import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'BUILDER PROGRESS TRACKER', subtitle: 'See your path across Community Builder Tiers.', layout: 'progress', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Builder', '1 LoopLock completed', 'people', '0%', 'cyan', 'current-tier'),
      card('Advocate', '3 LoopLocks completed', 'signal', '25%', 'blue', 'advance-progress'),
      card('Champion', '7 LoopLocks completed', 'chart', '50%', 'purple', 'advance-progress'),
      card('Partner', '15 LoopLocks in progress', 'heart', '75%', 'blue', 'current-tier'),
      card('Partner Elite', '30 LoopLocks next target', 'lock', '100%', 'purple', 'next-target'),
    ],
    callout: 'Next target: 15 LoopLocks to reach Partner.',
    footer: [['people', 'Builder Progress'], ['chart', 'LoopLock Milestones'], ['lock', 'Next Target']],
  }
export const scene31 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene31-progress-board h-full rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><section class="scene31-tiers">${config.items.map((item, index) => `<article class="${index === 2 ? 'current' : ''}">${icon(item.icon)}<strong>${item.title}</strong></article>`).join('')}</section><section class="scene31-progress"><header><strong>YOUR PROGRESS</strong><b>CURRENT POSITION</b></header><div><span></span></div><footer><i>0%</i><i>25%</i><i>50%</i><i>75%</i><i>100%</i></footer></section><section class="scene31-milestones"><h3>LOOPLOCK MILESTONES</h3><div>${[['1', 'Completed'], ['3', 'Completed'], ['7', 'Completed'], ['15', 'In Progress'], ['30', 'Next Target']].map(([value, status], index) => `<article>${icon(index < 3 ? 'link' : 'lock')}<strong>${value} LoopLock${value === '1' ? '' : 's'}</strong><span>${status}</span></article>`).join('')}<aside><small>NEXT TARGET</small><strong>15</strong><span>LoopLocks<br />to reach Partner</span></aside></div></section></div>`
    return renderLayeredUnderlay('31', config, body)
  },
  renderForeground() { return renderLayeredForeground('31', config) },
}
