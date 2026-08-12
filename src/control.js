import './control.css'
import { createObsController } from './obsController.js'
import {
  MIN_PRESENTER_SIZE,
  PRESENTER_PRESETS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  matchPreset,
  presetGeometry,
} from './presenter/presenterPresets.js'
import { LAYER_CUES } from './sceneCueEngine.js'
import { presenterStateForCue, sceneControlById, sceneControls } from './sceneControls.js'
import { fetchAvailableMusic, fetchSharedState, saveControlToken, sendSharedCommand, subscribeSharedState, updateSharedState } from './sharedControlClient.js'

const app = document.querySelector('#control-app')
let snapshot
let connectionStatus = 'connecting'
let busy = false
let errorMessage = ''
let countdownSceneId = ''
let countdownEndsAt = 0
let musicTracks = []
// Set while a drag is in flight so incoming shared state cannot re-render the
// stage out from under the operator's pointer mid-gesture.
let draggingPresenter = false

// OBS is optional and lives entirely in the controller (§24). Presentation
// pages never talk to it, so a failure here cannot affect program output.
const obs = createObsController({ onChange: () => render() })

const LAYER_META = Object.freeze([
  { key: 'background', label: 'Background', hint: 'Scene artwork and video loops' },
  { key: 'foreground', label: 'Foreground', hint: 'Scene cards, text, and data' },
  { key: 'presenter', label: 'Presenter camera', hint: 'Live webcam card' },
  { key: 'ticker', label: 'Ticker', hint: 'Bottom live activity bar' },
])

function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function ensureSceneCountdown(sceneId, durationSeconds) {
  if (countdownSceneId === sceneId) return
  countdownSceneId = sceneId
  countdownEndsAt = Date.now() + durationSeconds * 1000
}

