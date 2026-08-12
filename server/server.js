import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createControlStore, trackForScene } from './controlStore.js'

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
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
}

function listMusicTracks() {
  const musicDirectory = join(root, production ? 'dist' : 'public', 'assets', 'musics')
  if (!existsSync(musicDirectory)) return []
  return readdirSync(musicDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.mp3')
    .map((entry) => ({
      name: entry.name.replace(/\.mp3$/i, '').replace(/[_-]+/g, ' '),
      file: entry.name,
      url: `/assets/musics/${encodeURIComponent(entry.name)}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

// The music bed is meant to be running before anyone touches the controller,
// so on first start we adopt the first available track. Once the operator has
// chosen (or deliberately cleared) a track, autoplay is off and we never
// second-guess them.
function seedMusicTrack() {
  const snapshot = store.read()
  const { music, sceneId } = snapshot.state
  if (!music.autoplay) return
  const tracks = listMusicTracks()
  if (!tracks.length) return
  // Start on the bed the opening scene calls for, falling back to whatever is
  // present if that file is missing from this deployment.
  const wanted = music.followScene ? trackForScene(sceneId) : music.track
  const chosen = tracks.find((track) => track.url === wanted) ?? tracks[0]
  // Resume rather than restart when a track is already selected and running:
  // a server restart mid-show should not drop the listener back to zero.
  const alreadyRunning = music.track === chosen.url && music.playing
  if (alreadyRunning) return
  store.write({
    music: {
      track: chosen.url,
      playing: true,
      position: music.track === chosen.url ? music.position : 0,
      startedAt: Date.now(),
    },
  })
  console.log(`Background music bed: ${chosen.name}`)
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

  if (request.method === 'GET' && url.pathname === '/api/control/music') {
    sendJson(response, 200, { tracks: listMusicTracks() })
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

// /program is the finished show: every layer plus the browser presenter camera.
// The split routes stay for the legacy OBS workflow, and deliberately never
// own a camera — only the complete composition does (§17).
const LAYER_ROUTES = new Map([
  ['/program', { render: 'composite', camera: 'browser' }],
  ['/presentation', { render: 'underlay', camera: 'none' }],
  ['/ticker', { render: 'foreground', camera: 'none' }],
])

function layerRouteFor(pathname) {
  return LAYER_ROUTES.get(pathname.replace(/\/+$/, '') || '/')
}

// The layer routes carry no query string of their own, so a display can be
// pointed at a bare URL. Operator overrides on the URL still win over these
// defaults — except the camera flag, which is a property of the route itself.
function layerRouteSearch(route, search) {
  const params = new URLSearchParams(search)
  if (!params.has('sync')) params.set('sync', 'true')
  params.set('output', 'obs')
  params.set('render', route.render)
  params.set('camera', route.camera)
  if (!params.has('clean')) params.set('clean', 'true')
  return `?${params}`
}

function serveStatic(response, pathname) {
  const dist = join(root, 'dist')
  const page = pathname.replace(/\/+$/, '') || '/'
  const requested = page === '/control'
    ? '/control.html'
    : page === '/camera-setup'
      ? '/camera-setup.html'
      : page === '/' || layerRouteFor(pathname) ? '/index.html' : pathname
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
    const layerRender = layerRouteFor(url.pathname)
    if (layerRender) {
      response.writeHead(302, { Location: `/${layerRouteSearch(layerRender, url.search)}`, 'Cache-Control': 'no-store' })
      response.end()
      return
    }
    if (production) { serveStatic(response, url.pathname); return }
    const devPage = url.pathname.replace(/\/+$/, '') || '/'
    if (devPage === '/control') request.url = `/control.html${url.search}`
    if (devPage === '/camera-setup') request.url = `/camera-setup.html${url.search}`
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

seedMusicTrack()

server.listen(port, host, () => {
  console.log(`Presentation server: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)
  console.log(`Program output: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/program`)
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
