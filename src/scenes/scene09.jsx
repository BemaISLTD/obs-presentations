import { card, renderFeatureCards, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'PROGRAMS OVERVIEW', subtitle: 'Explore the core experiences inside Bema Hub.', layout: 'cards', columns: 2, footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Campaigns', 'Participate in creator-led experiences.', 'megaphone', '', 'blue', 'program-campaigns'),
      card('Events', 'Join live moments and community gatherings.', 'calendar', '', 'purple', 'program-events'),
      card('Changemakers', 'Discover people making meaningful impact.', 'people', '', 'cyan', 'program-changemakers'),
      card('Creator Stories', 'See real progress and proof updates.', 'play', '', 'pink', 'program-stories'),
    ],
    footer: [['chart', 'Programs Overview'], ['megaphone', 'Campaigns'], ['calendar', 'Events'], ['people', 'Changemakers'], ['play', 'Creator Stories']],
  }
export const scene09 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('09', config, renderFeatureCards('09', config)) },
  renderForeground() { return renderLayeredForeground('09', config) },
}