function updateSceneCountdownDisplay() {
  const countdown = app.querySelector('[data-scene-countdown]')
  const status = app.querySelector('[data-scene-countdown-status]')
  if (!countdown || !status) return
  const remainingSeconds = Math.max(0, (countdownEndsAt - Date.now()) / 1000)
  const isComplete = remainingSeconds <= 0
  countdown.textContent = formatCountdown(remainingSeconds)
  countdown.classList.toggle('is-complete', isComplete)
  status.textContent = isComplete ? 'Switch scene' : 'Scene time remaining'
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function controlButton(label, action, value, options = {}) {
  const classes = ['control-button', options.kind ? `is-${options.kind}` : '', options.active ? 'is-active' : ''].filter(Boolean).join(' ')
  return `<button type="button" class="${classes}" data-action="${action}"${value == null ? '' : ` data-value="${escapeHtml(value)}"`}${busy ? ' disabled' : ''}>${escapeHtml(label)}</button>`
}

// OBS runs outside the browser, so the source list shows a full address the
// operator can copy. This resolves to the LAN host when the control room is
// opened from another device, which is exactly the address OBS needs.
function layerUrl(path) {
  return new URL(path, window.location.origin).href
}

function renderLayerPanel(state) {
  const layers = state.layers
  return `
    <article class="control-panel layer-panel">
      <div class="panel-heading">
        <div><span>Composite output</span><h2>Layers on air</h2></div>
        <span class="layer-count">${LAYER_META.filter((layer) => layers[layer.key]).length} / ${LAYER_META.length} visible</span>
      </div>
      <div class="layer-grid">
        ${LAYER_META.map((layer) => {
          const on = layers[layer.key] === true
          return `
            <button type="button" class="layer-toggle ${on ? 'is-on' : ''}" data-action="toggle-layer" data-value="${layer.key}" aria-pressed="${on}" ${busy ? 'disabled' : ''}>
              <span class="layer-toggle-state">${on ? 'On air' : 'Hidden'}</span>
              <strong>${escapeHtml(layer.label)}</strong>
              <small>${escapeHtml(layer.hint)}</small>
            </button>`
        }).join('')}
      </div>
      <p class="layer-hint">Every layer stacks in the single program page. Hiding one takes it off air instantly on every connected display.</p>
    </article>`
}

const OBS_STATUS_COPY = Object.freeze({
  connected: 'Connected',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
  error: 'Disconnected',
})

/**
 * Optional OBS renderer (§24).
 *
 * The browser is the presentation engine; this exists so a site that still
 * drives a physical OBS camera source can do so from the same presenter state.
 * It is collapsed and last on the page because it is not part of the normal
 * in-house workflow.
 */
function renderObsLegacyPanel(state) {
  const obsState = obs.getState()
  const config = state.obs
  const statusLabel = OBS_STATUS_COPY[obsState.status] ?? 'Disconnected'
  const sceneOptions = [
    '<option value="">Select a scene…</option>',
    ...obsState.scenes.map((name) => `<option value="${escapeHtml(name)}" ${name === config.sceneName ? 'selected' : ''}>${escapeHtml(name)}</option>`),
    config.sceneName && !obsState.scenes.includes(config.sceneName)
      ? `<option value="${escapeHtml(config.sceneName)}" selected>${escapeHtml(config.sceneName)}${obsState.scenes.length ? ' (not in OBS)' : ''}</option>`
      : '',
  ].join('')
  const sourceOptions = [
    '<option value="">Select a source…</option>',
    ...obsState.sources.map((name) => `<option value="${escapeHtml(name)}" ${name === config.sourceName ? 'selected' : ''}>${escapeHtml(name)}</option>`),
    config.sourceName && !obsState.sources.includes(config.sourceName)
      ? `<option value="${escapeHtml(config.sourceName)}" selected>${escapeHtml(config.sourceName)} (not in scene)</option>`
      : '',
  ].join('')

  return `
    <details class="control-panel obs-legacy-panel" ${config.enabled ? 'open' : ''}>
      <summary>
        <span class="obs-legacy-summary">
          <strong>OBS presenter output (legacy)</strong>
          <small>Optional. Not required for the browser program page.</small>
        </span>
        <span class="obs-status"><i class="obs-status-dot is-${escapeHtml(obsState.status)}"></i>${escapeHtml(statusLabel)}</span>
      </summary>

      <p class="obs-hint">The browser program page is the presentation engine. Enable this only to also drive a camera source inside OBS from the same presenter state.</p>
      <div class="obs-legacy-enable">
        ${controlButton(config.enabled ? 'Disable OBS output' : 'Enable OBS output', 'toggle-obs-enabled', null, { kind: config.enabled ? 'quiet' : 'primary', active: config.enabled })}
      </div>

      ${config.enabled ? `
        ${obsState.error ? `<p class="obs-error" role="status">${escapeHtml(obsState.error)}</p>` : ''}
        <form class="obs-connection-form" data-obs-connection-form>
          <label class="obs-field"><span>Host</span><input type="text" name="host" value="${escapeHtml(config.host)}" placeholder="127.0.0.1" ${busy ? 'disabled' : ''}></label>
          <label class="obs-field"><span>Port</span><input type="number" name="port" min="1" max="65535" value="${escapeHtml(config.port)}" ${busy ? 'disabled' : ''}></label>
          <label class="obs-field"><span>Password</span><input type="password" name="password" value="${escapeHtml(config.password)}" autocomplete="off" placeholder="Optional" ${busy ? 'disabled' : ''}></label>
          <div class="obs-connection-actions">
            <button type="submit" ${busy ? 'disabled' : ''}>${obsState.connected ? 'Reconnect' : 'Connect'}</button>
            <button type="button" data-action="obs-disconnect" ${busy || !obsState.connected ? 'disabled' : ''}>Disconnect</button>
          </div>
        </form>
        <div class="obs-scene-picker">
          <label class="obs-field"><span>Scene</span><select data-obs-scene ${busy || !obsState.scenes.length ? 'disabled' : ''}>${sceneOptions}</select></label>
          <label class="obs-field"><span>Presenter source</span><select data-obs-source ${busy || !obsState.sources.length ? 'disabled' : ''}>${sourceOptions}</select></label>
          ${controlButton(obsState.discovering ? 'Refreshing…' : 'Refresh from OBS', 'obs-refresh', null, { kind: 'quiet' })}
        </div>
        <p class="obs-hint">Visibility and placement follow the same presenter state the browser layer uses, so the two renderers can never disagree.</p>
      ` : ''}
    </details>`
}

// A camera list is only meaningful for the machine that will open it, so this
// shows what the program page reported about itself rather than enumerating the
// controller's own webcams. That is what makes the picker correct when the
// control room is a laptop in another room.
const CAMERA_REPORT_STALE_MS = 60_000

function renderCameraPicker(state) {
  const camera = state.camera ?? { devices: [] }
  const devices = camera.devices ?? []
  const reported = Number(camera.reportedAt) || 0
  const online = reported > 0 && Date.now() - reported < CAMERA_REPORT_STALE_MS
  const pending = camera.requestedId && camera.requestedId !== camera.activeId

  if (!online) {
    return `
      <div class="camera-picker is-offline">
        <div class="camera-picker-heading"><span>Camera</span><em>Program page not connected</em></div>
        <p>Open <a href="/program" target="_blank" rel="noreferrer">/program</a> on the presentation computer. Its cameras appear here once it is running.</p>
      </div>`
  }

  const options = [
    `<option value="">Default camera</option>`,
    ...devices.map((device) => `<option value="${escapeHtml(device.deviceId)}" ${device.deviceId === camera.activeId ? 'selected' : ''}>${escapeHtml(device.label)}</option>`),
  ].join('')

  return `
    <div class="camera-picker">
      <div class="camera-picker-heading">
        <span>Camera on the presentation computer</span>
        <em>${devices.length} available${pending ? ' · switching…' : ''}</em>
      </div>
      <div class="camera-picker-row">
        <select data-camera-select ${busy ? 'disabled' : ''}>${options}</select>
        ${controlButton('Refresh', 'camera-refresh', null, { kind: 'quiet' })}
      </div>
      <small>${camera.activeLabel ? `On air: ${escapeHtml(camera.activeLabel)}` : 'No camera open yet.'} Phones and USB cameras appear here once the presentation computer sees them.</small>
    </div>`
}

// The drag surface is a scaled copy of the 1920x1080 stage. Rendering it at a
// fixed aspect ratio means pointer deltas convert to stage pixels with one
// multiply, and the operator sees the true framing rather than an abstraction.
function renderPresenterPanel(state) {
  const presenter = state.presenter
  const live = state.layers.presenter === true
  const activePreset = matchPreset(presenter)

  const left = (presenter.x / STAGE_WIDTH) * 100
  const top = (presenter.y / STAGE_HEIGHT) * 100
  const width = (presenter.width / STAGE_WIDTH) * 100
  const height = (presenter.height / STAGE_HEIGHT) * 100

  return `
    <article class="control-panel presenter-panel">
      <div class="panel-heading">
        <div><span>Web camera layer</span><h2>Presenter card</h2></div>
        <span class="presenter-state ${live ? 'is-live' : ''}">${live ? 'On air' : 'Hidden'}</span>
      </div>

      <div class="presenter-actions">
        ${controlButton(live ? 'Take presenter off air' : 'Put presenter on air', 'toggle-layer', 'presenter', { kind: live ? 'danger' : 'primary', active: live })}
      </div>

      <div class="presenter-stage" data-presenter-stage aria-label="Drag to position the presenter card">
        <div class="presenter-stage-grid" aria-hidden="true"></div>
        <div class="presenter-box ${live ? 'is-live' : ''}" data-presenter-box style="left:${left}%;top:${top}%;width:${width}%;height:${height}%">
          <span class="presenter-box-label">Presenter</span>
          <i class="presenter-handle" data-presenter-handle="nw"></i>
          <i class="presenter-handle" data-presenter-handle="ne"></i>
          <i class="presenter-handle" data-presenter-handle="sw"></i>
          <i class="presenter-handle" data-presenter-handle="se"></i>
        </div>
      </div>
      <p class="presenter-hint">Drag the box to move it, or pull a corner to resize. Changes apply live to every display.</p>

      <div class="presenter-preset-row">
        ${Object.values(PRESENTER_PRESETS).map((preset) => controlButton(preset.label, 'presenter-preset', preset.id, { kind: 'quiet', active: activePreset === preset.id })).join('')}
      </div>

      ${renderCameraPicker(state)}

      <div class="presenter-settings">
        <label class="obs-field"><span>Background removal</span><select data-presenter-removal ${busy ? 'disabled' : ''}><option value="true" ${presenter.backgroundRemoval ? 'selected' : ''}>AI removal on</option><option value="false" ${presenter.backgroundRemoval ? '' : 'selected'}>Off (plain camera)</option></select></label>
        <label class="obs-field"><span>Shape</span><select data-presenter-shape ${busy ? 'disabled' : ''}>${['rounded', 'square', 'circle'].map((shape) => `<option value="${shape}" ${shape === presenter.shape ? 'selected' : ''}>${shape[0].toUpperCase()}${shape.slice(1)}</option>`).join('')}</select></label>
        <label class="obs-field"><span>Scaling</span><select data-presenter-fit ${busy ? 'disabled' : ''}>${['cover', 'contain'].map((fit) => `<option value="${fit}" ${fit === presenter.fit ? 'selected' : ''}>${fit === 'cover' ? 'Fill the card' : 'Fit inside'}</option>`).join('')}</select></label>
        <label class="obs-field"><span>Mirror image</span><select data-presenter-mirrored ${busy ? 'disabled' : ''}><option value="true" ${presenter.mirrored ? 'selected' : ''}>Mirrored</option><option value="false" ${presenter.mirrored ? '' : 'selected'}>Not mirrored</option></select></label>
      </div>

      <div class="presenter-edge-row">
        <label class="obs-field"><span>Mask threshold <output data-mask-threshold-output>${Number(presenter.maskThreshold).toFixed(2)}</output></span><input type="range" min="0.05" max="0.95" step="0.05" value="${presenter.maskThreshold}" data-presenter-threshold ${busy ? 'disabled' : ''}></label>
        <label class="obs-field"><span>Edge feather <output data-edge-feather-output>${Number(presenter.edgeFeather).toFixed(2)}</output></span><input type="range" min="0" max="0.5" step="0.01" value="${presenter.edgeFeather}" data-presenter-feather ${busy ? 'disabled' : ''}></label>
      </div>

      <p class="presenter-hint">
        Camera hardware is configured on the presentation computer.
        <a href="/camera-setup" target="_blank" rel="noreferrer">Open camera setup ↗</a>
      </p>

      <div class="presenter-numbers">
        ${['x', 'y', 'width', 'height'].map((field) => `
          <label class="obs-field">
            <span>${field === 'x' ? 'Left (px)' : field === 'y' ? 'Top (px)' : field === 'width' ? 'Width (px)' : 'Height (px)'}</span>
            <input type="number" data-presenter-number="${field}" value="${Math.round(presenter[field])}" min="0" max="${field === 'x' || field === 'width' ? STAGE_WIDTH : STAGE_HEIGHT}" ${busy ? 'disabled' : ''}>
          </label>`).join('')}
      </div>

      <form class="presenter-name-form" data-presenter-label-form>
        <label class="obs-field">
          <span>Name badge</span>
          <input type="text" name="label" maxlength="80" value="${escapeHtml(presenter.label)}" placeholder="Name shown on the card" ${busy ? 'disabled' : ''}>
        </label>
        <div class="presenter-name-actions">
          <button type="submit" ${busy ? 'disabled' : ''}>Save name</button>
          ${controlButton(presenter.showLabel ? 'Hide badge' : 'Show badge', 'toggle-presenter-label', null, { kind: 'quiet', active: presenter.showLabel })}
        </div>
      </form>
    </article>`
}

function render() {
  if (!snapshot) {
    app.innerHTML = `<main class="control-loading"><span></span><p>Connecting to shared presentation state…</p></main>`
    return
  }

  const state = snapshot.state
  const config = sceneControlById[state.sceneId]
  ensureSceneCountdown(state.sceneId, config.durationSeconds)
  const initialCountdown = formatCountdown((countdownEndsAt - Date.now()) / 1000)
  const sceneNumber = Number(state.sceneId)
  const previous = String(sceneNumber === 1 ? 39 : sceneNumber - 1).padStart(2, '0')
  const next = String(sceneNumber === 39 ? 1 : sceneNumber + 1).padStart(2, '0')
  const tickerMessages = Array.isArray(state.ticker.messages) ? state.ticker.messages : []
  const music = state.music
  const selectedTrack = musicTracks.find((track) => track.url === music.track)
  const musicOptions = [
    '<option value="">Select a track…</option>',
    ...musicTracks.map((track) => `<option value="${escapeHtml(track.url)}" ${track.url === music.track ? 'selected' : ''}>${escapeHtml(track.name)}</option>`),
  ].join('')
  const cueButtons = [
    controlButton('Reset scene', 'cue', 'reset', { kind: 'quiet' }),
    controlButton(`Entry · ${config.entryCue.label}`, 'cue', config.entryCue.id, { kind: 'primary', active: state.command.cue === config.entryCue.id }),
    controlButton('Background in', 'cue', LAYER_CUES.background, { active: state.command.cue === LAYER_CUES.background }),
    controlButton('Foreground in', 'cue', LAYER_CUES.foreground, { active: state.command.cue === LAYER_CUES.foreground }),
    controlButton('Footer in', 'cue', LAYER_CUES.footer, { active: state.command.cue === LAYER_CUES.footer }),
    controlButton('Play full sequence', 'cue', LAYER_CUES.full, { kind: 'primary', active: state.command.cue === LAYER_CUES.full }),
    ...config.duringCues.map((cue) => controlButton(cue.label, 'cue', cue.id, { active: state.command.cue === cue.id })),
    controlButton(`Exit · ${config.exitCue.label}`, 'cue', config.exitCue.id, { kind: 'danger', active: state.command.cue === config.exitCue.id }),
  ].join('')

  app.innerHTML = `
    <main class="control-shell">
      <header class="control-header">
        <div>
          <p class="control-eyebrow">BemaHub Open Enrollment</p>
          <h1>Show Control Room</h1>
          <p>One shared state drives every layer of the program page — background, foreground, presenter camera, and ticker.</p>
        </div>
        <div class="connection-card">
          <span class="connection-dot is-${connectionStatus}"></span>
          <div class="connection-copy"><strong>${connectionStatus === 'connected' ? 'Live sync connected' : connectionStatus === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}</strong><small data-scene-countdown-status>Scene time remaining</small></div>
          <time class="scene-countdown" data-scene-countdown aria-label="Time remaining for scene ${state.sceneId}">${initialCountdown}</time>
        </div>
      </header>

      ${errorMessage ? `<div class="control-error" role="alert">${escapeHtml(errorMessage)}</div>` : ''}

      <section class="control-layout">
        <div class="control-main-column">
          <article class="control-panel active-scene-panel">
            <div class="panel-heading"><div><span>On air</span><h2>Scene ${state.sceneId}: ${escapeHtml(config.title)}</h2></div><div class="scene-stepper">${controlButton('← Previous', 'scene-full', previous, { kind: 'quiet' })}${controlButton('Next →', 'scene-full', next, { kind: 'quiet' })}</div></div>
            <div class="scene-grid" aria-label="Choose active scene">
              ${sceneControls.map((scene) => `<button type="button" data-action="scene" data-value="${scene.scene}" class="scene-picker ${scene.scene === state.sceneId ? 'is-active' : ''}" title="${escapeHtml(scene.title)}"${busy ? ' disabled' : ''}><strong>${scene.scene}</strong><span>${escapeHtml(scene.title)}</span></button>`).join('')}
            </div>
          </article>

          <article class="control-panel">
            <div class="panel-heading"><div><span>Scene-aware controls</span><h2>Animation and cue controls</h2></div><code>command #${state.command.sequence}</code></div>
            <div class="cue-grid">${cueButtons}</div>
            <div class="continuous-effects"><strong>Continuous effects in this scene</strong><p>${config.continuousEffects.map(escapeHtml).join(' · ')}</p></div>
          </article>

          ${renderLayerPanel(state)}

          ${renderPresenterPanel(state)}

          <article class="control-panel scene03-presenter-panel">
            <div class="panel-heading"><div><span>Scene 03</span><h2>Presenter card</h2></div></div>
            <form data-scene03-presenter-form>
              <label for="scene03-presenter-name">Presenter name</label>
              <div class="scene03-presenter-row">
                <input id="scene03-presenter-name" name="presenterName" maxlength="80" value="${escapeHtml(state.scene03PresenterName)}" placeholder="Enter the presenter’s name" ${busy ? 'disabled' : ''}>
                <button type="submit" ${busy ? 'disabled' : ''}>Edit</button>
              </div>
              <p>Updates the Scene 3 on-air presenter card immediately on every connected display.</p>
            </form>
          </article>

          <article class="control-panel settings-panel">
            <div class="panel-heading"><div><span>Global settings</span><h2>Playback and output behavior</h2></div></div>
            <div class="settings-grid">
              <div><h3>Animations</h3><p>Pause or resume CSS motion and scene lifecycle effects on every display.</p>${controlButton(state.animationsPaused ? 'Resume all animations' : 'Pause all animations', 'toggle-animations', null, { kind: state.animationsPaused ? 'primary' : 'quiet', active: state.animationsPaused })}</div>
              <div><h3>Background motion</h3><p>Choose video loops or force the static poster on every display.</p>${controlButton(state.backgroundVideo ? 'Use static posters' : 'Enable background video', 'toggle-background', null, { kind: 'quiet', active: !state.backgroundVideo })}</div>
              <div><h3>Presentation mode</h3><p>Live is the normal broadcast mode. Overlay and reference are for review.</p><select data-control-mode ${busy ? 'disabled' : ''}>${['live', 'overlay', 'reference'].map((mode) => `<option value="${mode}" ${mode === state.mode ? 'selected' : ''}>${mode[0].toUpperCase()}${mode.slice(1)}</option>`).join('')}</select></div>
            </div>
          </article>

          <article class="control-panel music-panel">
            <div class="panel-heading">
              <div><span>Shared program audio</span><h2>Music controls</h2></div>
              <span class="music-status ${music.playing ? 'is-playing' : ''}">${music.playing ? 'Playing' : 'Paused'}</span>
            </div>
            <div class="music-control-layout">
              <label class="music-track-picker">
                <span>Available music</span>
                <select data-music-track ${busy ? 'disabled' : ''}>${musicOptions}</select>
                <small>${selectedTrack ? `Selected: ${escapeHtml(selectedTrack.name)}` : musicTracks.length ? 'Choose a track to begin.' : 'No MP3 files found in public/assets/musics.'}</small>
              </label>
              <div class="music-transport" aria-label="Music playback">
                ${controlButton('Play', 'music-play', null, { kind: 'primary', active: music.playing })}
                ${controlButton('Pause', 'music-pause', null, { active: !music.playing })}
                ${controlButton(music.muted ? 'Unmute' : 'Mute', 'music-mute', null, { kind: 'quiet', active: music.muted })}
              </div>
              <label class="music-volume">
                <span><strong>Volume</strong><output data-music-volume-output>${Math.round(music.volume)}%</output></span>
                <input type="range" min="0" max="100" step="1" value="${music.volume}" data-music-volume aria-label="Music volume" ${busy ? 'disabled' : ''}>
              </label>
            </div>
          </article>

          <article class="control-panel data-mode-panel">
            <div class="panel-heading"><div><span>Scene 01 · 08 · 37 &amp; global ticker</span><h2>Live data source</h2></div></div>
            <div class="data-mode-layout">
              <div class="data-mode-tools">
                <p>Choose where the live counters, activity feed, and ticker read their numbers from. Every other scene is unaffected.</p>
                <div class="data-mode-actions">
                  ${controlButton('Simulated', 'set-data-mode', 'simulated', { kind: state.dataMode === 'simulated' ? 'primary' : 'quiet', active: state.dataMode === 'simulated' })}
                  ${controlButton('Backend (live)', 'set-data-mode', 'live', { kind: state.dataMode === 'live' ? 'primary' : 'quiet', active: state.dataMode === 'live' })}
                  ${controlButton('Hybrid', 'set-data-mode', 'hybrid', { kind: state.dataMode === 'hybrid' ? 'primary' : 'quiet', active: state.dataMode === 'hybrid' })}
                </div>
              </div>
              <form data-data-range-form>
                <label>Cue backend data from a date to today</label>
                <p class="data-range-hint">Sets the backend session start so joins, actions, referrals, QR scans, and CTA clicks reflect that date through the current day. Applies only when the data source is Backend or Hybrid.</p>
                <div class="data-range-row">
                  <input type="date" name="since" data-data-range-since value="${escapeHtml(state.dataRange.since ? state.dataRange.since.slice(0, 10) : '')}" ${busy ? 'disabled' : ''}>
                  <span>through today</span>
                  <div class="data-range-actions">
                    <button type="submit" ${busy ? 'disabled' : ''}>Apply range</button>
                    <button type="button" data-action="clear-data-range" ${busy ? 'disabled' : ''}>Clear</button>
                  </div>
                </div>
                ${state.dataRange.since ? `<p class="data-range-active">Active range: ${escapeHtml(new Date(state.dataRange.since).toLocaleDateString())} → today</p>` : ''}
              </form>
            </div>
          </article>

          <article class="control-panel ticker-panel">
            <div class="panel-heading"><div><span>Shared foreground</span><h2>Global live ticker</h2></div></div>
            <div class="ticker-control-layout">
              <div class="ticker-tools">
                <p>Visibility and motion</p>
                <div class="ticker-actions">${controlButton(state.ticker.visible ? 'Hide ticker' : 'Show ticker', 'toggle-ticker', null, { active: !state.ticker.visible })}${controlButton(state.ticker.paused ? 'Resume ticker' : 'Pause ticker', 'toggle-ticker-pause', null, { active: state.ticker.paused })}${controlButton('Clear ticker text', 'clear-ticker-content', null, { kind: 'quiet' })}</div>
              </div>
              <form data-announcement-form>
                <label for="priority-message">Add ticker message</label>
                <div class="ticker-announcement-row">
                  <input id="priority-message" name="message" maxlength="180" value="" placeholder="Type a message for every connected display" ${busy ? 'disabled' : ''}>
                  <div class="ticker-announcement-actions">
                    <button type="submit" ${busy ? 'disabled' : ''}>Add message</button>
                  </div>
                </div>
              </form>
              <div class="ticker-message-list" aria-label="Ticker messages">
                <div class="ticker-message-list-heading"><strong>Messages (${tickerMessages.length})</strong>${tickerMessages.length ? controlButton('Remove all', 'clear-announcements', null, { kind: 'quiet' }) : ''}</div>
                ${tickerMessages.length
                  ? `<ul>${tickerMessages.map((item) => `<li><span>${escapeHtml(item.message)}</span><button type="button" data-action="remove-announcement" data-value="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.message)}" ${busy ? 'disabled' : ''}>Remove</button></li>`).join('')}</ul>`
                  : '<p class="ticker-message-empty">No controller messages yet.</p>'}
              </div>
            </div>
          </article>

          ${renderObsLegacyPanel(state)}
        </div>

        <aside class="control-side-column">
          <article class="control-panel preview-panel">
            <div class="panel-heading"><div><span>Synced monitor</span><h2>Program preview</h2></div><a href="/?sync=true&output=obs&render=composite&clean=true" target="_blank" rel="noreferrer">Open ↗</a></div>
            <div class="preview-frame"><iframe src="/?sync=true&output=obs&render=composite&clean=true&controllerPreview=true" title="Synced program preview"></iframe></div>
            <p class="preview-note">The preview shows every layer except the camera, which only opens on the real program page.</p>
          </article>
          <article class="control-panel source-panel">
            <div class="panel-heading"><div><span>Display output</span><h2>Program URL</h2></div></div>
            <p class="source-panel-intro">Open this on the machine with the webcam and put it full screen on the output display. It is the entire show — all four layers composited in one page.</p>
            <ol class="source-url-list">
              <li><a href="/program" target="_blank" rel="noreferrer">${escapeHtml(layerUrl('/program'))}</a><span>Full program — background, foreground, presenter, ticker</span></li>
            </ol>
            <p>The camera needs permission once, on that page. Serve over HTTPS or localhost, or the browser will block webcam access.</p>
          </article>
          <details class="control-panel security-panel">
            <summary>Control server token</summary>
            <p>If the server was started with <code>CONTROL_TOKEN</code>, enter the same value here. It stays in this browser tab only.</p>
            <form data-token-form><input type="password" name="token" autocomplete="off" placeholder="Optional control token"><button type="submit">Save token</button></form>
          </details>
        </aside>
      </section>
    </main>`

  bindControls()
  updateSceneCountdownDisplay()
}

/**
 * Makes the presenter box draggable and resizable on the scaled stage.
 *
 * Two things keep this smooth. The box is moved directly in CSS during the
 * gesture rather than waiting for a server round trip, so it tracks the pointer
 * at screen rate; and the state is written once on release rather than on every
 * pointer frame, so a drag costs one revision instead of hundreds. `render()`
 * is suppressed while dragging so an unrelated state update cannot yank the
 * element out from under the pointer.
 */
function bindPresenterStage() {
  const stage = app.querySelector('[data-presenter-stage]')
  const box = app.querySelector('[data-presenter-box]')
  if (!stage || !box) return

  const startGesture = (event, handle) => {
    event.preventDefault()
    event.stopPropagation()
    const bounds = stage.getBoundingClientRect()
    // One scale factor converts pointer pixels to stage pixels in both axes,
    // because the surface holds a true 16:9 aspect ratio.
    const scale = STAGE_WIDTH / bounds.width
    const origin = { ...snapshot.state.presenter }
    const startX = event.clientX
    const startY = event.clientY
    draggingPresenter = true
    box.classList.add('is-dragging')

    const onMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) * scale
      const deltaY = (moveEvent.clientY - startY) * scale
      const next = handle
        ? resizeGeometry(origin, handle, deltaX, deltaY)
        : {
          ...origin,
          x: clamp(origin.x + deltaX, 0, STAGE_WIDTH - origin.width),
          y: clamp(origin.y + deltaY, 0, STAGE_HEIGHT - origin.height),
        }
      box.style.left = `${(next.x / STAGE_WIDTH) * 100}%`
      box.style.top = `${(next.y / STAGE_HEIGHT) * 100}%`
      box.style.width = `${(next.width / STAGE_WIDTH) * 100}%`
      box.style.height = `${(next.height / STAGE_HEIGHT) * 100}%`
      box.dataset.pendingGeometry = JSON.stringify(next)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      box.classList.remove('is-dragging')
      draggingPresenter = false
      const pending = box.dataset.pendingGeometry
      delete box.dataset.pendingGeometry
      if (!pending) return
      const geometry = JSON.parse(pending)
      runQuietly(() => updateSharedState({ presenter: geometry }), syncPresenterNumbers)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  box.addEventListener('pointerdown', (event) => {
    if (event.target.dataset.presenterHandle) return
    startGesture(event, null)
  })
  box.querySelectorAll('[data-presenter-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => startGesture(event, handle.dataset.presenterHandle))
  })
}

