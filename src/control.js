import './control.css'
import { LAYER_CUES } from './sceneCueEngine.js'
import { sceneControlById, sceneControls } from './sceneControls.js'
import { fetchSharedState, saveControlToken, sendSharedCommand, subscribeSharedState, updateSharedState } from './sharedControlClient.js'

const app = document.querySelector('#control-app')
let snapshot
let connectionStatus = 'connecting'
let busy = false
let errorMessage = ''

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
  const sceneNumber = Number(state.sceneId)
  const previous = String(sceneNumber === 1 ? 39 : sceneNumber - 1).padStart(2, '0')
  const next = String(sceneNumber === 39 ? 1 : sceneNumber + 1).padStart(2, '0')
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
          <div><strong>${connectionStatus === 'connected' ? 'Live sync connected' : connectionStatus === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}</strong><small>Revision ${snapshot.revision} · ${new Date(snapshot.updatedAt).toLocaleTimeString()}</small></div>
        </div>
      </header>

      ${errorMessage ? `<div class="control-error" role="alert">${escapeHtml(errorMessage)}</div>` : ''}

      <section class="control-layout">
        <div class="control-main-column">
          <article class="control-panel active-scene-panel">
            <div class="panel-heading"><div><span>On air</span><h2>Scene ${state.sceneId}: ${escapeHtml(config.title)}</h2></div><div class="scene-stepper">${controlButton('← Previous', 'scene', previous, { kind: 'quiet' })}${controlButton('Next →', 'scene', next, { kind: 'quiet' })}</div></div>
            <div class="scene-grid" aria-label="Choose active scene">
              ${sceneControls.map((scene) => `<button type="button" data-action="scene" data-value="${scene.scene}" class="scene-picker ${scene.scene === state.sceneId ? 'is-active' : ''}" title="${escapeHtml(scene.title)}"${busy ? ' disabled' : ''}><strong>${scene.scene}</strong><span>${escapeHtml(scene.title)}</span></button>`).join('')}
            </div>
          </article>

          <article class="control-panel">
            <div class="panel-heading"><div><span>Scene-aware controls</span><h2>Animation and cue controls</h2></div><code>command #${state.command.sequence}</code></div>
            <div class="cue-grid">${cueButtons}</div>
            <div class="continuous-effects"><strong>Continuous effects in this scene</strong><p>${config.continuousEffects.map(escapeHtml).join(' · ')}</p></div>
          </article>

          <article class="control-panel settings-panel">
            <div class="panel-heading"><div><span>Global settings</span><h2>Playback and output behavior</h2></div></div>
            <div class="settings-grid">
              <div><h3>Animations</h3><p>Pause or resume CSS motion and scene lifecycle effects on every display.</p>${controlButton(state.animationsPaused ? 'Resume all animations' : 'Pause all animations', 'toggle-animations', null, { kind: state.animationsPaused ? 'primary' : 'quiet', active: state.animationsPaused })}</div>
              <div><h3>Background motion</h3><p>Choose video loops or force the static poster on every display.</p>${controlButton(state.backgroundVideo ? 'Use static posters' : 'Enable background video', 'toggle-background', null, { kind: 'quiet', active: !state.backgroundVideo })}</div>
              <div><h3>Presentation mode</h3><p>Live is the normal broadcast mode. Overlay and reference are for review.</p><select data-control-mode ${busy ? 'disabled' : ''}>${['live', 'overlay', 'reference'].map((mode) => `<option value="${mode}" ${mode === state.mode ? 'selected' : ''}>${mode[0].toUpperCase()}${mode.slice(1)}</option>`).join('')}</select></div>
            </div>
          </article>

          <article class="control-panel ticker-panel">
            <div class="panel-heading"><div><span>Shared foreground</span><h2>Global live ticker</h2></div></div>
            <div class="ticker-control-layout">
              <div class="ticker-tools">
                <p>Visibility and motion</p>
                <div class="ticker-actions">${controlButton(state.ticker.visible ? 'Hide ticker' : 'Show ticker', 'toggle-ticker', null, { active: !state.ticker.visible })}${controlButton(state.ticker.paused ? 'Resume ticker' : 'Pause ticker', 'toggle-ticker-pause', null, { active: state.ticker.paused })}</div>
              </div>
              <form data-announcement-form>
                <label for="priority-message">Priority announcement</label>
                <div class="ticker-announcement-row">
                  <input id="priority-message" name="message" maxlength="180" value="${escapeHtml(state.ticker.priorityMessage)}" placeholder="Type a message for every connected display" ${busy ? 'disabled' : ''}>
                  <div class="ticker-announcement-actions">
                    <button type="submit" ${busy ? 'disabled' : ''}>Send announcement</button>
                    <button type="button" data-action="clear-announcement" ${busy ? 'disabled' : ''}>Clear</button>
                  </div>
                </div>
              </form>
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
      if (action === 'cue') {
        const selectedQuestion = /^question-[1-4]$/.test(value) ? Number(value.split('-')[1]) : undefined
        run(() => sendSharedCommand({ type: value === 'reset' ? 'reset' : 'cue', cue: value, selectedQuestion }))
      }
      if (action === 'toggle-animations') run(() => updateSharedState({ animationsPaused: !snapshot.state.animationsPaused }))
      if (action === 'toggle-background') run(() => updateSharedState({ backgroundVideo: !snapshot.state.backgroundVideo }))
      if (action === 'toggle-ticker') run(() => updateSharedState({ ticker: { visible: !snapshot.state.ticker.visible } }))
      if (action === 'toggle-ticker-pause') run(() => updateSharedState({ ticker: { paused: !snapshot.state.ticker.paused } }))
      if (action === 'clear-announcement') run(() => updateSharedState({ ticker: { priorityMessage: '', priorityId: snapshot.state.ticker.priorityId + 1 } }))
    })
  })
  app.querySelector('[data-control-mode]')?.addEventListener('change', (event) => run(() => updateSharedState({ mode: event.target.value })))
  app.querySelector('[data-announcement-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = new FormData(event.currentTarget).get('message')?.toString().trim() || ''
    run(() => updateSharedState({ ticker: { priorityMessage: message, priorityId: snapshot.state.ticker.priorityId + 1, visible: true } }))
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
    snapshot = await fetchSharedState()
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
