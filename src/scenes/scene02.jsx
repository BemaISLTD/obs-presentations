// Scene 02 owns these design primitives so it can be edited independently.
function renderTicker(items, variant = 'local') {
  const repeatedItems = [...items, ...items]
  const itemMarkup = repeatedItems
    .map((item) => `<span class="ticker-item inline-flex shrink-0 items-center gap-5 px-8 text-xl font-bold"><span class="ticker-dot text-bema-cyan">•</span>${item}</span>`)
    .join('')

  return `
    <div class="ticker ticker-bar ${variant}-ticker absolute inset-x-0 bottom-0 z-30 flex h-[74px] items-center overflow-hidden border-t border-white/20 bg-[linear-gradient(180deg,var(--ticker-navy),#03133a)] font-sans text-white shadow-2xl backdrop-blur" aria-label="Presentation ticker">
      <span class="ticker-label live-badge relative z-10 inline-flex h-full shrink-0 items-center gap-2 bg-gradient-to-r from-bema-blue to-bema-purple px-8 text-base font-black uppercase tracking-wider before:size-2.5 before:animate-pulse before:rounded-full before:bg-bema-live before:content-['']">Bema CORE Live</span>
      <div class="ticker-track flex min-w-max items-center animate-[ticker-scroll_28s_linear_infinite]">${itemMarkup}</div>
    </div>
  `
}

function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />
}

export const scene02 = {
  presenterZone: 'none',

  renderUnderlay() {
    const equalizer = Array.from({ length: 28 }, (_, index) => {
      const height = 32 + (index % 7) * 16
      const delay = (index % 9) * 0.12
      return `<span class="eq-bar" style="height: ${height}px; animation-delay: ${delay}s"></span>`
    }).join('')

    const waveform = Array.from({ length: 54 }, (_, index) => {
      const height = 20 + Math.abs(26 - index) * 1.4
      const delay = (index % 11) * 0.08
      return `<span class="wave-bar" style="height: ${Math.max(18, 96 - height)}px; animation-delay: ${delay}s"></span>`
    }).join('')

    const particles = createParticles(18)

    return sceneMarkup(`
      <section class="scene scene02 absolute inset-0 overflow-hidden font-sans text-bema-navy">
        <div class="particle-layer particle-field">${particles}</div>
        <div class="scene02-brand scene-brand-lockup"><img src="/assets/logos/bemahub-reference-mark.svg" alt=""><span class="brand-wordmark" data-asset-wrapper><img src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" data-asset-image /><strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong></span></div>
        <div class="scene02-live"><strong><i></i>LIVE</strong><span>♟ 1,246</span></div>
        <header class="scene02-copy">
          <p>WELCOME</p>
          <h2>MUSIC VISUALIZER</h2>
          <h3>Feel the beat. We’re getting started soon!</h3>
          <div><span></span><b>♥</b><span></span></div>
        </header>
        <div class="scene02-waveform-back" aria-hidden="true">${waveform}</div>
        <div class="scene02-presenter-space" aria-label="Presenter camera placement"></div>
        <div class="visualizer-shell wave-layer">
          <div class="logo-pulse">
            <img class="logo-mark" src="/assets/logos/bemahub-reference-mark.svg" alt="BemaHub mark" />
          </div>
          <div class="equalizer" aria-hidden="true">${equalizer}</div>
        </div>
      </section>
    `)
  },

  renderForeground(context) {
    return sceneMarkup(`<section class="scene-foreground scene02-foreground"><div class="scene02-presenter-frame" aria-hidden="true"></div><div class="scene02-status-row"><span>☺　Welcome Builders!</span><span>▣　Open Enrollment 2026</span><span>♡　Build together. Grow together.</span><span>♙　You belong here.</span><span>◯　Say hello in chat</span><span>◉　128 Watching Live</span></div>${renderTicker(context.ticker.scene02, 'local')}</section>`)
  },

  render(context) {
    return <>{this.renderUnderlay(context)}{this.renderForeground(context)}</>
  },
}

function createParticles(total) {
  return Array.from({ length: total }, (_, index) => {
    const left = 6 + (index * 5.1) % 88
    const delay = (index % 7) * 0.8
    const duration = 7 + (index % 5)
    const size = 6 + (index % 4) * 2
    return `<span class="particle" style="left: ${left}%; bottom: -24px; width: ${size}px; height: ${size}px; animation-delay: ${delay}s; animation-duration: ${duration}s"></span>`
  }).join('')
}