function clamp(value, min, max) {
  return Math.round(Math.min(Math.max(value, min), Math.max(min, max)))
}

// Resizing from a corner moves the two edges that corner touches and leaves the
// opposite corner pinned, which is what makes the gesture feel physical.
function resizeGeometry(origin, handle, deltaX, deltaY) {
  const right = origin.x + origin.width
  const bottom = origin.y + origin.height
  const west = handle.includes('w')
  const north = handle.includes('n')

  const x = west ? clamp(origin.x + deltaX, 0, right - MIN_PRESENTER_SIZE) : origin.x
  const y = north ? clamp(origin.y + deltaY, 0, bottom - MIN_PRESENTER_SIZE) : origin.y
  const width = west ? right - x : clamp(origin.width + deltaX, MIN_PRESENTER_SIZE, STAGE_WIDTH - origin.x)
  const height = north ? bottom - y : clamp(origin.height + deltaY, MIN_PRESENTER_SIZE, STAGE_HEIGHT - origin.y)
  return { x, y, width, height }
}


/**
 * Runs one operator action across every layer.
 *
 * A cue is a single show-control decision: it moves the background scene, the
 * ticker/foreground, and the presenter camera together. The presenter half is
 * written into the same shared state the operator's manual Show/Hide buttons
 * use, so cues and manual control can never disagree, and it is persisted even
 * when OBS is disconnected.
 */
