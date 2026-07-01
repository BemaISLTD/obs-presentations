import { renderTicker } from '../components/ticker.js'

export const scene03 = {
  render(context) {
    const presenterClass = context.presenterLayout === 'overlay'
      ? 'presenter-frame presenter-frame-overlay'
      : 'presenter-frame presenter-frame-boxed'

    return `
      <section class="scene scene03">
        <div class="scene-hero">
          <div class="scene-title">
            <p class="eyebrow">Host Standby Camera</p>
            <h2 class="stage-title">Presenter framing is switchable for OBS-ready handoff.</h2>
            <p class="stage-subtitle">Use <strong>?presenter=boxed</strong> for framed talent or <strong>?presenter=overlay</strong> for full camera underlay.</p>
          </div>
          <div class="presenter-options">
            <span class="pill-label chip">Presenter: ${context.presenterLayout}</span>
            <span class="pill-label chip">Loop Activity Monitor</span>
            <span class="pill-label chip">Recognized Impact Cues</span>
          </div>
        </div>

        <div class="scene03-layout">
          <div class="camera-stage">
            <div class="${presenterClass}"></div>
          </div>

          <aside class="side-column">
            <section class="bema-card glass-card camera-copy">
              <p class="eyebrow">Presenter Layout Mode</p>
              <h3>OBS camera overlay or boxed presenter frame</h3>
              <p class="muted">This scene keeps the approved standby composition while letting production choose how the presenter feed sits over the coded layout.</p>
              <div class="camera-badges">
                <span class="pill-label tag">Boxed Presenter</span>
                <span class="pill-label tag">OBS Overlay</span>
                <span class="pill-label tag">Lower Ticker Safe Zone</span>
              </div>
            </section>
            <section class="bema-card glass-card camera-copy">
              <p class="eyebrow">Production Notes</p>
              <ul>
                <li>Keep talent eyeline inside the upper-right safe area.</li>
                <li>Use overlay mode to align spacing against the approved storyboard PNG.</li>
                <li>Route the lower ticker beneath any live captions in OBS.</li>
              </ul>
            </section>
          </aside>
        </div>

        ${renderTicker(context.ticker.scene03, 'local')}
      </section>
    `
  },
}