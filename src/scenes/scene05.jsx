// Scene 05 owns these design primitives so it can be edited independently.
function renderTicker(items, variant = 'local') {
  const itemMarkup = items
    .map((item) => `<span class="ticker-item inline-flex shrink-0 items-center gap-5 px-8 text-xl font-bold"><span class="ticker-dot text-bema-cyan">•</span>${item}</span>`)
    .join('')

  return `
    <div class="ticker ticker-bar ${variant}-ticker absolute inset-x-0 bottom-0 z-30 flex h-[74px] items-center overflow-hidden border-t border-white/20 bg-[linear-gradient(180deg,var(--ticker-navy),#03133a)] font-sans text-white shadow-2xl backdrop-blur" aria-label="Presentation ticker">
      <span class="ticker-label live-badge relative z-10 inline-flex h-full shrink-0 items-center gap-2 bg-gradient-to-r from-bema-blue to-bema-purple px-8 text-base font-black uppercase tracking-wider before:size-2.5 before:animate-pulse before:rounded-full before:bg-bema-live before:content-['']">Bema CORE Live</span>
      <div class="ticker-track flex min-w-max items-center animate-[ticker-scroll_28s_linear_infinite]"><span class="ticker-sequence">${itemMarkup}</span><span class="ticker-sequence" aria-hidden="true">${itemMarkup}</span></div>
    </div>
  `
}

const ASSET_PATHS = {
  logos: {
    wordmark: '/full-logo.png',
    mark: '/logo.png',
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

const REFERENCE_AGENDA = Object.freeze([
  'Welcome',
  'What is Bema Hub',
  'What is Bema CORE',
  'Impact Statistics',
  'Programs Overview',
  'Participation Journey',
  'EchoLoop',
  'Access Levels',
  'Community Builder Tiers',
  'Live Enrollment',
])

function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />
}

export const scene05 = {
  presenterZone: "left",
  renderUnderlay(context) {
    const agendaRows = REFERENCE_AGENDA
      .map(
        (item, index) =>
          `<li class="scene05-agenda-row" data-control-cue="agenda-${index + 1}"><span class="scene05-agenda-index">${String(index + 1).padStart(2, "0")}</span><span class="scene05-agenda-title">${item}</span></li>`,
      )
      .join("");
    return sceneMarkup(
      `<section class="scene scene05 absolute inset-0 overflow-hidden font-sans text-bema-navy"><div class="scene05-brand scene-brand-lockup"><img src="${ASSET_PATHS.logos.mark}" alt=""><span class="brand-wordmark" data-asset-wrapper><img src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub" data-asset-image /><strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong></span></div><div class="scene-live-chip"><span></span>LIVE</div><div class="scene05-presenter-space" aria-label="Presenter camera placement"></div><div class="scene05-layout"><div class="scene05-title-wrap"><h2>BEMA HUB<br>OPEN ENROLLMENT</h2><div class="scene05-year-row"><span></span><strong>2026</strong><span></span></div><p>Better Benefits. Stronger Together.</p></div><div class="scene05-right-stack"><section class="scene05-agenda-panel rounded-panel border border-sky-200/60 bg-white/90 shadow-card backdrop-blur-xl"><h3>TODAY'S AGENDA</h3><ol class="scene05-agenda-list">${agendaRows}</ol></section><section class="scene05-cta-panel rounded-card border border-bema-cyan/30 bg-white text-white shadow-card"><p class="scene05-cta-title">Big insights. Builder next steps. Live enrollment.</p><p class="scene05-cta-copy">Key insights, Builder next steps, and live enrollment await.</p></section></div></div></section>`,
    );
  },
  renderForeground(context) {
    return sceneMarkup(
      `<section class="scene-foreground scene05-foreground">${renderTicker(context.ticker.scene05, "local")}</section>`,
    );
  },
  render(context) {
    return (
      <>
        {this.renderUnderlay(context)}
        {this.renderForeground(context)}
      </>
    );
  },
};
