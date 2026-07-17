import { card, renderAccessLadder, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'ACCESS LEVELS', subtitle: 'The vertical climb within the campaign.', layout: 'stack', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Participation Level', 'Entry point into the campaign experience.', 'user', '01', 'cyan', 'level-participation'),
      card('VIP Access', 'Deeper creator assets and a more connected experience.', 'star', '02', 'purple', 'level-vip'),
      card('Signature VIP', 'Deepest access, exclusive assets, and identity-based participation.', 'crown', '03', 'amber', 'level-signature'),
    ],
    callout: 'Access Levels determine what you receive, not your Recognized Impact rate.',
    footer: [['people', 'ACCESS LEVELS'], ['people', 'Participation Level'], ['star', 'VIP Access'], ['crown', 'Signature VIP'], ['signal', 'Choose your path']],
  }
export const scene12 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('12', config, renderAccessLadder(config)) },
  renderForeground() { return renderLayeredForeground('12', config) },
}
