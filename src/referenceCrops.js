const exportFamily = (sourceWidth, sourceHeight, compositionHeight) => Object.freeze({
  sourceWidth,
  sourceHeight,
  composition: Object.freeze({ x: 0, y: 0, width: sourceWidth, height: compositionHeight }),
})

const REFERENCE_EXPORT_FAMILIES = Object.freeze({
  early: exportFamily(1448, 1086, 740),
  core: exportFamily(1402, 1122, 738),
  walkthrough: exportFamily(1491, 1055, 678),
  closing: exportFamily(1448, 1086, 650),
})

export function getReferenceCrop(sceneId) {
  const scene = Number(sceneId)
  if (scene <= 5) return REFERENCE_EXPORT_FAMILIES.early
  if (scene <= 15) return REFERENCE_EXPORT_FAMILIES.core
  if (scene <= 25) return REFERENCE_EXPORT_FAMILIES.walkthrough
  return REFERENCE_EXPORT_FAMILIES.closing
}

