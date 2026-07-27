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

const DEFAULT_STATE = Object.freeze({
  sceneId: '01',
  mode: 'live',
  animationsPaused: false,
  backgroundVideo: true,
  selectedQuestion: 1,
  dataMode: 'simulated',
  dataRange: {
    since: '',
    until: '',
  },
  music: {
    track: '',
    playing: false,
    muted: false,
    volume: 70,
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
  return {
    sceneId: normalizeSceneId(source.sceneId, defaults.sceneId),
    mode: MODES.has(source.mode) ? source.mode : defaults.mode,
    animationsPaused: Boolean(source.animationsPaused),
    backgroundVideo: source.backgroundVideo !== false,
    selectedQuestion: Number(source.selectedQuestion) >= 1 && Number(source.selectedQuestion) <= 4
      ? Number(source.selectedQuestion)
      : defaults.selectedQuestion,
    dataMode: DATA_MODES.has(source.dataMode) ? source.dataMode : defaults.dataMode,
    dataRange: {
      since: normalizeDateInput(source.dataRange?.since),
      until: normalizeDateInput(source.dataRange?.until),
    },
    music: {
      track: normalizeMusicTrack(source.music?.track),
      playing: Boolean(source.music?.playing) && Boolean(normalizeMusicTrack(source.music?.track)),
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

function mergeState(current, patch) {
  const next = {
    ...current,
    ...(patch && typeof patch === 'object' ? patch : {}),
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
