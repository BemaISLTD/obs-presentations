import { renderTicker } from '../components/ticker.js'

export const scene05 = {
  render(context) {
    const cards = context.slide.agenda
      .map(
        (item, index) => `
          <article class="bema-card glass-card agenda-card soft-glow">
            <span class="agenda-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <p class="eyebrow">${item.label}</p>
              <strong>${item.title}</strong>
              <p class="muted">${item.copy}</p>
            </div>
          </article>
        `,
      )
      .join('')

    return `
      <section class="scene scene05">
        <div class="scene-hero">
          <div class="scene-title">
            <p class="eyebrow">Host Welcome And Agenda</p>
            <h2 class="stage-title">Set the room, frame the value, then move into the build.</h2>
            <p class="stage-subtitle">The opening agenda cards stay editable in JSON while the visual system remains consistent with the approved storyboard reference.</p>
          </div>
          <div class="mission-stack">
            <span class="pill-label tag">Builder-first language</span>
            <span class="pill-label tag">LoopLink moments</span>
            <span class="pill-label tag">Participation Assets</span>
          </div>
        </div>

        <div class="scene05-layout">
          <div class="agenda-grid">${cards}</div>

          <aside class="side-column">
            <section class="bema-card glass-card" style="padding: 22px; display: grid; gap: 14px;">
              <p class="eyebrow">Host Notes</p>
              <h3>Anchor the conversation around Mutual Exchange.</h3>
              <p class="muted">Use this side column for production prompts, guest name overrides, or agenda emphasis while preserving the locked visual scaffold.</p>
            </section>
            <section class="bema-card glass-card" style="padding: 22px; display: grid; gap: 12px;">
              <p class="eyebrow">Bema CORE Vocabulary</p>
              <div class="scene-tags">
                <span class="pill-label scene-tag">Builder</span>
                <span class="pill-label scene-tag">Participant</span>
                <span class="pill-label scene-tag">LoopLock</span>
                <span class="pill-label scene-tag">Recognized Impact</span>
                <span class="pill-label scene-tag">Creative Value</span>
              </div>
            </section>
          </aside>
        </div>

        ${renderTicker(context.ticker.scene05, 'local')}
      </section>
    `
  },
}