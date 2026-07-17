import { card, icon, renderAppShell, renderLayeredForeground, renderLayeredUnderlay, renderQrCard } from './layeredSceneShared.jsx'

const config = {
    title: 'EVENT DETAIL PAGE', subtitle: 'See the event story, schedule, and registration path.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Creative Futures Summit 2026', 'Inspire. Create. Impact.', 'signal', 'MAY 28', 'blue', 'event-hero'),
      card('Schedule', 'Opening Keynote · Builders in Action · From Idea to Impact', 'chart', '10:00–3:30', 'cyan', 'event-schedule'),
      card('What Attendees Get', 'Expert sessions · Resources · Networking · Recording access', 'heart', '4 BENEFITS', 'purple', 'event-benefits'),
      card('Register or Join', 'Free and open to all.', 'people', '128 REGISTERED', 'blue', 'event-cta'),
    ],
    footer: [['calendar', 'Event Detail'], ['clock', 'Schedule'], ['people', 'Register Now'], ['signal', 'Join Live']],
  }
export const scene27 = {
  presenterZone: 'left',
  renderUnderlay() {
    const content = `<div class="event-detail-banner"><section><small>VIRTUAL EVENT · MAY 28</small><h3>${config.items[0].title}</h3><p>${config.items[0].copy}</p><div><span>10:00 AM – 3:30 PM</span><span>Bema Hub Virtual Stage</span></div></section>${renderQrCard('Register for free')}</div><div class="event-detail-grid">${config.items.slice(1).map((item) => `<article><header>${icon(item.icon)}<h4>${item.title}</h4><strong>${item.value}</strong></header><p>${item.copy}</p><button>${item.title === 'Register or Join' ? 'Join the event' : 'View full details'}</button></article>`).join('')}</div>`
    return renderLayeredUnderlay('27', config, renderAppShell(content))
  },
  renderForeground() { return renderLayeredForeground('27', config) },
}
