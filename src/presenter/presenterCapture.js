// Camera acquisition, and nothing else.
//
// This module owns permissions, device enumeration, and the MediaStream. It
// knows nothing about scenes, segmentation, or layout, so a camera problem can
// never take down the presentation and a layout change can never disturb the
// camera.
//
// Device choice is machine-local (§5): the computer running the program page
// owns the camera, so the selection is persisted in localStorage here rather
// than in shared show state.

const STORAGE_KEY = 'bemahub.presenter.camera.v1'

export const CAMERA_STATUS = Object.freeze({
  idle: 'idle',
  requesting: 'requesting',
  ready: 'ready',
  denied: 'denied',
  missing: 'missing',
  busy: 'busy',
  error: 'error',
})

/** The saved camera for this machine: id plus label, so it survives id churn. */
export function readSavedCamera() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return null
    return { deviceId: String(saved.deviceId || ''), deviceLabel: String(saved.deviceLabel || '') }
  } catch {
    return null
  }
}

export function saveCamera(deviceId, deviceLabel) {
  try {
    if (!deviceId) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ deviceId, deviceLabel: deviceLabel || '' }))
  } catch { /* Storage can be disabled; the camera still works for this session. */ }
}

export function clearSavedCamera() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* Ignored. */ }
}

export function canCapture() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export async function listCameras() {
  if (!navigator.mediaDevices?.enumerateDevices) return []
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices
    .filter((device) => device.kind === 'videoinput')
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `Camera ${index + 1}`,
    }))
}

/**
 * Calls back whenever cameras are plugged in, unplugged, or paired.
 *
 * A phone joining over Continuity/Bluetooth or a USB camera being connected
 * shows up here, which is what keeps the operator's dropdown current without
 * anyone reloading the program page.
 */
export function watchCameras(onChange) {
  if (!navigator.mediaDevices?.addEventListener) return () => {}
  const handler = () => { listCameras().then(onChange).catch(() => {}) }
  navigator.mediaDevices.addEventListener('devicechange', handler)
  return () => navigator.mediaDevices.removeEventListener('devicechange', handler)
}

/**
 * Resolves the device to open.
 *
 * Device ids are not stable across replugs and browser restarts, so a saved id
 * that no longer exists falls back to matching the saved label — which is what
 * makes "it picked Camo again by itself" work the next morning.
 */
export async function resolveSavedDevice() {
  const saved = readSavedCamera()
  if (!saved?.deviceId && !saved?.deviceLabel) return ''
  const cameras = await listCameras().catch(() => [])
  if (saved.deviceId && cameras.some((camera) => camera.deviceId === saved.deviceId)) return saved.deviceId
  const byLabel = saved.deviceLabel && cameras.find((camera) => camera.label === saved.deviceLabel)
  if (byLabel) {
    saveCamera(byLabel.deviceId, byLabel.label)
    return byLabel.deviceId
  }
  return ''
}

function videoConstraints(deviceId) {
  return {
    audio: false,
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    },
  }
}

export function describeCameraError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return { status: CAMERA_STATUS.denied, message: 'Camera permission denied. Allow access for this page and reload.' }
  }
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
    return { status: CAMERA_STATUS.missing, message: 'The selected camera is not available. Choose another in camera setup.' }
  }
  if (error?.name === 'NotReadableError') {
    return { status: CAMERA_STATUS.busy, message: 'The camera is already in use by another application.' }
  }
  return { status: CAMERA_STATUS.error, message: error?.message || 'The camera could not be started.' }
}

/**
 * Owns one camera stream for the lifetime of the page.
 *
 * The stream is deliberately long-lived (§20): hiding the presenter between
 * scenes must not stop the device, because reacquiring it costs a visible
 * delay, makes the camera light blink, and upsets virtual cameras like Camo.
 */
export function createPresenterCapture({ onChange = () => {} } = {}) {
  const state = {
    status: CAMERA_STATUS.idle,
    message: '',
    deviceId: '',
    deviceLabel: '',
    settings: null,
  }
  let stream
  let starting

  const update = (patch) => {
    Object.assign(state, patch)
    onChange({ ...state })
  }

  async function start(requestedDeviceId) {
    if (!canCapture()) {
      update({ status: CAMERA_STATUS.error, message: 'This browser cannot open a camera. Use HTTPS or localhost.' })
      return null
    }
    const deviceId = requestedDeviceId ?? (await resolveSavedDevice())
    if (stream?.active && deviceId === state.deviceId) return stream
    if (starting) { try { await starting } catch { /* Fall through to a fresh attempt. */ } }
    if (stream?.active && deviceId === state.deviceId) return stream

    stop()
    update({ status: CAMERA_STATUS.requesting, message: '' })
    starting = navigator.mediaDevices.getUserMedia(videoConstraints(deviceId))
    try {
      stream = await starting
      const track = stream.getVideoTracks()[0]
      const settings = track?.getSettings?.() ?? {}
      const label = track?.label || ''
      // Persist only after a device has actually opened, so a failed choice is
      // never remembered as the machine's camera.
      if (settings.deviceId || deviceId) saveCamera(settings.deviceId || deviceId, label)
      // A device that vanishes mid-show must surface, not fail silently.
      track?.addEventListener('ended', () => {
        update({ status: CAMERA_STATUS.missing, message: 'The camera was disconnected.' })
      })
      update({
        status: CAMERA_STATUS.ready,
        message: '',
        deviceId: settings.deviceId || deviceId || '',
        deviceLabel: label,
        settings: {
          width: settings.width ?? null,
          height: settings.height ?? null,
          frameRate: settings.frameRate ? Math.round(settings.frameRate) : null,
        },
      })
      return stream
    } catch (error) {
      update(describeCameraError(error))
      return null
    } finally {
      starting = null
    }
  }

  function stop() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = undefined
  }

  return {
    start,
    stop: () => { stop(); update({ status: CAMERA_STATUS.idle, message: '', settings: null }) },
    getStream: () => stream,
    getState: () => ({ ...state }),
  }
}
