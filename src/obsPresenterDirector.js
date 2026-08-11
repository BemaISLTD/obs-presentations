// Presenter/camera control expressed as state rather than one-off commands.
//
// The controller asks for a target state — "the presenter source should be
// visible in the lower-right preset" — and this module works out the OBS calls
// required to get there. Version one only drives scene item visibility, but
// entrance/exit animation plugs into applyPresenterState() without changing any
// caller, because callers never issue OBS commands directly.

import { OBS_REQUESTS } from './obsWebSocketClient.js'

// Placement presets, in 1920x1080 canvas coordinates. `full` deliberately holds
// no transform: it means "leave the source exactly as the operator framed it in
// OBS", which is the safe default for a single full-frame camera.
export const PRESENTER_PRESETS = Object.freeze({
  full: { label: 'Full frame', transform: null },
  'lower-right': { label: 'Lower right', transform: { positionX: 1180, positionY: 490, scale: 0.36 } },
  'lower-left': { label: 'Lower left', transform: { positionX: 120, positionY: 490, scale: 0.36 } },
  center: { label: 'Center', transform: { positionX: 480, positionY: 135, scale: 0.5 } },
  pip: { label: 'Picture in picture', transform: { positionX: 1360, positionY: 700, scale: 0.28 } },
})

export const PRESENTER_PRESET_IDS = Object.freeze(Object.keys(PRESENTER_PRESETS))

export function isPresenterPreset(value) {
  return Object.hasOwn(PRESENTER_PRESETS, String(value))
}

/**
 * Resolves the numeric sceneItemId for a named source inside a named scene.
 * OBS addresses scene items by id, but operators configure them by name.
 */
async function resolveSceneItemId(client, sceneName, sourceName) {
  const response = await client.request(OBS_REQUESTS.getSceneItemId, { sceneName, sourceName })
  const sceneItemId = response?.sceneItemId
  if (typeof sceneItemId !== 'number') throw new Error(`OBS has no source named "${sourceName}" in scene "${sceneName}".`)
  return sceneItemId
}

/**
 * Applies one source's desired state to OBS.
 *
 * @param {object} client         An object from createObsClient().
 * @param {object} target
 * @param {string} target.sceneName   The OBS scene holding the source.
 * @param {string} target.sourceName  The configured OBS source name.
 * @param {boolean} target.visible    Whether the source should be on air.
 * @param {string} [target.preset]    A PRESENTER_PRESETS key.
 * @returns {Promise<{sceneItemId: number, visible: boolean, preset: string}>}
 */
export async function applyPresenterState(client, { sceneName, sourceName, visible, preset = 'full' }) {
  if (!sceneName) throw new Error('Select the OBS scene to control first.')
  if (!sourceName) throw new Error('Select or enter the OBS source to control first.')

  const sceneItemId = await resolveSceneItemId(client, sceneName, sourceName)
  const placement = PRESENTER_PRESETS[preset] ?? PRESENTER_PRESETS.full

  // Place the source before toggling visibility, so a preset change never pops
  // on screen mid-move. A future slide/fade implementation replaces this single
  // call with a tween and keeps the same call site.
  if (placement.transform) await applyTransform(client, sceneName, sceneItemId, placement.transform)

  await client.request(OBS_REQUESTS.setSceneItemEnabled, {
    sceneName,
    sceneItemId,
    sceneItemEnabled: Boolean(visible),
  })

  return { sceneItemId, visible: Boolean(visible), preset }
}

async function applyTransform(client, sceneName, sceneItemId, transform) {
  await client.request(OBS_REQUESTS.setSceneItemTransform, {
    sceneName,
    sceneItemId,
    sceneItemTransform: {
      positionX: transform.positionX,
      positionY: transform.positionY,
      scaleX: transform.scale,
      scaleY: transform.scale,
    },
  })
}

/** Lists the scenes OBS currently knows about, for the configuration dropdown. */
export async function fetchScenes(client) {
  const response = await client.request(OBS_REQUESTS.getSceneList)
  return (response?.scenes ?? [])
    .map((scene) => String(scene.sceneName ?? ''))
    .filter(Boolean)
    .reverse() // OBS returns scenes bottom-up; show them in UI order.
}

/** Lists the source names inside one scene, for the source dropdown. */
export async function fetchSceneSources(client, sceneName) {
  if (!sceneName) return []
  const response = await client.request(OBS_REQUESTS.getSceneItemList, { sceneName })
  return (response?.sceneItems ?? [])
    .map((item) => String(item.sourceName ?? ''))
    .filter(Boolean)
}
