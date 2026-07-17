import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'CREATOR STORIES & PROOF UPDATES', subtitle: 'Real updates. Real delivery. Real creative value.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Recent Creator Stories', 'Maya wrapped the brand anthem · Tariq is finalizing edits · Aisha delivers social assets today', 'people', '3 NEW', 'blue', 'story-1'),
      card('Recent Proof Updates', 'Campaign video draft · Social post set · Motion graphics preview', 'signal', 'LIVE', 'cyan', 'proof-update'),
      card('Delivery Status', 'Campaign Video 100% · Social Assets 85% · Influencer Clips 60%', 'chart', 'ON TRACK', 'purple', 'delivery-status'),
      card('Creator Spotlight', 'Jamal K. · Video Producer', 'music', '38 CREATORS', 'blue', 'creator-spotlight'),
      card('Progress Highlights', '92% of deliverables are on track.', 'heart', '92%', 'cyan', 'delivery-status'),
    ],
    footer: [['people', 'Creator Stories'], ['signal', 'Proof Updates'], ['chart', 'Real Delivery'], ['heart', 'Mutual Exchange']],
  }
export const scene29 = {
  presenterZone: 'left',
  renderUnderlay() {
    const stories = [['MJ', 'Maya J.', 'Wrapped up the brand anthem! On to motion graphics next.', '24'], ['TL', 'Tariq L.', 'Finalizing the campaign edits. Excited to share the final cut!', '31'], ['AR', 'Aisha R.', 'Delivering social assets today! Stay tuned for live results.', '27']]
    const body = `<div class="scene29-proof-board h-full"><section class="scene29-stories rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><h3>RECENT CREATOR STORIES</h3><div>${stories.map(([initials, name, copy, likes], index) => `<article><header><b>${initials}</b><strong>${name}</strong><small>${index * 3 + 2}h ago</small></header><p>${copy}</p><i class="proof-thumb art-${index}"></i><span>♥ ${likes}</span></article>`).join('')}</div></section><section class="scene29-updates rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><h3>RECENT PROOF UPDATES</h3>${['Campaign video draft delivered', 'Social post set v2 complete', 'Motion graphics preview', 'Influencer clips batch 1'].map((copy, index) => `<article><i class="proof-thumb art-${index}"></i><div><strong>${copy}</strong><small>${index * 2 + 2}h ago</small></div><b>✓</b></article>`).join('')}</section><section class="scene29-status rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><h3>DELIVERY STATUS</h3>${[['Campaign Video', 100, 'Delivered'], ['Social Assets', 85, 'In Review'], ['Influencer Clips', 60, 'In Progress']].map(([name, value, status]) => `<article><header><span>${name}</span><b>${value}%</b><em>${status}</em></header><progress value="${value}" max="100"></progress></article>`).join('')}</section><section class="scene29-spotlight rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><h3>CREATOR SPOTLIGHT</h3><div><b>JK</b><strong>Jamal K.<small>Video Producer</small></strong></div><p>“Bema Hub makes it easy to collaborate, share updates, and deliver real impact.”</p><span>★★★★★</span></section><section class="scene29-highlights rounded-2xl border border-sky-200/70 bg-white/95 shadow-card"><h3>PROGRESS HIGHLIGHTS</h3><p>${icon('chart')}<strong>14<small>Projects Active</small></strong></p><p>${icon('people')}<strong>38<small>Creators Engaged</small></strong></p><p>${icon('check')}<strong>92%<small>Deliverables On Track</small></strong></p></section></div>`
    return renderLayeredUnderlay('29', config, body)
  },
  renderForeground() { return renderLayeredForeground('29', config) },
}
