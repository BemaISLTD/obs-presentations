import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'TRUST & TRANSPARENCY', subtitle: 'Clear rules. Verified movement. Open communication.', layout: 'cards', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Clear Campaign Rules', 'Rules are simple, fair, and always visible.', 'scale', '', 'cyan', 'trust-rules'),
      card('Verification Windows', 'Activities are verified during posted windows.', 'calendar', '', 'blue', 'trust-windows'),
      card('Creator Proof Matters', 'Verifiable actions ensure real impact.', 'shield', '', 'purple', 'trust-proof'),
      card('Disclosure Reminders', 'Be transparent. Give credit. Follow guidelines.', 'megaphone', '', 'cyan', 'trust-disclosure'),
      card('Questions Are Welcome', 'We’re here to listen and keep it open.', 'question', '', 'purple', 'trust-questions'),
    ],
    footer: [['shield', 'Trust & Transparency'], ['document', 'Campaign Rules'], ['calendar', 'Verification'], ['question', 'Questions Welcome']],
  }
export const scene25 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene25-trust-panel h-full"><section class="scene25-checklist">${config.items.map((item) => `<article class="rounded-2xl border border-blue-400/30 bg-bema-deep-navy text-white shadow-card" data-control-cue="${item.cue}">${icon(item.icon)}<div><h3>${item.title}</h3><p>${item.copy}</p></div><b>✓</b></article>`).join('')}</section><aside class="rounded-panel border border-blue-400/30 bg-bema-deep-navy text-white shadow-card"><h3>PROOF &amp; VERIFICATION</h3><article>${icon('shield')}<div><strong>Verified by <em>LoopLock</em></strong><p>Secure and trusted verification.</p></div></article><article>${icon('document')}<div><strong>Audited Activity <em>Logs</em></strong><p>Transparent tracking from start to finish.</p></div></article><article>${icon('people')}<div><strong><em>Community Accountability</em></strong><p>Together we build trust and impact.</p></div></article></aside></div>`
    return renderLayeredUnderlay('25', config, body)
  },
  renderForeground() { return renderLayeredForeground('25', config) },
}
