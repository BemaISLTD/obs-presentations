import './style.css'
import { renderReferenceLayer } from './components/reference-layer.js'
import { renderSpecSheet } from './components/spec-sheet.js'
import { renderBackgroundLayer, initBackgroundLayer } from './components/BackgroundLayer.js'
import { scenes } from './scenes/index.js'
import { loadPresentationData } from './dataService.js'
import { getSceneBackground } from './utils/getSceneBackground.js'
import { applySceneCue, resetSceneCue } from './sceneCueEngine.js'
import { sceneControlById } from './sceneControls.js'

const app = document.querySelector('#app')
const DEFAULT_SCENE = '01'
const VALID_MODES = new Set(['reference', 'overlay', 'live'])
const VALID_OUTPUTS = new Set(['storyboard', 'obs'])
const VALID_RENDERS = new Set(['underlay', 'foreground', 'composite'])
const OUTPUT_NAVIGATION_ORDER = ['storyboard', 'underlay', 'foreground', 'composite']

let detachCanvasScale
let detachDebugTools
let detachNavigation

const debugState = {
  gridVisible: false,
  safeZonesVisible: false,
  controlsVisible: true,
  overlayReferenceVisible: true,
  referenceOpacity: 0.75,
  overlayReferenceOnTop: false,
}

boot().catch(showBootError)

async function boot() {
  const params = new URLSearchParams(window.location.search)
  const sceneId = normalizeSceneId(params.get('scene'))
  const mode = VALID_MODES.has(params.get('mode')) ? params.get('mode') : 'live'
  const requestedOutput = params.get('output')
  const output = VALID_RENDERS.has(requestedOutput)
    ? 'obs'
    : VALID_OUTPUTS.has(requestedOutput) ? requestedOutput : 'storyboard'
  const render = VALID_RENDERS.has(params.get('render'))
    ? params.get('render')
    : VALID_RENDERS.has(requestedOutput) ? requestedOutput : 'composite'
  const clean = params.get('clean') === 'true'
  const controllerPreview = params.get('controllerPreview') === 'true'
  const paused = params.get('paused') === 'true'
  const showControls = render === 'composite'
  const controlsVisible = params.get('controls') !== 'false'

  document.documentElement.dataset.output = output
  document.documentElement.dataset.render = render
  document.documentElement.dataset.scene = sceneId
  debugState.referenceOpacity = parseOpacity(params.get('refOpacity'))
  debugState.overlayReferenceOnTop = params.get('refOnTop') === 'true'

  const data = await loadPresentationData()
  const slide = data.slides.find((item) => item.id === sceneId) ?? data.slides[0]
  if (!slide) throw new Error('No slide configuration found in /public/data/slides.json.')

  const sceneRenderer = scenes[slide.id]
  const canRenderLive = Boolean(sceneRenderer?.render || sceneRenderer?.renderUnderlay)
  const context = {
    ...data,
    clean,
    controllerPreview,
    mode,
    output,
    render,
    paused,
    presenterLayout: params.get('presenter') === 'overlay' ? 'overlay' : 'boxed',
    presenterInset: params.get('presenterInset') === 'right' ? 'right' : 'left',
    metrics: data.metrics,
    questions: data.promptSource.enabledPrompts,
    deprecatedWarnings: data.promptSource.deprecatedWarnings,
    slide,
    allSlides: data.slides,
    ticker: data.ticker,
    url: params,
    refOpacity: debugState.referenceOpacity,
    refOnTop: debugState.overlayReferenceOnTop,
    backgroundDebug: params.get('bgDebug') === 'true',
    canRenderLive,
    showControls,
    controlsVisible,
  }

  document.title = `BemaHub OBS - Scene ${slide.id} ${mode}`
  renderApp(context, sceneRenderer)
  bindPresentationNavigation(context)
  bindOnCanvasControls(context)

  if (params.get('replay') === 'entry') {
    applySceneCue(app, 'entry')
    const settledUrl = new URL(location.href)
    settledUrl.searchParams.delete('replay')
    history.replaceState(null, '', settledUrl)
  }

  if (canRenderLive && !paused && (mode === 'live' || mode === 'overlay')) {
    sceneRenderer.setup?.(app, context)
  }
}

