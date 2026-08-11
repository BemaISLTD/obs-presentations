import './control.css'
import { createObsController } from './obsController.js'
import { PRESENTER_PRESETS } from './obsPresenterDirector.js'
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

// The OBS connection lives in the controller only. Presentation pages never
// talk to OBS, so a failure here can never affect the program output.
const obs = createObsController({ onChange: () => render() })

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

const OBS_STATUS_COPY = Object.freeze({
  connected: 'Connected',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
  error: 'Disconnected',
})

function renderObsSourceRow(key, source, obsState) {
  const knownSource = !source.sourceName || obsState.sources.includes(source.sourceName)
  const options = [
    '<option value="">Select a source…</option>',
    ...obsState.sources.map((name) => `<option value="${escapeHtml(name)}" ${name === source.sourceName ? 'selected' : ''}>${escapeHtml(name)}</option>`),
    // Keep a configured name selectable even when OBS is closed or the name was
    // typed manually, so the setting is never silently lost.
    !knownSource ? `<option value="${escapeHtml(source.sourceName)}" selected>${escapeHtml(source.sourceName)} (not in scene)</option>` : '',
  ].join('')

  return `
    <div class="obs-source-row" data-obs-source-row="${escapeHtml(key)}">
      <div class="obs-source-heading">
        <strong>${escapeHtml(source.label || key)}</strong>
        <span class="obs-source-state ${source.visible ? 'is-live' : ''}">${source.visible ? 'On air' : 'Hidden'}</span>
      </div>
      <label class="obs-field">
        <span>OBS source</span>
        <select data-obs-source-select="${escapeHtml(key)}" ${busy || !obsState.sources.length ? 'disabled' : ''}>${options}</select>
      </label>
      <label class="obs-field">
        <span>Or type the source name</span>
        <input type="text" data-obs-source-name="${escapeHtml(key)}" value="${escapeHtml(source.sourceName)}" maxlength="200" placeholder="Presenter Camera" ${busy ? 'disabled' : ''}>
      </label>
      <label class="obs-field">
        <span>Placement preset</span>
        <select data-obs-source-preset="${escapeHtml(key)}" ${busy ? 'disabled' : ''}>
          ${Object.entries(PRESENTER_PRESETS).map(([id, preset]) => `<option value="${id}" ${id === source.preset ? 'selected' : ''}>${escapeHtml(preset.label)}</option>`).join('')}
        </select>
      </label>
      <div class="obs-source-actions">
        ${controlButton('Show', 'obs-source-show', key, { kind: 'primary', active: source.visible })}
        ${controlButton('Hide', 'obs-source-hide', key, { active: !source.visible })}
      </div>
    </div>`
}

