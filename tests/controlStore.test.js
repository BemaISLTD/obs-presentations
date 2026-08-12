import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
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
    // The bed sits under speech, so it defaults quiet rather than prominent.
    assert.equal(store.read().state.music.volume, 25)

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

test('layers toggle independently and persist', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-layers-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    const defaults = store.read().state.layers
    assert.deepEqual(defaults, { background: true, foreground: true, presenter: false, ticker: true })

    const shown = store.write({ layers: { presenter: true } })
    assert.equal(shown.state.layers.presenter, true)
    assert.equal(shown.state.layers.background, true, 'toggling one layer leaves the others alone')

    const hidden = store.write({ layers: { background: false } })
    assert.equal(hidden.state.layers.background, false)
    assert.equal(hidden.state.layers.presenter, true)

    const ignored = store.write({ layers: { notALayer: true } })
    assert.equal(ignored.state.layers.notALayer, undefined, 'unknown layer keys are dropped')

    store.close()
    const reopened = createControlStore(databasePath)
    assert.equal(reopened.read().state.layers.background, false)
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('presenter geometry is clamped to the stage and survives bad patches', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-presenter-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const store = createControlStore(databasePath)
    // Camera hardware belongs to the output machine, not the shared show (§5).
    assert.equal(store.read().state.presenter.deviceId, undefined, 'device ids must not live in shared state')

    const placed = store.write({ presenter: { x: 100, y: 200, width: 640, height: 360 } })
    assert.deepEqual(
      { x: placed.state.presenter.x, y: placed.state.presenter.y, width: placed.state.presenter.width, height: placed.state.presenter.height },
      { x: 100, y: 200, width: 640, height: 360 },
    )

    const offStage = store.write({ presenter: { x: 5000, y: -300 } })
    assert.equal(offStage.state.presenter.x, 1920 - 640, 'a card dragged past the edge stays reachable')
    assert.equal(offStage.state.presenter.y, 0)

    const tiny = store.write({ presenter: { width: 10, height: 10 } })
    assert.equal(tiny.state.presenter.width, 120, 'the card never shrinks below a grabbable size')

    const badFrame = store.write({ presenter: { x: 'nonsense' } })
    assert.equal(badFrame.state.presenter.x, offStage.state.presenter.x, 'a bad drag frame keeps the stored position')

    const badShape = store.write({ presenter: { shape: 'triangle' } })
    assert.equal(badShape.state.presenter.shape, 'rounded')

    const device = store.write({ presenter: { deviceId: 'cam-abc', shape: 'circle', mirrored: false } })
    assert.equal(device.state.presenter.deviceId, undefined, 'a device id patch is dropped, not stored')
    assert.equal(device.state.presenter.shape, 'circle')
    assert.equal(device.state.presenter.mirrored, false)
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('legacy OBS presenter state migrates onto generic presenter state', () => {
  // §7: databases written before presenter state was renderer-neutral kept it
  // under obs.sources.presenter. That intent must survive the upgrade.
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-migrate-'))
  const databasePath = join(directory, 'state.sqlite')
  try {
    const database = new DatabaseSync(databasePath)
    database.exec(`CREATE TABLE presentation_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      revision INTEGER NOT NULL DEFAULT 0,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`)
    const legacy = {
      sceneId: '07',
      mode: 'live',
      obs: {
        host: '192.168.1.40',
        port: 4460,
        sceneName: 'OPEN ENROLLMENT MASTER',
        sources: { presenter: { label: 'Presenter', sourceName: 'Camo Camera', visible: true, preset: 'pip' } },
      },
    }
    database.prepare('INSERT INTO presentation_state VALUES (1, 5, ?, ?)')
      .run(JSON.stringify(legacy), new Date().toISOString())
    database.close()

    const store = createControlStore(databasePath)
    const state = store.read().state
    assert.equal(state.sceneId, '07', 'unrelated state is untouched')
    assert.equal(state.layers.presenter, true, 'presenter visibility becomes a layer')
    assert.deepEqual(
      { x: state.presenter.x, y: state.presenter.y, width: state.presenter.width, height: state.presenter.height },
      { x: 1520, y: 780, width: 320, height: 180 },
      'the pip preset becomes stage geometry',
    )
    assert.equal(state.obs.sourceName, 'Camo Camera', 'the OBS source survives for legacy mode')
    assert.equal(state.obs.host, '192.168.1.40')
    assert.equal(state.obs.port, 4460)
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('presenter background removal settings are validated', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-removal-'))
  try {
    const store = createControlStore(join(directory, 'state.sqlite'))
    const defaults = store.read().state.presenter
    assert.equal(defaults.backgroundRemoval, true)

    const tuned = store.write({ presenter: { maskThreshold: 0.7, edgeFeather: 0.2 } })
    assert.equal(tuned.state.presenter.maskThreshold, 0.7)
    assert.equal(tuned.state.presenter.edgeFeather, 0.2)

    // Out-of-range values clamp rather than producing an unusable mask.
    const clamped = store.write({ presenter: { maskThreshold: 9, edgeFeather: -3 } })
    assert.equal(clamped.state.presenter.maskThreshold, 0.95)
    assert.equal(clamped.state.presenter.edgeFeather, 0)

    const off = store.write({ presenter: { backgroundRemoval: false } })
    assert.equal(off.state.presenter.backgroundRemoval, false)
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('camera devices reported by the program page are stored and bounded', () => {
  // The device list is reported by another machine's browser, so it is
  // untrusted input: ids and labels are bounded and junk entries dropped.
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-camera-'))
  try {
    const store = createControlStore(join(directory, 'state.sqlite'))
    assert.deepEqual(store.read().state.camera.devices, [], 'no camera may be assumed')

    const reported = store.write({
      camera: {
        devices: [
          { deviceId: 'abc', label: 'Camo Camera' },
          { deviceId: 'def', label: 'iPhone Camera' },
          { deviceId: '', label: '' },
        ],
        activeId: 'abc',
        activeLabel: 'Camo Camera',
        reportedAt: 1_700_000_000_000,
      },
    })
    assert.equal(reported.state.camera.devices.length, 2, 'empty entries are dropped')
    assert.equal(reported.state.camera.devices[1].label, 'iPhone Camera')
    assert.equal(reported.state.camera.activeId, 'abc')

    const overlong = store.write({
      camera: { devices: Array.from({ length: 40 }, (_, index) => ({ deviceId: `d${index}`, label: 'x'.repeat(400) })) },
    })
    assert.equal(overlong.state.camera.devices.length, 24, 'the device list is capped')
    assert.equal(overlong.state.camera.devices[0].label.length, 120, 'labels are truncated')

    // An operator pick is a request; the program page confirms it separately.
    const request = store.write({ camera: { requestedId: 'def', requestSequence: 1 } })
    assert.equal(request.state.camera.requestedId, 'def')
    assert.equal(request.state.camera.requestSequence, 1)
    assert.equal(request.state.camera.activeId, 'abc', 'a request does not fake the active camera')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('music follows the scene without interrupting itself', () => {
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-scene-music-'))
  try {
    const store = createControlStore(join(directory, 'state.sqlite'))
    const vocal = '/assets/musics/Bema%20Hub.mp3'
    const instrumental = '/assets/musics/beat-bema.MP3'

    store.write({ sceneId: '01', music: { track: vocal, playing: true, position: 0, startedAt: Date.now() } })
    assert.equal(store.read().state.music.track, vocal)

    // Advancing inside one bed must leave playback completely alone: this is
    // what stops the music restarting every time the operator changes scene.
    store.write({ music: { position: 75 } })
    const sameBed = store.command({ type: 'scene', cue: 'entry', sceneId: '02' })
    assert.equal(sameBed.state.music.track, vocal)
    assert.equal(sameBed.state.music.position, 75, 'playback position survives a same-bed scene change')

    // Crossing to a scene on the other bed switches, and starts it from zero.
    const crossed = store.command({ type: 'scene', cue: 'entry', sceneId: '03' })
    assert.equal(crossed.state.music.track, instrumental)
    assert.equal(crossed.state.music.position, 0)

    store.write({ music: { position: 42 } })
    const stillInstrumental = store.command({ type: 'scene', cue: 'entry', sceneId: '06' })
    assert.equal(stillInstrumental.state.music.position, 42, 'instrumental scenes also play straight through')

    // A scene change arriving as a plain state patch resolves the bed too.
    const patched = store.write({ sceneId: '14' })
    assert.equal(patched.state.music.track, vocal)

    // Pinning a track makes the operator's choice survive scene changes.
    store.write({ music: { followScene: false, track: instrumental } })
    const pinned = store.command({ type: 'scene', cue: 'entry', sceneId: '35' })
    assert.equal(pinned.state.music.track, instrumental, 'a pinned track ignores the scene bed')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('a paused bed can be resumed and never strands itself', () => {
  // The music bed stopping with no way back is a silent show. Pausing is the
  // operator's call; nothing else may leave playback stuck off.
  const directory = mkdtempSync(join(tmpdir(), 'obs-control-music-resume-'))
  try {
    const store = createControlStore(join(directory, 'state.sqlite'))
    const vocal = '/assets/musics/Bema%20Hub.mp3'
    store.write({ music: { track: vocal, playing: true, startedAt: Date.now() } })

    // An explicit pause holds, including across a same-bed scene change.
    const paused = store.write({ music: { playing: false, position: 30, startedAt: 0 } })
    assert.equal(paused.state.music.playing, false)
    assert.equal(store.command({ type: 'scene', cue: 'entry', sceneId: '02' }).state.music.playing, false)

    // Resuming works from that state, keeping the position it paused at.
    const resumed = store.write({ music: { playing: true, startedAt: Date.now() } })
    assert.equal(resumed.state.music.playing, true)
    assert.equal(resumed.state.music.position, 30)

    // Crossing to the other bed while playing keeps playing.
    const crossed = store.command({ type: 'scene', cue: 'entry', sceneId: '03' })
    assert.equal(crossed.state.music.playing, true, 'a bed change must not silence the show')
    assert.ok(crossed.state.music.startedAt > 0, 'the new bed carries a start time so clients can seek')
    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
