import './style.css'
import { renderReferenceLayer } from './components/reference-layer.js'
import { renderSpecSheet } from './components/spec-sheet.js'
import { scenes } from './scenes/index.js'

const app = document.querySelector('#app')

const DEFAULT_SCENE = '01'
const DEFAULT_MODE = 'live'
const DEFAULT_OUTPUT = 'storyboard'
const VALID_MODES = new Set(['reference', 'live', 'overlay'])
const VALID_OUTPUTS = new Set(['storyboard', 'obs'])
const DEPRECATED_TERMS = [
  'supporter',
  'donor',
  'donation',
  'charity',
  'fundraising',
  'contributor',
  'commission',
  'referral reward',
  'guaranteed reward',
  'passive income',
  'mlm',
  'downline',
]

let detachCanvasScale = null
let detachDebugTools = null

const debugState = {
  gridVisible: false,
  safeZonesVisible: false,
  controlsVisible: true,
  overlayReferenceVisible: true,
  referenceOpacity: 0.35,
}

boot().catch((error) => {
  console.error(error)
  app.innerHTML = `
    <section class="app-shell">
      <div class="error-card">
        <p class="eyebrow">Scene Engine Error</p>
        <h1>Presentation app failed to load.</h1>
        <p>${error.message}</p>
      </div>
    </section>
  `
})

async function boot() {
  const params = new URLSearchParams(window.location.search)
  const sceneId = normalizeSceneId(params.get('scene'))
  const mode = normalizeMode(params.get('mode'))
  const output = normalizeOutput(params.get('output'))
  const presenterLayout = normalizePresenterLayout(params.get('presenter'))
  const clean = params.get('clean') === 'true'
  const paused = params.get('paused') === 'true'

  const [slides, metrics, ticker, promptSourceText] = await Promise.all([
    fetchJson('/data/slides.json'),
    fetchJson('/data/metrics.mock.json'),
    fetchJson('/data/ticker.json'),
    fetchText('/data/bemahub_countdown_questions_external_source.csv'),
  ])

  const promptSource = parseExternalPromptSource(promptSourceText)

  const slide = slides.find((entry) => entry.id === sceneId) ?? slides[0]

  if (!slide) {
    throw new Error('No slide configuration found in /public/data/slides.json.')
  }

  const sceneRenderer = scenes[slide.id]
  const canRenderLive = typeof sceneRenderer?.render === 'function'

  if ((mode === 'live' || mode === 'overlay') && !canRenderLive) {
    throw new Error(`No live renderer is implemented yet for scene ${slide.id}.`)
  }

  const context = {
    clean,
    mode,
    output,
    paused,
    presenterLayout,
    metrics,
    questions: promptSource.enabledPrompts,
    deprecatedWarnings: promptSource.deprecatedWarnings,
    slide,
    ticker,
    url: params,
  }

  document.title = `BemaHub OBS - Scene ${slide.id} ${mode}`
  renderApp(context, canRenderLive ? sceneRenderer : null)

  if (canRenderLive && (mode === 'live' || mode === 'overlay')) {
    sceneRenderer.setup?.(app, context)
  }
}

