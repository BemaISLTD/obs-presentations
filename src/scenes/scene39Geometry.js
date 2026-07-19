export const SCENE_39_GEOMETRY = Object.freeze({
  presenterSafe: Object.freeze({ x: 0, y: 150, width: 596, height: 930 }),
  brand: Object.freeze({ x: 46, y: 38, width: 341, height: 113 }),
  endBadge: Object.freeze({ x: 1704, y: 44, width: 175, height: 69 }),
  headline: Object.freeze({ x: 613, y: 185, width: 747, height: 242 }),
  divider: Object.freeze({ x: 650, y: 459, width: 646, height: 30 }),
  subtitle: Object.freeze({ x: 720, y: 514, width: 507, height: 84 }),
  qr: Object.freeze({ x: 1452, y: 143, width: 355, height: 390 }),
  ctaDashboard: Object.freeze({ x: 1363, y: 563, width: 485, height: 132 }),
  ctaLoopLink: Object.freeze({ x: 1363, y: 708, width: 485, height: 132 }),
  ctaCommunity: Object.freeze({ x: 1363, y: 854, width: 485, height: 134 }),
  loopMark: Object.freeze({ x: 894, y: 680, width: 162, height: 143 }),
  thankYou: Object.freeze({ x: 672, y: 841, width: 552, height: 90 }),
  footer: Object.freeze({ x: 7, y: 1003, width: 1905, height: 75 }),
});

export const SCENE_39_REGION_TARGETS = Object.freeze({
  brand: SCENE_39_GEOMETRY.brand,
  "end-badge": SCENE_39_GEOMETRY.endBadge,
  headline: SCENE_39_GEOMETRY.headline,
  divider: SCENE_39_GEOMETRY.divider,
  subtitle: SCENE_39_GEOMETRY.subtitle,
  qr: SCENE_39_GEOMETRY.qr,
  "cta-dashboard": SCENE_39_GEOMETRY.ctaDashboard,
  "cta-looplink": SCENE_39_GEOMETRY.ctaLoopLink,
  "cta-community": SCENE_39_GEOMETRY.ctaCommunity,
  "loop-mark": SCENE_39_GEOMETRY.loopMark,
  "thank-you": SCENE_39_GEOMETRY.thankYou,
  footer: SCENE_39_GEOMETRY.footer,
});

export const SCENE_39_COMPARE_THRESHOLDS = Object.freeze({
  similarity: 0.95,
  positionPx: 8,
  sizeRatio: 0.02,
});

export function geometryStyle(box) {
  return `left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px;`;
}