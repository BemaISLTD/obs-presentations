// AI background removal, producing genuine transparency.
//
// The camera frame is drawn to a canvas and the person-confidence mask from
// MediaPipe's Selfie Segmenter is written into that canvas's alpha channel.
// The result is a transparent canvas containing only the presenter, so the
// presentation behind them shows through — no green screen, no blur, no fill.
//
// Everything loads from local paths (§14). Nothing here may reach a CDN at show
// time, so the WASM bundle and the .tflite model are vendored into public/.

import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'

const WASM_PATH = '/mediapipe/wasm'
const MODEL_PATH = '/models/selfie_segmenter_landscape.tflite'

export const SEGMENTATION_STATUS = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  error: 'error',
})

/**
 * Creates the segmentation engine.
 *
 * The model is created once and kept warm for the life of the page (§21).
 * Hiding the presenter throttles inference rather than tearing the model down,
 * because reloading it costs seconds the show does not have.
 */
export function createPresenterSegmentation({ onChange = () => {} } = {}) {
  const state = {
    status: SEGMENTATION_STATUS.idle,
    message: '',
    delegate: '',
    fps: 0,
  }

  let segmenter
  let loading
  // One inference at a time. Without this, a slow machine queues frames until
  // it collapses; skipping instead keeps latency bounded (§13).
  let inferenceBusy = false
  let lastMask = null
  let maskCanvas
  let maskContext
  let frameTimes = []

  const update = (patch) => {
    Object.assign(state, patch)
    onChange({ ...state })
  }

  async function createSegmenter(delegate) {
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
    return ImageSegmenter.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    })
  }

  /**
   * Loads the model, preferring GPU but falling back to CPU.
   *
   * §13 warns against assuming GPU is better; it is faster where it works, but
   * on some Windows drivers it fails outright. Falling back keeps the show
   * running on a machine where GPU inference cannot initialize.
   */
  async function load() {
    if (segmenter) return segmenter
    if (loading) return loading
    update({ status: SEGMENTATION_STATUS.loading, message: '' })
    loading = (async () => {
      try {
        segmenter = await createSegmenter('GPU')
        update({ status: SEGMENTATION_STATUS.ready, delegate: 'GPU', message: '' })
      } catch (gpuError) {
        console.warn('Presenter segmentation: GPU delegate unavailable, falling back to CPU.', gpuError)
        try {
          segmenter = await createSegmenter('CPU')
          update({ status: SEGMENTATION_STATUS.ready, delegate: 'CPU', message: '' })
        } catch (cpuError) {
          update({ status: SEGMENTATION_STATUS.error, message: cpuError?.message || 'Background removal failed to load.' })
          throw cpuError
        }
      } finally {
        loading = null
      }
      return segmenter
    })()
    return loading
  }

  function recordFrame() {
    const now = performance.now()
    frameTimes.push(now)
    frameTimes = frameTimes.filter((time) => now - time < 1000)
    state.fps = frameTimes.length
  }

  /**
   * Runs inference for one frame, if the previous one has finished.
   *
   * Returns the newest mask, or the previous one when this frame was skipped —
   * reusing the last good mask is what lets segmentation run slower than the
   * camera without the picture stuttering (§13).
   */
  function segment(video, timestamp) {
    if (!segmenter || inferenceBusy) return lastMask
    inferenceBusy = true
    try {
      segmenter.segmentForVideo(video, timestamp, (result) => {
        const confidence = result.confidenceMasks?.[0]
        if (confidence) {
          lastMask = {
            data: confidence.getAsFloat32Array(),
            width: confidence.width,
            height: confidence.height,
          }
          recordFrame()
        }
        result.close?.()
        inferenceBusy = false
      })
    } catch (error) {
      inferenceBusy = false
      console.warn('Presenter segmentation frame failed.', error)
    }
    return lastMask
  }

  /**
   * Composites one frame into `target` with the background made transparent.
   *
   * The mask is generally lower resolution than the output, so it is drawn up
   * through a small intermediate canvas and read back — letting the GPU do the
   * scaling, and giving soft mask edges for free instead of blocky ones.
   */
  function renderFrame(video, target, { threshold = 0.5, feather = 0.08, mirrored = false } = {}) {
    const context = target.getContext('2d', { willReadFrequently: true })
    if (!context || !video.videoWidth) return false

    const width = target.width
    const height = target.height
    context.save()
    context.clearRect(0, 0, width, height)
    if (mirrored) {
      context.translate(width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, 0, 0, width, height)
    context.restore()

    if (!lastMask) return true

    if (!maskCanvas) {
      maskCanvas = document.createElement('canvas')
      maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
    }
    if (maskCanvas.width !== width || maskCanvas.height !== height) {
      maskCanvas.width = width
      maskCanvas.height = height
    }

    // Paint the raw mask at its own resolution, then let drawImage scale it to
    // the output size with smoothing.
    const small = maskContext.createImageData(lastMask.width, lastMask.height)
    for (let index = 0; index < lastMask.data.length; index += 1) {
      const value = Math.round(lastMask.data[index] * 255)
      const offset = index * 4
      small.data[offset] = value
      small.data[offset + 1] = value
      small.data[offset + 2] = value
      small.data[offset + 3] = 255
    }
    const scratch = document.createElement('canvas')
    scratch.width = lastMask.width
    scratch.height = lastMask.height
    scratch.getContext('2d').putImageData(small, 0, 0)

    maskContext.save()
    maskContext.clearRect(0, 0, width, height)
    maskContext.imageSmoothingEnabled = true
    maskContext.imageSmoothingQuality = 'high'
    if (mirrored) {
      maskContext.translate(width, 0)
      maskContext.scale(-1, 1)
    }
    maskContext.drawImage(scratch, 0, 0, width, height)
    maskContext.restore()

    const frame = context.getImageData(0, 0, width, height)
    const mask = maskContext.getImageData(0, 0, width, height)
    // A soft ramp around the threshold keeps hair and fingers from tearing,
    // while a narrow band avoids the ghosting that heavy feathering causes.
    const low = Math.max(0, threshold - feather)
    const high = Math.min(1, threshold + feather)
    const span = Math.max(0.0001, high - low)
    for (let index = 0; index < frame.data.length; index += 4) {
      const confidence = mask.data[index] / 255
      const alpha = confidence <= low ? 0 : confidence >= high ? 1 : (confidence - low) / span
      frame.data[index + 3] = Math.round(alpha * 255)
    }
    context.putImageData(frame, 0, 0)
    return true
  }

  return {
    load,
    segment,
    renderFrame,
    getState: () => ({ ...state }),
    hasMask: () => Boolean(lastMask),
    reset: () => { lastMask = null },
    close: () => {
      segmenter?.close?.()
      segmenter = undefined
      lastMask = null
      update({ status: SEGMENTATION_STATUS.idle, delegate: '', fps: 0 })
    },
  }
}
