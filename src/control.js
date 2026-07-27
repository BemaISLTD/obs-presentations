import './control.css'
import { LAYER_CUES } from './sceneCueEngine.js'
import { sceneControlById, sceneControls } from './sceneControls.js'
import { fetchAvailableMusic, fetchSharedState, saveControlToken, sendSharedCommand, subscribeSharedState, updateSharedState } from './sharedControlClient.js'

const app = document.querySelector('#control-app')
let snapshot
let connectionStatus = 'connecting'
let busy = false
let errorMessage = ''
let countdownSceneId = ''
let countdownEndsAt = 0
let musicTracks = []

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
          </article>
          <article class="control-panel source-panel">
            <div class="panel-heading"><div><span>OBS browser sources</span><h2>Synced URLs</h2></div></div>
            <a href="/?sync=true&output=obs&render=underlay&clean=true" target="_blank">Underlay (behind camera)</a>
            <a href="/?sync=true&output=obs&render=foreground&clean=true" target="_blank">Foreground (above camera)</a>
            <a href="/?sync=true&output=obs&render=composite&clean=true" target="_blank">Composite program</a>
            <p>All URLs keep their own physical layer while following the active scene, mode, cues, ticker, and animation settings.</p>
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
      if (action === 'scene') run(() => sendSharedCommand({ type: 'scene', cue: LAYER_CUES.background, sceneId: value }))
      if (action === 'scene-full') run(() => sendSharedCommand({ type: 'scene', cue: LAYER_CUES.full, sceneId: value }))
      if (action === 'cue') {
        const selectedQuestion = /^question-[1-4]$/.test(value) ? Number(value.split('-')[1]) : undefined
        run(() => sendSharedCommand({ type: value === 'reset' ? 'reset' : 'cue', cue: value, selectedQuestion }))
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
    subscribeSharedState((next) => {
      if (next.revision <= snapshot.revision) return
      snapshot = next
      errorMessage = ''
      render()
    }, (status) => { connectionStatus = status; render() })
  } catch (error) {
    errorMessage = error.message
    app.innerHTML = `<main class="control-fatal"><h1>Control server unavailable</h1><p>${escapeHtml(error.message)}</p><p>Start this project with <code>npm run dev</code>, not the standalone Vite command.</p></main>`
  }
}

boot()
window.setInterval(updateSceneCountdownDisplay, 250)
