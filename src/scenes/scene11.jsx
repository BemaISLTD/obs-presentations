import { card, renderFlow, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'ECHOLOOP EXPLAINED', subtitle: '', layout: 'flow', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('LoopLink', 'Your personal sharing link.', 'link', '01', 'blue', 'term-looplink'),
      card('LoopCode', 'Your personal share code.', 'qr', '02', 'cyan', 'term-loopcode'),
      card('LoopLock', 'A confirmed participation triggered when another person joins through your LoopLink or LoopCode.', 'lock', '03', 'purple', 'term-looplock'),
      card('Loop Activity', 'Where your movement and impact are tracked.', 'chart', '04', 'purple', 'term-activity'),
    ],
    callout: 'Qualifying LoopLocks may contribute to Recognized Impact according to campaign rules.',
    footer: [['signal', 'EchoLoop Explained'], ['link', 'LoopLink'], ['qr', 'LoopCode'], ['lock', 'LoopLock'], ['chart', 'Loop Activity']],
  }
export const scene11 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene11-echoloop-panel h-full rounded-panel border border-white/50 bg-white/90 p-6 shadow-card backdrop-blur-xl">${renderFlow('11', config)}<div class="scene11-notes mt-5 grid gap-3"><p class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950"><span class="mr-2 font-black">i</span>Sharing alone does not create Recognized Impact.</p><p class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950"><span class="mr-2 font-black">✓</span>Qualifying LoopLocks may contribute to Recognized Impact according to campaign rules.</p></div></div>`
    return renderLayeredUnderlay('11', config, body)
  },
  renderForeground() { return renderLayeredForeground('11', config) },
}
