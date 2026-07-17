import { card, renderFeatureCards, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'WHAT IS BEMA HUB?', subtitle: 'A creative economy platform built on mutual exchange.', layout: 'cards', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Professional Creators', 'Bring original creative value, experiences, and ideas to Bema Hub.', 'creator', '', 'blue', 'highlight-creators'),
      card('Participation Assets', 'Access creative value through LoopCode, Loop Activity, and VIP experiences.', 'play', '', 'cyan', 'highlight-assets'),
      card('Builders Help Value Move', 'Builders extend reach with LoopLink and LoopLock through the community.', 'people', '', 'purple', 'highlight-builders'),
    ],
    callout: 'Creators bring real value. Builders help it reach more people.',
    footer: [['signal', 'What is Bema Hub'], ['music', 'Creative value in motion'], ['people', 'Community of Rewarded Engagement']],
  }

export const scene06 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene06-definition-panel h-full rounded-panel border border-white/50 bg-white/90 p-5 shadow-card backdrop-blur-xl">${renderFeatureCards('06', config)}<div class="scene06-definition-callout mt-4 rounded-2xl bg-bema-navy px-6 py-4 text-center text-lg text-white"><strong>Creators</strong> bring real value. <strong>Builders</strong> help it reach more people.</div></div>`
    return renderLayeredUnderlay('06', config, body)
  },
  renderForeground() { return renderLayeredForeground('06', config) },
}
