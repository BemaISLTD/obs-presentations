// Camera setup and diagnostics for the presentation computer (§18, §23).
//
// This page is opened on the machine that will run /program, because camera
// hardware is machine-local: enumerating devices on the controller laptop lists
// that laptop's cameras, not the show computer's. The chosen device is saved
// here in localStorage and picked up by /program on the same machine.

import './control.css'
import {
  CAMERA_STATUS,
  clearSavedCamera,
  createPresenterCapture,
  listCameras,
  readSavedCamera,
  saveCamera,
} from './presenter/presenterCapture.js'
import { createPresenterSegmentation, SEGMENTATION_STATUS } from './presenter/presenterSegmentation.js'

const app = document.querySelector('#camera-setup-app')

const OUTPUT_WIDTH = 1280
const OUTPUT_HEIGHT = 720

let cameras = []
let selectedDeviceId = readSavedCamera()?.deviceId || ''
let backgroundRemoval = true
let mirrored = true
let showSegmented = true
let programFps = 0
let frameTimes = []
let running = false
let frameHandle
let lastStatusPaint = 0

const capture = createPresenterCapture({ onChange: () => renderStatus() })
const segmentation = createPresenterSegmentation({ onChange: () => renderStatus() })

const CAMERA_COPY = Object.freeze({
  [CAMERA_STATUS.idle]: 'Not started',
  [CAMERA_STATUS.requesting]: 'Requesting permission…',
  [CAMERA_STATUS.ready]: 'Ready',
  [CAMERA_STATUS.denied]: 'Permission denied',
  [CAMERA_STATUS.missing]: 'Camera not found',
  [CAMERA_STATUS.busy]: 'In use by another app',
  [CAMERA_STATUS.error]: 'Error',
})

const SEGMENTATION_COPY = Object.freeze({
  [SEGMENTATION_STATUS.idle]: 'Not loaded',
  [SEGMENTATION_STATUS.loading]: 'Loading model…',
  [SEGMENTATION_STATUS.ready]: 'Ready',
  [SEGMENTATION_STATUS.error]: 'Error',
})

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function render() {
  const saved = readSavedCamera()
  app.innerHTML = `
    <main class="control-shell camera-setup-shell">
      <header class="control-header">
        <div>
          <p class="control-eyebrow">BemaHub presentation computer</p>
          <h1>Camera Setup</h1>
          <p>Configure the camera on this machine. The program page uses whatever you select here.</p>
        </div>
        <a class="camera-setup-open" href="/program" target="_blank" rel="noreferrer">Open /program ↗</a>
      </header>

      <section class="camera-setup-layout">
        <article class="control-panel">
          <div class="panel-heading"><div><span>Preview</span><h2>Live camera</h2></div>
            <div class="camera-preview-toggle">
              <button type="button" class="control-button ${showSegmented ? '' : 'is-active'}" data-action="show-raw">Raw</button>
              <button type="button" class="control-button ${showSegmented ? 'is-active' : ''}" data-action="show-segmented">Background removed</button>
            </div>
          </div>
          <div class="camera-preview" data-camera-preview>
            <video class="camera-preview-video" data-preview-video autoplay muted playsinline ${showSegmented ? 'hidden' : ''}></video>
            <canvas class="camera-preview-canvas" data-preview-canvas width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" ${showSegmented ? '' : 'hidden'}></canvas>
            <p class="camera-preview-empty" data-preview-empty>Grant camera permission to see a preview.</p>
          </div>
          <div class="camera-actions">
            <button type="button" class="control-button is-primary" data-action="start">Grant / start camera</button>
            <button type="button" class="control-button" data-action="reconnect">Reconnect camera</button>
            <button type="button" class="control-button is-quiet" data-action="reset-saved">Reset saved camera</button>
          </div>
        </article>

        <article class="control-panel">
          <div class="panel-heading"><div><span>Hardware</span><h2>Device</h2></div></div>
          <label class="obs-field">
            <span>Camera</span>
            <select data-camera-select>
              <option value="">Default camera</option>
              ${cameras.map((camera) => `<option value="${escapeHtml(camera.deviceId)}" ${camera.deviceId === selectedDeviceId ? 'selected' : ''}>${escapeHtml(camera.label)}</option>`).join('')}
            </select>
          </label>
          ${saved?.deviceLabel ? `<p class="camera-saved">Saved on this machine: <strong>${escapeHtml(saved.deviceLabel)}</strong></p>` : ''}
          <div class="camera-options">
            <label class="camera-switch"><input type="checkbox" data-toggle-removal ${backgroundRemoval ? 'checked' : ''}><span>AI background removal</span></label>
            <label class="camera-switch"><input type="checkbox" data-toggle-mirror ${mirrored ? 'checked' : ''}><span>Mirror image</span></label>
          </div>
          <div class="camera-diagnostics" data-diagnostics></div>
        </article>
      </section>
    </main>`

  bind()
  renderStatus()
}

