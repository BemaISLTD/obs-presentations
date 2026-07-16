const BACKGROUND_DEFINITIONS = [
  {
    id: 'bg01-countdown-stage-light',
    name: 'Countdown Stage Light',
    posterPath: '/assets/backgrounds/ref/bg01-countdown-stage-light.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg01-countdown-stage-light.mp4',
    introVideoPath: '/assets/backgrounds/videos/intros/bg01-countdown-stage-light-intro.mp4',
    outroVideoPath: '/assets/backgrounds/videos/outros/bg01-countdown-stage-light-outro.mp4',
    defaultOpacity: 0.92,
    overlayTint: 'soft-wash',
    motionIntensity: 0.36,
    preferredScenes: [1],
  },
  {
    id: 'bg02-music-visualizer-neon-ref',
    name: 'Music Visualizer Neon',
    posterPath: '/assets/backgrounds/ref/bg02-music-visualizer-neon-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg02-music-visualizer-neon-ref.mp4',
    defaultOpacity: 0.94,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.78,
    preferredScenes: [2],
  },
  {
    id: 'bg03-music-visualizer-stage-vortex',
    name: 'Music Visualizer Stage Vortex',
    posterPath: '/assets/backgrounds/ref/bg03-music-visualizer-stage-vortex.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg03-music-visualizer-stage-vortex.mp4',
    defaultOpacity: 0.95,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.82,
    preferredScenes: [14],
  },
  {
    id: 'bg04-presenter-studio-real-ref',
    name: 'Presenter Studio Real',
    posterPath: '/assets/backgrounds/ref/bg04-presenter-studio-real-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg04-presenter-studio-real-ref.mp4',
    defaultOpacity: 0.9,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.42,
    preferredScenes: [3, 4],
  },
  {
    id: 'bg05-presenter-studio-clean-panel-ref',
    name: 'Presenter Studio Clean Panel',
    posterPath: '/assets/backgrounds/ref/bg05-presenter-studio-clean-panel-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg05-presenter-studio-clean-panel-ref.mp4',
    defaultOpacity: 0.88,
    overlayTint: 'soft-wash',
    motionIntensity: 0.28,
    preferredScenes: [5],
  },
  {
    id: 'bg06-explainer-clean-wave-ref',
    name: 'Explainer Clean Wave',
    posterPath: '/assets/backgrounds/ref/bg06-explainer-clean-wave-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg06-explainer-clean-wave-ref.mp4',
    defaultOpacity: 0.9,
    overlayTint: 'soft-wash',
    motionIntensity: 0.34,
    preferredScenes: [6, 7],
  },
  {
    id: 'bg07-explainer-perspective-wave-ref',
    name: 'Explainer Perspective Wave',
    posterPath: '/assets/backgrounds/ref/bg07-explainer-perspective-wave-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg07-explainer-perspective-wave-ref.mp4',
    defaultOpacity: 0.9,
    overlayTint: 'soft-wash',
    motionIntensity: 0.4,
    preferredScenes: [9, 10],
  },
  {
    id: 'bg08-dashboard-product-tech-ref',
    name: 'Dashboard Product Tech',
    posterPath: '/assets/backgrounds/ref/bg08-dashboard-product-tech-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg08-dashboard-product-tech-ref.mp4',
    defaultOpacity: 0.92,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.52,
    preferredScenes: [8, 16],
  },
  {
    id: 'bg09-enrollment-cta-stage-ref',
    name: 'Enrollment CTA Stage',
    posterPath: '/assets/backgrounds/ref/bg09-enrollment-cta-stage-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg09-enrollment-cta-stage-ref.mp4',
    defaultOpacity: 0.9,
    overlayTint: 'soft-wash',
    motionIntensity: 0.44,
    preferredScenes: [14, 34],
  },
  {
    id: 'bg10-brand-stinger-dark-orb-ref',
    name: 'Brand Stinger Dark Orb',
    posterPath: '/assets/backgrounds/ref/bg10-brand-stinger-dark-orb-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg10-brand-stinger-dark-orb-ref.mp4',
    introVideoPath: '/assets/backgrounds/videos/intros/bg10-brand-stinger-dark-orb-ref-intro.mp4',
    outroVideoPath: '/assets/backgrounds/videos/outros/bg10-brand-stinger-dark-orb-ref-outro.mp4',
    defaultOpacity: 0.95,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.7,
    preferredScenes: [4, 10],
  },
  {
    id: 'bg11-utility-qa-hold-wave-ref',
    name: 'Utility QA Hold Wave',
    posterPath: '/assets/backgrounds/ref/bg11-utility-qa-hold-wave-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg11-utility-qa-hold-wave-ref.mp4',
    defaultOpacity: 0.86,
    overlayTint: 'soft-wash',
    motionIntensity: 0.22,
    preferredScenes: [11, 33, 35],
  },
  {
    id: 'bg12-soft-light-corridor-ref',
    name: 'Soft Light Corridor',
    posterPath: '/assets/backgrounds/ref/bg12-soft-light-corridor-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg12-soft-light-corridor-ref.mp4',
    defaultOpacity: 0.88,
    overlayTint: 'soft-wash',
    motionIntensity: 0.18,
    preferredScenes: [12],
  },
  {
    id: 'bg13-iridescent-energy-burst-room-ref',
    name: 'Iridescent Energy Burst Room',
    posterPath: '/assets/backgrounds/ref/bg13-iridescent-energy-burst-room-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg13-iridescent-energy-burst-room-ref.mp4',
    defaultOpacity: 0.94,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.66,
    preferredScenes: [13],
  },
  {
    id: 'bg14-neon-speed-tunnel-ref',
    name: 'Neon Speed Tunnel',
    posterPath: '/assets/backgrounds/ref/bg14-neon-speed-tunnel-ref.png',
    loopVideoPath: '/assets/backgrounds/videos/loops/bg14-neon-speed-tunnel-ref.mp4',
    defaultOpacity: 0.96,
    overlayTint: 'navy-gradient',
    motionIntensity: 0.9,
    preferredScenes: [15],
  },
]

