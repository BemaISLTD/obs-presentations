import { card, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'FREQUENTLY ASKED QUESTIONS', subtitle: 'Clear answers before you choose your next step.', layout: 'faq',
    items: [
      card('What are the Access Levels?', 'They determine what you receive, not your Recognized Impact rate.', 'people', '01', 'blue', 'faq-1'),
      card('What do I receive?', 'Each level unlocks creator assets, experiences, and opportunities.', 'heart', '02', 'cyan', 'faq-2'),
      card('What is LoopLink?', 'Your personal sharing link that connects activity and invites.', 'signal', '03', 'purple', 'faq-3'),
      card('What are Qualified LoopLocks?', 'Verified participation that meets campaign rules.', 'lock', '04', 'blue', 'faq-4'),
      card('How is Recognized Impact measured?', 'Through qualifying actions, history, and verified contributions.', 'chart', '05', 'cyan', 'faq-5'),
    ],
    footer: [['signal', 'FAQ'], ['heart', 'Clear Answers'], ['people', 'Participation Questions']],
  }
export const scene33 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="faq-layout h-full"><section class="rounded-panel border border-sky-200/70 bg-white/90 text-bema-navy shadow-card backdrop-blur"><span class="faq-mark">?</span><h3>Everything you need to know.</h3><p>Clear answers before you choose your next step.</p><button>VISIT HELP CENTER</button></section><div class="faq-list">${config.items.map((item, index) => `<article class="rounded-2xl border border-sky-200/70 bg-white/95 shadow-card" data-control-cue="${item.cue}"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><b>+</b></article>`).join('')}</div></div>`
    return renderLayeredUnderlay('33', config, body)
  },
  renderForeground() { return renderLayeredForeground('33', config) },
}
