import { card, icon, renderLayeredForeground, renderLayeredUnderlay, renderStatus } from './layeredSceneShared.jsx'

const config = {
    title: 'LOOP ACTIVITY & RECOGNIZED IMPACT', subtitle: 'Clear status. Verified movement. Transparent results.', layout: 'status', compact: true, footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Pending LoopLock', 'Loop activity submitted and awaiting review.', 'clock', 'PENDING', 'amber', 'status-pending'),
      card('Confirmed LoopLock', 'Loop activity verified and confirmed as valid.', 'shield', 'VERIFIED', 'blue', 'status-confirmed'),
      card('Qualified LoopLock', 'LoopLock meets campaign criteria and is eligible.', 'star', 'QUALIFIED', 'cyan', 'status-qualified'),
      card('Recognized Impact Pending', 'Qualified LoopLock is under impact review.', 'hourglass', 'IN REVIEW', 'purple', 'status-impact-pending'),
      card('Recognized Impact Confirmed', 'Impact verified and confirmed per campaign rules.', 'award', 'CONFIRMED', 'blue', 'status-impact-confirmed'),
      card('Recognized Impact Released', 'Recognized Impact recorded and reflected in totals.', 'send', 'RELEASED', 'cyan', 'status-released'),
    ],
    callout: 'Qualified LoopLocks may contribute to Recognized Impact according to campaign rules.',
    footer: [['refresh', 'Loop Activity'], ['star', 'Recognized Impact'], ['shield', 'Qualified LoopLocks'], ['check', 'Status clarity']],
  }
export const scene15 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene15-status-dashboard h-full rounded-panel border border-white/50 bg-white/90 p-6 shadow-card backdrop-blur-xl">${renderStatus('15', config)}<div class="scene15-status-callout mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-bema-blue to-bema-purple px-5 py-4 text-center text-white [&_.broadcast-icon]:size-7">${icon('shield')}<strong>Qualified LoopLocks may contribute to Recognized Impact<br />according to campaign rules.</strong></div></div>`
    return renderLayeredUnderlay('15', config, body)
  },
  renderForeground() { return renderLayeredForeground('15', config) },
}