const DEFAULT_BACKGROUND_ID = 'bg06-explainer-clean-wave-ref'

export const backgroundManifest = Object.freeze(BACKGROUND_DEFINITIONS)

export const backgroundById = Object.freeze(
  BACKGROUND_DEFINITIONS.reduce((map, background) => {
    map[background.id] = background
    return map
  }, {}),
)

export const sceneBackgroundAssignments = Object.freeze({
  1: 'bg01-countdown-stage-light',
  2: 'bg02-music-visualizer-neon-ref',
  3: 'bg04-presenter-studio-real-ref',
  4: 'bg10-brand-stinger-dark-orb-ref',
  5: 'bg05-presenter-studio-clean-panel-ref',
  6: 'bg06-explainer-clean-wave-ref',
  7: 'bg07-explainer-perspective-wave-ref',
  8: 'bg08-dashboard-product-tech-ref',
  9: 'bg07-explainer-perspective-wave-ref',
  10: 'bg07-explainer-perspective-wave-ref',
  11: 'bg11-utility-qa-hold-wave-ref',
  12: 'bg12-soft-light-corridor-ref',
  13: 'bg13-iridescent-energy-burst-room-ref',
  14: 'bg09-enrollment-cta-stage-ref',
  15: 'bg14-neon-speed-tunnel-ref',
  16: 'bg08-dashboard-product-tech-ref',
  17: 'bg08-dashboard-product-tech-ref',
  18: 'bg08-dashboard-product-tech-ref',
  19: 'bg06-explainer-clean-wave-ref',
  20: 'bg06-explainer-clean-wave-ref',
  21: 'bg07-explainer-perspective-wave-ref',
  22: 'bg07-explainer-perspective-wave-ref',
  23: 'bg06-explainer-clean-wave-ref',
  24: 'bg06-explainer-clean-wave-ref',
  25: 'bg06-explainer-clean-wave-ref',
  26: 'bg08-dashboard-product-tech-ref',
  27: 'bg08-dashboard-product-tech-ref',
  28: 'bg12-soft-light-corridor-ref',
  29: 'bg08-dashboard-product-tech-ref',
  30: 'bg08-dashboard-product-tech-ref',
  31: 'bg08-dashboard-product-tech-ref',
  32: 'bg08-dashboard-product-tech-ref',
  33: 'bg11-utility-qa-hold-wave-ref',
  34: 'bg09-enrollment-cta-stage-ref',
  35: 'bg11-utility-qa-hold-wave-ref',
  36: 'bg11-utility-qa-hold-wave-ref',
  37: 'bg08-dashboard-product-tech-ref',
  38: 'bg11-utility-qa-hold-wave-ref',
  39: 'bg11-utility-qa-hold-wave-ref',
})

export function resolveBackgroundId(sceneId, explicitBackgroundId) {
  if (explicitBackgroundId && backgroundById[explicitBackgroundId]) {
    return explicitBackgroundId
  }

  const numericScene = Number(sceneId)
  if (Number.isFinite(numericScene) && sceneBackgroundAssignments[numericScene]) {
    return sceneBackgroundAssignments[numericScene]
  }

  return DEFAULT_BACKGROUND_ID
}

export function getBackgroundForScene(sceneId, explicitBackgroundId) {
  const backgroundId = resolveBackgroundId(sceneId, explicitBackgroundId)
  return {
    sceneId: Number(sceneId),
    backgroundId,
    background: backgroundById[backgroundId] ?? backgroundById[DEFAULT_BACKGROUND_ID],
  }
}
