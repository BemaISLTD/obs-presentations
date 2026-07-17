import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'PARTICIPATION ASSETS DELIVERED', subtitle: 'What you receive inside the campaign experience.', layout: 'list', darkPanel: true, footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Music Access', 'Exclusive tracks, stems, and behind-the-scenes audio.', 'music', '✓', 'blue', 'asset-music'),
      card('Exclusive Content', 'Unreleased videos, early drops, and creator stories.', 'video', '✓', 'purple', 'asset-content'),
      card('Creator Updates', 'Direct updates and announcements from the creator.', 'people', '✓', 'cyan', 'asset-updates'),
      card('Event Access', 'Live sessions, AMAs, rehearsals, and special events.', 'signal', '✓', 'purple', 'asset-events'),
      card('Community Experience', 'Connect, collaborate, and grow with fellow supporters.', 'people', '✓', 'cyan', 'asset-community'),
    ],
    callout: 'You participate. You unlock. You get real creative value.',
    footer: [['people', 'Participation Assets'], ['music', 'Music Access'], ['video', 'Exclusive Content'], ['people', 'Creator Updates']],
  }
export const scene20 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="reference-assets-panel h-full overflow-hidden rounded-panel border border-indigo-300/30 bg-bema-deep-navy/95 text-white shadow-card"><header><span>${icon('lock')}</span><div><small>YOUR PARTICIPATION PACKAGE</small><h3>Participation Assets Delivered</h3></div><strong>5 / 5 UNLOCKED</strong></header><div class="asset-list">${config.items.map((item, index) => `<article class="border-white/10 bg-white/5" data-control-cue="${item.cue}"><span>${icon(item.icon)}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><small>${index === 0 ? 'READY TO PLAY' : index === 3 ? 'VIEW SCHEDULE' : 'OPEN ASSET'}</small><b>✓</b></article>`).join('')}</div></div>`
    return renderLayeredUnderlay('20', config, body)
  },
  renderForeground() { return renderLayeredForeground('20', config) },
}
