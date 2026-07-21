import {
  SCENE_39_GEOMETRY,
  geometryStyle,
} from "./scene39Geometry.js";

const SCENE_39_CTAS = Object.freeze([
  Object.freeze({
    cue: "dashboard-cta",
    region: "cta-dashboard",
    title: "Visit Your",
    accent: "Dashboard",
    iconTone: "from-cyan-500 to-blue-500",
    accentTone: "text-blue-600",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3M6 9h5M6 13h3M13 10h5M13 14h5"/></svg>',
  }),
  Object.freeze({
    cue: "looplink-cta",
    region: "cta-looplink",
    title: "Share Your",
    accent: "LoopLink",
    iconTone: "from-blue-600 to-violet-600",
    accentTone: "text-violet-600",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4l2.8-2.8"/><path d="M7.2 16.8a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6l-.9.9"/><path d="M16.8 7.2a4 4 0 0 1 0 5.6l-2.2 2.2a4 4 0 0 1-5.6-5.6l.9-.9"/></svg>',
  }),
  Object.freeze({
    cue: "community-cta",
    region: "cta-community",
    title: "Join the",
    accent: "Community Chat",
    iconTone: "from-blue-700 to-blue-500",
    accentTone: "text-blue-700",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5A3.5 3.5 0 0 1 8.5 5h7A3.5 3.5 0 0 1 19 8.5v4a3.5 3.5 0 0 1-3.5 3.5H10l-4 3v-3.2A3.5 3.5 0 0 1 5 12.5Z"/><circle cx="9" cy="10.6" r="1"/><circle cx="12" cy="10.6" r="1"/><circle cx="15" cy="10.6" r="1"/></svg>',
  }),
]);

