import { card, icon, renderLayeredForeground, renderLayeredUnderlay, renderQrCard } from './layeredSceneShared.jsx'

const config = {
    title: 'ENROLLMENT PROGRESS', subtitle: 'Real-time movement as viewers take action.', layout: 'dashboard', utility: true, qr: true,
    items: [
      card('Scans', 'Viewers opening enrollment', 'qr', '248', 'blue', 'advance-counts'),
      card('LoopLinks Activated', 'Personal tools now active', 'signal', '119', 'cyan', 'advance-counts'),
      card('New Builders', 'Community growth today', 'people', '76', 'purple', 'advance-counts'),
      card('Questions Answered', 'Live support completed', 'heart', '32', 'blue', 'advance-counts'),
      card('Overall Progress', 'Enrollment movement in real time', 'chart', '68%', 'cyan', 'advance-progress'),
      card('Live Activity Feed', 'Amina joined · Samuel activated LoopLink · Joyce chose VIP', 'signal', 'JUST NOW', 'purple', 'activity-update'),
    ],
    footer: [['signal', 'You Are Watching Live'], ['people', 'Live Chat Active'], ['heart', 'Like & Share']],
  }
export const scene37 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="enrollment-progress-layout h-full"><section class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><div class="live-metric-grid">${config.items.slice(0, 4).map((item) => `<article>${icon(item.icon)}<strong>${item.value}</strong><span>${item.title}</span><small>${item.copy}</small></article>`).join('')}</div><div class="overall-progress"><header><div><small>OVERALL PROGRESS</small><h3>Enrollment movement</h3></div><strong>68%</strong></header><div><span></span></div><footer><span>0</span><span>Today’s goal: 350</span></footer></div><div class="live-feed"><header><span>● LIVE ACTIVITY</span><strong>JUST NOW</strong></header>${['Amina joined as a Builder', 'Samuel activated LoopLink', 'Joyce chose VIP Access'].map((copy, index) => `<article><b>${['A', 'S', 'J'][index]}</b><span>${copy}<small>${index + 1} min ago</small></span><i>✓</i></article>`).join('')}</div></section>${renderQrCard('Scan to enroll')}</div>`
    return renderLayeredUnderlay('37', config, body)
  },
  renderForeground() { return renderLayeredForeground('37', config) },
}
