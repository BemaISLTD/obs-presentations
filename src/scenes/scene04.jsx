// Scene 04 owns these design primitives so it can be edited independently.
const ASSET_PATHS = {
  logos: {
    wordmark: '/assets/logos/bemahub-wordmark.svg',
    mark: '/assets/logos/bemahub-mark.svg',
  },
  qr: {
    join: '/assets/qr/main-join-qr.png',
  },
  video: {
    slide01Loop: '/assets/video/slide01-bg-loop.mp4',
  },
  backgrounds: {
    slide01: '/assets/storyboards/backgrounds/slide01-bg.png',
  },
}

function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />
}

export const scene04 = {
  presenterZone: 'none',
  renderUnderlay() {
    const particles = Array.from({ length: 20 }, (_, index) => `<span class="particle" style="left:${5 + (index * 4.45) % 88}%;bottom:-30px;width:${5 + (index % 5) * 2}px;height:${5 + (index % 5) * 2}px;animation-delay:${(index % 6) * 0.55}s;animation-duration:${6 + (index % 4)}s"></span>`).join('')
    return sceneMarkup(`<section class="scene scene04 absolute inset-0 overflow-hidden font-sans text-bema-navy"><div class="scene-live-chip"><span></span>LIVE</div><div class="particle-layer particle-field">${particles}</div><div class="light-streak"></div><div class="stinger-copy wave-layer"><div class="scene04-brand-row"><img class="scene04-brand-mark" src="${ASSET_PATHS.logos.mark}" alt="BemaHub mark"><img class="scene04-brand-wordmark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub"></div><div class="scene04-statements"><p data-control-cue="statement-1"><span>Every <strong class="blue">creator</strong> deserves <strong class="blue">to be seen</strong>.</span></p><p data-control-cue="statement-2"><span>Every <strong class="cyan">Builder</strong> deserves a meaningful way to <strong class="blue">help creative value move</strong>.</span></p><p data-control-cue="statement-3"><span>Every <strong class="blue">community</strong> deserves a chance to <strong class="red">grow together</strong>.</span></p></div><p class="scene04-welcome">Welcome to <strong>Bema.</strong> Welcome to <strong class="blue">Open Enrollment 2026.</strong></p></div></section>`)
  },
  render(context) { return this.renderUnderlay(context) },
}