function renderApp(context, sceneRenderer) {
  const { mode, output, render, paused, slide, canRenderLive } = context
  const showUnderlay = render !== 'foreground'
  const showForeground = render !== 'underlay'
  const underlayMarkup = canRenderLive ? renderUnderlay(sceneRenderer, context) : ''
  const foregroundMarkup = canRenderLive ? sceneRenderer.renderForeground?.(context) ?? '' : ''
  const showBackground = mode !== 'reference' && showUnderlay && canRenderLive
  const { backgroundId } = getSceneBackground(Number(slide.id))
  const shellClasses = ['app-shell', `output-${output}`, `render-${render}`, `mode-${mode}`]
  const canvasClasses = ['storyboard-canvas', `mode-${mode}`, `output-${output}`, `render-${render}`]
  if (context.refOnTop && mode === 'overlay') canvasClasses.push('reference-on-top')
  if (paused) shellClasses.push('is-paused')

  const showHeader = output === 'storyboard' && mode !== 'reference'
  const showSpec = output === 'storyboard' && mode !== 'reference'
  const showDebug = !context.clean && !context.controllerPreview && mode !== 'reference' && output === 'storyboard'

  app.innerHTML = `
    <main class="${shellClasses.join(' ')}">
      ${showHeader ? renderHeader(context) : ''}
      <section class="canvas-shell output-${output}">
        <div class="canvas-scale-frame">
          <div class="${canvasClasses.join(' ')}">
            ${(mode === 'reference' || mode === 'overlay') ? renderReferenceLayer(slide, mode, getReferenceOpacity(mode), shouldShowReference(mode)) : ''}
            <section class="visual-stage output-stage-${output} render-stage-${render}" aria-label="OBS visual stage">
              ${showBackground ? renderBackgroundLayer({ sceneId: slide.id, backgroundId, className: 'stage-background-layer', debug: context.backgroundDebug && !context.clean }) : ''}
              ${(mode === 'live' || mode === 'overlay') && showUnderlay ? `<div class="live-layer underlay-layer">${underlayMarkup}</div>` : ''}
              ${(mode === 'live' || mode === 'overlay') && showForeground ? `<div class="live-layer foreground-layer">${foregroundMarkup}</div>` : ''}
            </section>
            ${context.showControls ? renderOnCanvasControls(context) : ''}
            ${showSpec ? renderSpecSheet(slide, context) : ''}
            ${showDebug ? renderDebugOverlay(context) : ''}
          </div>
        </div>
      </section>
    </main>`

  bindCanvasScale(output)
  bindDebugTools(context)
  if (showBackground) initBackgroundLayer(app)
}

function renderOnCanvasControls(context) {
  const config = sceneControlById[context.slide.id]
  return `
    <button type="button" class="presentation-controls-toggle" data-toggle-presentation-controls aria-pressed="${context.controlsVisible}" aria-label="${context.controlsVisible ? 'Hide' : 'Show'} presentation controls">
      <span aria-hidden="true">${context.controlsVisible ? '×' : '☰'}</span>
      ${context.controlsVisible ? 'Hide Controls' : 'Show Controls'}
    </button>
    <nav class="presentation-controls ${context.controlsVisible ? '' : 'is-hidden'}" aria-label="Presentation controls">
      <div class="presentation-mode-controls">
        <button type="button" data-presentation-mode="reference" class="${context.mode === 'reference' ? 'is-active' : ''}">Reference</button>
        <button type="button" data-presentation-mode="overlay" class="${context.mode === 'overlay' ? 'is-active' : ''}">Overlay</button>
        <button type="button" data-replay-entry class="${context.mode === 'live' ? 'is-active' : ''}">Live / Replay Entry</button>
        <button type="button" data-trigger-exit>Exit</button>
      </div>
      <div class="presentation-scene-strip">
        <span class="presentation-current-scene"><strong>${context.slide.id}</strong><small>${config?.title ?? context.slide.title}</small></span>
        <div class="presentation-scene-buttons">
          ${context.allSlides.map((item) => `<button type="button" data-presentation-scene="${item.id}" class="${item.id === context.slide.id ? 'is-active' : ''}" title="Scene ${item.id}: ${item.title}">${item.id}</button>`).join('')}
        </div>
      </div>
    </nav>`
}

