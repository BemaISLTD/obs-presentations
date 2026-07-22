import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const DEFAULT_STATE = Object.freeze({
  sceneId: '01',
  mode: 'live',
  animationsPaused: false,
  backgroundVideo: true,
  selectedQuestion: 1,
  ticker: {
    visible: true,
    paused: false,
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

function cloneDefaultState() {
  return structuredClone(DEFAULT_STATE)
}

function normalizeSceneId(value, fallback = '01') {
  const number = Number(String(value ?? '').replace(/\D/g, ''))
  return number >= 1 && number <= 39 ? String(number).padStart(2, '0') : fallback
}

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {}
  const defaults = cloneDefaultState()
  return {
    sceneId: normalizeSceneId(source.sceneId, defaults.sceneId),
    mode: MODES.has(source.mode) ? source.mode : defaults.mode,
    animationsPaused: Boolean(source.animationsPaused),
    backgroundVideo: source.backgroundVideo !== false,
    selectedQuestion: Number(source.selectedQuestion) >= 1 && Number(source.selectedQuestion) <= 4
      ? Number(source.selectedQuestion)
      : defaults.selectedQuestion,
    ticker: {
      visible: source.ticker?.visible !== false,
      paused: Boolean(source.ticker?.paused),
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

