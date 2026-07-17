import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'MY IMPACT DASHBOARD', subtitle: 'Track your Loop Activity, LoopLocks, and Recognized Impact.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Total Loop Activity', '+342 this week', 'chart', '2,486', 'blue', 'metric-activity'),
      card('Pending LoopLocks', 'Awaiting verification', 'signal', '18', 'amber', 'metric-pending'),
      card('Qualified LoopLocks', 'Verified and qualified', 'lock', '127', 'cyan', 'metric-qualified'),
      card('Recognized Impact Status', 'You are building meaningful impact. Keep going!', 'heart', 'ON TRACK', 'purple', 'metric-impact'),
      card('Builder Tier Progress', 'Silver Builder · 2,460 / 5,000 points', 'people', '49%', 'blue', 'metric-tier'),
    ],
    footer: [['chart', 'My Impact'], ['chart', 'Loop Activity'], ['lock', 'Qualified LoopLocks'], ['people', 'Builder Progress']],
  }
export const scene30 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene30-impact-board h-full"><section class="scene30-metrics">${config.items.slice(0, 3).map((item) => `<article class="rounded-2xl border border-sky-200/70 bg-white/95 shadow-card">${icon(item.icon)}<div><small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span></div></article>`).join('')}</section><section class="scene30-impact-status rounded-2xl border border-sky-200/70 bg-white/95 shadow-card">${icon('award')}<div><small>RECOGNIZED IMPACT STATUS</small><h3>On Track!</h3><p>You’re building meaningful impact.<br />Keep going!</p></div></section><section class="scene30-tier rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><div><small>BUILDER TIER PROGRESS</small><h3>Silver Builder</h3><strong>2,460 / 5,000 pts</strong><progress value="49" max="100"></progress></div>${icon('shield')}<b>49%</b></section><section class="scene30-activity rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><header><strong>RECENT ACTIVITY</strong><a>View all</a></header><div><p>${icon('link')}<span>LoopLink shared<small>10m ago</small></span></p><p>${icon('lock')}<span>LoopLock qualified<small>1h ago</small></span></p><p>${icon('star')}<span>Impact recognized<small>3h ago</small></span></p></div></section></div>`
    return renderLayeredUnderlay('30', config, body)
  },
  renderForeground() { return renderLayeredForeground('30', config) },
}
