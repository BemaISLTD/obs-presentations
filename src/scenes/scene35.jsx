import { card, renderFeatureCards, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'THANK YOU & NEXT STEPS', subtitle: 'Stay connected and keep moving with Bema Hub.', layout: 'cards', columns: 2,
    items: [
      card('Check Your Email', 'Access details and resources are waiting in your inbox.', 'signal', '01', 'blue', 'step-email'),
      card('Join the Chat', 'Stay in the conversation and keep the momentum going.', 'people', '02', 'cyan', 'step-chat'),
      card('Explore Your Dashboard', 'Log in, explore programs, and personalize your experience.', 'chart', '03', 'purple', 'step-dashboard'),
      card('Share Your LoopLink', 'Invite others and build something meaningful together.', 'heart', '04', 'blue', 'step-looplink'),
    ],
    callout: 'Together, we create. Together, we grow.',
    footer: [['heart', 'Thank You'], ['signal', 'Next Steps'], ['chart', 'Explore Your Dashboard'], ['people', 'Stay Connected']],
  }
export const scene35 = {
  presenterZone: 'left',
  renderUnderlay() { return renderLayeredUnderlay('35', config, renderFeatureCards('35', config)) },
  renderForeground() { return renderLayeredForeground('35', config) },
}
