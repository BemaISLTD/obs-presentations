// Minimal obs-websocket v5 client.
//
// This is deliberately dependency-free: the show must run on the OBS computer
// with no Internet access, so the protocol is implemented against the browser's
// built-in WebSocket and crypto.subtle rather than pulling a package at build
// time. Only the opcodes this controller needs are implemented.

const OP = Object.freeze({
  hello: 0,
  identify: 1,
  identified: 2,
  event: 5,
  request: 6,
  requestResponse: 7,
})

// Every request the controller can make, kept in one place so the OBS surface
// this app depends on is auditable.
export const OBS_REQUESTS = Object.freeze({
  getSceneList: 'GetSceneList',
  getSceneItemList: 'GetSceneItemList',
  getSceneItemId: 'GetSceneItemId',
  setSceneItemEnabled: 'SetSceneItemEnabled',
  getSceneItemTransform: 'GetSceneItemTransform',
  setSceneItemTransform: 'SetSceneItemTransform',
})

const REQUEST_TIMEOUT_MS = 8000

function toBase64(buffer) {
  let binary = ''
  new Uint8Array(buffer).forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

async function sha256Base64(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toBase64(digest)
}

// obs-websocket v5 authentication: base64(sha256(password + salt)) is hashed
// again with the per-connection challenge.
async function buildAuthentication(password, salt, challenge) {
  const secret = await sha256Base64(`${password}${salt}`)
  return sha256Base64(`${secret}${challenge}`)
}

function randomRequestId() {
  return globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function obsWebSocketUrl({ host, port }) {
  const trimmedHost = String(host || '').trim() || '127.0.0.1'
  // Accept a bare host, a host:port, or a full ws:// or wss:// address so the
  // controller can also reach OBS on another machine over the LAN.
  if (/^wss?:\/\//i.test(trimmedHost)) return trimmedHost
  const bracketed = trimmedHost.includes(':') && !trimmedHost.startsWith('[') ? `[${trimmedHost}]` : trimmedHost
  return `ws://${bracketed}:${Number(port) || 4455}`
}

/**
 * Creates an OBS connection wrapper.
 *
 * The controller must keep running when OBS is closed, so every failure path
 * resolves into a status callback instead of throwing at the call site.
 */
export function createObsClient({ onStatus = () => {}, onEvent = () => {} } = {}) {
  let socket = null
  let status = 'disconnected'
  let lastError = ''
  let identified = null
  let closedByCaller = false
  const pending = new Map()

  function setStatus(next, error = '') {
    status = next
    lastError = error
    onStatus({ status: next, error })
  }

  function rejectAllPending(reason) {
    pending.forEach(({ reject, timer }) => {
      window.clearTimeout(timer)
      reject(new Error(reason))
    })
    pending.clear()
  }

  function teardown(reason) {
    rejectAllPending(reason)
    if (socket) {
      socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close()
    }
    socket = null
    identified = null
  }

  function handleMessage(raw, resolveConnect, rejectConnect) {
    let message
    try { message = JSON.parse(raw) } catch { return }
    const { op, d: data } = message

    if (op === OP.hello) {
      const payload = { rpcVersion: data.rpcVersion ?? 1 }
      const auth = data.authentication
      const send = () => socket?.send(JSON.stringify({ op: OP.identify, d: payload }))
      if (auth) {
        if (!identified?.password) {
          rejectConnect(new Error('This OBS WebSocket server requires a password.'))
          return
        }
        buildAuthentication(identified.password, auth.salt, auth.challenge)
          .then((authentication) => { payload.authentication = authentication; send() })
          .catch((error) => rejectConnect(error))
        return
      }
      send()
      return
    }

    if (op === OP.identified) {
      setStatus('connected')
      resolveConnect()
      return
    }

    if (op === OP.requestResponse) {
      const entry = pending.get(data.requestId)
      if (!entry) return
      pending.delete(data.requestId)
      window.clearTimeout(entry.timer)
      if (data.requestStatus?.result) entry.resolve(data.responseData ?? {})
      else entry.reject(new Error(data.requestStatus?.comment || `OBS rejected ${data.requestType}.`))
      return
    }

    if (op === OP.event) onEvent(data)
  }

  function connect({ host, port, password }) {
    closedByCaller = false
    teardown('Reconnecting to OBS.')
    identified = { password: String(password || '') }
    setStatus('connecting')

    return new Promise((resolve, reject) => {
      let settled = false
      const finish = (error) => {
        if (settled) return
        settled = true
        if (error) {
          setStatus('error', error.message)
          teardown(error.message)
          reject(error)
        } else resolve()
      }

      try { socket = new WebSocket(obsWebSocketUrl({ host, port })) } catch (error) {
        finish(new Error(`Could not open an OBS connection: ${error.message}`))
        return
      }

      socket.onmessage = (event) => handleMessage(event.data, () => finish(), finish)
      socket.onerror = () => finish(new Error('Could not reach OBS WebSocket. Check that OBS is running and the WebSocket server is enabled.'))
      socket.onclose = (event) => {
        rejectAllPending('The OBS connection closed.')
        if (!settled) {
          // 4009 is the v5 code for a rejected password.
          finish(new Error(event.code === 4009 ? 'OBS rejected the password.' : 'The OBS connection closed before identifying.'))
          return
        }
        socket = null
        identified = null
        if (!closedByCaller) setStatus('disconnected', 'The OBS connection closed.')
      }
    })
  }

  function disconnect() {
    closedByCaller = true
    teardown('The OBS connection was closed by the operator.')
    setStatus('disconnected')
  }

  function request(requestType, requestData = {}) {
    if (!socket || socket.readyState !== WebSocket.OPEN || status !== 'connected') {
      return Promise.reject(new Error('OBS is not connected.'))
    }
    const requestId = randomRequestId()
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pending.delete(requestId)
        reject(new Error(`OBS did not answer ${requestType} in time.`))
      }, REQUEST_TIMEOUT_MS)
      pending.set(requestId, { resolve, reject, timer })
      socket.send(JSON.stringify({ op: OP.request, d: { requestId, requestType, requestData } }))
    })
  }

  return {
    connect,
    disconnect,
    request,
    getStatus: () => ({ status, error: lastError }),
    isConnected: () => status === 'connected',
  }
}
