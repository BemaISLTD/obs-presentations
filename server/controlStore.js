import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const TICKER_MESSAGE_SEED_VERSION = 1
const DEFAULT_TICKER_MESSAGES = Object.freeze([
  Object.freeze({ id: 'starter-welcome', message: 'Welcome to BemaHub Open Enrollment Live' }),
  Object.freeze({ id: 'starter-build', message: 'Build connections, unlock opportunities, and grow together' }),
  Object.freeze({ id: 'starter-loopcode', message: 'Share your LoopCode and invite someone into the community' }),
  Object.freeze({ id: 'starter-explore', message: 'Explore the campaign and choose the access path that fits you' }),
  Object.freeze({ id: 'starter-live', message: 'Stay with us for live updates throughout the session' }),
])

// Every visual layer stacks in one browser page, so the operator's only job is
// deciding which ones are on air. Order here is bottom-to-top on the stage.
const DEFAULT_LAYERS = Object.freeze({
  background: true,
  foreground: true,
  presenter: false,
  ticker: true,
})

// The presenter camera is a web capture placed on the same 1920x1080 stage as
// every other layer, so its geometry is stored in stage pixels rather than as
// CSS. The controller drags a box in those coordinates and the output page
// renders it verbatim, which keeps preview and program identical.
const DEFAULT_PRESENTER = Object.freeze({
  x: 1320,
  y: 620,
  width: 520,
  height: 293,
  shape: 'rounded',
  mirrored: true,
  fit: 'cover',
  label: '',
  showLabel: false,
  // AI background removal, and the two knobs that tune its edges (§12).
  backgroundRemoval: true,
  edgeFeather: 0.08,
  maskThreshold: 0.5,
})

// The camera hardware attached to the machine running /program.
//
// Device *choice* is still machine-local (§5) — the show computer decides which
// camera it can actually open. What lives here is a published mirror of that
// machine's device list, so a controller on another laptop can see the real
// options and ask for one, rather than listing its own webcams. `requestedId`
// is an operator request; the program page resolves and confirms it in `active`.
const DEFAULT_CAMERA = Object.freeze({
  devices: [],
  activeId: '',
  activeLabel: '',
  requestedId: '',
  requestSequence: 0,
  reportedAt: 0,
})

// OBS is retained as an optional downstream renderer (§24). It reads the same
// generic presenter state the browser does, so OBS is one renderer of show
// intent rather than the place that intent lives.
const DEFAULT_OBS = Object.freeze({
  enabled: false,
  host: '127.0.0.1',
  port: 4455,
  password: '',
  sceneName: '',
  sourceName: '',
  autoConnect: false,
})

const DEFAULT_STATE = Object.freeze({
  sceneId: '01',
  mode: 'live',
  layers: DEFAULT_LAYERS,
  presenter: DEFAULT_PRESENTER,
  camera: DEFAULT_CAMERA,
  obs: DEFAULT_OBS,
  animationsPaused: false,
  backgroundVideo: true,
  selectedQuestion: 1,
  scene03PresenterName: 'Joyce Root',
  dataMode: 'simulated',
  dataRange: {
    since: '',
    until: '',
  },
  // Music is ambient bed rather than a cue: it runs under every scene at a low
  // default so speech stays intelligible, and only the operator changes it.
  music: {
    track: '',
    playing: true,
    autoplay: true,
    muted: false,
    volume: 25,
    position: 0,
    startedAt: 0,
  },
  ticker: {
    visible: true,
    paused: false,
    messages: DEFAULT_TICKER_MESSAGES,
    messageSeedVersion: TICKER_MESSAGE_SEED_VERSION,
    clearId: 0,
    priorityMessage: '',
    priorityId: 0,
  },
  command: {
    sequence: 0,
    type: 'reset',
    cue: 'reset',
  },
})

const MODES = new Set(['reference', 'overlay', 'live'])
const DATA_MODES = new Set(['simulated', 'live', 'hybrid'])

// The layer keys are fixed: they map one-to-one onto the stacked elements the
// stage renders, so an unknown key is a bug rather than an extension point.
const LAYER_KEYS = Object.freeze(['background', 'foreground', 'presenter', 'ticker'])

const PRESENTER_SHAPES = new Set(['rounded', 'square', 'circle'])
const PRESENTER_FITS = new Set(['cover', 'contain'])

// The stage the operator is positioning against. Geometry is clamped to it so a
// dropped card can never land off screen where it cannot be dragged back.
const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080
const MIN_PRESENTER_SIZE = 120