function renderApp(context, sceneRenderer) {
  const { clean, mode, output, paused, slide } = context
  const liveMarkup = sceneRenderer ? sceneRenderer.render(context) : ''
  const shellClassNames = ['app-shell', `output-${output}`]
  const canvasClassNames = ['storyboard-canvas', `mode-${mode}`, `output-${output}`]
  const showHeader = output === 'storyboard'
  const showSpecSheet = output === 'storyboard' && mode !== 'reference'

  if (paused) {
    shellClassNames.push('is-paused')
  }

  app.innerHTML = `
    <main class="${shellClassNames.join(' ')}">
      ${showHeader ? `
        <header class="app-header">
          <div>
            <p class="eyebrow">BemaHub Open Enrollment OBS</p>
            <h1>Scene ${slide.id}: ${slide.title}</h1>
          </div>
          <div class="mode-pills" aria-label="Viewing mode">
            ${renderModePill('reference', mode)}
            ${renderModePill('live', mode)}
            ${renderModePill('overlay', mode)}
          </div>
          <div class="mode-pills" aria-label="Output mode">
            ${renderModePill('storyboard', output)}
            ${renderModePill('obs', output)}
          </div>
        </header>
      ` : ''}

      <section class="canvas-shell output-${output}">
        <div class="canvas-scale-frame">
          <div class="${canvasClassNames.join(' ')}">
            ${(mode === 'reference' || mode === 'overlay') ? renderReferenceLayer(slide, mode, getReferenceOpacity(mode), shouldShowReference(mode)) : ''}
            <section class="visual-stage" aria-label="OBS visual stage">
              ${(mode === 'live' || mode === 'overlay') ? `<div class="live-layer">${liveMarkup}</div>` : ''}
            </section>
            ${showSpecSheet ? renderSpecSheet(slide, context) : ''}
            ${clean ? '' : renderDebugOverlay(context)}
          </div>
        </div>
      </section>
    </main>
  `

  bindCanvasScale(output)
  bindDebugTools(context)
}

function renderDebugOverlay(context) {
  const { mode, output, slide, deprecatedWarnings } = context
  const overlayClassNames = ['debug-overlay']
  const warningMarkup = deprecatedWarnings.length
    ? `
      <div class="debug-checklist debug-warning">
        <p class="debug-checklist-title">CSV Warnings</p>
        ${deprecatedWarnings
          .slice(0, 8)
          .map((warning) => `<p>Row ${warning.id}: deprecated term "${warning.term}"</p>`)
          .join('')}
      </div>
    `
    : `
      <div class="debug-checklist">
        <p class="debug-checklist-title">CSV Checklist</p>
        <p>No deprecated terms detected.</p>
      </div>
    `

  if (!debugState.controlsVisible) {
    overlayClassNames.push('is-hidden')
  }

  return `
    <div class="debug-guides ${debugState.gridVisible ? 'show-grid' : ''} ${debugState.safeZonesVisible ? 'show-safe-zones' : ''}" aria-hidden="true">
      <div class="grid-overlay"></div>
      <div class="column-overlay">
        ${Array.from({ length: 12 }, () => '<span class="grid-column"></span>').join('')}
      </div>
      <div class="center-line vertical"></div>
      <div class="center-line horizontal"></div>
      <div class="boundary-line visual-boundary"><span>Visual Stage 1080</span></div>
      <div class="boundary-line spec-boundary"><span>Spec Sheet 500</span></div>
      <div class="safe-zone stage-safe-zone"><span>5% Safe Area</span></div>
      <div class="safe-zone presenter-safe-zone"><span>Presenter Safe</span></div>
      <div class="safe-zone qr-safe-zone"><span>QR Safe</span></div>
      <div class="safe-zone ticker-safe-zone"><span>Ticker Safe</span></div>
    </div>
    <aside class="${overlayClassNames.join(' ')}" aria-label="Debug overlay controls">
      <div class="debug-summary">
        <p><span>Scene</span><strong>${slide.id}</strong></p>
        <p><span>Mode</span><strong>${mode}</strong></p>
        <p><span>Output</span><strong>${output}</strong></p>
        <p><span>Reference</span><strong>${getReferenceFilename(slide.referenceImage)}</strong></p>
      </div>
      <label class="debug-control">
        <span>Reference Opacity</span>
        <input data-reference-opacity type="range" min="0" max="1" step="0.05" value="${getReferenceOpacity(mode)}" ${mode === 'live' ? 'disabled' : ''} />
      </label>
      <div class="debug-actions">
        <button type="button" class="debug-button" data-toggle-grid>${debugState.gridVisible ? 'Hide Grid' : 'Show Grid'}</button>
        <button type="button" class="debug-button" data-toggle-safe-zones>${debugState.safeZonesVisible ? 'Hide Safe Zones' : 'Show Safe Zones'}</button>
      </div>
      ${warningMarkup}
      <p class="debug-shortcuts">G grid · R reference · [ ] opacity · D debug</p>
    </aside>
  `
}

