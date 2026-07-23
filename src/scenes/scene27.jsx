import { renderTailwindCanvas, renderTailwindForeground } from './tailwindBroadcastScene.jsx'

// Scene 27 owns these design primitives so it can be edited independently.
const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
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

function renderForegroundBar(items, lead = 'LIVE NOW', { audience = false, leadIcon = 'signal' } = {}) {
  return `
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] items-stretch overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      <div class="foreground-bar-lead flex min-w-[250px] items-center gap-3 bg-gradient-to-br from-bema-blue to-bema-purple px-7 [&_.broadcast-icon]:size-7"><strong class="text-base font-black tracking-wide">${lead}</strong></div>
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 flex-1 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join('')}
      ${audience ? `<div class="foreground-bar-audience flex min-w-[170px] items-center justify-center gap-2 border-l border-white/10 px-5 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon('people')}<strong class="text-xl">${audience}</strong><span class="text-[10px] leading-tight text-indigo-200">Watching<br>Live</span></div>` : ''}
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

const config = {
    title: 'EVENT DETAIL PAGE', subtitle: 'See the event story, schedule, and registration path.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Creative Futures Summit 2026', 'Inspire. Create. Impact.', 'signal', 'MAY 28', 'blue', 'event-hero'),
      card('Schedule', 'Opening Keynote · Builders in Action · From Idea to Impact', 'chart', '10:00–3:30', 'cyan', 'event-schedule'),
      card('What Attendees Get', 'Expert sessions · Resources · Networking · Recording access', 'heart', '4 BENEFITS', 'purple', 'event-benefits'),
      card('Register or Join', 'Free and open to all.', 'people', '128 REGISTERED', 'blue', 'event-cta'),
    ],
    footer: [['calendar', 'Event Detail'], ['clock', 'Schedule'], ['people', 'Register Now'], ['signal', 'Join Live']],
  }
export const scene27 = {
  presenterZone: 'left',
  renderUnderlay() {
    const schedule = [
      ['10:00 AM', 'Opening Keynote'],
      ['11:15 AM', 'Builders in Action'],
      ['1:00 PM', 'From Idea to Impact'],
      ['3:00 PM', 'Closing Reflections'],
    ]
    const benefits = [
      ['▶', 'Live expert sessions', 'bg-violet-100 text-violet-700'],
      ['▤', 'Practical resources', 'bg-cyan-100 text-cyan-700'],
      ['♙', 'Networking opportunities', 'bg-blue-100 text-blue-700'],
      ['☁', 'Recording access', 'bg-amber-100 text-amber-700'],
    ]
    return renderTailwindCanvas(`
      <div class="absolute inset-y-0 left-0 w-[30%] border-r border-white/30 bg-white/10" aria-label="Large presenter profile placement"></div>
      <header class="major-scene-heading absolute left-[29.5%] top-[155px] z-20 w-[19%] px-5 text-center">
        <h2 class="font-display text-[60px] font-black leading-[.9] tracking-[-.05em] text-[#071b59]"><span class="bg-gradient-to-r from-blue-600 to-violet-700 bg-clip-text text-transparent">EVENT</span><br/>DETAIL PAGE</h2>
        <div class="mx-auto mt-6 flex w-56 items-center gap-3 text-cyan-500"><span class="h-1 flex-1 bg-cyan-500"></span><span class="text-2xl">♥</span><span class="h-1 flex-1 bg-cyan-500"></span></div>
        <p class="mt-6 text-[24px] font-bold leading-[1.3] text-[#16255c]">See the event story,<br/>schedule, and<br/>registration path.</p>
      </header>
      <section class="absolute bottom-[130px] left-[48.5%] right-10 top-[88px] z-20 overflow-hidden rounded-[30px] border border-sky-200 bg-white/95 p-4 shadow-2xl">
        <p class="px-2 text-[14px] font-black text-blue-600">‹ Events　›　Creative Futures Summit 2026</p>
        <header class="mt-3 grid h-[225px] grid-cols-[1fr_270px] overflow-hidden rounded-[22px] bg-[linear-gradient(90deg,rgba(3,15,55,.98)_0%,rgba(3,15,55,.84)_45%,rgba(20,15,80,.22)_100%),url('/assets/generated/scene27-event-hero.png')] bg-cover bg-center p-6 text-white">
          <div><b class="rounded-md bg-violet-600 px-3 py-1 text-[13px]">LIVE EVENT</b><h3 class="mt-4 text-[34px] font-black leading-[1.05]">Creative Futures<br/>Summit 2026</h3><p class="mt-2 text-[18px] font-bold">Inspire. Create. Impact.</p></div>
          <div class="grid content-center gap-5 text-[16px] font-black drop-shadow-lg"><span>▣　May 28, 2026</span><span>◷　10:00 AM – 3:30 PM ET</span><span>⌖　Bema Hub Virtual Stage</span></div>
        </header>
        <div class="mt-3 grid h-[76px] grid-cols-[.85fr_1.15fr] items-center rounded-[16px] border border-slate-200 bg-white px-5 shadow-sm">
          <div class="flex items-center gap-3"><img class="size-12" src="/assets/logos/bemahub-reference-mark.svg" alt=""/><span><small class="block text-[13px] font-bold text-slate-500">Hosted by</small><strong class="text-[18px]">Bema Hub</strong></span></div>
          <div class="flex items-center border-l pl-5"><span><small class="block text-[13px] font-bold text-slate-500">Presented by</small><strong class="text-[17px]">Community creators</strong></span><div class="ml-auto flex -space-x-3">${['amina','jordan','tierra','marcus'].map((name) => `<img class="size-12 rounded-full border-2 border-white object-cover shadow" src="/assets/generated/changemaker-${name}.png" alt=""/>`).join('')}<b class="grid size-12 place-items-center rounded-full border-2 border-white bg-blue-50 text-[13px] text-blue-600">+5</b></div></div>
        </div>
        <div class="mt-3 grid h-[310px] grid-cols-[1.05fr_.95fr] gap-4">
          <article class="rounded-[18px] border border-sky-200 bg-white p-5 shadow-sm"><h4 class="text-[22px] font-black">Schedule</h4><div class="mt-2">${schedule.map(([time, label]) => `<div class="grid grid-cols-[92px_1fr] items-center border-b border-slate-200 py-3"><strong class="text-[15px] text-cyan-600">${time}</strong><span class="text-[16px] font-black">${label}</span></div>`).join('')}</div></article>
          <aside class="grid grid-rows-[78px_1fr] gap-3"><button class="rounded-[16px] bg-gradient-to-r from-blue-600 to-violet-600 text-[22px] font-black text-white shadow-lg">Register or Join　→<small class="mt-1 block text-[13px]">Free and open to all</small></button><article class="rounded-[18px] border border-sky-200 bg-white p-5 shadow-sm"><h4 class="text-[22px] font-black">What Attendees Get</h4><ul class="mt-3 space-y-3">${benefits.map(([symbol, label, color]) => `<li class="flex items-center gap-3 text-[17px] font-black"><span class="grid size-9 place-items-center rounded-full ${color}">${symbol}</span>${label}</li>`).join('')}</ul></article></aside>
        </div>
      </section>`)
  },
  renderForeground() { return renderTailwindForeground(['▣ Event Detail', '◷ Schedule', '♙ Register Now', '⌁ Join Live']) },
}
