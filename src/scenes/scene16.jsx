import { card, icon, renderBrand, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'BEMA HUB HOME DASHBOARD', subtitle: 'Where activity begins.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Active Campaigns', '● Live now', 'send', '18', 'cyan', 'dashboard-today'),
      card('Changemakers', '↑ 1186 today', 'people', '2,845', 'purple', 'dashboard-today'),
      card('Engagement', '↑ 8% this week', 'heart', '12.6K', 'purple', 'dashboard-today'),
      card('Growth', '↑ vs last week', 'chart', '24%', 'blue', 'dashboard-today'),
      card('Featured Campaigns', 'Music for Change · Creativity for Good · Community Builders', 'music', 'VIEW ALL', 'cyan', 'dashboard-campaigns'),
    ],
    footer: [['chart', 'Home Dashboard'], ['megaphone', 'Active Campaigns'], ['calendar', 'Upcoming Events'], ['star', 'Featured Campaigns']],
  }
export const scene16 = {
  presenterZone: 'left',
  renderUnderlay() {
    const metrics = config.items.slice(0, 4)
    const events = [['22', 'Open Enrollment Kickoff LIVE', '12:00 PM ET'], ['24', 'Creator Community Q&A', '3:00 PM ET'], ['27', 'Loop Activity Masterclass', '1:00 PM ET']]
    const campaigns = [['Music for Change', 'Amplify voices. Inspire change.', '72%'], ['Creativity for Good', 'Create. Connect. Contribute.', '58%'], ['Community Builders', 'Stronger communities. Together.', '64%']]
    const body = `<div class="scene16-home-layout h-full"><aside class="scene16-home-points">${[['people', 'See what’s live.<br />Join what matters.'], ['star', 'Discover campaigns.<br />Make an impact.'], ['chart', 'Track activity.<br />Fuel growth together.']].map(([itemIcon, copy]) => `<p>${icon(itemIcon)}<span>${copy}</span></p>`).join('')}</aside><div class="scene16-dashboard overflow-hidden rounded-panel border border-sky-200/70 bg-white shadow-card"><header><span class="scene16-app-brand">${renderBrand()}</span><nav>Home　 Campaigns　 Loop Activity　 My Impact</nav><b>⌕　♧　 JR</b></header><main><div class="scene16-welcome"><div><h3>Welcome back, Joyce! 👋</h3><p>Here’s what’s happening on Bema Hub today.</p></div><button>My Dashboard　→</button></div><strong class="scene16-section-label">TODAY ON BEMA HUB</strong><div class="scene16-metrics">${metrics.map((item) => `<article class="rounded-2xl border border-sky-100 bg-white shadow-sm">${icon(item.icon)}<small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span><a>View details　→</a></article>`).join('')}</div><div class="scene16-lower-grid"><section><header><strong>UPCOMING EVENTS</strong><a>View calendar →</a></header>${events.map(([day, title, time]) => `<article><time><small>MAY</small><b>${day}</b></time><div><strong>${title}</strong><span>${time}</span></div><em>${day === '22' ? 'LIVE' : 'RSVP'}</em></article>`).join('')}</section><section><header><strong>FEATURED CAMPAIGNS</strong><a>View all →</a></header>${campaigns.map(([title, copy, value], index) => `<article><i class="scene16-campaign-art art-${index}"></i><div><strong>${title}</strong><span>${copy}</span><progress value="${value.slice(0, -1)}" max="100"></progress></div><b>${value}</b></article>`).join('')}</section></div></main></div></div>`
    return renderLayeredUnderlay('16', config, body)
  },
  renderForeground() { return renderLayeredForeground('16', config) },
}
