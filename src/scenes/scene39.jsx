import { card, icon, renderLayeredForeground, renderLayeredUnderlay, renderQrCard } from './layeredSceneShared.jsx'

const config = {
    title: 'THE LOOP CONTINUES.', subtitle: 'Keep creating. Keep connecting. Keep moving value forward.', layout: 'cta', utility: true, qr: true,
    items: [
      card('Visit Your Dashboard', 'Track your activity and continue your journey.', 'chart', 'OPEN', 'blue', 'dashboard-cta'),
      card('Share Your LoopLink', 'Help creative value reach more people.', 'signal', 'SHARE', 'purple', 'looplink-cta'),
      card('Join the Community Chat', 'Stay connected after the live session.', 'people', 'JOIN', 'cyan', 'community-cta'),
    ],
    callout: 'Thank you for joining Bema Hub Open Enrollment 2026.',
    footer: [['heart', 'Thank You for Being Part of the Loop'], ['signal', 'Create Connections'], ['music', 'Share Value'], ['people', 'Move Forward']],
  }
export const scene39 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="reference-cta-layout h-full"><aside>${renderQrCard('Stay connected')}</aside><section class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><small>THANK YOU FOR JOINING</small><h3>The loop continues.</h3><div class="cta-option-grid">${config.items.map((item) => `<article class="rounded-2xl border border-sky-200/70 bg-white shadow-sm" data-control-cue="${item.cue}"><span>${icon(item.icon)}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><button>${item.value}</button></article>`).join('')}</div><footer><span>Secure enrollment</span><span>Instant access</span><span>Community support</span></footer></section></div>`
    return renderLayeredUnderlay('39', config, body)
  },
  renderForeground() { return renderLayeredForeground('39', config) },
}
