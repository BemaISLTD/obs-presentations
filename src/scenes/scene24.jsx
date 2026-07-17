import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'RECOGNIZED IMPACT EXPLAINED', subtitle: 'Acknowledging real value created through verified movement.', layout: 'stack', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Acknowledges Real Value', 'Recognized Impact acknowledges value created through verified Loop Activity.', 'heart', '01', 'cyan', 'point-value'),
      card('Based on Qualifying LoopLocks', 'It is based on LoopLocks that meet campaign rules and eligibility criteria.', 'lock', '02', 'blue', 'point-qualified'),
      card('Verified and Released', 'Recognized Impact is subject to verification and release processes to maintain integrity and transparency.', 'document', '03', 'purple', 'point-verified'),
    ],
    footer: [['heart', 'Recognized Impact'], ['signal', 'Verification'], ['lock', 'Qualifying LoopLocks']],
  }
export const scene24 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="impact-explainer h-full"><section class="rounded-panel border border-sky-200/70 bg-white/90 text-bema-navy shadow-card backdrop-blur"><small>RECOGNIZED</small><strong>IMPACT</strong><span>EXPLAINED</span><div class="impact-orbit">${icon('heart')}<i></i><i></i></div><p>Acknowledging real value<br />created through verified movement.</p></section><div class="impact-points">${config.items.map((item) => `<article class="rounded-2xl border border-sky-200/70 bg-white/95 shadow-card" data-control-cue="${item.cue}"><strong>${item.value}</strong><span>${icon(item.icon)}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div></article>`).join('')}</div></div>`
    return renderLayeredUnderlay('24', config, body)
  },
  renderForeground() { return renderLayeredForeground('24', config) },
}