async function runCue({ type, cue, sceneId, selectedQuestion }) {
  const targetScene = sceneId ?? snapshot.state.sceneId
  // Moving to a scene adopts that scene's entry intent even when the cue that
  // carries the move has none of its own (§19). Without this, switching scenes
  // would leave the previous scene's camera framing on air.
  const intentCue = sceneId && sceneId !== snapshot.state.sceneId ? 'entry' : cue
  const presenterState = presenterStateForCue(targetScene, intentCue)
  if (presenterState) {
    // One operator action moves the whole show together (§19): the scene's own
    // plan decides whether the camera is on air and which placement it takes,
    // so nobody has to remember to hide the camera between scenes. Dragging
    // still overrides freely — until the next cue that carries placement.
    const geometry = presenterState.preset ? presetGeometry(presenterState.preset) : null
    const current = snapshot.state.presenter
    const visibleChanged = snapshot.state.layers.presenter !== presenterState.visible
    const placementChanged = Boolean(geometry)
      && (current.x !== geometry.x || current.y !== geometry.y
        || current.width !== geometry.width || current.height !== geometry.height)
    // Skip the write when nothing actually differs, so unrelated cues do not
    // add revisions or disturb the camera.
    if (visibleChanged || placementChanged) {
      await updateSharedState({
        layers: { presenter: presenterState.visible },
        ...(geometry ? { presenter: geometry } : {}),
      })
    }
  }
  return sendSharedCommand({ type, cue, sceneId, selectedQuestion })
}

