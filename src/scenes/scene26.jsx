import { card, renderAppShell, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'EVENTS PAGE WALKTHROUGH', subtitle: 'Discover live moments, gatherings, and event registration points.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Creative Futures Summit', 'May 28 · Bema Hub Virtual Stage', 'signal', 'FEATURED', 'blue', 'event-featured'),
      card('Creator Community Q&A', 'Live questions and practical answers.', 'people', 'LIVE', 'cyan', 'event-upcoming'),
      card('Loop Activity Masterclass', 'Practical tools for Builders.', 'chart', 'UPCOMING', 'purple', 'event-upcoming'),
      card('Event Categories', 'Workshops · Panels · Community · Music', 'heart', 'EXPLORE', 'blue', 'event-categories'),
      card('View Calendar', 'Save events and join from anywhere.', 'signal', 'OPEN', 'cyan', 'event-categories'),
    ],
    footer: [['calendar', 'Events Page'], ['clock', 'Upcoming Events'], ['signal', 'Join Live Moments']],
  }
export const scene26 = {
  presenterZone: 'left',
  renderUnderlay() {
    const content = `<div class="app-title-row"><div><small>UPCOMING</small><h3>Events</h3></div><button>View calendar</button></div><div class="event-feature"><div><small>FEATURED EVENT</small><h3>${config.items[0].title}</h3><p>${config.items[0].copy}</p><button>Register now</button></div><time><b>28</b>MAY</time></div><div class="event-list">${config.items.slice(1).map((item, index) => `<article><time><b>${30 + index}</b>MAY</time><div><small>${item.value}</small><h4>${item.title}</h4><p>${item.copy}</p></div><button>View details</button></article>`).join('')}</div>`
    return renderLayeredUnderlay('26', config, renderAppShell(content))
  },
  renderForeground() { return renderLayeredForeground('26', config) },
}
