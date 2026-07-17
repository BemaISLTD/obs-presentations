import { icon, renderBrand, renderForegroundBar, renderLiveBadge } from '../components/broadcastChrome.js'
import { sceneMarkup } from './SceneMarkup.jsx'

export const scene03 = {
  presenterZone: 'center-left',
  renderUnderlay() {
    return sceneMarkup(`<section class="scene proof-scene scene03 proof-enter absolute inset-0 overflow-hidden font-sans text-bema-navy">${renderBrand()}${renderLiveBadge()}<div class="scene03-presenter-space" aria-label="Presenter camera placement"></div><article class="studio-display rounded-panel border border-white/30 bg-white/85 shadow-card backdrop-blur-xl">${renderBrand()}<h2>Better Benefits.<br>Stronger Together.</h2><div class="studio-values"><div>${icon('music')}<span>Creative<br>Value</span></div><div>${icon('people')}<span>Builders</span></div><div>${icon('signal')}<span>Loop<br>Activity</span></div><div>${icon('heart')}<span>Recognized<br>Impact</span></div></div></article></section>`)
  },
  renderForeground() {
    return sceneMarkup(`<section class="scene-foreground scene03-foreground"><div class="host-lower-third" data-control-cue="reveal-lower-third"><span>HOST</span><strong>Joyce Root</strong><p>Community Manager, Bema Hub</p></div>${renderForegroundBar([{ icon: 'heart', label: 'Better Benefits' }, { icon: 'signal', label: '<strong class="red-copy">Live now</strong>' }, { icon: 'people', label: 'Chat active' }, { icon: 'eye', label: '<strong>128</strong> Watching live' }], 'OPEN ENROLLMENT <em>2026</em>')}</section>`)
  },
  render(context) { return <>{this.renderUnderlay(context)}{this.renderForeground(context)}</> },
}
