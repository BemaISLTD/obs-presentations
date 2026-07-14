import { icon, renderBrand, renderForegroundBar, renderLiveBadge, renderQrCard } from '../components/broadcastChrome.js'

export const scene38 = {
  presenterZone: 'none',

  renderUnderlay() {
    const waveform = Array.from({ length: 62 }, (_, index) => {
      const height = 14 + Math.abs(Math.sin(index * 0.55)) * (index > 8 && index < 54 ? 76 : 25)
      return `<i style="height:${height}px;--wave-index:${index}"></i>`
    }).join('')

    return `
      <section class="scene proof-scene scene38 proof-enter">
        ${renderBrand({ enrollment: true })}${renderLiveBadge()}
        <div class="standby-copy"><h2>PLEASE<br />STAND BY</h2><p>We’ll be right back.</p></div>
        <div class="standby-mini-brand">${renderBrand({ enrollment: true })}</div>
        <article class="standby-panel">
          ${renderBrand()}
          <div class="standby-waveform">${waveform}</div>
          <h3>The session will continue shortly.</h3>
          <div class="standby-status-row">
            <div>${icon('audio')}<strong>AUDIO</strong><span>CONNECTED</span></div>
            <div>${icon('video')}<strong>VIDEO</strong><span>STABLE</span></div>
            <div>${icon('wifi')}<strong>CONNECTION</strong><span>STRONG</span></div>
            <div class="standby-qr">${renderQrCard('')}<p>Scan for Open Enrollment<br />resources and next steps.</p></div>
          </div>
        </article>
      </section>
    `
  },

  renderForeground() {
    return renderForegroundBar([
      { icon: 'signal', label: 'LIVE FROM BEMAHUB' },
      { icon: 'eye', label: '<strong>128</strong> WATCHING LIVE' },
    ], 'BEMA HUB OPEN ENROLLMENT')
  },
}
