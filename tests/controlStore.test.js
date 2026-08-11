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
    const updated = first.write({ sceneId: '8', animationsPaused: true, scene03PresenterName: 'Ada Okafor', ticker: { visible: false } })
    assert.equal(updated.revision, 1)
    assert.equal(updated.state.sceneId, '08')
    assert.equal(updated.state.animationsPaused, true)
    assert.equal(updated.state.scene03PresenterName, 'Ada Okafor')
    assert.equal(updated.state.ticker.visible, false)
    assert.equal(updated.state.ticker.paused, false)
    first.close()

    const reopened = createControlStore(databasePath)
    const persisted = reopened.read()
    assert.equal(persisted.revision, 1)
    assert.equal(persisted.state.sceneId, '08')
    assert.equal(persisted.state.animationsPaused, true)
    assert.equal(persisted.state.scene03PresenterName, 'Ada Okafor')
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

test('music playback settings are normalized and persisted', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-music-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    assert.equal(store.read().state.music.volume, 70)

    const playing = store.write({
      music: {
        track: '/assets/musics/Bema%20Hub.mp3',
        playing: true,
        muted: true,
        volume: 120,
        position: 12.5,
        startedAt: 1_700_000_000_000,
      },
    })
    assert.equal(playing.state.music.track, '/assets/musics/Bema%20Hub.mp3')
    assert.equal(playing.state.music.playing, true)
    assert.equal(playing.state.music.muted, true)
    assert.equal(playing.state.music.volume, 100)
    assert.equal(playing.state.music.position, 12.5)

    const rejected = store.write({ music: { track: '/assets/other/not-allowed.mp3', playing: true, volume: -4 } })
    assert.equal(rejected.state.music.track, '')
    assert.equal(rejected.state.music.playing, false)
    assert.equal(rejected.state.music.volume, 0)
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

test('obs connection settings are validated and persisted', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-obs-config-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const defaults = store.read().state.obs
    assert.equal(defaults.host, '127.0.0.1')
    assert.equal(defaults.port, 4455)
    assert.equal(defaults.sources.presenter.sourceName, '', 'no source name may be hard-coded')

    const configured = store.write({
      obs: { host: '192.168.1.40', port: 4460, password: 'secret', sceneName: 'OPEN ENROLLMENT MASTER' },
    })
    assert.equal(configured.state.obs.host, '192.168.1.40')
    assert.equal(configured.state.obs.port, 4460)
    assert.equal(configured.state.obs.sceneName, 'OPEN ENROLLMENT MASTER')

    const invalidPort = store.write({ obs: { port: 70000 } })
    assert.equal(invalidPort.state.obs.port, 4460, 'an out-of-range port keeps the last good value')

    store.close()
    const reopened = createControlStore(databasePath)
    assert.equal(reopened.read().state.obs.host, '192.168.1.40')
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('obs sources are an extensible keyed registry', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-obs-sources-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const named = store.write({ obs: { sources: { presenter: { sourceName: 'Camo Camera' } } } })
    assert.equal(named.state.obs.sources.presenter.sourceName, 'Camo Camera')
    assert.equal(named.state.obs.sources.presenter.visible, false)

    const second = store.write({ obs: { sources: { guestCamera: { label: 'Guest', sourceName: 'Guest Phone' } } } })
    assert.equal(second.state.obs.sources.guestCamera.sourceName, 'Guest Phone')
    assert.equal(second.state.obs.sources.presenter.sourceName, 'Camo Camera', 'patching one source keeps the others')

    const shown = store.write({ obs: { sources: { presenter: { visible: true, preset: 'lower-right' } } } })
    assert.equal(shown.state.obs.sources.presenter.visible, true)
    assert.equal(shown.state.obs.sources.presenter.preset, 'lower-right')

    const badPreset = store.write({ obs: { sources: { presenter: { preset: 'not-a-preset' } } } })
    assert.equal(badPreset.state.obs.sources.presenter.preset, 'lower-right')

    const removed = store.write({ obs: { sources: { guestCamera: null } } })
    assert.equal(removed.state.obs.sources.guestCamera, undefined)
    assert.ok(removed.state.obs.sources.presenter, 'the presenter role always survives')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
