import { card, renderFlow, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'LOOPLOCK CONFIRMATION', subtitle: 'How a confirmed participation is created.', layout: 'flow', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Share LoopLink or LoopCode', 'You share your personal participation tool.', 'signal', '01', 'blue', 'flow-1'),
      card('Another Person Participates', 'They click your link or enter your code.', 'people', '02', 'cyan', 'flow-2'),
      card('LoopLock Confirmed', 'Participation is verified and a LoopLock is created.', 'lock', '03', 'purple', 'flow-3'),
      card('Loop Activity Updates', 'The new LoopLock appears in real time.', 'chart', '04', 'blue', 'flow-4'),
    ],
    callout: 'A LoopLock means another person’s participation is confirmed through your LoopLink or LoopCode.',
    footer: [['lock', 'LoopLock Confirmation'], ['people', 'Participation Flow'], ['chart', 'Loop Activity']],
  }
export const scene22 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('22', config, renderFlow('22', config)) },
  renderForeground() { return renderLayeredForeground('22', config) },
}