async function run(action) {
  busy = true
  errorMessage = ''
  render()
  try { snapshot = await action() } catch (error) { errorMessage = error.message } finally { busy = false; render() }
}

/**
 * Saves without re-rendering the page.
 *
 * A drag or resize already painted the result on screen, and it leaves the
 * pointer over a handle the operator may be about to use again. Re-rendering
 * would rebuild the panel underneath them — the flash that reads as the page
 * refreshing — so geometry writes update the live numbers in place instead.
 */
async function runQuietly(action, onSaved) {
  errorMessage = ''
  try {
    snapshot = await action()
    onSaved?.()
  } catch (error) {
    errorMessage = error.message
    render()
  }
}

/** Syncs the numeric fields to state without touching the drag surface. */
function syncPresenterNumbers() {
  const presenter = snapshot.state.presenter
  app.querySelectorAll('[data-presenter-number]').forEach((input) => {
    input.value = String(Math.round(presenter[input.dataset.presenterNumber]))
  })
}

/** Live-updates the readout while dragging, and saves once on release. */
function bindPresenterSlider(inputSelector, outputSelector, field) {
  const input = app.querySelector(inputSelector)
  const output = app.querySelector(outputSelector)
  input?.addEventListener('input', (event) => {
    if (output) output.textContent = Number(event.target.value).toFixed(2)
  })
  input?.addEventListener('change', (event) => {
    runQuietly(() => updateSharedState({ presenter: { [field]: Number(event.target.value) } }))
  })
}

