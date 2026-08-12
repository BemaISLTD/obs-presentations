// Presenter placements, expressed once for every renderer.
//
// Both the browser PresenterLayer and the legacy OBS director consume these, so
// a placement is defined in exactly one place. Values are canonical 1920x1080
// stage pixels: the browser turns them into CSS, and the OBS director turns
// them into a scene-item transform.

export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

// The smallest card that is still comfortably grabbable on the control surface.
export const MIN_PRESENTER_SIZE = 120

const preset = (id, label, x, y, width, height) => Object.freeze({ id, label, x, y, width, height })

export const PRESENTER_PRESETS = Object.freeze({
  full: preset('full', 'Full frame', 0, 0, 1920, 1080),
  'lower-right': preset('lower-right', 'Lower right', 1320, 620, 520, 293),
  'lower-left': preset('lower-left', 'Lower left', 80, 620, 520, 293),
  center: preset('center', 'Center stage', 560, 220, 800, 450),
  pip: preset('pip', 'Picture in picture', 1520, 780, 320, 180),
  sidebar: preset('sidebar', 'Side panel', 1180, 180, 660, 720),
})

export const PRESENTER_PRESET_IDS = Object.freeze(Object.keys(PRESENTER_PRESETS))

export function isPresenterPreset(value) {
  return Object.hasOwn(PRESENTER_PRESETS, String(value))
}

/** Geometry for a preset id, or null when the id is not a known preset. */
export function presetGeometry(id) {
  const match = PRESENTER_PRESETS[id]
  return match ? { x: match.x, y: match.y, width: match.width, height: match.height } : null
}

/**
 * The preset whose geometry matches, or 'custom' when the operator has dragged
 * the card somewhere of their own. Lets the UI highlight the active preset
 * without storing a redundant preset field alongside the geometry.
 */
export function matchPreset(geometry) {
  if (!geometry) return 'custom'
  const found = PRESENTER_PRESET_IDS.find((id) => {
    const preset = PRESENTER_PRESETS[id]
    return preset.x === geometry.x && preset.y === geometry.y
      && preset.width === geometry.width && preset.height === geometry.height
  })
  return found ?? 'custom'
}

/** OBS expresses placement as a position plus a uniform scale of a 1080p source. */
export function presetToObsTransform(id) {
  const geometry = presetGeometry(id)
  if (!geometry || id === 'full') return null
  return {
    positionX: geometry.x,
    positionY: geometry.y,
    scale: geometry.width / STAGE_WIDTH,
  }
}
