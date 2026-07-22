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
