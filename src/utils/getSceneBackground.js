import { getBackgroundForScene } from '../backgrounds/backgroundManifest.js'

export function getSceneBackground(sceneNumber) {
  const { backgroundId, background } = getBackgroundForScene(sceneNumber)
  return { sceneNumber: Number(sceneNumber), backgroundId, background }
}
