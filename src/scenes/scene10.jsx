import { card, renderFlow, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'PARTICIPATION JOURNEY', subtitle: 'How a Builder moves through the experience.', layout: 'flow', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Choose Access Level', 'Select the campaign experience that fits.', 'access', '1', 'blue', 'journey-1'),
      card('Receive Participation Assets', 'Unlock creator value and experiences.', 'download', '2', 'blue', 'journey-2'),
      card('Activate LoopLink or LoopCode', 'Use your personal participation tools.', 'link', '3', 'blue', 'journey-3'),
      card('Another Person Participates', 'A confirmed participation creates a LoopLock.', 'people', '4', 'purple', 'journey-4'),
      card('Loop Activity Grows', 'Your verified movement becomes visible.', 'chart', '5', 'purple', 'journey-5'),
    ],
    callout: 'Each confirmed participation through your LoopLink or LoopCode becomes a LoopLock.',
    footer: [['access', 'Participation Journey'], ['crown', 'Choose Access Level'], ['link', 'LoopLink'], ['chart', 'Loop Activity']],
  }
export const scene10 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('10', config, renderFlow('10', config)) },
  renderForeground() { return renderLayeredForeground('10', config) },
}