function renderModePill(value, currentMode) {
  const activeClass = value === currentMode ? 'is-active' : ''
  return `<span class="mode-pill ${activeClass}">${value}</span>`
}

function normalizeSceneId(value) {
  if (!value) {
    return DEFAULT_SCENE
  }

  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.padStart(2, '0').slice(-2) || DEFAULT_SCENE
}

function normalizeMode(value) {
  return VALID_MODES.has(value) ? value : DEFAULT_MODE
}

function normalizeOutput(value) {
  return VALID_OUTPUTS.has(value) ? value : DEFAULT_OUTPUT
}

function normalizePresenterLayout(value) {
  return value === 'overlay' ? 'overlay' : 'boxed'
}

function getReferenceFilename(referenceImage) {
  return referenceImage.split('/').pop() ?? referenceImage
}

function bindCanvasScale(output) {
  detachCanvasScale?.()

  const shell = app.querySelector('.canvas-shell')
  const frame = app.querySelector('.canvas-scale-frame')
  const canvas = app.querySelector('.storyboard-canvas')

  if (!shell || !frame || !canvas) {
    detachCanvasScale = null
    return
  }

  const baseWidth = 1920
  const baseHeight = output === 'obs' ? 1080 : 1580

  const updateScale = () => {
    const availableWidth = Math.max(shell.clientWidth, 320)
    const shellTop = shell.getBoundingClientRect().top
    const availableHeight = Math.max(window.innerHeight - shellTop - 24, 320)
    const scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight)

    frame.style.width = `${baseWidth * scale}px`
    frame.style.height = `${baseHeight * scale}px`
    canvas.style.setProperty('--canvas-scale', String(scale))
  }

  updateScale()
  window.addEventListener('resize', updateScale)
  detachCanvasScale = () => window.removeEventListener('resize', updateScale)
}

