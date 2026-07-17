import { card, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'LIVE Q&A', subtitle: 'Your questions are welcome.', layout: 'faq', utility: true,
    items: [
      card('How do Access Levels work?', 'Choose the campaign experience and assets that fit you.', 'people', '?', 'blue', 'question-1'),
      card('What counts as a LoopLock?', 'A confirmed participation through LoopLink or LoopCode.', 'lock', '?', 'cyan', 'question-2'),
      card('Where do I see Loop Activity?', 'Track it from your personal impact dashboard.', 'chart', '?', 'purple', 'question-3'),
      card('How do I choose a campaign?', 'Explore clear value, assets, access levels, and creator proof.', 'heart', '?', 'blue', 'question-4'),
    ],
    footer: [['signal', 'Open Enrollment Is Live'], ['lock', 'Lock Access'], ['people', 'Link & Share'], ['heart', 'Earn Impact']],
  }
export const scene36 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="faq-layout h-full"><section class="rounded-panel border border-sky-200/70 bg-white/90 text-bema-navy shadow-card backdrop-blur"><span class="faq-mark">?</span><h3>Ask us anything.</h3><p>Drop your question in the live chat and the team will answer it.</p><button>LIVE CHAT IS OPEN</button></section><div class="faq-list">${config.items.map((item, index) => `<article class="rounded-2xl border border-sky-200/70 bg-white/95 shadow-card" data-control-cue="${item.cue}"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><b>+</b></article>`).join('')}</div></div>`
    return renderLayeredUnderlay('36', config, body)
  },
  renderForeground() { return renderLayeredForeground('36', config) },
}
