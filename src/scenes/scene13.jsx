import { card, renderLayeredForeground, renderLayeredUnderlay, renderTierTrack } from './layeredSceneShared.jsx'

const config = {
    title: 'COMMUNITY BUILDER TIERS', subtitle: 'The horizontal spread of Loop Activity.', layout: 'flow', compact: true, footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Builder', 'First active step.', 'thumb', '01', 'cyan', 'tier-builder'),
      card('Advocate', 'Intentional sharing and trust.', 'people', '02', 'blue', 'tier-advocate'),
      card('Champion', 'Stronger campaign movement.', 'trophy', '03', 'purple', 'tier-champion'),
      card('Partner', 'Meaningful reach and deeper alignment.', 'handshake', '04', 'blue', 'tier-partner'),
      card('Partner Elite', 'Highest Community Builder Tier.', 'crown', '05', 'amber', 'tier-elite'),
    ],
    callout: 'Community Builder Tiers are earned through Loop Activity and qualifying LoopLocks. They are not purchased.',
    footer: [['people', 'COMMUNITY BUILDER TIERS'], ['thumb', 'Builder'], ['chart', 'Loop Activity'], ['lock', 'Qualifying LoopLocks']],
  }
export const scene13 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('13', config, renderTierTrack(config)) },
  renderForeground() { return renderLayeredForeground('13', config) },
}
