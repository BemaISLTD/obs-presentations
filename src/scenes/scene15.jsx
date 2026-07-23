// Scene 15 owns these design primitives so it can be edited independently.
const ICONS = {
  people:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal:
    '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  refresh:
    '<svg viewBox="0 0 24 24"><path d="M20 7V3l-2.2 2.2A8 8 0 1 0 20 14M4 17v4l2.2-2.2"/></svg>',
  hourglass:
    '<svg viewBox="0 0 24 24"><path d="M6 3h12M6 21h12M7 3c0 4 1.6 6.5 5 9-3.4 2.5-5 5-5 9m10-18c0 4-1.6 6.5-5 9 3.4 2.5 5 5 5 9"/></svg>',
  award:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8M12 5v8M8 9h8"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="m3 11 18-8-7 18-3-7-8-3Zm8 3 10-11"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.2 8.5 8 11 4.8-2.5 8-6 8-11V5l-8-3Z"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
  check:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/></svg>',
};

function icon(name) {
  return `<span class="broadcast-icon inline-grid shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]" data-icon-name="${name}" data-icon-fallback="${ICONS[name] ? "false" : "true"}" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`;
}

function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand absolute left-[62px] top-[42px] z-20 flex items-center gap-3 font-sans text-bema-navy">
      <img class="h-14 w-auto" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
      <span class="brand-wordmark" data-asset-wrapper>
        <img class="broadcast-wordmark h-9 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" data-asset-image />
        <strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong>
      </span>
      ${enrollment ? '<strong class="ml-3 border-l border-current/20 pl-4 text-sm font-black tracking-[.14em]">OPEN ENROLLMENT</strong><small class="text-xs font-semibold opacity-70">Your Benefits. Your Future. Our Priority.</small>' : ""}
    </div>
  `;
}

function renderLiveBadge() {
  return '<div class="broadcast-live absolute right-[62px] top-[46px] z-20 inline-flex items-center gap-2 rounded-full border border-red-200/50 bg-white/90 px-4 py-2 text-sm font-black tracking-[.14em] text-bema-live shadow-lg backdrop-blur"><span class="size-2.5 animate-pulse rounded-full bg-bema-live shadow-[0_0_12px_rgba(255,45,31,.7)]"></span>LIVE</div>';
}

function renderForegroundBar(items) {
  return `
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] !items-center overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 !flex-1 !basis-0 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join("")}
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

    </section>`);
}

function renderLayeredForeground(id, config) {
  const items = config.footer.map(([itemIcon, label]) => ({
    icon: itemIcon,
    label,
  }));
  return sceneMarkup(
    `<section class="scene-foreground layered-scene-foreground layered-scene-foreground-${id} pointer-events-none absolute inset-0 font-sans"><div class="layered-presenter-accent" aria-hidden="true"></div>${renderForegroundBar(items)}</section>`,
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
  return `<div class="reference-status-panel"><div class="reference-status-rail"></div>${config.items.map((item, index) => `<article class="reference-status-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-5 p-3" data-control-cue="${item.cue}" style="--item-index:${index}"><span class="reference-status-dot size-12">${icon(item.icon)}</span><div><h3 class="font-bold text-xl">${item.title}</h3><p class="font-semibold text-lg ml-6">${item.copy}</p></div><strong>${item.value}</strong><span class="reference-status-check">${id === "23" && index === 3 ? "×" : "✓"}</span></article>`).join("")}</div>`;
}

function renderAppShell(content) {
  return `<div class="reference-app-shell"><div class="reference-app-topbar"><span class="reference-app-logo">bema<span>Hub</span></span><label>Search Bema Hub</label><i></i><i></i><b>JR</b></div><nav class="reference-app-sidebar"><strong>Overview</strong><span>Home</span><span>Campaigns</span><span>Events</span><span>Changemakers</span><span>My Impact</span><small>ACCOUNT</small><span>Messages</span><span>Settings</span></nav><main class="reference-app-content">${content}</main></div>`;
}

const config = {
  title: "LOOP ACTIVITY & RECOGNIZED IMPACT",
  subtitle: "Clear status. Verified movement. Transparent results.",
  layout: "status",
  compact: true,
  items: [
    card(
      "Pending LoopLock",
      "Loop activity submitted and awaiting review.",
      "clock",
      "PENDING",
      "amber",
      "status-pending",
    ),
    card(
      "Confirmed LoopLock",
      "Loop activity verified and confirmed as valid.",
      "shield",
      "VERIFIED",
      "blue",
      "status-confirmed",
    ),
    card(
      "Qualified LoopLock",
      "LoopLock meets campaign criteria and is eligible.",
      "star",
      "QUALIFIED",
      "cyan",
      "status-qualified",
    ),
    card(
      "Recognized Impact Pending",
      "Qualified LoopLock is under impact review.",
      "hourglass",
      "IN REVIEW",
      "purple",
      "status-impact-pending",
    ),
    card(
      "Recognized Impact Confirmed",
      "Impact verified and confirmed per campaign rules.",
      "award",
      "CONFIRMED",
      "blue",
      "status-impact-confirmed",
    ),
    card(
      "Recognized Impact Released",
      "Recognized Impact recorded and reflected in totals.",
      "send",
      "RELEASED",
      "cyan",
      "status-released",
    ),
  ],
  callout:
    "Qualified LoopLocks may contribute to Recognized Impact according to campaign rules.",
  footer: [
    ["refresh", "Loop Activity"],
    ["star", "Recognized Impact"],
    ["shield", "Qualified LoopLocks"],
    ["check", "Status clarity"],
  ],
};
export const scene15 = {
  presenterZone: "left",
  renderUnderlay() {
    const body = `<div class="scene15-status-dashboard h-full rounded-panel border border-white/50 bg-white/90 p-6 shadow-card backdrop-blur-xl">${renderStatus("15", config)}<div class="scene15-status-callout mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-bema-blue to-bema-purple px-5 py-4 text-center text-white [&_.broadcast-icon]:size-10 [&_.broadcast-icon]:text-white">${icon("shield")}<strong>Qualified LoopLocks may contribute to Recognized Impact<br />according to campaign rules.</strong></div></div>`;
    return renderLayeredUnderlay("15", config, body);
  },
  renderForeground() {
    return renderLayeredForeground("15", config);
  },
};