function clampNumber(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function normalizeLayers(value, defaults) {
  const source = value && typeof value === 'object' ? value : {}
  return Object.fromEntries(LAYER_KEYS.map((key) => [
    key,
    typeof source[key] === 'boolean' ? source[key] : defaults[key],
  ]))
}

// Size is clamped before position so the position clamp knows the real extent,
// which keeps a card that was resized larger than the stage anchored at 0.
function normalizePresenter(value, defaults) {
  const source = value && typeof value === 'object' ? value : {}
  const width = clampNumber(source.width, defaults.width, MIN_PRESENTER_SIZE, STAGE_WIDTH)
  const height = clampNumber(source.height, defaults.height, MIN_PRESENTER_SIZE, STAGE_HEIGHT)
  return {
    x: clampNumber(source.x, defaults.x, 0, Math.max(0, STAGE_WIDTH - width)),
    y: clampNumber(source.y, defaults.y, 0, Math.max(0, STAGE_HEIGHT - height)),
    width,
    height,
    shape: PRESENTER_SHAPES.has(source.shape) ? source.shape : defaults.shape,
    mirrored: typeof source.mirrored === 'boolean' ? source.mirrored : defaults.mirrored,
    fit: PRESENTER_FITS.has(source.fit) ? source.fit : defaults.fit,
    label: String(source.label ?? defaults.label).trim().slice(0, 80),
    showLabel: typeof source.showLabel === 'boolean' ? source.showLabel : defaults.showLabel,
    backgroundRemoval: typeof source.backgroundRemoval === 'boolean' ? source.backgroundRemoval : defaults.backgroundRemoval,
    edgeFeather: clampFloat(source.edgeFeather, defaults.edgeFeather, 0, 0.5),
    maskThreshold: clampFloat(source.maskThreshold, defaults.maskThreshold, 0.05, 0.95),
  }
}

function clampFloat(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function isValidPort(value) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 && port <= 65535
}

// The device list is reported by another machine's browser, so ids and labels
// are untrusted input: bound the count and the string lengths.
function normalizeCamera(value, defaults) {
  const source = value && typeof value === 'object' ? value : {}
  const devices = (Array.isArray(source.devices) ? source.devices : defaults.devices)
    .slice(0, 24)
    .map((device) => ({
      deviceId: String(device?.deviceId ?? '').slice(0, 200),
      label: String(device?.label ?? '').trim().slice(0, 120),
    }))
    .filter((device) => device.deviceId || device.label)
  return {
    devices,
    activeId: String(source.activeId ?? defaults.activeId).slice(0, 200),
    activeLabel: String(source.activeLabel ?? defaults.activeLabel).trim().slice(0, 120),
    requestedId: String(source.requestedId ?? defaults.requestedId).slice(0, 200),
    // Bumped by the controller on each pick, so the program page can tell a new
    // request from a repeat of one it has already applied.
    requestSequence: Math.max(0, Number(source.requestSequence) || 0),
    reportedAt: Math.max(0, Number(source.reportedAt) || 0),
  }
}

function normalizeObs(value, defaults) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : defaults.enabled,
    host: String(source.host ?? defaults.host).trim().slice(0, 120) || defaults.host,
    port: isValidPort(source.port) ? Number(source.port) : defaults.port,
    password: String(source.password ?? defaults.password).slice(0, 200),
    sceneName: String(source.sceneName ?? defaults.sceneName).trim().slice(0, 200),
    sourceName: String(source.sourceName ?? defaults.sourceName).trim().slice(0, 200),
    autoConnect: Boolean(source.autoConnect ?? defaults.autoConnect),
  }
}

/**
 * Lifts a pre-migration `obs.sources.presenter` row onto generic state (§7).
 *
 * Older databases stored presenter intent underneath OBS, because OBS was the
 * renderer. Visibility becomes a layer, the placement preset becomes geometry,
 * and the OBS source name is kept so a legacy connection still works.
 */
function migrateLegacyPresenter(source) {
  const legacy = source?.obs?.sources?.presenter
  if (!legacy || typeof legacy !== 'object') return null
  const geometry = LEGACY_PRESET_GEOMETRY[legacy.preset] ?? null
  return {
    layers: { presenter: Boolean(legacy.visible) },
    presenter: geometry ?? {},
    sourceName: String(legacy.sourceName ?? ''),
  }
}

