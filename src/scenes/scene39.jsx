import { renderTailwindCanvas, renderTailwindForeground } from './tailwindBroadcastScene.jsx'

// Scene 39 owns these design primitives so it can be edited independently.
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
      <img class="broadcast-wordmark h-9 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" />
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
    title: 'THE LOOP CONTINUES.', subtitle: 'Keep creating. Keep connecting. Keep moving value forward.', layout: 'cta', qr: true,
    items: [
      card('Visit Your Dashboard', 'Track your activity and continue your journey.', 'chart', 'OPEN', 'blue', 'dashboard-cta'),
      card('Share Your LoopLink', 'Help creative value reach more people.', 'signal', 'SHARE', 'purple', 'looplink-cta'),
      card('Join the Community Chat', 'Stay connected after the live session.', 'people', 'JOIN', 'cyan', 'community-cta'),
    ],
    callout: 'Thank you for joining Bema Hub Open Enrollment 2026.',
    footer: [['heart', 'Thank You for Being Part of the Loop'], ['signal', 'Create Connections'], ['music', 'Share Value'], ['people', 'Move Forward']],
  }
export const scene39 = {
  presenterZone: 'left',
  renderUnderlay() {
    const actions = [
      ['▣', 'Visit Your', 'Dashboard', 'bg-cyan-500', 'text-blue-600'],
      ['↗', 'Share Your', 'LoopLink', 'bg-violet-600', 'text-violet-600'],
      ['•••', 'Join the', 'Community Chat', 'bg-blue-700', 'text-blue-700'],
    ]
    return renderTailwindCanvas(`
      <div class="absolute inset-y-0 left-0 w-[30%] border-r border-white/30 bg-white/10" aria-label="Large presenter profile placement"></div>
      <div class="absolute right-12 top-9 z-40 flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3 text-xl font-black tracking-wide text-white shadow-xl"><span class="size-4 rounded-full bg-white"></span>END</div>
      <header class="absolute left-[30%] right-[28%] top-[110px] z-20 text-center">
        <h2 class="font-display text-[82px] font-black leading-[.9] tracking-[-.05em] text-[#071b59]">THE LOOP<br/><span class="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">CONTINUES.</span></h2>
        <div class="mx-auto mt-6 flex w-[480px] items-center gap-4 text-blue-500"><span class="h-1 flex-1 bg-blue-900"></span><span class="text-[34px]">∞</span><span class="h-1 flex-1 bg-blue-900"></span></div>
        <p class="mt-5 text-[27px] font-black leading-[1.25]">Keep creating. Keep connecting.<br/>Keep <span class="text-blue-600">moving value forward.</span></p>
      </header>
      <section class="absolute bottom-[135px] right-10 top-[100px] z-20 flex w-[27%] flex-col items-center">
        <div class="rounded-[24px] border-4 border-cyan-300 bg-white p-4 shadow-[0_0_30px_rgba(34,211,238,.45)]"><img class="size-[235px]" src="/assets/qr/main-join-qr.png" alt="Scan to continue with Bema Hub" /></div>
        <div class="mt-5 w-full space-y-4">${actions.map(([symbol, lineOne, lineTwo, iconColor, textColor]) => `<article class="grid h-[102px] grid-cols-[84px_1fr_34px] items-center gap-4 rounded-[20px] border border-sky-200 bg-white/95 px-5 shadow-xl"><span class="grid size-[72px] place-items-center rounded-full ${iconColor} text-[28px] font-black text-white">${symbol}</span><h3 class="text-[22px] font-black leading-[1.05]">${lineOne}<br/><span class="${textColor}">${lineTwo}</span></h3><b class="text-[38px]">›</b></article>`).join('')}</div>
      </section>
      <div class="absolute bottom-[155px] left-[32%] z-20 w-[36%] text-center"><div class="mx-auto grid size-[112px] place-items-center rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 text-[52px] font-black text-white shadow-xl">↻</div><p class="mt-5 text-[24px] font-black leading-tight">Thank you for joining<br/>Bema Hub <span class="text-blue-600">Open Enrollment 2026.</span></p></div>`)
  },
  renderForeground() { return renderTailwindForeground(['⌁ THANK YOU FOR BEING PART OF THE LOOP.', 'CREATE CONNECTIONS.', 'SHARE VALUE.', 'MOVE FORWARD.']) },
}
