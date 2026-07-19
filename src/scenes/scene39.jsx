import {
  renderTailwindCanvas,
  renderTailwindForeground,
} from "./tailwindBroadcastScene.jsx";

// Scene 39 owns these design primitives so it can be edited independently.
const ICONS = {
  people:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal:
    '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart:
    '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  music:
    '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
};

function icon(name) {
  return `<span class="broadcast-icon inline-grid shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]" data-icon-name="${name}" data-icon-fallback="${ICONS[name] ? "false" : "true"}" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`;
}

function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand absolute left-[62px] top-[42px] z-20 flex items-center gap-3 font-sans text-bema-navy">
      <img class="h-14 w-auto" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
      <img class="broadcast-wordmark h-9 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" />
      ${enrollment ? '<strong class="ml-3 border-l border-current/20 pl-4 text-sm font-black tracking-[.14em]">OPEN ENROLLMENT</strong><small class="text-xs font-semibold opacity-70">Your Benefits. Your Future. Our Priority.</small>' : ""}
    </div>
  `;
}

function renderLiveBadge() {
  return '<div class="broadcast-live absolute right-[62px] top-[46px] z-20 inline-flex items-center gap-2 rounded-full border border-red-200/50 bg-white/90 px-4 py-2 text-sm font-black tracking-[.14em] text-bema-live shadow-lg backdrop-blur"><span class="size-2.5 animate-pulse rounded-full bg-bema-live shadow-[0_0_12px_rgba(255,45,31,.7)]"></span>LIVE</div>';
}

function renderForegroundBar(
  items,
  lead = "LIVE NOW",
  { audience = false, leadIcon = "signal" } = {},
) {
  return `
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] items-stretch overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      <div class="foreground-bar-lead flex min-w-[250px] items-center gap-3 bg-gradient-to-br from-bema-blue to-bema-purple px-7 [&_.broadcast-icon]:size-7"><strong class="text-base font-black tracking-wide">${lead}</strong></div>
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 flex-1 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join("")}
      ${audience ? `<div class="foreground-bar-audience flex min-w-[170px] items-center justify-center gap-2 border-l border-white/10 px-5 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon("people")}<strong class="text-xl">${audience}</strong><span class="text-[10px] leading-tight text-indigo-200">Watching<br>Live</span></div>` : ""}
    </div>
  `;
}

function renderQrCard(title = "Scan to Join Now") {
  return `
    <div class="proof-qr-card grid place-items-center gap-2 rounded-card border border-sky-200/70 bg-white/95 p-4 text-center text-bema-navy shadow-card">
      <strong class="text-sm font-black uppercase tracking-wide">${title}</strong>
      <img class="size-[130px] rounded-xl bg-white p-1" src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" />
    </div>
  `;
}

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

const TONE_CLASSES = Object.freeze({
  blue: "border-blue-300/60 bg-gradient-to-br from-white to-blue-50 [&_.broadcast-icon]:text-bema-blue",
  cyan: "border-cyan-300/60 bg-gradient-to-br from-white to-cyan-50 [&_.broadcast-icon]:text-cyan-600",
  purple:
    "border-violet-300/60 bg-gradient-to-br from-white to-violet-50 [&_.broadcast-icon]:text-bema-purple",
  pink: "border-pink-300/60 bg-gradient-to-br from-white to-pink-50 [&_.broadcast-icon]:text-pink-600",
  amber:
    "border-amber-300/60 bg-gradient-to-br from-white to-amber-50 [&_.broadcast-icon]:text-amber-600",
  green:
    "border-emerald-300/60 bg-gradient-to-br from-white to-emerald-50 [&_.broadcast-icon]:text-emerald-600",
});

const cardSurface =
  "rounded-card border bg-white/90 shadow-card backdrop-blur transition duration-300";
const toneClasses = (tone) => TONE_CLASSES[tone] ?? TONE_CLASSES.blue;

const card = (
  title,
  copy,
  iconName = "signal",
  value = "",
  tone = "blue",
  cue = "",
) => ({
  title,
  copy,
  icon: iconName,
  value,
  tone,
  cue,
});

function renderLayeredUnderlay(id, config, body) {
  const dottedHeading = ["09", "12", "26", "27"].includes(id);
  return sceneMarkup(`
    <section class="scene layered-scene reference-built-scene reference-scene-${id} layout-${config.layout} absolute inset-0 overflow-hidden font-sans text-bema-navy ${config.compact ? "is-compact" : ""} ${config.darkPanel ? "has-dark-panel" : ""}">
      ${renderBrand()}${renderLiveBadge()}
      <div class="layered-presenter-space absolute inset-y-0 left-0 w-[34%]" aria-label="Presenter camera placement"></div>
      <header class="layered-scene-heading absolute z-10 text-center">
        <h2 class="font-display font-black tracking-[-.045em] text-bema-navy">${config.title}</h2>
        ${dottedHeading ? '<span class="layered-heading-rule">•</span>' : ""}
        <p class="font-semibold text-slate-600">${config.subtitle}</p>
        ${dottedHeading ? "" : '<span class="layered-heading-rule">♥</span>'}
      </header>
      <div class="reference-scene-body absolute z-10"><div class="scene-card-composition scene-card-composition-${id} h-full w-full" data-scene-card-design="${id}">${body}</div></div>
      ${config.qr && !["27", "34", "37", "39"].includes(id) ? `<aside class="layered-qr">${renderQrCard("Scan to Join")}</aside>` : ""}
      ${config.callout && !["06", "11", "15"].includes(id) ? `<div class="layered-callout text-2xl"><strong>${config.callout}</strong></div>` : ""}
    </section>`);
}

function renderLayeredForeground(id, config) {
  const items = config.footer.map(([itemIcon, label]) => ({
    icon: itemIcon,
    label,
  }));
  const lead =
    config.footerLead ??
    (config.utility
      ? "LIVE NOW"
      : config.title.split(" ").slice(0, 3).join(" "));
  return sceneMarkup(
    `<section class="scene-foreground layered-scene-foreground layered-scene-foreground-${id} pointer-events-none absolute inset-0 font-sans"><div class="layered-presenter-accent" aria-hidden="true"></div>${renderForegroundBar(items, lead, { audience: config.audience, leadIcon: config.footerLeadIcon })}</section>`,
  );
}

function renderFeatureCards(id, config) {
  return `<div class="reference-feature-grid columns-${config.columns ?? config.items.length} grid h-full gap-5">${config.items.map((item, index) => `<article class="reference-feature-card tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative overflow-hidden p-7" data-control-cue="${item.cue}" style="--item-index:${index}"><div class="reference-card-icon mb-5 grid size-24 place-items-center rounded-2xl bg-current/5 [&_.broadcast-icon]:size-24">${icon(item.icon)}</div><h3 class="text-3xl font-black tracking-tight">${item.title}</h3><p class="mt-3 text-lg leading-relaxed text-slate-600">${item.copy}</p>${item.value ? `<strong class="reference-pill mt-5 inline-flex rounded-full bg-bema-navy px-3 py-1 text-sm font-black text-white">${item.value}</strong>` : ""}<span class="reference-card-link mt-6 inline-flex items-center gap-2 text-sm font-black text-bema-blue">${id === "09" ? "Explore program" : id === "19" ? "View what is included" : ""}</span></article>`).join("")}</div>`;
}

function renderFlow(id, config) {
  return `<div class="reference-flow reference-flow-${id}"><div class="reference-flow-line"></div>${config.items.map((item, index) => `<article class="reference-flow-step tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative grid place-items-center p-6 text-center" data-control-cue="${item.cue}" style="--item-index:${index}"><strong class="reference-flow-index">${item.value}</strong><div class="reference-flow-icon">${icon(item.icon)}</div><h3>${item.title}</h3><p>${item.copy}</p>${index < config.items.length - 1 ? '<span class="reference-flow-arrow">→</span>' : ""}</article>`).join("")}</div>`;
}

function renderTierTrack(config) {
  return `<div class="reference-tier-track"><div class="reference-tier-line"><span></span></div>${config.items.map((item, index) => `<article class="reference-tier tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative grid place-items-center p-5 text-center" data-control-cue="${item.cue}" style="--item-index:${index}"><div class="reference-tier-medal">${icon(item.icon)}</div><strong>${item.title}</strong><span>${item.copy}</span><small>${item.value}</small></article>`).join("")}</div>`;
}

function renderAccessLadder(config) {
  return `<div class="reference-access-layout"><div class="reference-access-intro"><strong>ACCESS<br />LEVELS</strong><p>The vertical climb within the campaign.</p><span>Choose the experience that fits you.</span></div><div class="reference-access-ladder">${config.items.map((item, index) => `<article class="reference-access-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-6 p-6" data-control-cue="${item.cue}" style="--item-index:${index}"><strong class="reference-access-rank">${item.value}</strong><div>${icon(item.icon)}</div><section><h3>${item.title}</h3><p>${item.copy}</p><small>${index === 0 ? "CORE ACCESS" : index === 1 ? "DEEPER EXPERIENCE" : "DEEPEST ACCESS"}</small></section></article>`).join("")}</div></div>`;
}

function renderStatus(id, config) {
  return `<div class="reference-status-panel"><div class="reference-status-rail"></div>${config.items.map((item, index) => `<article class="reference-status-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-5 p-5" data-control-cue="${item.cue}" style="--item-index:${index}"><span class="reference-status-dot">${icon(item.icon)}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><strong>${item.value}</strong><span class="reference-status-check">${id === "23" && index === 3 ? "×" : "✓"}</span></article>`).join("")}</div>`;
}

function renderAppShell(content) {
  return `<div class="reference-app-shell"><div class="reference-app-topbar"><span class="reference-app-logo">bema<span>Hub</span></span><label>Search Bema Hub</label><i></i><i></i><b>JR</b></div><nav class="reference-app-sidebar"><strong>Overview</strong><span>Home</span><span>Campaigns</span><span>Events</span><span>Changemakers</span><span>My Impact</span><small>ACCOUNT</small><span>Messages</span><span>Settings</span></nav><main class="reference-app-content">${content}</main></div>`;
}

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

function renderScene39Ctas() {
  return SCENE_39_CTAS.map(
    (item) => `
    <article class="grid h-[94px] grid-cols-[76px_1fr_30px] items-center gap-4 rounded-[20px] border border-[#cddffc] bg-white px-5 shadow-[0_10px_26px_rgba(10,52,132,.18)]" data-control-cue="${item.cue}" data-match-region="${item.region}">
      <span class="grid size-[58px] place-items-center rounded-full bg-gradient-to-br ${item.iconTone} text-white shadow-md">
        <span class="size-[29px] [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]">${item.icon}</span>
      </span>
      <h3 class="text-[23px] leading-[1.03] font-black tracking-[-.02em] text-[#13245d]">${item.title}<br/><span class="${item.accentTone}">${item.accent}</span></h3>
      <span class="text-[35px] font-light text-[#13245d]">›</span>
    </article>`,
  ).join("");
}

export const scene39 = {
  presenterZone: "left",
  renderUnderlay() {
    return sceneMarkup(`
      <section class="absolute inset-0 overflow-hidden font-sans text-[#06174c]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_76%_32%,rgba(63,187,255,.34),transparent_32%),radial-gradient(circle_at_50%_58%,rgba(85,143,255,.16),transparent_40%),linear-gradient(180deg,#f5fbff_0%,#ebf5ff_56%,#daeefe_100%)]"></div>
        <div class="pointer-events-none absolute inset-y-0 left-0 w-[31%]" data-presenter-safe-zone aria-label="Presenter-safe area"></div>

        <div class="absolute left-10 top-8 z-20 flex items-start gap-3" data-match-region="brand">
          <img class="h-[72px] w-[72px]" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
          <div class="pt-1">
            <img class="h-[48px] w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" />
            <p class="mt-1 text-[13px] font-bold tracking-[-.01em] text-[#12285d]">Connect. Create. Move Value.</p>
          </div>
        </div>

        <div class="absolute right-9 top-8 z-30 inline-flex items-center gap-3 rounded-[14px] bg-[#ea1218] px-7 py-2.5 text-[26px] font-black uppercase tracking-[.08em] text-white" data-match-region="end-badge">
          <span class="size-4 rounded-full bg-white"></span>END
        </div>

        <header class="absolute left-[31%] right-[26.3%] top-[104px] z-20 text-center">
          <h2 class="font-display text-[59px] font-black leading-[.88] tracking-[-.042em] text-[#0b1f68]" data-match-region="headline">THE LOOP<br/><span class="bg-gradient-to-r from-[#28b8ff] via-[#1e72e8] to-[#7545e5] bg-clip-text text-transparent">CONTINUES.</span></h2>
          <div class="mx-auto mt-3 flex w-[478px] items-center gap-4 text-[#1f62c2]"><span class="h-[3px] flex-1 bg-[#1f4fa6]"></span><span class="text-[23px] font-bold">∞</span><span class="h-[3px] flex-1 bg-[#1f4fa6]"></span></div>
          <p class="mt-4 text-[26px] font-black leading-[1.2] tracking-[-.01em] text-[#0b1f68]" data-match-region="subtitle">Keep creating. Keep connecting.<br/>Keep <span class="bg-gradient-to-r from-[#1e78e8] to-[#7545e5] bg-clip-text text-transparent">moving value forward.</span></p>
        </header>

        <section class="absolute right-[36px] top-[96px] bottom-[138px] z-20 flex w-[25.8%] flex-col items-center">
          <div class="rounded-[24px] border-[5px] border-white bg-white p-[10px] shadow-[0_0_0_2px_rgba(118,212,255,.8),0_0_28px_rgba(67,197,255,.65)]" data-match-region="qr">
            <img class="size-[230px] rounded-[14px] bg-white" src="/assets/qr/main-join-qr.png" alt="Scan to continue with Bema Hub" />
          </div>
          <div class="mt-4 w-full space-y-[11px]">${renderScene39Ctas()}</div>
        </section>

        <div class="absolute bottom-[132px] left-[34.6%] z-20 w-[35%] text-center" data-match-region="thank-you">
          <div class="mx-auto grid size-[120px] place-items-center rounded-full bg-gradient-to-br from-[#2fc1ff] via-[#2a79e8] to-[#7e49eb] shadow-[0_10px_20px_rgba(24,68,158,.28)]" data-match-region="loop-mark">
            <svg class="size-[78px]" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="scene39-loop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#7fe7ff"/>
                  <stop offset="58%" stop-color="#3085ef"/>
                  <stop offset="100%" stop-color="#7d47ea"/>
                </linearGradient>
              </defs>
              <path d="M9 36A23 23 0 0 0 48 51" fill="none" stroke="url(#scene39-loop)" stroke-width="6" stroke-linecap="round"/>
              <path d="M13 24A23 23 0 0 1 53 11" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".92"/>
              <path d="M49 51l-1-9 8 4z" fill="#ffffff"/>
              <path d="M12 24l1 9-8-4z" fill="url(#scene39-loop)"/>
              <image href="/assets/logos/bemahub-mark.svg" x="22" y="22" width="20" height="20"/>
            </svg>
          </div>
          <p class="mt-5 text-[28px] font-black leading-[1.24] tracking-[-.01em] text-[#0b1f68]">Thank you for joining<br/>Bema Hub <span class="bg-gradient-to-r from-[#1d7ae9] to-[#7747e8] bg-clip-text text-transparent">Open Enrollment 2026.</span></p>
        </div>
      </section>
    `);
  },
  renderForeground() {
    return sceneMarkup(`
      <section class="pointer-events-none absolute inset-x-0 bottom-0 z-40 font-sans" data-match-region="footer">
        <div class="h-[72px] border-t-[3px] border-[#37dcff] bg-[#06184f] px-9 text-white shadow-[0_-8px_20px_rgba(4,24,72,.35)]">
          <div class="grid h-full grid-cols-[1.8fr_1fr_1fr_1fr_1.8fr] items-center gap-0">
            <div class="flex items-center gap-3 pr-4 text-[17px] font-black">
              <span class="inline-grid size-6 place-items-center rounded-full border-2 border-white/85 text-white"><svg class="size-3.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 0 0 0 6M1 6a12 12 0 0 0 0 12M20 9a8 8 0 0 1 0 6M23 6a12 12 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg></span>
              <span>THANK YOU FOR BEING PART OF THE LOOP.</span>
            </div>
            <div class="border-l border-white/50 px-4 text-center text-[16px] font-black text-[#42d9ff]">CREATE CONNECTIONS.</div>
            <div class="border-l border-white/50 px-4 text-center text-[16px] font-black text-[#b66eff]">SHARE VALUE.</div>
            <div class="border-l border-white/50 px-4 text-center text-[16px] font-black text-[#3ab8ff]">MOVE FORWARD.</div>
            <div class="border-l border-white/50 pl-5 text-right text-[17px] font-black text-[#dde7ff]">BEMA HUB OPEN ENROLLMENT 2026</div>
          </div>
        </div>
      </section>
    `);
  },
};