function bindOnCanvasControls(context) {
  if (!context.showControls) return
  const controls = app.querySelector('.presentation-controls')
  const toggle = app.querySelector('[data-toggle-presentation-controls]')
  toggle?.addEventListener('click', () => {
    const willShow = controls?.classList.contains('is-hidden') ?? true
    controls?.classList.toggle('is-hidden', !willShow)
    toggle.setAttribute('aria-pressed', String(willShow))
    toggle.setAttribute('aria-label', `${willShow ? 'Hide' : 'Show'} presentation controls`)
    toggle.innerHTML = `<span aria-hidden="true">${willShow ? '×' : '☰'}</span>${willShow ? 'Hide Controls' : 'Show Controls'}`
    const url = new URL(location.href)
    if (willShow) url.searchParams.delete('controls')
    else url.searchParams.set('controls', 'false')
    history.replaceState(null, '', url)
  })
  app.querySelectorAll('[data-presentation-scene]').forEach((button) => {
    button.addEventListener('click', () => navigatePresentation(button.dataset.presentationScene, context.mode))
  })
  app.querySelectorAll('[data-presentation-mode]').forEach((button) => {
    button.addEventListener('click', () => navigatePresentation(context.slide.id, button.dataset.presentationMode))
  })
  app.querySelector('[data-replay-entry]')?.addEventListener('click', () => {
    if (context.mode !== 'live') {
      const url = new URL(location.href)
      url.searchParams.set('mode', 'live')
      url.searchParams.set('replay', 'entry')
      location.assign(url)
      return
    }
    resetSceneCue(app)
    requestAnimationFrame(() => applySceneCue(app, 'entry'))
  })
  app.querySelector('[data-trigger-exit]')?.addEventListener('click', () => applySceneCue(app, 'exit'))
}

function renderHeader({ slide, mode, output, render }) {
  const pills = (values, active) => values.map((value) => `<span class="mode-pill ${value === active ? 'is-active' : ''}">${value}</span>`).join('')
  return `<header class="app-header"><div><p class="eyebrow">BemaHub Open Enrollment OBS</p><h1>Scene ${slide.id}: ${slide.title}</h1></div><div class="mode-pills">${pills(['reference', 'overlay', 'live'], mode)}</div><div class="mode-pills">${pills(['storyboard', 'obs'], output)}</div><div class="mode-pills">${pills(['underlay', 'foreground', 'composite'], render)}</div></header>`
}

function renderUnderlay(renderer, context) {
  return renderer.renderUnderlay?.(context) ?? renderer.render?.(context) ?? ''
}

function renderDebugOverlay(context) {
  return `<div class="debug-guides" aria-hidden="true"><div class="grid-overlay"></div><div class="safe-zone stage-safe-zone"><span>5% Safe Area</span></div></div><aside class="debug-overlay"><div class="debug-summary"><p><span>Scene</span><strong>${context.slide.id}</strong></p><p><span>Mode</span><strong>${context.mode}</strong></p><p><span>Output</span><strong>${context.output}</strong></p><p><span>Render</span><strong>${context.render}</strong></p></div><label class="debug-control"><span>Reference Opacity</span><input data-reference-opacity type="range" min="0" max="1" step="0.05" value="${getReferenceOpacity(context.mode)}" ${context.mode === 'live' ? 'disabled' : ''}></label><div class="debug-actions"><button data-toggle-grid>Grid</button><button data-toggle-safe-zones>Safe zones</button></div><p class="debug-shortcuts">← → scenes · ↑ ↓ layers · G grid · R reference · T layer · [ ] opacity · D debug</p></aside>`
}

function bindCanvasScale(output) {
  detachCanvasScale?.()
  const shell = app.querySelector('.canvas-shell')
  const frame = app.querySelector('.canvas-scale-frame')
  const canvas = app.querySelector('.storyboard-canvas')
  if (!shell || !frame || !canvas) return
  const baseHeight = output === 'storyboard' ? 1580 : 1080
  const update = () => {
    const scale = Math.min(Math.max(shell.clientWidth, 320) / 1920, Math.max(window.innerHeight - shell.getBoundingClientRect().top - (output === 'storyboard' ? 24 : 0), 320) / baseHeight)
    frame.style.width = `${1920 * scale}px`
    frame.style.height = `${baseHeight * scale}px`
    canvas.style.setProperty('--canvas-scale', scale)
  }
  update()
  window.addEventListener('resize', update)
  detachCanvasScale = () => window.removeEventListener('resize', update)
}

