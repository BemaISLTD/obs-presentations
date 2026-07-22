import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createControlStore } from './controlStore.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const production = process.argv.includes('--production')
const argumentValue = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}
const host = process.env.HOST || argumentValue('--host') || '0.0.0.0'
const port = Number(process.env.PORT || argumentValue('--port')) || 5173
const controlToken = process.env.CONTROL_TOKEN || ''
const store = createControlStore(process.env.OBS_DB_PATH || join(root, 'data/obs-control.sqlite'))
const eventClients = new Set()

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(value))
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 64_000) throw new Error('Request body is too large.')
  }
  return body ? JSON.parse(body) : {}
}

function isAuthorized(request) {
  if (!controlToken) return true
  return request.headers.authorization === `Bearer ${controlToken}` || request.headers['x-control-token'] === controlToken
}

function publish(snapshot) {
  const message = `event: state\ndata: ${JSON.stringify(snapshot)}\n\n`
  eventClients.forEach((client) => client.write(message))
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/control/health') {
    const snapshot = store.read()
    sendJson(response, 200, { status: 'ok', revision: snapshot.revision, updatedAt: snapshot.updatedAt })
    return true
  }

  if (request.method === 'GET' && url.pathname === '/api/control/state') {
    sendJson(response, 200, store.read())
    return true
  }

  if (request.method === 'GET' && url.pathname === '/api/control/events') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    response.write(`retry: 1500\nevent: state\ndata: ${JSON.stringify(store.read())}\n\n`)
    eventClients.add(response)
    request.on('close', () => eventClients.delete(response))
    return true
  }

  if (request.method === 'PATCH' && url.pathname === '/api/control/state') {
    if (!isAuthorized(request)) { sendJson(response, 401, { error: 'Invalid control token.' }); return true }
    const snapshot = store.write(await readJson(request))
    publish(snapshot)
    sendJson(response, 200, snapshot)
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/control/command') {
    if (!isAuthorized(request)) { sendJson(response, 401, { error: 'Invalid control token.' }); return true }
    const snapshot = store.command(await readJson(request))
    publish(snapshot)
    sendJson(response, 200, snapshot)
    return true
  }

  return false
}

function serveStatic(response, pathname) {
  const dist = join(root, 'dist')
  const requested = pathname === '/control' || pathname === '/control/'
    ? '/control.html'
    : pathname === '/' ? '/index.html' : pathname
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '')
  let filePath = join(dist, safePath)
  if (!filePath.startsWith(dist) || !existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(dist, 'index.html')
  response.writeHead(200, { 'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream' })
  createReadStream(filePath).pipe(response)
}

let vite
const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  try {
    if (url.pathname.startsWith('/api/control/') && await handleApi(request, response, url)) return
    if (production) { serveStatic(response, url.pathname); return }
    if (url.pathname === '/control' || url.pathname === '/control/') request.url = `/control.html${url.search}`
    vite.middlewares(request, response, (error) => {
      if (error) { vite.ssrFixStacktrace(error); console.error(error); response.statusCode = 500; response.end('Vite server error') }
    })
  } catch (error) {
    console.error(error)
    if (!response.headersSent) sendJson(response, 400, { error: error.message })
    else response.end()
  }
})

if (!production) {
  const { createServer: createViteServer } = await import('vite')
  vite = await createViteServer({ root, server: { middlewareMode: true, ws: { server } }, appType: 'spa' })
}

const heartbeat = setInterval(() => {
  eventClients.forEach((client) => client.write(': heartbeat\n\n'))
}, 20_000)

server.listen(port, host, () => {
  console.log(`OBS presentation server: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)
  console.log(`Operator controls: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/control`)
  console.log(`Shared SQLite state: ${process.env.OBS_DB_PATH || join(root, 'data/obs-control.sqlite')}`)
})

function shutdown() {
  clearInterval(heartbeat)
  eventClients.forEach((client) => client.end())
  server.close(() => {
    vite?.close()
    store.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
