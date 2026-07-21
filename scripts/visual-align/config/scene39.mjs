export default {
  sceneId: "39",
  pass: "1",
  referencePath:
    "public/assets/references/1920x1080/39_Utility_CloseLoop_1920x1080.png",
  urls: {
    reference:
      "/?scene=39&mode=reference&output=obs&render=composite&clean=true&paused=true&bgVideo=false",
    live:
      "/?scene=39&mode=live&output=obs&render=composite&clean=true&paused=true&bgVideo=false",
    overlay:
      "/?scene=39&mode=overlay&output=obs&render=composite&clean=true&paused=true&bgVideo=false&refOpacity=0.5&refOnTop=true&overlayView=both",
  },
  presenterExclusion: {
    selector: "[data-presenter-safe-zone]",
  },
  cropPadding: 50,
  thresholds: {
    geometry: {
      positionPx: 6,
      sizeRatio: 0.015,
    },
  },
  regions: {
    brand: {
      label: "BemaHub branding",
      selector: '[data-match-region="brand"]',
      expected: { x: 47, y: 38, width: 369, height: 132 },
    },
    "end-badge": {
      label: "END badge",
      selector: '[data-match-region="end-badge"]',
      expected: { x: 1717, y: 35, width: 143, height: 67 },
    },
    headline: {
      label: "Headline",
      selector: '[data-match-region="headline"]',
      expected: { x: 621, y: 196, width: 795, height: 164 },
    },
    divider: {
      label: "Infinity divider",
      selector: '[data-match-region="divider"]',
      expected: { x: 668, y: 448, width: 632, height: 25 },
    },
    subtitle: {
      label: "Supporting statement",
      selector: '[data-match-region="subtitle"]',
      expected: { x: 741, y: 509, width: 530, height: 67 },
    },
    qr: {
      label: "QR region",
      selector: '[data-match-region="qr"]',
      expected: { x: 1441, y: 131, width: 379, height: 389 },
    },
  },
  analysisTargets: {
    "brand-mark": {
      label: "Brand mark",
      selector: '[data-brand-part="mark"]',
      expected: { x: 47, y: 38, width: 83, height: 103 },
    },
    "brand-wordmark": {
      label: "Brand wordmark",
      selector: '[data-brand-part="wordmark"]',
      expected: { x: 126, y: 67, width: 290, height: 33 },
    },
    "brand-tagline": {
      label: "Brand tagline",
      selector: '[data-brand-part="tagline"]',
      expected: { x: 126, y: 91, width: 289, height: 49 },
    },
    "qr-content": {
      label: "QR content",
      selector: '[data-qr-part="content"]',
      expected: { x: 1489, y: 161, width: 291, height: 319 },
    },
  },
  regionOrder: ["brand", "end-badge", "headline", "divider", "subtitle", "qr"],
};