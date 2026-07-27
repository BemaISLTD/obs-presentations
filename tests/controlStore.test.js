import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createControlStore } from '../server/controlStore.js'

test('shared presentation state persists across store restarts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-store-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const first = createControlStore(databasePath)
    assert.equal(first.read().state.ticker.messages.length, 5)
    const updated = first.write({ sceneId: '8', animationsPaused: true, ticker: { visible: false } })
    assert.equal(updated.revision, 1)
    assert.equal(updated.state.sceneId, '08')
    assert.equal(updated.state.animationsPaused, true)
    assert.equal(updated.state.ticker.visible, false)
    assert.equal(updated.state.ticker.paused, false)
    first.close()

    const reopened = createControlStore(databasePath)
    const persisted = reopened.read()
    assert.equal(persisted.revision, 1)
    assert.equal(persisted.state.sceneId, '08')
    assert.equal(persisted.state.animationsPaused, true)
    assert.equal(persisted.state.ticker.visible, false)
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('data mode and date range are validated and persisted', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-data-mode-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const defaults = store.read()
    assert.equal(defaults.state.dataMode, 'simulated')
    assert.equal(defaults.state.dataRange.since, '')

    const invalid = store.write({ dataMode: 'not-a-mode' })
    assert.equal(invalid.state.dataMode, 'simulated')

    const live = store.write({ dataMode: 'live', dataRange: { since: '2026-07-01T00:00:00.000Z' } })
    assert.equal(live.state.dataMode, 'live')
    assert.equal(live.state.dataRange.since, '2026-07-01T00:00:00.000Z')

    const hybrid = store.write({ dataMode: 'hybrid' })
    assert.equal(hybrid.state.dataMode, 'hybrid')
    assert.equal(hybrid.state.dataRange.since, '2026-07-01T00:00:00.000Z', 'unrelated patch should not clear an existing range')

    const cleared = store.write({ dataRange: { since: '' } })
    assert.equal(cleared.state.dataRange.since, '')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('commands increment a durable sequence and validate scene values', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-command-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const first = store.command({ type: 'scene', cue: 'reset', sceneId: '39' })
    const second = store.command({ type: 'cue', cue: 'community-cta' })
    assert.equal(first.state.sceneId, '39')
    assert.equal(first.state.command.sequence, 1)
    assert.equal(second.state.command.sequence, 2)
    assert.equal(second.state.command.cue, 'community-cta')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('ticker stores multiple independently removable controller messages', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-ticker-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const messages = [
      { id: 'first', message: 'First announcement' },
      { id: 'second', message: 'Second announcement' },
    ]
    const added = store.write({ ticker: { messages, clearId: 1 } })
    assert.deepEqual(added.state.ticker.messages, messages)
    assert.equal(added.state.ticker.clearId, 1)

    const removed = store.write({ ticker: { messages: messages.filter((item) => item.id !== 'first') } })
    assert.deepEqual(removed.state.ticker.messages, [messages[1]])
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('starter ticker messages are seeded once and stay deleted', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-ticker-seed-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const first = createControlStore(databasePath)
    assert.equal(first.read().state.ticker.messages.length, 5)
    first.write({ ticker: { messages: [], priorityMessage: '' } })
    first.close()

    const reopened = createControlStore(databasePath)
    assert.deepEqual(reopened.read().state.ticker.messages, [])
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
