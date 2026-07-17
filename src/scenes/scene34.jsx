import { card, icon, renderLayeredForeground, renderLayeredUnderlay, renderQrCard } from './layeredSceneShared.jsx'

const config = {
    title: 'FINAL ENROLLMENT CALL TO ACTION', subtitle: 'Choose your access level and join the movement today.', layout: 'cta', qr: true,
    items: [
      card('Participation Level', 'Entry point into the campaign experience.', 'people', 'JOIN NOW', 'cyan', 'level-participation'),
      card('VIP Access', 'Deeper creator assets and a connected experience.', 'heart', 'UPGRADE', 'blue', 'level-vip'),
      card('Signature VIP', 'Deepest access and exclusive assets.', 'lock', 'GO ALL IN', 'purple', 'level-signature'),
      card('Join as a Builder', 'Be part of the movement. Create value. Help more people.', 'people', 'JOIN', 'cyan', 'join-builder'),
    ],
    footer: [['signal', 'Final Enrollment'], ['qr', 'Scan to Join'], ['people', 'Choose Access Level'], ['heart', 'Join as a Builder']],
  }
export const scene34 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="reference-cta-layout h-full"><aside>${renderQrCard('Scan to Join Now')}</aside><section class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><small>ENROLLMENT IS OPEN</small><h3>Choose how you want to participate.</h3><div class="cta-option-grid">${config.items.map((item) => `<article class="rounded-2xl border border-sky-200/70 bg-white shadow-sm" data-control-cue="${item.cue}"><span>${icon(item.icon)}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><button>${item.value}</button></article>`).join('')}</div><footer><span>Secure enrollment</span><span>Instant access</span><span>Community support</span></footer></section></div>`
    return renderLayeredUnderlay('34', config, body)
  },
  renderForeground() { return renderLayeredForeground('34', config) },
}
