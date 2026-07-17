import './tailwind.css'
import { isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
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

const UI = Object.freeze({
  appShell: 'relative mx-auto h-full w-full overflow-hidden p-7 font-sans text-bema-navy',
  header: 'relative mb-[18px] flex items-end justify-between gap-6',
  eyebrow: 'mb-2.5 text-xs font-extrabold uppercase tracking-[.16em] text-slate-500',
  modeGroup: 'flex flex-wrap gap-2.5',
  modePill: 'inline-flex items-center rounded-full border border-slate-900/10 bg-white/60 px-4 py-2.5 text-sm font-bold capitalize text-slate-500 backdrop-blur',
  modePillActive: 'border-bema-cyan/40 bg-gradient-to-br from-bema-cyan/25 to-bema-purple/20 text-bema-navy shadow-sm',
  canvasShell: 'grid h-full w-full place-items-center pb-6',
  canvas: 'absolute left-0 top-0 grid h-[1580px] w-[1920px] origin-top-left grid-rows-[1080px_500px] overflow-hidden rounded-panel border border-sky-300/40 bg-gradient-to-br from-white via-sky-50 to-blue-100 shadow-card [transform:scale(var(--canvas-scale))]',
  stage: 'relative z-[2] h-[1080px] w-[1920px] overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100',
  controlToggle: 'absolute right-[18px] top-[88px] z-[61] inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-indigo-200/40 bg-slate-950/90 px-3.5 text-xs font-extrabold text-indigo-50 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-bema-cyan',
  controls: 'pointer-events-none absolute inset-x-5 bottom-3.5 z-[60] font-sans text-white transition duration-200',
  controlButton: 'pointer-events-auto h-[42px] min-w-[138px] cursor-pointer rounded-xl border border-indigo-200/40 bg-slate-950/90 px-4 text-sm font-extrabold text-indigo-50 shadow-lg transition hover:-translate-y-0.5 hover:border-bema-cyan',
  controlButtonActive: 'border-violet-400 bg-gradient-to-br from-violet-600 to-indigo-900 text-white',
  sceneStrip: 'pointer-events-auto flex h-[54px] items-center gap-2 rounded-[13px] border border-indigo-200/30 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl',
  sceneButton: 'pointer-events-auto h-[34px] min-w-0 cursor-pointer rounded-lg border border-indigo-200/30 bg-slate-900/90 p-0 text-[10px] font-extrabold text-indigo-100 transition hover:-translate-y-0.5 hover:border-bema-cyan',
  sceneButtonActive: 'border-bema-cyan bg-bema-cyan text-bema-deep-navy shadow-cyan',
})

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
  const showControls = render === 'composite' && !clean && !controllerPreview
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
  const foregroundMarkup = canRenderLive ? renderMarkup(sceneRenderer.renderForeground?.(context)) : ''
  const showBackground = mode !== 'reference' && showUnderlay && canRenderLive
  const { backgroundId } = getSceneBackground(Number(slide.id))
  const shellClasses = ['app-shell', UI.appShell, `output-${output}`, `render-${render}`, `mode-${mode}`]
  const canvasClasses = ['storyboard-canvas', UI.canvas, `mode-${mode}`, `output-${output}`, `render-${render}`]
  if (output === 'obs') shellClasses.push('!h-screen !w-screen !max-w-none !p-0')
  if (mode === 'reference') shellClasses.push('!p-0')
  if (output === 'obs') canvasClasses.push('!h-[1080px] !grid-rows-[1080px] !rounded-none !border-0 !shadow-none')
  if (mode === 'reference') canvasClasses.push('!rounded-none !border-0 !bg-transparent !shadow-none')
  if (context.refOnTop && mode === 'overlay') canvasClasses.push('reference-on-top')
  if (paused) shellClasses.push('is-paused')

  const showHeader = output === 'storyboard' && mode !== 'reference'
  const showSpec = output === 'storyboard' && mode !== 'reference'
  const showDebug = !context.clean && !context.controllerPreview && mode !== 'reference' && output === 'storyboard'

  app.innerHTML = `
    <main class="${shellClasses.join(' ')}" data-app-shell data-testid="app-shell">
      ${showHeader ? renderHeader(context) : ''}
      <section class="canvas-shell ${UI.canvasShell} ${output === 'obs' ? '!h-screen !w-screen !min-h-svh !pb-0' : ''} output-${output}" data-canvas-shell>
        <div class="canvas-scale-frame relative overflow-hidden">
          <div class="${canvasClasses.join(' ')}" data-storyboard-canvas data-testid="storyboard-canvas">
            ${(mode === 'reference' || mode === 'overlay') ? renderReferenceLayer(slide, mode, getReferenceOpacity(mode), shouldShowReference(mode)) : ''}
            <section class="visual-stage ${UI.stage} ${render === 'foreground' || mode === 'reference' ? '!bg-transparent' : ''} output-stage-${output} render-stage-${render}" data-visual-stage data-testid="visual-stage" aria-label="OBS visual stage">
              ${showBackground ? renderBackgroundLayer({ sceneId: slide.id, backgroundId, className: 'stage-background-layer', debug: context.backgroundDebug && !context.clean }) : ''}
              ${(mode === 'live' || mode === 'overlay') && showUnderlay ? `<div class="live-layer underlay-layer absolute inset-0" data-live-layer="underlay">${underlayMarkup}</div>` : ''}
              ${(mode === 'live' || mode === 'overlay') && showForeground ? `<div class="live-layer foreground-layer absolute inset-0" data-live-layer="foreground">${foregroundMarkup}</div>` : ''}
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
    <button type="button" class="presentation-controls-toggle ${UI.controlToggle}" data-toggle-presentation-controls aria-pressed="${context.controlsVisible}" aria-label="${context.controlsVisible ? 'Hide' : 'Show'} presentation controls">
      <span aria-hidden="true">${context.controlsVisible ? '×' : '☰'}</span>
      ${context.controlsVisible ? 'Hide Controls' : 'Show Controls'}
    </button>
    <nav class="presentation-controls ${UI.controls} ${context.controlsVisible ? '' : 'is-hidden invisible translate-y-6 opacity-0'}" aria-label="Presentation controls">
      <div class="presentation-mode-controls mb-2 ml-auto flex justify-end gap-2">
        <button type="button" data-presentation-mode="reference" class="${UI.controlButton} ${context.mode === 'reference' ? `is-active ${UI.controlButtonActive}` : ''}">Reference</button>
        <button type="button" data-presentation-mode="overlay" class="${UI.controlButton} ${context.mode === 'overlay' ? `is-active ${UI.controlButtonActive}` : ''}">Overlay</button>
        <button type="button" data-replay-entry class="${UI.controlButton} ${context.mode === 'live' ? `is-active ${UI.controlButtonActive}` : ''}">Live / Replay Entry</button>
        <button type="button" data-trigger-exit class="${UI.controlButton} !border-rose-400/50 !bg-rose-950/90 !text-rose-200">Exit</button>
      </div>
      <div class="presentation-scene-strip ${UI.sceneStrip}">
        <span class="presentation-current-scene flex w-[250px] min-w-[250px] items-center gap-2.5 overflow-hidden px-2.5"><strong class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-violet-600 text-[13px] text-white">${context.slide.id}</strong><small class="truncate text-[11px] font-bold text-indigo-200/80">${config?.title ?? context.slide.title}</small></span>
        <div class="presentation-scene-buttons grid min-w-0 flex-1 grid-cols-[repeat(39,minmax(0,1fr))] gap-[3px]">
          ${context.allSlides.map((item) => `<button type="button" data-presentation-scene="${item.id}" class="${UI.sceneButton} ${item.id === context.slide.id ? `is-active ${UI.sceneButtonActive}` : ''}" title="Scene ${item.id}: ${item.title}">${item.id}</button>`).join('')}
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
    controls?.classList.toggle('invisible', !willShow)
    controls?.classList.toggle('translate-y-6', !willShow)
    controls?.classList.toggle('opacity-0', !willShow)
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
  const pills = (values, active) => values.map((value) => `<span class="mode-pill ${UI.modePill} ${value === active ? `is-active ${UI.modePillActive}` : ''}">${value}</span>`).join('')
  return `<header class="app-header ${UI.header}"><div><p class="eyebrow ${UI.eyebrow}">BemaHub Open Enrollment OBS</p><h1 class="font-display text-[56px] font-black leading-[.95] tracking-[-.05em]">Scene ${slide.id}: ${slide.title}</h1></div><div class="mode-pills ${UI.modeGroup}">${pills(['reference', 'overlay', 'live'], mode)}</div><div class="mode-pills ${UI.modeGroup}">${pills(['storyboard', 'obs'], output)}</div><div class="mode-pills ${UI.modeGroup}">${pills(['underlay', 'foreground', 'composite'], render)}</div></header>`
}

function renderUnderlay(renderer, context) {
  return renderMarkup(renderer.renderUnderlay?.(context) ?? renderer.render?.(context))
}

function renderMarkup(value) {
  if (value == null || value === false) return ''
  if (!isValidElement(value)) return String(value)
  const markup = renderToStaticMarkup(value)
  const wrapper = '<div data-react-scene-markup="true">'
  return markup.startsWith(wrapper) && markup.endsWith('</div>')
    ? markup.slice(wrapper.length, -6)
    : markup
}

function renderDebugOverlay(context) {
  return `<div class="debug-guides pointer-events-none absolute inset-0 z-50" aria-hidden="true"><div class="grid-overlay absolute inset-0 opacity-0"></div><div class="safe-zone stage-safe-zone absolute inset-[5%] opacity-0"><span>5% Safe Area</span></div></div><aside class="debug-overlay absolute right-5 top-[150px] z-[70] w-[340px] rounded-2xl border border-indigo-200/30 bg-slate-950/90 p-4 font-sans text-indigo-50 shadow-2xl backdrop-blur-xl transition"><div class="debug-summary grid grid-cols-4 gap-2 text-xs">${[['Scene', context.slide.id], ['Mode', context.mode], ['Output', context.output], ['Render', context.render]].map(([label, value]) => `<p class="grid gap-1"><span class="text-[9px] font-bold uppercase tracking-wider text-indigo-300/60">${label}</span><strong class="truncate capitalize">${value}</strong></p>`).join('')}</div><label class="debug-control mt-4 grid gap-2 text-xs font-bold"><span>Reference Opacity</span><input class="accent-bema-cyan" data-reference-opacity type="range" min="0" max="1" step="0.05" value="${getReferenceOpacity(context.mode)}" ${context.mode === 'live' ? 'disabled' : ''}></label><div class="debug-actions mt-3 flex gap-2"><button class="rounded-lg border border-indigo-200/30 bg-indigo-950/80 px-3 py-2 text-xs font-bold hover:border-bema-cyan" data-toggle-grid>Grid</button><button class="rounded-lg border border-indigo-200/30 bg-indigo-950/80 px-3 py-2 text-xs font-bold hover:border-bema-cyan" data-toggle-safe-zones>Safe zones</button></div><p class="debug-shortcuts mt-3 text-[10px] text-indigo-200/60">← → scenes · ↑ ↓ layers · G grid · R reference · T layer · [ ] opacity · D debug</p></aside>`
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
    overlay.classList.toggle('invisible', !debugState.controlsVisible)
    overlay.classList.toggle('opacity-0', !debugState.controlsVisible)
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
