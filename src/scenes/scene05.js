import { renderTicker } from "../components/ticker.js";
import { ASSET_PATHS } from "../config/assets.js";

export const scene05 = {
  render(context) {
    const agendaItems = resolveAgendaItems(context);
    const agendaRows = agendaItems
      .map(
        (item, index) => `
          <li class="scene05-agenda-row">
            <span class="scene05-agenda-index">${String(index + 1).padStart(2, "0")}</span>
            <span class="scene05-agenda-title">${item}</span>
          </li>
        `,
      )
      .join("");

    return `
      <section class="scene scene05">
        <img class="scene-brand-wordmark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub" />
        <div class="scene-live-chip"><span></span>LIVE</div>

        <div class="scene05-layout">
          <div class="scene05-left-stage">
            <div class="scene05-presenter-shadow"></div>
            <div class="scene05-title-wrap">
              <h2>BEMA HUB<br/>OPEN ENROLLMENT</h2>
              <div class="scene05-year-row">
                <span></span>
                <strong>2026</strong>
                <span></span>
              </div>
              <p>Better Benefits. Stronger Together.</p>
            </div>
            <div class="scene05-eq-strip"></div>
          </div>

          <div class="scene05-right-stack">
            <section class="scene05-agenda-panel">
              <h3>TODAY'S AGENDA</h3>
              <ol class="scene05-agenda-list">${agendaRows}</ol>
            </section>
            <section class="scene05-cta-panel">
              <p class="scene05-cta-title">Big insights. Builder next steps. Live enrollment.</p>
              <p class="scene05-cta-copy">Key insights, Builder next steps, and live enrollment await.</p>
            </section>
          </div>
        </div>

        ${renderTicker(context.ticker.scene05, "local")}
      </section>
    `;
  },
};

function resolveAgendaItems(context) {
  const slideTitles = (context.allSlides ?? [])
    .slice(0, 10)
    .map((item) => item.title)
    .filter(Boolean);

  if (slideTitles.length >= 6) {
    return slideTitles;
  }

  return (context.slide.agenda ?? [])
    .map((item) => item.title || item.label)
    .filter(Boolean);
}
