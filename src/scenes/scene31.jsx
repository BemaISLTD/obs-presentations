import { renderTailwindForeground, renderTailwindUnderlay } from './tailwindBroadcastScene.jsx'

// Scene 31 owns these design primitives so it can be edited independently.
const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
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
    title: 'BUILDER PROGRESS TRACKER', subtitle: 'See your path across Community Builder Tiers.', layout: 'progress',
    items: [
      card('Builder', '1 LoopLock completed', 'people', '0%', 'cyan', 'current-tier'),
      card('Advocate', '3 LoopLocks completed', 'signal', '25%', 'blue', 'advance-progress'),
      card('Champion', '7 LoopLocks completed', 'chart', '50%', 'purple', 'advance-progress'),
      card('Partner', '15 LoopLocks in progress', 'heart', '75%', 'blue', 'current-tier'),
      card('Partner Elite', '30 LoopLocks next target', 'lock', '100%', 'purple', 'next-target'),
    ],
    callout: 'Next target: 15 LoopLocks to reach Partner.',
    footer: [['people', 'Builder Progress'], ['chart', 'LoopLock Milestones'], ['lock', 'Next Target']],
  }
export const scene31 = {
  presenterZone: 'left',
  renderUnderlay() {
    const milestones = [['1', 'Completed'], ['3', 'Completed'], ['7', 'Completed'], ['15', 'In Progress'], ['30', 'Next Target']]
    const body = `<section class="mx-auto grid h-[570px] max-w-[1200px] grid-rows-[150px_145px_1fr] overflow-hidden rounded-[30px] border border-sky-200 bg-white/95 p-7 shadow-2xl">
      <div class="relative grid grid-cols-5 items-start gap-5 before:absolute before:left-[9%] before:right-[9%] before:top-[48px] before:h-[4px] before:bg-gradient-to-r before:from-cyan-400 before:via-blue-600 before:to-violet-600">${config.items.map((item, index) => `<article class="relative z-10 grid justify-items-center text-center"><span class="grid size-[96px] place-items-center rounded-full border-4 border-white ${index === 2 ? 'scale-110 bg-violet-50 text-violet-600 shadow-[0_0_0_3px_#8b5cf6,0_8px_25px_rgba(109,40,217,.35)]' : index === 4 ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-blue-600'} [&_.broadcast-icon]:size-12">${icon(item.icon)}</span><strong class="mt-4 text-[21px] font-black ${index === 2 ? 'text-violet-600' : ''}">${item.title}</strong></article>`).join('')}</div>
      <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5"><header class="flex items-center justify-between"><strong class="text-lg">YOUR PROGRESS</strong><b class="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white shadow-lg">CURRENT POSITION</b></header><div class="mt-4 h-5 overflow-hidden rounded-full bg-slate-200"><span class="block h-full w-[52%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600"></span></div><footer class="mt-2 flex justify-between text-sm font-bold"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></footer></div>
      <div class="pt-5"><h3 class="text-lg font-black">LOOPLOCK MILESTONES</h3><div class="mt-4 grid grid-cols-[repeat(5,1fr)_170px] items-stretch gap-4">${milestones.map(([value, status], index) => `<article class="grid justify-items-center text-center"><span class="grid size-16 place-items-center rounded-full ${index < 3 ? 'bg-cyan-50 text-cyan-600' : index === 3 ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-400'} [&_.broadcast-icon]:size-8">${icon(index < 3 ? 'signal' : 'lock')}</span><strong class="mt-3 text-base">${value} LoopLock${value === '1' ? '' : 's'}</strong><small class="mt-1 font-bold ${index === 3 ? 'text-violet-600' : 'text-slate-500'}">${status}</small></article>`).join('')}<aside class="grid place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-100 p-4 text-center"><small class="font-black">NEXT TARGET</small><strong class="text-5xl font-black text-violet-600">15</strong><span class="font-bold">LoopLocks<br/>to reach Partner</span></aside></div></div>
    </section>`
    return renderTailwindUnderlay({ title: 'BUILDER<br/>PROGRESS TRACKER', subtitle: config.subtitle, body, titleClass: '[&_h2]:!text-[68px]' })
  },
  renderForeground() { return renderTailwindForeground(['♧ Builder Progress', '↗ LoopLocks', '♙ Community Builder Tiers', '⌁ Next Tier']) },
}
