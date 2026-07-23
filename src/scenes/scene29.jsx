import { renderTailwindForeground, renderTailwindUnderlay } from './tailwindBroadcastScene.jsx'

// Scene 29 owns these design primitives so it can be edited independently.
const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/></svg>',
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
    title: 'CREATOR STORIES & PROOF UPDATES', subtitle: 'Real updates. Real delivery. Real creative value.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('Recent Creator Stories', 'Maya wrapped the brand anthem · Tariq is finalizing edits · Aisha delivers social assets today', 'people', '3 NEW', 'blue', 'story-1'),
      card('Recent Proof Updates', 'Campaign video draft · Social post set · Motion graphics preview', 'signal', 'LIVE', 'cyan', 'proof-update'),
      card('Delivery Status', 'Campaign Video 100% · Social Assets 85% · Influencer Clips 60%', 'chart', 'ON TRACK', 'purple', 'delivery-status'),
      card('Creator Spotlight', 'Jamal K. · Video Producer', 'music', '38 CREATORS', 'blue', 'creator-spotlight'),
      card('Progress Highlights', '92% of deliverables are on track.', 'heart', '92%', 'cyan', 'delivery-status'),
    ],
    footer: [['people', 'Creator Stories'], ['signal', 'Proof Updates'], ['chart', 'Real Delivery'], ['heart', 'Mutual Exchange']],
  }
export const scene29 = {
  presenterZone: 'left',
  renderUnderlay() {
    const stories = [
      { name: 'Maya J.', time: '2h ago', copy: 'Wrapped up the brand anthem! On to motion graphics next.', likes: 24, portrait: '/assets/generated/changemaker-amina.png', image: '/assets/generated/creator-story-concert.jpg' },
      { name: 'Tariq L.', time: '5h ago', copy: 'Finalizing the campaign edits. Excited to share the final cut!', likes: 31, portrait: '/assets/generated/changemaker-jordan.png', image: '/assets/generated/creator-story-producer.jpg' },
      { name: 'Aisha R.', time: '1d ago', copy: 'Delivering social assets today! Stay tuned for live results.', likes: 27, portrait: '/assets/generated/changemaker-tierra.png', image: '/assets/generated/proof-microphone.jpg' },
    ]
    const proofs = [
      ['Campaign video draft delivered', '/assets/generated/creator-story-concert.jpg', '2h ago'],
      ['Social post set v2 complete', '/assets/generated/proof-microphone.jpg', '4h ago'],
      ['Motion graphics preview', '/assets/generated/creator-story-producer.jpg', '6h ago'],
      ['Influencer clips batch 1', '/assets/generated/proof-crowd.jpg', '1d ago'],
    ]
    const body = `<div class="grid h-full grid-cols-12 grid-rows-[310px_220px] content-center gap-4">
      <section class="col-span-7 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl"><h3 class="text-lg font-black">RECENT CREATOR STORIES</h3><div class="mt-3 grid grid-cols-3 gap-3">${stories.map((story) => `<article class="overflow-hidden rounded-xl border border-slate-200 bg-white p-3"><header class="flex items-center gap-2"><img class="size-10 rounded-full object-cover" src="${story.portrait}" alt="${story.name}"/><strong>${story.name}</strong><small class="ml-auto text-slate-500">${story.time}</small></header><p class="mt-2 h-[62px] text-[13px] font-semibold leading-snug">${story.copy}</p><img class="mt-2 h-[88px] w-full rounded-lg object-cover" src="${story.image}" alt=""/><span class="mt-2 block text-sm font-black text-rose-500">♥ ${story.likes}</span></article>`).join('')}</div></section>
      <section class="col-span-5 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl"><h3 class="text-lg font-black">RECENT PROOF UPDATES</h3><div class="mt-2 grid gap-2">${proofs.map(([label, image, time]) => `<article class="grid grid-cols-[64px_1fr_30px] items-center gap-3 border-b border-slate-200 py-2"><img class="h-11 w-16 rounded-md object-cover" src="${image}" alt=""/><span><strong class="block text-sm">${label}</strong><small class="text-slate-500">${time}</small></span><b class="grid size-7 place-items-center rounded-full bg-cyan-500 text-white">✓</b></article>`).join('')}</div></section>
      <section class="col-span-4 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl"><h3 class="text-base font-black">DELIVERY STATUS</h3>${[['Campaign Video',100,'Delivered'],['Social Assets',85,'In Review'],['Influencer Clips',60,'In Progress']].map(([label,value,status], index) => `<div class="mt-3"><div class="flex items-center text-xs font-bold"><span>${label}</span><b class="ml-auto">${value}%</b><em class="ml-2 rounded-full ${index === 0 ? 'bg-cyan-50 text-cyan-600' : 'bg-violet-50 text-violet-600'} px-2 py-1 not-italic">${status}</em></div><div class="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><i class="block h-full rounded-full ${index === 0 ? 'bg-cyan-500 w-full' : index === 1 ? 'bg-blue-600 w-[85%]' : 'bg-violet-600 w-3/5'}"></i></div></div>`).join('')}</section>
      <section class="col-span-4 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl"><h3 class="text-base font-black">CREATOR SPOTLIGHT</h3><div class="mt-3 flex items-center gap-3"><img class="size-16 rounded-full object-cover" src="/assets/generated/changemaker-darnell.png" alt="Jamal K."/><strong class="text-lg">Jamal K.<small class="block text-xs text-blue-600">Video Producer</small></strong></div><p class="mt-3 text-[13px] font-semibold leading-relaxed">“Bema Hub makes it easy to collaborate, share updates, and deliver real impact.”</p><span class="mt-2 block tracking-[.2em] text-amber-500">★★★★★</span></section>
      <section class="col-span-4 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl"><h3 class="text-base font-black">PROGRESS HIGHLIGHTS</h3>${[['chart','14','Projects Active'],['people','38','Creators Engaged'],['check','92%','Deliverables On Track']].map(([name,value,label], index) => `<div class="mt-2 flex items-center gap-3 border-b pb-2"><span class="grid size-10 place-items-center rounded-full ${index === 1 ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'} [&_.broadcast-icon]:size-6">${icon(name)}</span><strong class="text-xl ${index === 0 ? 'text-cyan-600' : index === 1 ? 'text-blue-600' : 'text-violet-600'}">${value}<small class="ml-2 text-xs text-[#14255d]">${label}</small></strong></div>`).join('')}</section>
    </div>`
    return renderTailwindUnderlay({ title: 'CREATOR STORIES<br/>& PROOF UPDATES', subtitle: config.subtitle, body })
  },
  renderForeground() { return renderTailwindForeground(['◌ Creator Stories', '▤ Proof Updates', '▧ Real Delivery', '⟳ Mutual Exchange']) },
}
