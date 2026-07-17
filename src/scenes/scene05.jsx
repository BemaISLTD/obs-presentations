import { renderTicker } from '../components/ticker.js'
import { ASSET_PATHS } from '../config/assets.js'
import { sceneMarkup } from './SceneMarkup.jsx'

export const scene05 = {
  presenterZone: 'left',
  renderUnderlay(context) {
    const agendaRows = resolveAgendaItems(context).map((item, index) => `<li class="scene05-agenda-row" data-control-cue="agenda-${index + 1}"><span class="scene05-agenda-index">${String(index + 1).padStart(2, '0')}</span><span class="scene05-agenda-title">${item}</span></li>`).join('')
    return sceneMarkup(`<section class="scene scene05 absolute inset-0 overflow-hidden font-sans text-bema-navy"><img class="scene-brand-wordmark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub"><div class="scene-live-chip"><span></span>LIVE</div><div class="scene05-presenter-space" aria-label="Presenter camera placement"></div><div class="scene05-layout"><div class="scene05-title-wrap"><h2>BEMA HUB<br>OPEN ENROLLMENT</h2><div class="scene05-year-row"><span></span><strong>2026</strong><span></span></div><p>Better Benefits. Stronger Together.</p></div><div class="scene05-right-stack"><section class="scene05-agenda-panel rounded-panel border border-sky-200/60 bg-white/90 shadow-card backdrop-blur-xl"><h3>TODAY'S AGENDA</h3><ol class="scene05-agenda-list">${agendaRows}</ol></section><section class="scene05-cta-panel rounded-card border border-bema-cyan/30 bg-gradient-to-r from-bema-blue to-bema-purple text-white shadow-card"><p class="scene05-cta-title">Big insights. Builder next steps. Live enrollment.</p><p class="scene05-cta-copy">Key insights, Builder next steps, and live enrollment await.</p></section></div></div></section>`)
  },
  renderForeground(context) { return sceneMarkup(`<section class="scene-foreground scene05-foreground">${renderTicker(context.ticker.scene05, 'local')}</section>`) },
  render(context) { return <>{this.renderUnderlay(context)}{this.renderForeground(context)}</> },
}

function resolveAgendaItems(context) {
  const titles = (context.allSlides ?? []).slice(0, 10).map((item) => item.title).filter(Boolean)
  return titles.length >= 6 ? titles : (context.slide.agenda ?? []).map((item) => item.title || item.label).filter(Boolean)
}
