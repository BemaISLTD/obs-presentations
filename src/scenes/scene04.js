import { ASSET_PATHS } from "../config/assets.js";

export const scene04 = {
  render() {
    const particles = Array.from({ length: 20 }, (_, index) => {
      const left = 5 + ((index * 4.45) % 88);
      const delay = (index % 6) * 0.55;
      const duration = 6 + (index % 4);
      const size = 5 + (index % 5) * 2;
      return `<span class="particle" style="left: ${left}%; bottom: -30px; width: ${size}px; height: ${size}px; animation-delay: ${delay}s; animation-duration: ${duration}s"></span>`;
    }).join("");

    return `
      <section class="scene scene04">
        <div class="scene-live-chip"><span></span>LIVE</div>
        <div class="particle-layer particle-field">${particles}</div>
        <div class="light-streak"></div>
        <div class="stinger-copy wave-layer">
          <div class="scene04-brand-row">
            <img class="scene04-brand-mark" src="${ASSET_PATHS.logos.mark}" alt="BemaHub mark" />
            <img class="scene04-brand-wordmark" src="${ASSET_PATHS.logos.wordmark}" alt="BemaHub" />
          </div>
          <div class="scene04-statements">
            <p><span>Every <strong class="blue">creator</strong> deserves <strong class="blue">to be seen</strong>.</span></p>
            <p><span>Every <strong class="cyan">Builder</strong> deserves a meaningful way to <strong class="blue">help creative value move</strong>.</span></p>
            <p><span>Every <strong class="blue">community</strong> deserves a chance to <strong class="red">grow together</strong>.</span></p>
          </div>
          <p class="scene04-welcome">Welcome to <strong>Bema.</strong> Welcome to <strong class="blue">Open Enrollment 2026.</strong></p>
        </div>
      </section>
    `;
  },
};