function renderObsPanel(state) {
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

  return `
    <article class="control-panel obs-panel">
      <div class="panel-heading">
        <div><span>Live video layer</span><h2>OBS connection</h2></div>
        <span class="obs-status"><i class="obs-status-dot is-${escapeHtml(obsState.status)}"></i>${escapeHtml(statusLabel)}</span>
      </div>

      ${obsState.error ? `<p class="obs-error" role="status">${escapeHtml(obsState.error)}</p>` : ''}

      <form class="obs-connection-form" data-obs-connection-form>
        <label class="obs-field"><span>Host</span><input type="text" name="host" value="${escapeHtml(config.host)}" placeholder="127.0.0.1" ${busy ? 'disabled' : ''}></label>
        <label class="obs-field"><span>Port</span><input type="number" name="port" min="1" max="65535" value="${escapeHtml(config.port)}" ${busy ? 'disabled' : ''}></label>
        <label class="obs-field"><span>Password</span><input type="password" name="password" value="${escapeHtml(config.password)}" autocomplete="off" placeholder="Optional" ${busy ? 'disabled' : ''}></label>
        <div class="obs-connection-actions">
          <button type="submit" ${busy ? 'disabled' : ''}>${obsState.connected ? 'Reconnect' : 'Connect'}</button>
          <button type="button" data-action="obs-disconnect" ${busy || !obsState.connected ? 'disabled' : ''}>Disconnect</button>
        </div>
        <p class="obs-hint">Runs entirely on the local network. Use the OBS computer's LAN address when the controller is on another device.</p>
      </form>

      <div class="obs-scene-picker">
        <label class="obs-field">
          <span>Scene to control</span>
          <select data-obs-scene ${busy || !obsState.scenes.length ? 'disabled' : ''}>${sceneOptions}</select>
        </label>
        <label class="obs-field">
          <span>Or type the scene name</span>
          <input type="text" data-obs-scene-name value="${escapeHtml(config.sceneName)}" maxlength="200" placeholder="OPEN ENROLLMENT MASTER" ${busy ? 'disabled' : ''}>
        </label>
        ${controlButton(obsState.discovering ? 'Refreshing…' : 'Refresh from OBS', 'obs-refresh', null, { kind: 'quiet' })}
      </div>

      <div class="obs-source-list">
        ${Object.entries(config.sources).map(([key, source]) => renderObsSourceRow(key, source, obsState)).join('')}
      </div>
      <p class="obs-hint">Presenter visibility is also driven by scene cues. Showing or hiding here updates the same shared state, so cues and manual control never disagree.</p>
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
          <h1>OBS Control Room</h1>
          <p>One shared state controls every connected presentation and OBS browser source.</p>
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

          ${renderObsPanel(state)}

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
        </div>

        <aside class="control-side-column">
          <article class="control-panel preview-panel">
            <div class="panel-heading"><div><span>Synced monitor</span><h2>Program preview</h2></div><a href="/?sync=true&output=obs&render=composite&clean=true" target="_blank" rel="noreferrer">Open ↗</a></div>
            <div class="preview-frame"><iframe src="/?sync=true&output=obs&render=composite&clean=true&controllerPreview=true" title="Synced program preview"></iframe></div>
            <div class="preview-layer-links">
              <a href="/presentation" target="_blank" rel="noreferrer"><strong>Presentation ↗</strong><small>Background layer</small></a>
              <a href="/ticker" target="_blank" rel="noreferrer"><strong>Ticker ↗</strong><small>Transparent foreground</small></a>
              <a href="/program" target="_blank" rel="noreferrer"><strong>Program ↗</strong><small>Both layers combined</small></a>
            </div>
          </article>
          <article class="control-panel source-panel">
            <div class="panel-heading"><div><span>OBS browser sources</span><h2>Synced URLs</h2></div></div>
            <p class="source-panel-intro">Paste these into OBS, top of the list first. The presenter camera goes between them.</p>
            <ol class="source-url-list">
              <li><a href="/ticker" target="_blank" rel="noreferrer">${escapeHtml(layerUrl('/ticker'))}</a><span>Ticker / foreground — above the camera</span></li>
              <li class="source-url-camera"><span>Presenter camera — your OBS video source</span></li>
              <li><a href="/presentation" target="_blank" rel="noreferrer">${escapeHtml(layerUrl('/presentation'))}</a><span>Background presentation — behind the camera</span></li>
            </ol>
            <p>Each URL keeps its own physical layer while following the active scene, mode, cues, ticker, and animation settings. Set both browser sources to 1920×1080.</p>
            <details class="source-url-legacy">
              <summary>Full query-string URLs</summary>
              <a href="/?sync=true&output=obs&render=underlay&clean=true" target="_blank" rel="noreferrer">Underlay (behind camera)</a>
              <a href="/?sync=true&output=obs&render=foreground&clean=true" target="_blank" rel="noreferrer">Foreground (above camera)</a>
              <a href="/?sync=true&output=obs&render=composite&clean=true" target="_blank" rel="noreferrer">Composite program</a>
            </details>
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
  const presenterState = presenterStateForCue(targetScene, cue)
  if (presenterState) {
    const presenter = snapshot.state.obs.sources.presenter
    const changed = presenter.visible !== presenterState.visible
      || (presenterState.preset && presenter.preset !== presenterState.preset)
    // Only write when the cue actually changes the presenter, so unrelated cues
    // do not add revisions or re-issue OBS calls.
    if (changed) await updateSharedState({ obs: { sources: { presenter: presenterState } } })
  }
  return sendSharedCommand({ type, cue, sceneId, selectedQuestion })
}

async function run(action) {
  busy = true
  errorMessage = ''
  render()
  try { snapshot = await action() } catch (error) { errorMessage = error.message } finally { busy = false; render() }
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
      if (action === 'obs-disconnect') {
        obs.disconnect()
        run(() => updateSharedState({ obs: { autoConnect: false } }))
      }
      if (action === 'obs-refresh') obs.discover(snapshot.state.obs.sceneName)
      if (action === 'obs-source-show' || action === 'obs-source-hide') {
        const visible = action === 'obs-source-show'
        run(() => updateSharedState({ obs: { sources: { [value]: { visible } } } }))
      }
    })
  })

  app.querySelector('[data-obs-connection-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const obsConfig = {
      host: form.get('host')?.toString().trim() || '127.0.0.1',
      port: Number(form.get('port')) || 4455,
      password: form.get('password')?.toString() || '',
    }
    run(async () => {
      const saved = await updateSharedState({ obs: obsConfig })
      const connected = await obs.connect({ ...obsConfig, sceneName: saved.state.obs.sceneName })
      if (!connected) return saved
      await obs.syncSources(saved.state.obs, { force: true })
      return updateSharedState({ obs: { autoConnect: true } })
    })
  })

  const applySceneName = (sceneName) => run(async () => {
    const saved = await updateSharedState({ obs: { sceneName } })
    await obs.discover(sceneName)
    return saved
  })
  app.querySelector('[data-obs-scene]')?.addEventListener('change', (event) => applySceneName(event.target.value))
  app.querySelector('[data-obs-scene-name]')?.addEventListener('change', (event) => applySceneName(event.target.value.trim()))

  app.querySelectorAll('[data-obs-source-select]').forEach((select) => {
    select.addEventListener('change', (event) => {
      const key = select.dataset.obsSourceSelect
      run(() => updateSharedState({ obs: { sources: { [key]: { sourceName: event.target.value } } } }))
    })
  })
  app.querySelectorAll('[data-obs-source-name]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const key = input.dataset.obsSourceName
      run(() => updateSharedState({ obs: { sources: { [key]: { sourceName: event.target.value.trim() } } } }))
    })
  })
  app.querySelectorAll('[data-obs-source-preset]').forEach((select) => {
    select.addEventListener('change', (event) => {
      const key = select.dataset.obsSourcePreset
      run(() => updateSharedState({ obs: { sources: { [key]: { preset: event.target.value } } } }))
    })
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
    // Reconnect to OBS automatically once the operator has connected before, so
    // reloading the control room does not require re-entering the connection.
    if (snapshot.state.obs.autoConnect) {
      obs.connect(snapshot.state.obs).then((ok) => { if (ok) obs.syncSources(snapshot.state.obs, { force: true }) })
    }
    subscribeSharedState((next) => {
      if (next.revision <= snapshot.revision) return
      snapshot = next
      errorMessage = ''
      render()
      // Mirror the new shared state onto OBS. This is a no-op when nothing
      // OBS-related changed, and silently skipped when OBS is not connected.
      obs.syncSources(next.state.obs)
    }, (status) => { connectionStatus = status; render() })
  } catch (error) {
    errorMessage = error.message
    app.innerHTML = `<main class="control-fatal"><h1>Control server unavailable</h1><p>${escapeHtml(error.message)}</p><p>Start this project with <code>npm run dev</code>, not the standalone Vite command.</p></main>`
  }
}

boot()
window.setInterval(updateSceneCountdownDisplay, 250)
