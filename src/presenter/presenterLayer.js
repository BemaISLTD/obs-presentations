// The presenter as it appears on the program stage.
//
// Composition only: this module owns the DOM, the render loop, and the
// animation between placements. Camera acquisition lives in presenterCapture
// and background removal in presenterSegmentation, so either can fail without
// taking the layer — or the show — down (§22).

import { createPresenterCapture, listCameras, watchCameras, CAMERA_STATUS } from './presenterCapture.js'
import { createPresenterSegmentation, SEGMENTATION_STATUS } from './presenterSegmentation.js'
import { STAGE_WIDTH, STAGE_HEIGHT } from './presenterPresets.js'

const SHAPE_RADIUS = Object.freeze({ rounded: '24px', square: '0px', circle: '50%' })

// Output resolution of the transparent canvas. Independent of the segmentation
// model's own inference size, which is smaller and scaled up (§11).
const OUTPUT_WIDTH = 1280
const OUTPUT_HEIGHT = 720

export function renderPresenterLayer(presenter = {}, { visible = false } = {}) {
  return `
    <div class="presenter-layer" data-presenter-layer data-presenter-visible="${visible ? 'true' : 'false'}" style="${layerStyle(presenter, visible)}">
      <div class="presenter-card" data-presenter-card style="border-radius:${SHAPE_RADIUS[presenter.shape] ?? SHAPE_RADIUS.rounded}">
        <video class="presenter-video" data-presenter-video autoplay muted playsinline></video>
        <canvas class="presenter-canvas" data-presenter-canvas width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}"></canvas>
        ${presenter.showLabel && presenter.label
          ? `<span class="presenter-label">${escapeHtml(presenter.label)}</span>`
          : ''}
      </div>
    </div>`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

// Placement is a transform rather than left/top/width/height so the browser can
// animate it on the compositor, which keeps movement smooth while the render
// loop is also running (§9).
function layerStyle(presenter = {}, visible = false) {
  const { x = 0, y = 0, width = 520, height = 293 } = presenter
  const scaleX = width / STAGE_WIDTH
  const scaleY = height / STAGE_HEIGHT
  return [
    `width:${STAGE_WIDTH}px`,
    `height:${STAGE_HEIGHT}px`,
    `transform:translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`,
    `opacity:${visible ? 1 : 0}`,
    `visibility:${visible ? 'visible' : 'hidden'}`,
  ].join(';')
}

/**
 * Drives the presenter layer for the life of the page.
 *
 * `update()` is cheap and safe to call on every shared-state revision: it moves
 * the existing element rather than replacing it, so neither the camera stream
 * nor the segmentation model is disturbed by a placement change.
 */
export function createPresenterRuntime({ onChange = () => {} } = {}) {
  let root
  let video
  let canvas
  let presenter = {}
  let visible = false
  let running = false
  let frameHandle
  let usingFallback = false
  let enabling = null

  const capture = createPresenterCapture({ onChange: () => onChange(getState()) })
  const segmentation = createPresenterSegmentation({ onChange: () => onChange(getState()) })

  function getState() {
    return {
      camera: capture.getState(),
      segmentation: segmentation.getState(),
      visible,
      // True when the camera works but background removal does not, so the
      // operator can see the show fell back to a plain rectangle (§22).
      fallbackToRawVideo: usingFallback,
    }
  }

  function applyVisualState() {
    if (!root) return
    root.dataset.presenterVisible = visible ? 'true' : 'false'
    root.setAttribute('style', layerStyle(presenter, visible))
    const card = root.querySelector('[data-presenter-card]')
    if (card) card.style.borderRadius = SHAPE_RADIUS[presenter.shape] ?? SHAPE_RADIUS.rounded
    const removal = presenter.backgroundRemoval !== false
    // Raw <video> and segmented <canvas> are two paths to the same picture;
    // exactly one is shown, so a segmentation failure degrades to plain video.
    const showCanvas = removal && !usingFallback
    if (video) {
      video.style.display = showCanvas ? 'none' : 'block'
      video.style.transform = presenter.mirrored === false ? 'none' : 'scaleX(-1)'
      video.style.objectFit = presenter.fit === 'contain' ? 'contain' : 'cover'
    }
    if (canvas) {
      canvas.style.display = showCanvas ? 'block' : 'none'
      canvas.style.objectFit = presenter.fit === 'contain' ? 'contain' : 'cover'
    }
  }

  function loop() {
    if (!running) return
    const schedule = () => {
      // requestVideoFrameCallback ties work to real camera frames where it
      // exists, which avoids doing any work on a stalled or hidden stream.
      if (video?.requestVideoFrameCallback) frameHandle = video.requestVideoFrameCallback(loop)
      else frameHandle = requestAnimationFrame(loop)
    }
    const removal = presenter.backgroundRemoval !== false
    if (!visible || !removal || !video?.videoWidth) { schedule(); return }

    try {
      segmentation.segment(video, performance.now())
      if (segmentation.hasMask()) {
        segmentation.renderFrame(video, canvas, {
          threshold: Number(presenter.maskThreshold ?? 0.5),
          feather: Number(presenter.edgeFeather ?? 0.08),
          mirrored: presenter.mirrored !== false,
        })
        if (usingFallback) { usingFallback = false; applyVisualState(); onChange(getState()) }
      }
    } catch (error) {
      console.warn('Presenter render failed; showing raw camera.', error)
      if (!usingFallback) { usingFallback = true; applyVisualState(); onChange(getState()) }
    }
    schedule()
  }

  function startLoop() {
    if (running) return
    running = true
    loop()
  }

  function stopLoop() {
    running = false
    if (frameHandle && video?.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameHandle)
    else if (frameHandle) cancelAnimationFrame(frameHandle)
    frameHandle = undefined
  }

  /** Binds to the rendered DOM and brings the camera up if it should be live. */
  async function mount(container, nextPresenter, { visible: nextVisible = false } = {}) {
    root = container.querySelector('[data-presenter-layer]')
    if (!root) return
    video = root.querySelector('[data-presenter-video]')
    canvas = root.querySelector('[data-presenter-canvas]')
    presenter = nextPresenter ?? {}
    visible = nextVisible
    applyVisualState()
    if (visible) await enable()
  }

  async function enable() {
    // Two callers can race here — mount() and the first shared-state update —
    // and a second getUserMedia would stop the stream the first just attached.
    // Serializing means the later caller reuses the same stream instead.
    if (enabling) return enabling
    enabling = (async () => {
      const stream = await capture.start()
      if (!stream) return
      // Re-resolve the element: a re-render between the call and now would have
      // replaced the <video> this closure captured, leaving the stream on a
      // detached node and the visible card blank.
      video = root?.querySelector('[data-presenter-video]') ?? video
      canvas = root?.querySelector('[data-presenter-canvas]') ?? canvas
      if (video && video.srcObject !== stream) {
        video.srcObject = stream
        await video.play().catch(() => {})
      }
      if (presenter.backgroundRemoval !== false) {
        try {
          await segmentation.load()
          usingFallback = false
        } catch {
          // The camera is fine; only removal failed. Show the raw rectangle
          // rather than dropping the presenter entirely.
          usingFallback = true
        }
      }
      applyVisualState()
      startLoop()
      onChange(getState())
    })()
    try { await enabling } finally { enabling = null }
  }

  /**
   * Applies new shared state.
   *
   * Placement, shape, and mirroring are pure visual updates. The camera is only
   * touched when visibility actually changes, and the segmentation model is
   * never rebuilt here (§20, §21).
   */
  async function update(nextPresenter, { visible: nextVisible = false } = {}) {
    const wasVisible = visible
    presenter = nextPresenter ?? {}
    visible = nextVisible
    applyVisualState()

    if (!visible && wasVisible) {
      // Keep the stream alive across scenes; only pause the work (§20).
      stopLoop()
      onChange(getState())
      return
    }
    // Enable whenever the camera should be live but no stream is running, not
    // only on a false->true transition. Shared state can arrive after mount, so
    // the layer may already believe it is visible while the camera was never
    // opened — that gap left the presenter blank on a freshly loaded page.
    if (visible && !capture.getStream()?.active) { await enable(); return }
    if (visible && !running) startLoop()
  }

  /**
   * Switches to a different camera without disturbing anything else.
   *
   * The segmentation model stays loaded and the layer stays on air, so a
   * mid-show swap costs only the new device's open time. Failing to open the
   * requested device leaves the previous one running rather than going black.
   */
  async function switchCamera(deviceId) {
    const previous = capture.getState().deviceId
    if (deviceId === previous) return true
    const stream = await capture.start(deviceId)
    if (!stream) {
      // Restore whatever was working before, so a bad pick is not fatal.
      if (previous) await capture.start(previous).catch(() => {})
      onChange(getState())
      return false
    }
    if (video) {
      video.srcObject = stream
      await video.play().catch(() => {})
    }
    segmentation.reset()
    if (visible && !running) startLoop()
    onChange(getState())
    return true
  }

  /** The cameras this machine can actually open, for the operator's dropdown. */
  function devices() {
    return listCameras().catch(() => [])
  }

  function destroy() {
    stopLoop()
    capture.stop()
    segmentation.close()
  }

  return { mount, update, destroy, getState, enable, switchCamera, devices, watchCameras, capture, segmentation }
}

export { CAMERA_STATUS, SEGMENTATION_STATUS }