// Kept in step with src/presenter/presenterPresets.js. Duplicated rather than
// imported because the server must not depend on browser modules.
const LEGACY_PRESET_GEOMETRY = Object.freeze({
  full: { x: 0, y: 0, width: 1920, height: 1080 },
  'lower-right': { x: 1320, y: 620, width: 520, height: 293 },
  'lower-left': { x: 80, y: 620, width: 520, height: 293 },
  center: { x: 560, y: 220, width: 800, height: 450 },
  pip: { x: 1520, y: 780, width: 320, height: 180 },
})

function normalizeDateInput(value) {
  const text = String(value ?? '').trim().slice(0, 40)
  if (!text) return ''
  return Number.isNaN(Date.parse(text)) ? '' : text
}

function cloneDefaultState() {
  return structuredClone(DEFAULT_STATE)
}

function normalizeSceneId(value, fallback = '01') {
  const number = Number(String(value ?? '').replace(/\D/g, ''))
  return number >= 1 && number <= 39 ? String(number).padStart(2, '0') : fallback
}

function normalizeTickerMessages(value, legacyMessage = '', legacyId = 0) {
  const messages = Array.isArray(value) ? value : []
  const normalized = messages
    .map((item, index) => ({
      id: String(item?.id ?? `message-${index}`).trim().slice(0, 100),
      message: String(item?.message ?? '').trim().slice(0, 180),
    }))
    .filter((item) => item.id && item.message)
  if (!normalized.length && String(legacyMessage ?? '').trim()) {
    normalized.push({
      id: `legacy-${Math.max(0, Number(legacyId) || 0)}`,
      message: String(legacyMessage).trim().slice(0, 180),
    })
  }
  return normalized.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
}

function normalizeMusicTrack(value) {
  const track = String(value ?? '').trim().slice(0, 300)
  return /^\/assets\/musics\/[^/]+\.mp3$/i.test(track) ? track : ''
}

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {}
  const defaults = cloneDefaultState()
  const musicVolume = Number(source.music?.volume)
  // A row written before presenter state was generic carries its intent under
  // obs.sources.presenter; lift it across rather than silently losing it (§7).
  const legacy = source.presenter || source.layers ? null : migrateLegacyPresenter(source)
  return {
    sceneId: normalizeSceneId(source.sceneId, defaults.sceneId),
    mode: MODES.has(source.mode) ? source.mode : defaults.mode,
    layers: normalizeLayers(legacy ? { ...source.layers, ...legacy.layers } : source.layers, defaults.layers),
    presenter: normalizePresenter(legacy ? { ...defaults.presenter, ...legacy.presenter } : source.presenter, defaults.presenter),
    camera: normalizeCamera(source.camera, defaults.camera),
    obs: normalizeObs(
      legacy ? { ...source.obs, sourceName: legacy.sourceName } : source.obs,
      defaults.obs,
    ),
    animationsPaused: Boolean(source.animationsPaused),
    backgroundVideo: source.backgroundVideo !== false,
    selectedQuestion: Number(source.selectedQuestion) >= 1 && Number(source.selectedQuestion) <= 4
      ? Number(source.selectedQuestion)
      : defaults.selectedQuestion,
    scene03PresenterName: String(source.scene03PresenterName ?? defaults.scene03PresenterName).trim().slice(0, 80)
      || defaults.scene03PresenterName,
    dataMode: DATA_MODES.has(source.dataMode) ? source.dataMode : defaults.dataMode,
    dataRange: {
      since: normalizeDateInput(source.dataRange?.since),
      until: normalizeDateInput(source.dataRange?.until),
    },
    music: {
      track: normalizeMusicTrack(source.music?.track),
      playing: Boolean(source.music?.playing) && Boolean(normalizeMusicTrack(source.music?.track)),
      // When autoplay is on, the output page picks the first available track on
      // its own, so the operator never has to start the bed by hand.
      autoplay: source.music?.autoplay !== false,
      muted: Boolean(source.music?.muted),
      volume: Number.isFinite(musicVolume) ? Math.min(100, Math.max(0, musicVolume)) : defaults.music.volume,
      position: Math.max(0, Number(source.music?.position) || 0),
      startedAt: Math.max(0, Number(source.music?.startedAt) || 0),
    },
    ticker: {
      visible: source.ticker?.visible !== false,
      paused: Boolean(source.ticker?.paused),
      messages: normalizeTickerMessages(source.ticker?.messages, source.ticker?.priorityMessage, source.ticker?.priorityId),
      messageSeedVersion: Math.max(0, Number(source.ticker?.messageSeedVersion) || 0),
      clearId: Math.max(0, Number(source.ticker?.clearId) || 0),
      priorityMessage: String(source.ticker?.priorityMessage ?? '').slice(0, 180),
      priorityId: Math.max(0, Number(source.ticker?.priorityId) || 0),
    },
    command: {
      sequence: Math.max(0, Number(source.command?.sequence) || 0),
      type: String(source.command?.type ?? defaults.command.type).slice(0, 40),
      cue: String(source.command?.cue ?? defaults.command.cue).slice(0, 100),
    },
  }
}

