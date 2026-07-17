import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'LOOPLINK & LOOPCODE ACTIVATION', subtitle: 'Your personal participation tools.', layout: 'tools', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('LoopLink', 'https://bemahub.com/join/joyceroot', 'signal', 'COPY · SHARE', 'blue', 'copy-link'),
      card('LoopCode', 'JOYCE-7249', 'qr', 'PERSONAL CODE', 'purple', 'reveal-code'),
      card('Live Loop Activity', 'Alex joined via LoopLink · Taylor joined via LoopCode · Jamie joined via LoopLink', 'people', '12 JOINED', 'cyan', 'activity-update'),
    ],
    callout: 'When someone joins using your LoopLink or LoopCode, they are connected to your Loop Activity.',
    footer: [['link', 'LoopLink'], ['qr', 'LoopCode'], ['shield', 'Share Responsibly'], ['chart', 'Loop Activity']],
  }
export const scene21 = {
  presenterZone: 'left',
  renderUnderlay() {
    const activity = ['Alex joined via LoopLink', 'Taylor joined via LoopCode', 'Jamie joined via LoopLink', 'Morgan activated a code']
    const body = `<div class="reference-tools-layout h-full"><section>${config.items.slice(0, 2).map((item, index) => `<article class="tool-card tone-${item.tone} rounded-panel border border-sky-200/70 bg-white/95 shadow-card" data-control-cue="${item.cue}"><header>${icon(item.icon)}<div><small>PERSONAL TOOL</small><h3>${item.title}</h3></div><strong>ACTIVE</strong></header><div class="tool-value"><code>${item.copy}</code><button>${index ? 'Reveal code' : 'Copy link'}</button></div><footer><span>${item.value}</span><i></i><span>Ready to share</span></footer></article>`).join('')}</section><aside class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><header>${icon('people')}<div><small>LIVE</small><h3>Loop Activity</h3></div><strong>12 JOINED</strong></header>${activity.map((text, index) => `<article><b>${['A', 'T', 'J', 'M'][index]}</b><span>${text}<small>${index + 1} min ago</small></span><i>✓</i></article>`).join('')}</aside></div>`
    return renderLayeredUnderlay('21', config, body)
  },
  renderForeground() { return renderLayeredForeground('21', config) },
}