/**
 * Mirrors generic presenter state onto OBS (§24, §7).
 *
 * OBS becomes one renderer of the same intent the browser layer renders, so
 * the two can never disagree. A no-op when OBS is disabled or disconnected.
 */
async function syncObsPresenter(state, options = {}) {
  if (!state.obs.enabled || !state.obs.sourceName) return
  await obs.applyPresenter({
    sceneName: state.obs.sceneName,
    sourceName: state.obs.sourceName,
    visible: state.layers.presenter === true,
    preset: matchPreset(state.presenter),
  }, options).catch((error) => console.warn('OBS presenter sync failed.', error))
}

const GEOMETRY_FIELDS = ['x', 'y', 'width', 'height']

/**
 * True when the only difference between two states is presenter geometry.
 *
 * Comparing everything else as JSON keeps this honest as state grows: a new
 * field added later fails the check and falls back to a full render rather
 * than being silently ignored here.
 */
function onlyPresenterGeometryChanged(previous, next) {
  if (!previous || !next) return false
  const strip = (state) => {
    const presenter = { ...state.presenter }
    GEOMETRY_FIELDS.forEach((field) => delete presenter[field])
    return JSON.stringify({ ...state, presenter })
  }
  if (strip(previous) !== strip(next)) return false
  return GEOMETRY_FIELDS.some((field) => previous.presenter[field] !== next.presenter[field])
}