// Geometry arrives from the controller a field at a time while dragging, so an
// unparseable value must fall back to the stored one rather than the frozen
// default — otherwise one bad drag frame would snap the card across the stage.
function mergePresenter(current, patch) {
  if (!patch || typeof patch !== 'object') return current
  const merged = { ...current, ...patch }
  return normalizePresenter(merged, current)
}

function mergeState(current, patch) {
  const next = {
    ...current,
    ...(patch && typeof patch === 'object' ? patch : {}),
    layers: { ...current.layers, ...(patch?.layers ?? {}) },
    presenter: mergePresenter(current.presenter, patch?.presenter),
    camera: { ...current.camera, ...(patch?.camera ?? {}) },
    obs: { ...current.obs, ...(patch?.obs ?? {}) },
    dataRange: { ...current.dataRange, ...(patch?.dataRange ?? {}) },
    music: { ...current.music, ...(patch?.music ?? {}) },
    ticker: { ...current.ticker, ...(patch?.ticker ?? {}) },
    command: { ...current.command, ...(patch?.command ?? {}) },
  }
  return normalizeState(next)
}

export function createControlStore(databasePath = resolve('data/obs-control.sqlite')) {
  mkdirSync(dirname(databasePath), { recursive: true })
  const database = new DatabaseSync(databasePath)
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS presentation_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      revision INTEGER NOT NULL DEFAULT 0,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  const selectState = database.prepare('SELECT revision, state_json, updated_at FROM presentation_state WHERE id = 1')
  const insertState = database.prepare('INSERT OR IGNORE INTO presentation_state (id, revision, state_json, updated_at) VALUES (1, 0, ?, ?)')
  const updateState = database.prepare('UPDATE presentation_state SET revision = ?, state_json = ?, updated_at = ? WHERE id = 1')
  insertState.run(JSON.stringify(cloneDefaultState()), new Date().toISOString())

  const storedRow = selectState.get()
  try {
    const storedState = JSON.parse(storedRow.state_json)
    if ((Number(storedState?.ticker?.messageSeedVersion) || 0) < TICKER_MESSAGE_SEED_VERSION) {
      const existingMessages = normalizeTickerMessages(
        storedState?.ticker?.messages,
        storedState?.ticker?.priorityMessage,
        storedState?.ticker?.priorityId,
      )
      storedState.ticker = {
        ...(storedState.ticker ?? {}),
        messages: existingMessages.length ? existingMessages : structuredClone(DEFAULT_TICKER_MESSAGES),
        messageSeedVersion: TICKER_MESSAGE_SEED_VERSION,
      }
      const migratedState = normalizeState(storedState)
      updateState.run(
        Number(storedRow.revision) + 1,
        JSON.stringify(migratedState),
        new Date().toISOString(),
      )
    }
  } catch {
    // read() below safely normalizes an invalid row without risking startup.
  }

  function read() {
    const row = selectState.get()
    let state
    try { state = normalizeState(JSON.parse(row.state_json)) } catch { state = cloneDefaultState() }
    return { revision: Number(row.revision), updatedAt: row.updated_at, state }
  }

  function write(patch) {
    const current = read()
    const state = mergeState(current.state, patch)
    const revision = current.revision + 1
    const updatedAt = new Date().toISOString()
    updateState.run(revision, JSON.stringify(state), updatedAt)
    return { revision, updatedAt, state }
  }

  function command({ type, cue, sceneId, selectedQuestion }) {
    const current = read()
    const patch = {
      command: {
        sequence: current.state.command.sequence + 1,
        type: String(type || 'cue'),
        cue: String(cue || type || ''),
      },
    }
    if (sceneId != null) patch.sceneId = sceneId
    if (selectedQuestion != null) patch.selectedQuestion = selectedQuestion
    return write(patch)
  }

  return { read, write, command, close: () => database.close() }
}
