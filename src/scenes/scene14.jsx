import { icon, renderBrand, renderForegroundBar, renderLiveBadge, renderQrCard } from '../components/broadcastChrome.js'
import { sceneMarkup } from './SceneMarkup.jsx'

const LEVELS = [
  { title: 'Participation Level', icon: 'people', copy: 'Start with core campaign value.', tone: 'cyan' },
  { title: 'VIP Access', icon: 'heart', copy: 'Go deeper into the creator experience.', tone: 'blue' },
  { title: 'Signature VIP', icon: 'lock', copy: 'Unlock the deepest access and exclusive assets.', tone: 'purple' },
]

export const scene14 = {
  presenterZone: 'left',

  renderUnderlay() {
    return sceneMarkup(`
      <section class="scene proof-scene scene14 proof-enter absolute inset-0 overflow-hidden font-sans text-bema-navy">
        ${renderBrand()}${renderLiveBadge()}
        <div class="scene14-presenter-space" aria-label="Presenter camera placement"></div>
        <header class="proof-heading scene14-heading">
          <h2>♪ LIVE ENROLLMENT ♪</h2>
          <p>Choose your access level and join today.</p>
          <span class="heading-rule">♥</span>
        </header>
        <div class="access-level-grid">
          ${LEVELS.map((level, index) => `
            <article class="access-level-card tone-${level.tone} rounded-card border border-white/30 bg-white/90 shadow-card backdrop-blur-xl" style="--card-index:${index}">
              <h3>${level.title}</h3>
              ${icon(level.icon)}
              <p>${level.copy}</p>
            </article>
          `).join('')}
        </div>
        <aside class="scene14-cta">
          ${renderQrCard()}
          <div class="builder-cta">${icon('people')}<p><strong>Join as a Builder.</strong><span>Help grow impact.<br />Earn recognition.<br />Build community.</span></p></div>
        </aside>
      </section>
    `)
  },

  renderForeground() {
    return sceneMarkup(renderForegroundBar([
      { icon: 'people', label: 'Choose Your Access Level' },
      { icon: 'qr', label: 'Scan to Join' },
      { icon: 'heart', label: 'Join as a Builder' },
      { icon: 'eye', label: '<strong>128</strong> Watching Live' },
    ], 'LIVE ENROLLMENT'))
  },
}