function bindPresentationNavigation(context) {
  detachNavigation?.()
  const onKey = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.target?.matches?.('input, textarea, select, button, [contenteditable]')) return
    const index = context.allSlides.findIndex((item) => item.id === context.slide.id)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const offset = event.key === 'ArrowLeft' ? -1 : 1
      const next = context.allSlides[(index + offset + context.allSlides.length) % context.allSlides.length]
      navigatePresentation(next.id, context.mode)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const current = context.output === 'storyboard' ? 'storyboard' : context.render
      const index = OUTPUT_NAVIGATION_ORDER.indexOf(current)
      const offset = event.key === 'ArrowUp' ? -1 : 1
      const next = OUTPUT_NAVIGATION_ORDER[(index + offset + OUTPUT_NAVIGATION_ORDER.length) % OUTPUT_NAVIGATION_ORDER.length]
      const url = new URL(location.href)
      if (next === 'storyboard') { url.searchParams.set('output', 'storyboard'); url.searchParams.set('render', 'composite') } else { url.searchParams.set('output', 'obs'); url.searchParams.set('render', next) }
      location.assign(url)
    }
  }
  window.addEventListener('keydown', onKey)
  detachNavigation = () => window.removeEventListener('keydown', onKey)
}

function bindDebugTools(context) {
  detachDebugTools?.()
  if (context.clean || context.controllerPreview) return
  const root = app.querySelector('.storyboard-canvas')
  const overlay = app.querySelector('.debug-overlay')
  const guides = app.querySelector('.debug-guides')
  const opacity = app.querySelector('[data-reference-opacity]')
  if (!root || !overlay || !guides) return
  const apply = () => {
    guides.classList.toggle('show-grid', debugState.gridVisible)
    guides.classList.toggle('show-safe-zones', debugState.safeZonesVisible)
    overlay.classList.toggle('is-hidden', !debugState.controlsVisible)
    root.classList.toggle('reference-on-top', debugState.overlayReferenceOnTop)
    syncReference(context.mode)
  }
  const onKey = (event) => {
    if (event.target instanceof HTMLInputElement) return
    if (/^g$/i.test(event.key)) debugState.gridVisible = !debugState.gridVisible
    else if (/^d$/i.test(event.key)) debugState.controlsVisible = !debugState.controlsVisible
    else if (/^r$/i.test(event.key) && context.mode === 'overlay') debugState.overlayReferenceVisible = !debugState.overlayReferenceVisible
    else if (/^t$/i.test(event.key) && context.mode === 'overlay') debugState.overlayReferenceOnTop = !debugState.overlayReferenceOnTop
    else if (event.key === '[') debugState.referenceOpacity = Math.max(0, debugState.referenceOpacity - 0.05)
    else if (event.key === ']') debugState.referenceOpacity = Math.min(1, debugState.referenceOpacity + 0.05)
    else return
    apply()
  }
  opacity?.addEventListener('input', (event) => { debugState.referenceOpacity = Number(event.target.value); apply() })
  app.querySelector('[data-toggle-grid]')?.addEventListener('click', () => { debugState.gridVisible = !debugState.gridVisible; apply() })
  app.querySelector('[data-toggle-safe-zones]')?.addEventListener('click', () => { debugState.safeZonesVisible = !debugState.safeZonesVisible; apply() })
  window.addEventListener('keydown', onKey)
  detachDebugTools = () => window.removeEventListener('keydown', onKey)
  apply()
}

function navigatePresentation(scene, mode) {
  const url = new URL(location.href)
  const nextScene = normalizeSceneId(scene)
  const nextMode = VALID_MODES.has(mode) ? mode : 'live'
  if (url.searchParams.get('scene') === nextScene && url.searchParams.get('mode') === nextMode) return
  url.searchParams.set('scene', nextScene)
  url.searchParams.set('mode', nextMode)
  location.assign(url)
}

function syncReference(mode) {
  const layer = app.querySelector('.reference-layer')
  const image = app.querySelector('.reference-layer img')
  if (!layer || !image) return
  layer.style.visibility = shouldShowReference(mode) ? 'visible' : 'hidden'
  image.style.opacity = getReferenceOpacity(mode)
}

function shouldShowReference(mode) { return mode === 'reference' || (mode === 'overlay' && debugState.overlayReferenceVisible) }
function getReferenceOpacity(mode) { return mode === 'reference' ? 1 : debugState.referenceOpacity }
function parseOpacity(value) { const number = Number(value); return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0.75 }
function normalizeSceneId(value) { const digits = String(value ?? '').replace(/\D/g, ''); const number = Number(digits); return number >= 1 && number <= 39 ? String(number).padStart(2, '0') : DEFAULT_SCENE }
function showBootError(error) { console.error(error); app.innerHTML = `<section class="app-shell"><div class="error-card"><p class="eyebrow">Scene Engine Error</p><h1>Presentation app failed to load.</h1><p>${error.message}</p></div></section>` }
