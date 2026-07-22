const STATE_URL = '/api/control/state'
const COMMAND_URL = '/api/control/command'
const EVENTS_URL = '/api/control/events'

function tokenHeaders() {
  const token = sessionStorage.getItem('bemahub.obs.controlToken') || ''
  return token ? { 'X-Control-Token': token } : {}
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...tokenHeaders(), ...(options.headers ?? {}) },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Control server request failed (${response.status}).`)
  }
  return response.json()
}

export function saveControlToken(token) {
  if (token) sessionStorage.setItem('bemahub.obs.controlToken', token)
  else sessionStorage.removeItem('bemahub.obs.controlToken')
}

export function fetchSharedState() {
  return request(STATE_URL)
}

export function updateSharedState(patch) {
  return request(STATE_URL, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function sendSharedCommand(command) {
  return request(COMMAND_URL, { method: 'POST', body: JSON.stringify(command) })
}

export function subscribeSharedState(onState, onStatus = () => {}) {
  const events = new EventSource(EVENTS_URL)
  events.addEventListener('open', () => onStatus('connected'))
  events.addEventListener('error', () => onStatus('reconnecting'))
  events.addEventListener('state', (event) => {
    try { onState(JSON.parse(event.data)) } catch (error) { console.error('Invalid shared control event.', error) }
  })
  return () => events.close()
}

