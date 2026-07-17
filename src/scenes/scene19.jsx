import { card, renderFeatureCards, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'CHOOSING YOUR ACCESS LEVEL', subtitle: 'Find the path that fits your campaign experience.', layout: 'cards', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Participation Level', 'Unlock core campaign value and essential participation assets to get started.', 'people', 'Start. Engage. Grow.', 'cyan', 'level-participation'),
      card('VIP Access', 'Unlock deeper creator experiences and exclusive assets for greater impact.', 'crown', 'Go Deeper. Do More.', 'purple', 'level-vip'),
      card('Signature VIP', 'Unlock the deepest access, exclusive assets, and identity-based participation.', 'diamond', 'Lead. Legacy. Elevate.', 'amber', 'level-signature'),
    ],
    footer: [['people', 'Choose Access Level'], ['people', 'Participation Level'], ['crown', 'VIP Access'], ['diamond', 'Signature VIP']],
  }
export const scene19 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('19', config, renderFeatureCards('19', config)) },
  renderForeground() { return renderLayeredForeground('19', config) },
}
