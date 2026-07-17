import { card, renderLayeredForeground, renderLayeredUnderlay, renderStatus } from './layeredSceneShared.jsx'

const config = {
    title: 'QUALIFIED LOOPLOCKS', subtitle: 'Campaign rules and verification matter.', layout: 'status', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Pending LoopLock', 'Activity submitted and awaiting review.', 'clock', 'UNDER REVIEW', 'amber', 'status-pending'),
      card('Confirmed LoopLock', 'Activity verified and confirmed as valid.', 'shield', 'VERIFIED', 'blue', 'status-confirmed'),
      card('Qualified LoopLock', 'Meets campaign rules and may contribute to Recognized Impact.', 'star', 'MAY CONTRIBUTE', 'cyan', 'status-qualified'),
      card('Not Qualified', 'Does not meet rules or is outside the eligible window.', 'question', 'DOES NOT CONTRIBUTE', 'purple', 'status-not-qualified'),
    ],
    callout: 'Only Qualified LoopLocks may contribute to Recognized Impact according to campaign rules.',
    footer: [['lock', 'Qualified LoopLocks'], ['signal', 'Verification'], ['chart', 'Campaign Rules']],
  }
export const scene23 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('23', config, renderStatus('23', config)) },
  renderForeground() { return renderLayeredForeground('23', config) },
}
