import { renderTailwindForeground, renderTailwindUnderlay } from './tailwindBroadcastScene.jsx'

// Scene 32 owns these design primitives so it can be edited independently.
const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
}

function icon(name) {
  return `<span class="broadcast-icon inline-grid shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]" data-icon-name="${name}" data-icon-fallback="${ICONS[name] ? 'false' : 'true'}" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`
}

function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand absolute left-[62px] top-[42px] z-20 flex items-center gap-3 font-sans text-bema-navy">
      <img class="h-14 w-auto" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
      <span class="brand-wordmark" data-asset-wrapper>
        <img class="broadcast-wordmark h-9 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" data-asset-image />
        <strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong>
      </span>
      ${enrollment ? '<strong class="ml-3 border-l border-current/20 pl-4 text-sm font-black tracking-[.14em]">OPEN ENROLLMENT</strong><small class="text-xs font-semibold opacity-70">Your Benefits. Your Future. Our Priority.</small>' : ''}
    </div>
  `
}

function renderLiveBadge() {
  return '<div class="broadcast-live absolute right-[62px] top-[46px] z-20 inline-flex items-center gap-2 rounded-full border border-red-200/50 bg-white/90 px-4 py-2 text-sm font-black tracking-[.14em] text-bema-live shadow-lg backdrop-blur"><span class="size-2.5 animate-pulse rounded-full bg-bema-live shadow-[0_0_12px_rgba(255,45,31,.7)]"></span>LIVE</div>'
}

function renderForegroundBar(items) {
  return `
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] items-stretch overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 flex-1 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join('')}
    </div>
  `
}

function renderQrCard(title = 'Scan to Join Now') {
  return `
    <div class="proof-qr-card grid place-items-center gap-2 rounded-card border border-sky-200/70 bg-white/95 p-4 text-center text-bema-navy shadow-card">
      <strong class="text-sm font-black uppercase tracking-wide">${title}</strong>
      <img class="size-[130px] rounded-xl bg-white p-1" src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" />
    </div>
  `
}

function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />
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
  title: 'TOP REFERRERS & COMMUNITY MOMENTUM', subtitle: 'Visible movement helps value travel farther.', layout: 'leaderboard',
  items: [
    card('Creative_Jay', 'Community Builder', 'people', '128', 'cyan', 'rank-1'),
    card('DesignFlow', 'Visual Storyteller', 'chart', '97', 'blue', 'rank-2'),
    card('MelodyMinds', 'Music Creator', 'music', '86', 'purple', 'rank-3'),
    card('LoopQueen', 'Engagement Leader', 'heart', '72', 'blue', 'activity-update'),
    card('Visionary_Vee', 'Impact Connector', 'signal', '61', 'cyan', 'activity-update'),
    card('Weekly Momentum', '1,248 referrals · 2,976 LoopLinks · 4,532 community actions', 'chart', '+24%', 'purple', 'activity-update'),
  ],
  footer: [['people', 'Top Referrers'], ['signal', 'Loop Activity'], ['chart', 'Weekly Movement']],
}
export const scene32 = {
  presenterZone: "left",
  renderUnderlay() {
    const leaders = [
      { ...config.items[0], image: '/assets/generated/changemaker-jordan.png' },
      { ...config.items[1], image: '/assets/generated/changemaker-amina.png' },
      { ...config.items[2], image: '/assets/generated/changemaker-marcus.png' },
      { ...config.items[3], image: '/assets/generated/changemaker-tierra.png' },
      { ...config.items[4], image: '/assets/generated/changemaker-darnell.png' },
    ]
    const momentum = [['♙', 'New Referrals', '1,248', '▲ 18%'], ['↗', 'LoopLinks Shared', '2,976', '▲ 24%'], ['♡', 'Community Actions', '4,532', '▲ 21%']]
    const body = `<div class="grid h-full grid-cols-[1.35fr_.85fr] content-center gap-5">
      <section class="overflow-hidden rounded-[26px] border border-sky-200 bg-white/95 p-6 shadow-2xl"><header class="flex items-center gap-4 border-b pb-4"><span class="grid size-14 place-items-center rounded-full bg-blue-50 text-3xl text-blue-600">♜</span><h3 class="text-[25px] font-black">TOP BUILDERS THIS WEEK</h3></header><div>${leaders.map((item, index) => `<article class="grid grid-cols-[54px_78px_1fr_100px] items-center gap-4 border-b py-3" data-control-cue="${item.cue}"><b class="grid size-10 place-items-center rounded-full ${index === 0 ? 'bg-amber-300 text-amber-950' : index === 1 ? 'bg-slate-200' : index === 2 ? 'bg-orange-200' : 'bg-blue-50 text-blue-600'} text-lg">${index + 1}</b><img class="size-[68px] rounded-full border-2 border-white object-cover shadow-md" src="${item.image}" alt="${item.title}"/><div><h4 class="text-[22px] font-black">${item.title}</h4><p class="text-[15px] font-semibold text-slate-600">${item.copy}</p></div><strong class="text-right text-[28px] font-black text-cyan-600">${item.value}<small class="block text-xs text-[#14255d]">Referrals</small></strong></article>`).join('')}</div><p class="pt-4 text-center text-base font-black text-blue-700">♙　Thank you to all builders helping the community grow!</p></section>
      <aside class="grid grid-rows-[1.2fr_.8fr] gap-5"><section class="rounded-[26px] border border-sky-200 bg-white/95 p-6 shadow-2xl"><header class="flex items-center gap-4 border-b pb-4"><span class="grid size-14 place-items-center rounded-full bg-cyan-50 text-3xl text-cyan-600">↗</span><h3 class="text-[24px] font-black">WEEKLY MOMENTUM</h3></header>${momentum.map(([symbol,label,value,change], index) => `<div class="grid grid-cols-[50px_1fr_auto] items-center gap-4 border-b py-4"><span class="text-[34px] ${index === 2 ? 'text-fuchsia-500' : 'text-blue-600'}">${symbol}</span><div><small class="text-[15px] font-bold">${label}</small><strong class="block text-[28px] font-black text-cyan-600">${value}</strong></div><b class="text-sm text-cyan-600">${change}<small class="block text-[10px] text-slate-500">vs last week</small></b></div>`).join('')}</section><section class="rounded-[26px] border border-sky-200 bg-white/95 p-5 shadow-2xl"><h3 class="flex items-center gap-3 border-b pb-3 text-[22px] font-black"><i class="size-3 rounded-full bg-violet-600"></i>LIVE ACTIVITY</h3>${leaders.slice(0, 3).map((item, index) => `<div class="mt-3 flex items-center gap-3"><img class="size-11 rounded-full object-cover" src="${item.image}" alt=""/><strong class="min-w-0 flex-1 truncate">@${item.title.replaceAll(' ','')} ${index === 0 ? 'shared a LoopLink' : index === 1 ? 'joined Bema Hub' : 'invited 3 friends'}</strong><small>${10 + index * 18}s ago</small></div>`).join('')}</section></aside>
    </div>`
    return renderTailwindUnderlay({ title: 'TOP REFERRERS &<br/>COMMUNITY MOMENTUM', subtitle: config.subtitle, body, titleClass: '[&_h2]:!text-[64px]' });
  },
  renderForeground() {
    return renderTailwindForeground(['♜ Top Referrers', '♙ Community Momentum', '↗ Loop Activity', '▥ Weekly Movement']);
  },
};
