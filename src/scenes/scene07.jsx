import { card, renderFeatureCards, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'WHAT IS BEMA CORE?', subtitle: 'Community of Rewarded Engagement.', layout: 'cards', footerLead: 'BEMA CORE', footerLeadIcon: 'heart', audience: '128',
    items: [
      card('Mutual Exchange', 'Participants access real creative value.', 'refresh', '', 'cyan', 'pillar-exchange'),
      card('Builders in Action', 'Builders help that value reach more people.', 'people', '', 'blue', 'pillar-builders'),
      card('Sustainable Creative Economy', 'Creators gain a stronger path to keep creating.', 'sprout', '', 'purple', 'pillar-economy'),
    ],
    callout: 'Clear value. Meaningful participation. Real movement.',
    footer: [['heart', 'Mutual Exchange'], ['people', 'Builders in Action'], ['music', 'Creative value in motion']],
  }
export const scene07 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('07', config, renderFeatureCards('07', config)) },
  renderForeground() { return renderLayeredForeground('07', config) },
}
