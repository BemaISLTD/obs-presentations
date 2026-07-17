import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'CAMPAIGNS PAGE WALKTHROUGH', subtitle: 'Discover creator-led campaigns.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Sound of Tomorrow', 'by NovaWave · Participation Level', 'music', 'FEATURED', 'blue', 'campaign-featured'),
      card('Stage to Spotlight', 'by Echo Collective', 'chart', 'LIVE', 'cyan', 'campaign-grid'),
      card('Move the Culture', 'by Flow Studio', 'people', 'TRENDING', 'purple', 'campaign-grid'),
      card('Loop Activity', '218 Builders joined Stage to Spotlight', 'signal', 'REAL TIME', 'blue', 'campaign-activity'),
      card('Explore Campaigns', 'Find a campaign that moves you.', 'heart', 'START', 'cyan', 'campaign-cta'),
    ],
    footer: [['target', 'Campaigns Page'], ['people', 'Participation Level'], ['star', 'Featured Campaigns'], ['chart', 'Loop Activity']],
  }
const campaigns = [['Sound of Tomorrow', 'NovaWave', 'FEATURED', '0'], ['Stage to Spotlight', 'Echo Collective', 'LIVE', '1'], ['Move the Culture', 'Flow Studio', '', '2'], ['Frame the Future', 'Visionary Lab', '', '3'], ['Beat Builders', 'Loop Makers', '', '4'], ['Bright Ideas', 'Create Forward', '', '5']]
export const scene17 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene17-campaign-browser h-full"><section class="scene17-campaigns rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><header>${icon('star')}<strong>Featured Campaigns</strong><nav><b>All</b><span>Trending</span><span>New</span><span>Ending Soon</span></nav><label>⌕　Search campaigns...</label></header><div class="scene17-card-grid">${campaigns.map(([title, creator, badge, art]) => `<article class="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"><div class="scene17-art art-${art}">${badge ? `<b>${badge}</b>` : ''}</div><h3>${title}</h3><p>by ${creator}</p><footer><span>Participation Level</span><i>${icon('people')}${icon('people')}${icon('people')}</i></footer></article>`).join('')}</div><a class="scene17-view-all">View all campaigns　→</a></section><aside class="scene17-activity rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><header>${icon('signal')}<div><h3>Loop Activity</h3><p>Real-time updates</p></div></header>${[['people', '218 Builders', 'joined Stage to Spotlight', '2m ago'], ['play', 'New Loop Activity', 'added to Beat Builders', '5m ago'], ['trophy', 'Challenge Completed', 'in Move the Culture', '12m ago'], ['user', 'New Builder', 'joined Bema Hub', '18m ago']].map(([itemIcon, title, copy, time]) => `<article>${icon(itemIcon)}<div><strong>${title}</strong><span>${copy}</span><small>${time}</small></div></article>`).join('')}<footer><strong>Ready to participate?</strong><span>Find a campaign that moves you.</span><button>Explore Campaigns</button></footer></aside></div>`
    return renderLayeredUnderlay('17', config, body)
  },
  renderForeground() { return renderLayeredForeground('17', config) },
}
