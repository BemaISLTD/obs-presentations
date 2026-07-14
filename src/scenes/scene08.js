import { icon, renderBrand, renderForegroundBar, renderLiveBadge } from '../components/broadcastChrome.js'

const STATS = [
  { cue: 'highlight-active-campaigns', icon: 'chart', value: '39', label: 'Active Campaigns', detail: 'Campaigns live and making impact', tone: 'blue' },
  { cue: 'highlight-changemakers', icon: 'people', value: '10', label: 'Changemakers', detail: 'Leaders driving real change', tone: 'cyan' },
  { cue: 'highlight-builders', icon: 'people', value: '12,450+', label: 'Builders Active', detail: 'Community builders in action', tone: 'purple' },
  { cue: 'highlight-countries', icon: 'signal', value: '37', label: 'Countries Reached', detail: 'Global reach, local impact', tone: 'blue' },
  { cue: 'highlight-looplocks', icon: 'lock', value: '3,420', label: 'Qualified LoopLocks', detail: 'Trusted connections created', tone: 'cyan' },
  { cue: 'highlight-impact', icon: 'heart', value: 'Recognized Impact', label: 'Tracking Live', detail: 'Impact verified and updated in real time', tone: 'purple' },
]

export const scene08 = {
  presenterZone: 'inset',

  renderUnderlay(context) {
    const insetSide = context.presenterInset === 'right' ? 'right' : 'left'

    return `
      <section class="scene proof-scene scene08 proof-enter presenter-inset-${insetSide}">
        ${renderBrand()}${renderLiveBadge()}
        <header class="proof-heading scene08-heading">
          <h2>IMPACT STATISTICS</h2>
          <p>Real movement across the <strong>Bema Hub</strong> ecosystem.</p>
        </header>
        <div class="scene08-presenter-space" aria-label="Configurable presenter inset placement"></div>
        <div class="scene08-stat-grid">
          ${STATS.map((stat, index) => `
            <article class="impact-card tone-${stat.tone}" data-control-cue="${stat.cue}" style="--card-index:${index}">
              ${icon(stat.icon)}
              <strong class="impact-value">${stat.value}</strong>
              <h3>${stat.label}</h3>
              <p>${stat.detail}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `
  },

  renderForeground(context) {
    const insetSide = context.presenterInset === 'right' ? 'right' : 'left'

    return `
      <section class="scene-foreground scene08-foreground presenter-inset-${insetSide}">
        <div class="presenter-inset-frame" aria-hidden="true"><span>PRESENTER</span></div>
        ${renderForegroundBar([
          { icon: 'chart', label: 'Impact Statistics' },
          { icon: 'people', label: '<strong>12,450+</strong> Builders Active' },
          { icon: 'lock', label: '<strong>3,420</strong> Qualified LoopLocks' },
          { icon: 'music', label: 'Creative value in motion' },
          { icon: 'eye', label: '<strong>128</strong> Watching Live' },
        ])}
      </section>
    `
  },
}
