import { card, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'CHANGEMAKERS OVERVIEW', subtitle: 'Spotlight people creating meaningful movement.', layout: 'profiles', compact: true, footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Amina Diallo', 'Youth Mentor & Creative Educator', 'people', '1.2K', 'cyan', 'changemaker-1'),
      card('Marcus Reed', 'Impact Strategist & Movement Leader', 'chart', '1.1K', 'blue', 'changemaker-2'),
      card('Jordan Miles', 'Community Builder & Social Entrepreneur', 'heart', '980', 'purple', 'changemaker-3'),
      card('Sophia Lee', 'Climate Advocate & Sustainability Leader', 'signal', '870', 'cyan', 'changemaker-4'),
      card('Tierra Vaughn', 'Creative Director & Visual Storyteller', 'music', '1.6K', 'purple', 'changemaker-5'),
      card('Darnell Brooks', 'UX Designer & Tech for Good Advocate', 'people', '1.3K', 'blue', 'changemaker-6'),
    ],
    footer: [['people', 'Changemakers'], ['heart', 'Meaningful Impact'], ['play', 'Real Stories'], ['signal', 'Community Movement']],
  }
export const scene28 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="profile-directory h-full">${config.items.map((item, index) => `<article class="profile-card rounded-panel border border-sky-200/70 bg-white/95 shadow-card" data-control-cue="${item.cue}"><div class="profile-avatar avatar-${index}">${item.title.split(' ').map((word) => word[0]).join('')}</div><section><small>CHANGEMAKER</small><h3>${item.title}</h3><p>${item.copy}</p><span>● Verified profile</span></section><footer><strong>${item.value}</strong><small>IMPACT</small><button>View story</button></footer></article>`).join('')}</div>`
    return renderLayeredUnderlay('28', config, body)
  },
  renderForeground() { return renderLayeredForeground('28', config) },
}
