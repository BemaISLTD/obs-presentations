// Scene 16 owns these design primitives so it can be edited independently.
const ICONS = {
  people:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal:
    '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart:
    '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v10h-6v-7H9v7H3V11Z"/></svg>',
  music:
    '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="m3 11 18-8-7 18-3-7-8-3Zm8 3 10-11"/></svg>',
  megaphone:
    '<svg viewBox="0 0 24 24"><path d="m4 13 13 5V5L4 10v3ZM17 9c2 0 3 1 3 2.5S19 14 17 14M7 14l1 5h4l-2-4"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/></svg>',
};

function icon(name) {
  return `<span class="broadcast-icon inline-grid shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]" data-icon-name="${name}" data-icon-fallback="${ICONS[name] ? "false" : "true"}" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`;
}

function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand absolute left-[48px] top-[34px] z-20 flex items-center gap-3 font-sans text-bema-navy">
      <img class="h-[72px] w-auto" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
      <span class="brand-wordmark" data-asset-wrapper>
        <img class="broadcast-wordmark h-[74px] w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" data-asset-image />
        <strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong>
      </span>
      ${enrollment ? '<strong class="ml-3 border-l border-current/20 pl-4 text-sm font-black tracking-[.14em]">OPEN ENROLLMENT</strong><small class="text-xs font-semibold opacity-70">Your Benefits. Your Future. Our Priority.</small>' : ""}
    </div>
  `;
}

function renderLiveBadge() {
  return '<div class="broadcast-live absolute right-[52px] top-[34px] z-20 inline-flex items-center gap-3 rounded-xl border border-red-500 bg-red-600 px-5 py-3 text-2xl font-black tracking-[.1em] text-white shadow-lg"><span class="size-3 animate-pulse rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.8)]"></span>LIVE</div>';
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
        <h2 class="font-display font-black tracking-[-.045em] text-white">${config.title}</h2>
        ${dottedHeading ? '<span class="layered-heading-rule">•</span>' : ""}
        <p class="font-semibold text-gray-100">${config.subtitle}</p>
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
  return `<div class="reference-status-panel"><div class="reference-status-rail"></div>${config.items.map((item, index) => `<article class="reference-status-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-5 p-5" data-control-cue="${item.cue}" style="--item-index:${index}"><span class="reference-status-dot">${icon(item.icon)}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><strong>${item.value}</strong><span class="reference-status-check">${id === "23" && index === 3 ? "×" : "✓"}</span></article>`).join("")}</div>`;
}

function renderAppShell(content) {
  return `<div class="reference-app-shell"><div class="reference-app-topbar"><span class="reference-app-logo">bema<span>Hub</span></span><label>Search Bema Hub</label><i></i><i></i><b>JR</b></div><nav class="reference-app-sidebar"><strong>Overview</strong><span>Home</span><span>Campaigns</span><span>Events</span><span>Changemakers</span><span>My Impact</span><small>ACCOUNT</small><span>Messages</span><span>Settings</span></nav><main class="reference-app-content">${content}</main></div>`;
}

const config = {
  title: "BEMA HUB<br />HOME DASHBOARD",
  subtitle: "Where activity begins.",
  layout: "dashboard",
  items: [
    card(
      "Active Campaigns",
      "● Live now",
      "megaphone",
      "18",
      "cyan",
      "dashboard-today",
    ),
    card(
      "Changemakers",
      "↑ 1186 today",
      "people",
      "2,845",
      "purple",
      "dashboard-today",
    ),
    card(
      "Engagement",
      "↑ 8% this week",
      "heart",
      "12.6K",
      "purple",
      "dashboard-today",
    ),
    card("Growth", "↑ vs last week", "chart", "24%", "blue", "dashboard-today"),
    card(
      "Featured Campaigns",
      "Music for Change · Creativity for Good · Community Builders",
      "music",
      "VIEW ALL",
      "cyan",
      "dashboard-campaigns",
    ),
  ],
  footer: [
    ["home", "Home Dashboard"],
    ["megaphone", "Active Campaigns"],
    ["calendar", "Upcoming Events"],
    ["star", "Featured Campaigns"],
  ],
};
export const scene16 = {
  presenterZone: "left",
  renderUnderlay() {
    const metrics = config.items.slice(0, 4);
    const events = [
      ["22", "Open Enrollment Kickoff LIVE", "12:00 PM ET"],
      ["24", "Creator Community Q&A", "3:00 PM ET"],
      ["27", "Loop Activity Masterclass", "1:00 PM ET"],
    ];
    const campaigns = [
      ["Music for Change", "Amplify voices. Inspire change.", "72%"],
      ["Creativity for Good", "Create. Connect. Contribute.", "58%"],
      ["Community Builders", "Stronger communities. Together.", "64%"],
    ];
    const body = `<div class="scene16-home-layout h-full"><aside class="scene16-home-points">${[
      ["people", "See what’s live.<br />Join what matters."],
      ["star", "Discover campaigns.<br />Make an impact."],
      ["chart", "Track activity.<br />Fuel growth together."],
    ]
      .map(
        ([itemIcon, copy]) =>
          `<p>${icon(itemIcon)}<span class="text-white font-bold">${copy}</span></p>`,
      )
      .join(
        "",
      )}</aside><div class="scene16-dashboard overflow-hidden rounded-panel border border-sky-200/70 bg-white shadow-card"><header><span class="scene16-app-brand"><img src="/assets/logos/bemahub-reference-mark.svg" alt="" /><img class="broadcast-wordmark" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" /></span><nav>Home　 Campaigns　 Loop Activity　 My Impact</nav><b>⌕　♧　 JR</b></header><main><div class="scene16-welcome"><div><h3>Welcome back, Joyce! 👋</h3><p>Here’s what’s happening on Bema Hub today.</p></div><button>My Dashboard　→</button></div><strong class="scene16-section-label">TODAY ON BEMA HUB</strong><div class="scene16-metrics">${metrics.map((item) => `<article class="rounded-2xl border border-sky-100 bg-white shadow-sm">${icon(item.icon)}<small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span><a>View details　→</a></article>`).join("")}</div><div class="scene16-lower-grid"><section><header><strong>UPCOMING EVENTS</strong><a>View calendar →</a></header>${events.map(([day, title, time]) => `<article><time><small>MAY</small><b>${day}</b></time><div><strong>${title}</strong><span>${time}</span></div><em>${day === "22" ? "LIVE" : "RSVP"}</em></article>`).join("")}</section><section><header><strong>FEATURED CAMPAIGNS</strong><a>View all →</a></header>${campaigns.map(([title, copy, value], index) => `<article><i class="scene16-campaign-art art-${index}"></i><div><strong>${title}</strong><span>${copy}</span><progress value="${value.slice(0, -1)}" max="100"></progress></div><b>${value}</b></article>`).join("")}</section></div></main></div></div>`;
    return renderLayeredUnderlay("16", config, body);
  },
  renderForeground() {
    return renderLayeredForeground("16", config);
  },
};
