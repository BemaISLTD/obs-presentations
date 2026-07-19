const exportFamily = (sourceWidth, sourceHeight, compositionHeight) =>
  Object.freeze({
    sourceWidth,
    sourceHeight,
    composition: Object.freeze({
      x: 0,
      y: 0,
      width: sourceWidth,
      height: compositionHeight,
    }),
  });

const REFERENCE_EXPORT_FAMILIES = Object.freeze({
  early: exportFamily(1448, 1086, 740),
  core: exportFamily(1402, 1122, 738),
  walkthrough: exportFamily(1491, 1055, 678),
  closing: exportFamily(1448, 1086, 650),
});

const SCENE_REFERENCE_OVERRIDES = Object.freeze({
  39: Object.freeze({
    sourceWidth: 1448,
    sourceHeight: 1086,
    composition: Object.freeze({ x: 0, y: 0, width: 1448, height: 718 }),
  }),
});

export function getReferenceCrop(sceneId) {
  const scene = Number(sceneId);
  const override = SCENE_REFERENCE_OVERRIDES[String(sceneId)];
  if (override) return override;
  if (scene <= 5) return REFERENCE_EXPORT_FAMILIES.early;
  if (scene <= 15) return REFERENCE_EXPORT_FAMILIES.core;
  if (scene <= 25) return REFERENCE_EXPORT_FAMILIES.walkthrough;
  return REFERENCE_EXPORT_FAMILIES.closing;
}