function SceneMarkup({ html }) {
  return html ? (
    <div
      data-react-scene-markup="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />;
}

function renderScene39Card(item, box, accentColor) {
  return `
    <article class="absolute overflow-hidden rounded-[22px] border border-[#cfdcf4] bg-white shadow-[0_12px_30px_rgba(17,56,129,.18)]" style="${geometryStyle(box)}" data-control-cue="${item.cue}" data-match-region="${item.region}">
      <span class="absolute inset-y-0 left-0 w-[14px]" style="background:${accentColor};"></span>
      <div class="grid h-full grid-cols-[110px_1fr_42px] items-center gap-0 pl-[28px] pr-[24px]">
        <span class="grid size-[78px] place-items-center rounded-full bg-gradient-to-br ${item.iconTone} text-white shadow-[0_10px_20px_rgba(38,103,255,.22)]">
          <span class="size-[42px] [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]">${item.icon}</span>
        </span>
        <h3 class="pt-[2px] text-[26px] font-black leading-[1.04] tracking-[-.03em] text-[#11245f]">${item.title}<br/><span class="${item.accentTone}">${item.accent}</span></h3>
        <span class="justify-self-end text-[56px] font-extralight leading-none text-[#14265c]">›</span>
      </div>
    </article>
  `;
}

export const scene39 = {
  presenterZone: "left",
  renderUnderlay() {
    return sceneMarkup(`
      <section class="absolute inset-0 overflow-hidden font-sans text-[#06174c]">
        <img class="absolute inset-0 h-full w-full object-cover" src="/assets/backgrounds/ref/bg11-utility-qa-hold-wave-ref.png" alt="" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_48%_32%,rgba(255,255,255,.92),transparent_26%),radial-gradient(circle_at_77%_23%,rgba(89,208,255,.34),transparent_28%),linear-gradient(180deg,rgba(255,255,255,.20),rgba(255,255,255,.06))]"></div>
        <div class="pointer-events-none absolute" style="${geometryStyle(SCENE_39_GEOMETRY.presenterSafe)}" data-presenter-safe-zone aria-label="Presenter-safe area"></div>

        <div class="absolute z-20" style="${geometryStyle(SCENE_39_GEOMETRY.brand)}" data-match-region="brand">
          <img class="absolute left-0 top-0 h-[103px] w-[83px]" src="/assets/logos/bemahub-reference-mark.svg" alt="" data-brand-part="mark" />
          <span class="absolute left-[79px] top-[29px] block h-[33px] w-[290px] bg-[linear-gradient(90deg,#15245d_0_57%,#32bfff_57%_100%)]" style="mask-image:url('/assets/logos/bemahub-wordmark.svg');-webkit-mask-image:url('/assets/logos/bemahub-wordmark.svg');mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-size:100% 100%;-webkit-mask-size:100% 100%;" aria-label="BemaHub" data-brand-part="wordmark"></span>
          <p class="absolute left-[79px] top-[53px] h-[49px] w-[289px] text-[15px] font-black leading-[1] tracking-[-.01em] text-[#162a65]" style="font-family:'Helvetica Neue',Arial,sans-serif;" data-brand-part="tagline">Connect. Create. Move Value.</p>
        </div>

        <div class="absolute z-30 inline-flex items-center justify-center gap-[8px] rounded-[13px] border border-[#ff7676] bg-[#f01112] text-white shadow-[0_5px_12px_rgba(234,23,30,.14)]" style="${geometryStyle(SCENE_39_GEOMETRY.endBadge)}" data-match-region="end-badge">
          <span class="size-[18px] rounded-full bg-white shadow-[0_0_0_1px_rgba(255,255,255,.3)]"></span><span class="text-[35px] font-black uppercase tracking-[-.045em]" style="font-family:'Helvetica Neue',Arial,sans-serif;line-height:1;">END</span>
        </div>

        <header class="absolute z-20 flex flex-col items-center justify-start text-center" style="${geometryStyle(SCENE_39_GEOMETRY.headline)}" data-match-region="headline">
          <h2 class="text-[126px] font-black leading-[.84] tracking-[-.068em] text-[#0f2368]" style="font-family:'Helvetica Neue',Arial,sans-serif;">THE LOOP</h2>
          <p class="mt-[-4px] text-[148px] font-black leading-[.84] tracking-[-.065em] bg-gradient-to-r from-[#23b1ff] via-[#2c6fea] to-[#7b49e9] bg-clip-text text-transparent" style="font-family:'Helvetica Neue',Arial,sans-serif;">CONTINUES.</p>
        </header>

        <div class="absolute z-20 flex items-center justify-center gap-[12px] text-[#2d92f6]" style="${geometryStyle(SCENE_39_GEOMETRY.divider)}" data-match-region="divider">
          <span class="mt-[-6px] h-[2px] w-[291px] rounded-full bg-[#202d7c]"></span>
          <span class="mt-[-6px] text-[33px] font-semibold leading-none tracking-[-.04em]">∞</span>
          <span class="mt-[-6px] h-[2px] w-[252px] rounded-full bg-[#202d7c]"></span>
        </div>

        <div class="absolute z-20 flex items-start justify-center text-center" style="${geometryStyle(SCENE_39_GEOMETRY.subtitle)}" data-match-region="subtitle">
          <p class="pt-[0px] text-[27px] font-black leading-[1.04] tracking-[-.025em] text-[#132b68]" style="font-family:'Helvetica Neue',Arial,sans-serif;">Keep creating. Keep connecting.<br/>Keep <span class="bg-gradient-to-r from-[#2991ff] via-[#4271f1] to-[#8546ea] bg-clip-text text-transparent">moving value forward.</span></p>
        </div>

        <div class="absolute z-20 grid place-items-center rounded-[30px] border border-[#dbf5ff] bg-[#ffffff] p-[10px] shadow-[0_0_0_2px_rgba(160,237,255,.8),0_0_18px_rgba(95,215,255,.3)]" style="${geometryStyle(SCENE_39_GEOMETRY.qr)}" data-match-region="qr" data-qr-part="frame">
          <div class="grid h-full w-full place-items-center rounded-[18px] border border-[#d8d2ff] bg-white p-[14px] shadow-[inset_0_0_0_1px_rgba(88,169,255,.18)]" data-qr-part="inner-frame">
            <img class="h-[291px] w-[291px] rounded-[4px] bg-white" src="/assets/qr/main-join-qr.png" alt="Scan to continue with Bema Hub" data-qr-part="content" />
          </div>
        </div>

        ${renderScene39Card(SCENE_39_CTAS[0], SCENE_39_GEOMETRY.ctaDashboard, "linear-gradient(180deg,#39d6ff,#1d88ef)")}
        ${renderScene39Card(SCENE_39_CTAS[1], SCENE_39_GEOMETRY.ctaLoopLink, "linear-gradient(180deg,#8d63ff,#5b3fe8)")}
        ${renderScene39Card(SCENE_39_CTAS[2], SCENE_39_GEOMETRY.ctaCommunity, "linear-gradient(180deg,#2d87ff,#1b59dc)")}

        <div class="absolute z-20 grid place-items-center" style="${geometryStyle(SCENE_39_GEOMETRY.loopMark)}" data-match-region="loop-mark">
          <div class="grid size-[136px] place-items-center rounded-full bg-white/62 shadow-[0_12px_24px_rgba(38,88,185,.16)]">
            <svg class="size-[139px]" viewBox="0 0 160 160" aria-hidden="true">
              <defs>
                <linearGradient id="scene39-loop-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#25c3ff"/>
                  <stop offset="55%" stop-color="#2a73ea"/>
                  <stop offset="100%" stop-color="#7a47e7"/>
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="45" fill="rgba(255,255,255,.86)"/>
              <path d="M44 95c4 18 19 33 38 38 22 5 45-5 59-24" fill="none" stroke="url(#scene39-loop-ring)" stroke-width="11" stroke-linecap="round"/>
              <path d="M115 42c-16-9-35-11-53-4-17 7-30 21-37 39" fill="none" stroke="#2bb7ff" stroke-width="11" stroke-linecap="round"/>
              <path d="M141 108l2 16-14-8z" fill="#7649e8"/>
              <path d="M24 76l-2-16 14 8z" fill="#28c0ff"/>
              <path d="M67 58v30a13 13 0 0 0 13 13h0a13 13 0 0 0 13-13V70" fill="none" stroke="url(#scene39-loop-ring)" stroke-width="8" stroke-linecap="round"/>
              <path d="M76 58v28a4.5 4.5 0 0 0 4.5 4.5h0A4.5 4.5 0 0 0 85 86V72" fill="none" stroke="#10255f" stroke-width="8" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <div class="absolute z-20 text-center" style="${geometryStyle(SCENE_39_GEOMETRY.thankYou)}" data-match-region="thank-you">
          <p class="text-[29px] font-black leading-[1.15] tracking-[-.025em] text-[#13285f]">Thank you for joining<br/>Bema Hub <span class="bg-gradient-to-r from-[#1f82ed] to-[#7d4be7] bg-clip-text text-transparent">Open Enrollment 2026.</span></p>
        </div>
      </section>
    `);
  },
  renderForeground() {
    return sceneMarkup(`
      <section class="pointer-events-none absolute z-40 font-sans" style="${geometryStyle(SCENE_39_GEOMETRY.footer)}" data-match-region="footer">
        <div class="h-full border-t-[3px] border-[#37ddff] bg-[#08184e] text-white shadow-[0_-8px_20px_rgba(4,24,72,.35)]">
          <div class="grid h-full grid-cols-[39px_534px_250px_237px_225px_620px] items-center pl-[27px] pr-[16px]">
            <span class="inline-grid size-[24px] place-items-center text-white">
              <svg class="size-[24px]" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 0 0 0 6M1 6a12 12 0 0 0 0 12M20 9a8 8 0 0 1 0 6M23 6a12 12 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/></svg>
            </span>
            <div class="pl-[12px] text-[18px] font-black tracking-[-.01em]">THANK YOU FOR BEING PART OF THE LOOP.</div>
            <div class="border-l border-white/45 text-center text-[16px] font-black text-[#37dcff]">CREATE CONNECTIONS.</div>
            <div class="border-l border-white/45 text-center text-[16px] font-black text-[#b466ff]">SHARE VALUE.</div>
            <div class="border-l border-white/45 text-center text-[16px] font-black text-[#39bcff]">MOVE FORWARD.</div>
            <div class="border-l border-white/45 pl-[22px] text-right text-[18px] font-black tracking-[-.01em] text-[#eef4ff]">BEMA HUB OPEN ENROLLMENT 2026</div>
          </div>
        </div>
      </section>
    `);
  },
};