/** Moves the drag box to match state, for changes that did not come from a drag. */
function syncPresenterBox() {
  const box = app.querySelector('[data-presenter-box]')
  if (!box) return
  const { x, y, width, height } = snapshot.state.presenter
  box.style.left = `${(x / STAGE_WIDTH) * 100}%`
  box.style.top = `${(y / STAGE_HEIGHT) * 100}%`
  box.style.width = `${(width / STAGE_WIDTH) * 100}%`
  box.style.height = `${(height / STAGE_HEIGHT) * 100}%`
}

function bindControls() {
  app.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action
      const value = button.dataset.value
      if (action === 'scene') run(() => runCue({ type: 'scene', cue: LAYER_CUES.background, sceneId: value }))
      if (action === 'scene-full') run(() => runCue({ type: 'scene', cue: LAYER_CUES.full, sceneId: value }))
      if (action === 'cue') {
        const selectedQuestion = /^question-[1-4]$/.test(value) ? Number(value.split('-')[1]) : undefined
        run(() => runCue({ type: value === 'reset' ? 'reset' : 'cue', cue: value, selectedQuestion }))
      }
      if (action === 'toggle-animations') run(() => updateSharedState({ animationsPaused: !snapshot.state.animationsPaused }))
      if (action === 'toggle-background') run(() => updateSharedState({ backgroundVideo: !snapshot.state.backgroundVideo }))
      if (action === 'toggle-ticker') run(() => updateSharedState({ ticker: { visible: !snapshot.state.ticker.visible } }))
      if (action === 'toggle-ticker-pause') run(() => updateSharedState({ ticker: { paused: !snapshot.state.ticker.paused } }))
      if (action === 'clear-ticker-content') run(() => updateSharedState({
        ticker: {
          clearId: snapshot.state.ticker.clearId + 1,
          messages: [],
          priorityMessage: '',
          priorityId: snapshot.state.ticker.priorityId + 1,
        },
      }))
      if (action === 'remove-announcement') {
        const messages = snapshot.state.ticker.messages.filter((item) => item.id !== value)
        run(() => updateSharedState({ ticker: { messages, priorityMessage: messages.at(-1)?.message || '' } }))
      }
      if (action === 'clear-announcements') run(() => updateSharedState({ ticker: { messages: [], priorityMessage: '', priorityId: snapshot.state.ticker.priorityId + 1 } }))
      if (action === 'set-data-mode') run(() => updateSharedState({ dataMode: value }))
      if (action === 'clear-data-range') run(() => updateSharedState({ dataRange: { since: '', until: '' } }))
      if (action === 'music-play' && snapshot.state.music.track) {
        const music = snapshot.state.music
        run(() => updateSharedState({ music: { playing: true, startedAt: Date.now() } }))
      }
      if (action === 'music-pause') {
        const music = snapshot.state.music
        const position = music.playing && music.startedAt
          ? music.position + Math.max(0, (Date.now() - music.startedAt) / 1000)
          : music.position
        run(() => updateSharedState({ music: { playing: false, position, startedAt: 0 } }))
      }
      if (action === 'music-mute') run(() => updateSharedState({ music: { muted: !snapshot.state.music.muted } }))
      if (action === 'toggle-layer') run(() => updateSharedState({ layers: { [value]: !snapshot.state.layers[value] } }))
      if (action === 'presenter-preset') {
        const preset = PRESENTER_PRESETS[value]
        if (preset) {
          runQuietly(
            () => updateSharedState({ presenter: { x: preset.x, y: preset.y, width: preset.width, height: preset.height } }),
            () => { syncPresenterBox(); syncPresenterNumbers() },
          )
        }
      }
      if (action === 'toggle-presenter-label') run(() => updateSharedState({ presenter: { showLabel: !snapshot.state.presenter.showLabel } }))
      if (action === 'camera-refresh') {
        // Re-requesting the device already on air makes the program page
        // re-enumerate and republish, which picks up newly attached hardware.
        run(() => updateSharedState({
          camera: {
            requestedId: snapshot.state.camera?.activeId || '',
            requestSequence: (Number(snapshot.state.camera?.requestSequence) || 0) + 1,
          },
        }))
      }
      if (action === 'toggle-obs-enabled') {
        const enabled = !snapshot.state.obs.enabled
        if (!enabled) obs.disconnect()
        run(() => updateSharedState({ obs: { enabled, ...(enabled ? {} : { autoConnect: false }) } }))
      }
      if (action === 'obs-disconnect') {
        obs.disconnect()
        run(() => updateSharedState({ obs: { autoConnect: false } }))
      }
      if (action === 'obs-refresh') obs.discover(snapshot.state.obs.sceneName)
    })
  })

  bindPresenterStage()

  app.querySelector('[data-camera-select]')?.addEventListener('change', (event) => {
    // Bumping the sequence is what marks this as a new request; the program
    // page applies it and reports back which device actually opened.
    run(() => updateSharedState({
      camera: {
        requestedId: event.target.value,
        requestSequence: (Number(snapshot.state.camera?.requestSequence) || 0) + 1,
      },
    }))
  })
  app.querySelector('[data-presenter-removal]')?.addEventListener('change', (event) => run(() => updateSharedState({ presenter: { backgroundRemoval: event.target.value === 'true' } })))
  bindPresenterSlider('[data-presenter-threshold]', '[data-mask-threshold-output]', 'maskThreshold')
  bindPresenterSlider('[data-presenter-feather]', '[data-edge-feather-output]', 'edgeFeather')
  app.querySelector('[data-presenter-shape]')?.addEventListener('change', (event) => run(() => updateSharedState({ presenter: { shape: event.target.value } })))
  app.querySelector('[data-presenter-fit]')?.addEventListener('change', (event) => run(() => updateSharedState({ presenter: { fit: event.target.value } })))
  app.querySelector('[data-presenter-mirrored]')?.addEventListener('change', (event) => run(() => updateSharedState({ presenter: { mirrored: event.target.value === 'true' } })))
  app.querySelectorAll('[data-presenter-number]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const field = input.dataset.presenterNumber
      runQuietly(
        () => updateSharedState({ presenter: { [field]: Number(event.target.value) } }),
        () => { syncPresenterBox(); syncPresenterNumbers() },
      )
    })
  })
  app.querySelector('[data-obs-connection-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const config = {
      host: form.get('host')?.toString().trim() || '127.0.0.1',
      port: Number(form.get('port')) || 4455,
      password: form.get('password')?.toString() || '',
    }
    run(async () => {
      const saved = await updateSharedState({ obs: config })
      const connected = await obs.connect({ ...config, sceneName: saved.state.obs.sceneName })
      if (!connected) return saved
      await syncObsPresenter(saved.state, { force: true })
      return updateSharedState({ obs: { autoConnect: true } })
    })
  })
  app.querySelector('[data-obs-scene]')?.addEventListener('change', (event) => {
    const sceneName = event.target.value
    run(async () => {
      const saved = await updateSharedState({ obs: { sceneName } })
      await obs.discover(sceneName)
      return saved
    })
  })
  app.querySelector('[data-obs-source]')?.addEventListener('change', (event) => {
    run(() => updateSharedState({ obs: { sourceName: event.target.value } }))
  })
  app.querySelector('[data-presenter-label-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const label = new FormData(event.currentTarget).get('label')?.toString().trim() || ''
    run(() => updateSharedState({ presenter: { label, showLabel: Boolean(label) } }))
  })
  app.querySelector('[data-control-mode]')?.addEventListener('change', (event) => run(() => updateSharedState({ mode: event.target.value })))
  app.querySelector('[data-music-track]')?.addEventListener('change', (event) => {
    const track = event.target.value
    run(() => updateSharedState({
      music: {
        track,
        playing: Boolean(track) && snapshot.state.music.playing,
        position: 0,
        startedAt: track && snapshot.state.music.playing ? Date.now() : 0,
      },
    }))
  })
  const volume = app.querySelector('[data-music-volume]')
  volume?.addEventListener('input', (event) => {
    app.querySelector('[data-music-volume-output]').textContent = `${event.target.value}%`
  })
  volume?.addEventListener('change', (event) => run(() => updateSharedState({ music: { volume: Number(event.target.value) } })))
  app.querySelector('[data-data-range-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const since = new FormData(event.currentTarget).get('since')?.toString().trim() || ''
    if (!since) return
    run(() => updateSharedState({ dataRange: { since: new Date(`${since}T00:00:00Z`).toISOString(), until: '' } }))
  })
  app.querySelector('[data-scene03-presenter-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const scene03PresenterName = new FormData(event.currentTarget).get('presenterName')?.toString().trim() || ''
    if (!scene03PresenterName) return
    run(() => updateSharedState({ scene03PresenterName }))
  })
  app.querySelector('[data-announcement-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = new FormData(event.currentTarget).get('message')?.toString().trim() || ''
    if (!message) return
    const id = globalThis.crypto?.randomUUID?.() || `message-${Date.now()}-${Math.random().toString(36).slice(2)}`
    run(() => updateSharedState({
      ticker: {
        messages: [...snapshot.state.ticker.messages, { id, message }],
        priorityMessage: message,
        priorityId: snapshot.state.ticker.priorityId + 1,
        visible: true,
      },
    }))
  })
  app.querySelector('[data-token-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    saveControlToken(new FormData(event.currentTarget).get('token')?.toString() || '')
    errorMessage = ''
    render()
  })
}