function bindDebugTools(context) {
  detachDebugTools?.()

  if (context.clean) {
    detachDebugTools = null
    return
  }

  const root = app.querySelector('.storyboard-canvas')
  const overlay = app.querySelector('.debug-overlay')
  const guides = app.querySelector('.debug-guides')
  const opacityInput = app.querySelector('[data-reference-opacity]')
  const toggleGridButton = app.querySelector('[data-toggle-grid]')
  const toggleSafeZonesButton = app.querySelector('[data-toggle-safe-zones]')

  if (!root || !overlay || !guides) {
    detachDebugTools = null
    return
  }

  const applyDebugState = () => {
    guides.classList.toggle('show-grid', debugState.gridVisible)
    guides.classList.toggle('show-safe-zones', debugState.safeZonesVisible)
    overlay.classList.toggle('is-hidden', !debugState.controlsVisible)

    if (toggleGridButton) {
      toggleGridButton.textContent = debugState.gridVisible ? 'Hide Grid' : 'Show Grid'
    }

    if (toggleSafeZonesButton) {
      toggleSafeZonesButton.textContent = debugState.safeZonesVisible ? 'Hide Safe Zones' : 'Show Safe Zones'
    }

    if (opacityInput) {
      opacityInput.value = String(getReferenceOpacity(context.mode))
      opacityInput.disabled = context.mode === 'live'
    }

    syncReferenceDisplay(context.mode)
  }

  const onOpacityInput = (event) => {
    const nextValue = Number(event.target.value)

    if (!Number.isNaN(nextValue)) {
      debugState.referenceOpacity = clamp(nextValue, 0, 1)
      syncReferenceDisplay(context.mode)
    }
  }

  const onToggleGrid = () => {
    debugState.gridVisible = !debugState.gridVisible
    applyDebugState()
  }

  const onToggleSafeZones = () => {
    debugState.safeZonesVisible = !debugState.safeZonesVisible
    applyDebugState()
  }

  const onKeyDown = (event) => {
    if (event.target instanceof HTMLInputElement) {
      return
    }

    if (event.key === 'g' || event.key === 'G') {
      debugState.gridVisible = !debugState.gridVisible
      applyDebugState()
      return
    }

    if (event.key === 'r' || event.key === 'R') {
      if (context.mode === 'overlay') {
        debugState.overlayReferenceVisible = !debugState.overlayReferenceVisible
        applyDebugState()
      }
      return
    }

    if (event.key === '[') {
      debugState.referenceOpacity = clamp(debugState.referenceOpacity - 0.05, 0, 1)
      applyDebugState()
      return
    }

    if (event.key === ']') {
      debugState.referenceOpacity = clamp(debugState.referenceOpacity + 0.05, 0, 1)
      applyDebugState()
      return
    }

    if (event.key === 'd' || event.key === 'D') {
      debugState.controlsVisible = !debugState.controlsVisible
      applyDebugState()
    }
  }

  opacityInput?.addEventListener('input', onOpacityInput)
  toggleGridButton?.addEventListener('click', onToggleGrid)
  toggleSafeZonesButton?.addEventListener('click', onToggleSafeZones)
  window.addEventListener('keydown', onKeyDown)

  applyDebugState()

  detachDebugTools = () => {
    opacityInput?.removeEventListener('input', onOpacityInput)
    toggleGridButton?.removeEventListener('click', onToggleGrid)
    toggleSafeZonesButton?.removeEventListener('click', onToggleSafeZones)
    window.removeEventListener('keydown', onKeyDown)
  }
}

function syncReferenceDisplay(mode) {
  const reference = app.querySelector('.reference-layer img')

  if (!reference) {
    return
  }

  reference.style.opacity = String(getReferenceOpacity(mode))
  reference.style.visibility = shouldShowReference(mode) ? 'visible' : 'hidden'
}

function shouldShowReference(mode) {
  if (mode === 'reference') {
    return true
  }

  if (mode === 'overlay') {
    return debugState.overlayReferenceVisible
  }

  return false
}

function getReferenceOpacity(mode) {
  return mode === 'reference' ? 1 : debugState.referenceOpacity
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}.`)
  }

  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}.`)
  }

  return response.text()
}

function parseExternalPromptSource(csvText) {
  const rows = parseCsvRows(csvText)
  const deprecatedWarnings = []
  const warningKeys = new Set()

  for (const row of rows) {
    const searchable = Object.values(row).join(' ').toLowerCase()

    for (const term of DEPRECATED_TERMS) {
      if (searchable.includes(term)) {
        const rowId = row.id || 'unknown'
        const key = `${rowId}:${term}`

        if (!warningKeys.has(key)) {
          warningKeys.add(key)
          deprecatedWarnings.push({ id: rowId, term })
        }
      }
    }
  }

  const enabledPrompts = rows
    .filter((row) => String(row.enabled).toLowerCase() === 'true')
    .map((row) => ({
      ...row,
      start_sec: Number(row.start_sec || 0),
      duration_sec: Number(row.duration_sec || 0),
      animation_in_duration_ms: Number(row.animation_in_duration_ms || 500),
      animation_out_duration_ms: Number(row.animation_out_duration_ms || 400),
    }))
    .sort((a, b) => a.start_sec - b.start_sec)

  return {
    enabledPrompts,
    deprecatedWarnings,
  }
}

function parseCsvRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length)

  if (!lines.length) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header, index) => {
    if (index === 0) {
      return header.replace(/^\uFEFF/, '')
    }

    return header
  })

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? ''
      return acc
    }, {})
  })
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}
