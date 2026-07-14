import { renderTicker } from '../components/ticker.js'

export const scene02 = {
  presenterZone: 'none',

  renderUnderlay() {
    const equalizer = Array.from({ length: 28 }, (_, index) => {
      const height = 32 + (index % 7) * 16
      const delay = (index % 9) * 0.12
      return `<span class="eq-bar" style="height: ${height}px; animation-delay: ${delay}s"></span>`
    }).join('')

    const waveform = Array.from({ length: 54 }, (_, index) => {
      const height = 20 + Math.abs(26 - index) * 1.4
      const delay = (index % 11) * 0.08
      return `<span class="wave-bar" style="height: ${Math.max(18, 96 - height)}px; animation-delay: ${delay}s"></span>`
    }).join('')

    const particles = createParticles(18)

    return `
      <section class="scene scene02">
        <div class="particle-layer particle-field">${particles}</div>
        <div class="bema-card glass-card visualizer-shell soft-glow wave-layer">
          <div class="scene02-copy">
            <p class="eyebrow">Welcome Music Visualizer</p>
            <h2 class="stage-title">Creative Value is entering the room.</h2>
            <p class="stage-subtitle muted">Waveform, equalizer bars, particles, and center logo pulse are all live HTML elements.</p>
          </div>
          <div class="waveform" aria-hidden="true">${waveform}</div>
          <div class="logo-pulse">
            <div class="logo-mark">BC</div>
          </div>
          <div class="equalizer" aria-hidden="true">${equalizer}</div>
        </div>
      </section>
    `
  },

  renderForeground(context) {
    return `<section class="scene-foreground scene02-foreground">${renderTicker(context.ticker.scene02, 'local')}</section>`
  },

  render(context) {
    return `${this.renderUnderlay(context)}${this.renderForeground(context)}`
  },
}

function createParticles(total) {
  return Array.from({ length: total }, (_, index) => {
    const left = 6 + (index * 5.1) % 88
    const delay = (index % 7) * 0.8
    const duration = 7 + (index % 5)
    const size = 6 + (index % 4) * 2
    return `<span class="particle" style="left: ${left}%; bottom: -24px; width: ${size}px; height: ${size}px; animation-delay: ${delay}s; animation-duration: ${duration}s"></span>`
  }).join('')
}