async function boot() {
  try {
    const [initialSnapshot, musicLibrary] = await Promise.all([fetchSharedState(), fetchAvailableMusic()])
    snapshot = initialSnapshot
    musicTracks = Array.isArray(musicLibrary.tracks) ? musicLibrary.tracks : []
    connectionStatus = 'connected'
    render()
    // Reconnect to OBS only when the operator has enabled the legacy renderer
    // before; browser-only shows never open a socket (§24).
    if (snapshot.state.obs.enabled && snapshot.state.obs.autoConnect) {
      obs.connect(snapshot.state.obs).then((ok) => { if (ok) syncObsPresenter(snapshot.state, { force: true }) })
    }
    subscribeSharedState((next) => {
      if (next.revision <= snapshot.revision) return
      const previous = snapshot.state
      snapshot = next
      errorMessage = ''
      // A re-render mid-drag would replace the element the pointer is holding.
      // The drag writes its own result on release, so skipping here is safe.
      if (draggingPresenter) return
      // A geometry-only change — including this operator's own write echoing
      // back — moves the box in place. Rebuilding the panel here is what made
      // resizing look like the page was refreshing.
      // Mirror onto OBS when the legacy renderer is enabled; a no-op otherwise.
      syncObsPresenter(next.state)
      if (onlyPresenterGeometryChanged(previous, next.state)) {
        syncPresenterBox()
        syncPresenterNumbers()
        return
      }
      render()
    }, (status) => { connectionStatus = status; render() })
  } catch (error) {
    errorMessage = error.message
    app.innerHTML = `<main class="control-fatal"><h1>Control server unavailable</h1><p>${escapeHtml(error.message)}</p><p>Start this project with <code>npm run dev</code>, not the standalone Vite command.</p></main>`
  }
}

boot()
window.setInterval(updateSceneCountdownDisplay, 250)
