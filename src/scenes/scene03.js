import { renderTicker } from "../components/ticker.js";
import { ASSET_PATHS } from "../config/assets.js";

export const scene03 = {
  render(context) {
    const presenterClass =
      context.presenterLayout === "overlay"
        ? "presenter-frame presenter-frame-overlay"
        : "presenter-frame presenter-frame-boxed";

    return `
      <section class="scene scene03">
        <img class="scene-brand-mark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub" />
        <div class="scene-live-chip"><span></span>LIVE</div>

        <div class="scene03-layout">
          <div class="camera-stage">
            <div class="scene03-monitor-card">
              <img class="scene03-monitor-wordmark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub" />
              <p class="scene03-monitor-tagline">Better Benefits.<br/>Stronger Together.</p>
              <div class="scene03-monitor-pillars">
                <span>Creative Value</span>
                <span>Builders</span>
                <span>Loop Activity</span>
                <span>Recognized Impact</span>
              </div>
            </div>
            <div class="${presenterClass}"></div>
            <div class="scene03-lower-third">
              <p class="scene03-host-kicker">HOST</p>
              <h3>Joyce Root</h3>
              <p>Community Manager, Bema Hub</p>
            </div>
          </div>
        </div>

        ${renderTicker(context.ticker.scene03, "local")}
      </section>
    `;
  },
};