function renderStatus() {
  const panel = app.querySelector('[data-diagnostics]')
  if (!panel) return
  const camera = capture.getState()
  const seg = segmentation.getState()
  const rows = [
    ['Camera', camera.deviceLabel || 'Not selected'],
    ['Permission', CAMERA_COPY[camera.status] ?? camera.status],
    ['Requested', '1920×1080 @ 30'],
    ['Actual', camera.settings?.width ? `${camera.settings.width}×${camera.settings.height} @ ${camera.settings.frameRate ?? '—'}` : '—'],
    ['Segmentation', SEGMENTATION_COPY[seg.status] ?? seg.status],
    ['Segmentation FPS', seg.status === SEGMENTATION_STATUS.ready ? String(seg.fps) : '—'],
    ['Preview FPS', running ? String(programFps) : '—'],
    ['AI delegate', seg.delegate || '—'],
    ['Background removal', backgroundRemoval ? 'Enabled' : 'Disabled'],
    ['Mirror', mirrored ? 'Enabled' : 'Disabled'],
  ]
  const error = camera.message || seg.message
  panel.innerHTML = `
    <dl class="camera-diagnostic-grid">
      ${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
    </dl>
    ${error ? `<p class="camera-error" role="status">${escapeHtml(error)}</p>` : ''}`

  const empty = app.querySelector('[data-preview-empty]')
  // Hide the prompt as soon as a stream exists, not merely when the status says
  // ready: the status can arrive before the first frame is painted.
  if (empty) empty.hidden = camera.status === CAMERA_STATUS.ready || Boolean(capture.getStream())
}

function recordPreviewFrame() {
  const now = performance.now()
  frameTimes.push(now)
  frameTimes = frameTimes.filter((time) => now - time < 1000)
  programFps = frameTimes.length
}

function loop() {
  if (!running) return
  const video = app.querySelector('[data-preview-video]')
  const canvas = app.querySelector('[data-preview-canvas]')
  const schedule = () => {
    if (video?.requestVideoFrameCallback) frameHandle = video.requestVideoFrameCallback(loop)
    else frameHandle = requestAnimationFrame(loop)
  }
  if (!video?.videoWidth || !showSegmented || !backgroundRemoval) { schedule(); return }
  segmentation.segment(video, performance.now())
  if (segmentation.hasMask()) {
    segmentation.renderFrame(video, canvas, { mirrored })
    recordPreviewFrame()
  }
  // Rebuilding the diagnostics table on every frame would dominate the frame
  // budget and report an FPS that only measures its own overhead.
  const now = performance.now()
  if (now - lastStatusPaint > 500) { lastStatusPaint = now; renderStatus() }
  schedule()
}

async function startCamera(deviceId) {
  const stream = await capture.start(deviceId)
  if (!stream) { renderStatus(); return }
  // Labels are only exposed once permission has been granted, so the device
  // list is worth re-reading after the first successful open. Re-render before
  // attaching the stream: rendering afterwards would replace the very <video>
  // the stream was attached to, leaving a blank preview.
  cameras = await listCameras().catch(() => [])
  render()

  const video = app.querySelector('[data-preview-video]')
  if (!video) return
  video.srcObject = stream
  video.style.transform = mirrored ? 'scaleX(-1)' : 'none'
  await video.play().catch(() => {})
  if (backgroundRemoval) await segmentation.load().catch(() => {})
  running = true
  loop()
  renderStatus()
}

function bind() {
  app.querySelector('[data-action="start"]')?.addEventListener('click', () => startCamera(selectedDeviceId))
  app.querySelector('[data-action="reconnect"]')?.addEventListener('click', async () => {
    capture.stop()
    segmentation.reset()
    await startCamera(selectedDeviceId)
  })
  app.querySelector('[data-action="reset-saved"]')?.addEventListener('click', () => {
    clearSavedCamera()
    selectedDeviceId = ''
    render()
  })
  app.querySelector('[data-action="show-raw"]')?.addEventListener('click', () => { showSegmented = false; render() })
  app.querySelector('[data-action="show-segmented"]')?.addEventListener('click', () => { showSegmented = true; render() })
  app.querySelector('[data-camera-select]')?.addEventListener('change', (event) => {
    selectedDeviceId = event.target.value
    const match = cameras.find((camera) => camera.deviceId === selectedDeviceId)
    saveCamera(selectedDeviceId, match?.label || '')
    startCamera(selectedDeviceId)
  })
  app.querySelector('[data-toggle-removal]')?.addEventListener('change', async (event) => {
    backgroundRemoval = event.target.checked
    if (backgroundRemoval) await segmentation.load().catch(() => {})
    render()
  })
  app.querySelector('[data-toggle-mirror]')?.addEventListener('change', (event) => {
    mirrored = event.target.checked
    const video = app.querySelector('[data-preview-video]')
    if (video) video.style.transform = mirrored ? 'scaleX(-1)' : 'none'
    renderStatus()
  })
}

async function boot() {
  cameras = await listCameras().catch(() => [])
  render()
}

boot()
