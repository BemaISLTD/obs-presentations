// Scene 08 owns these design primitives so it can be edited independently.
const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
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
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] !items-center overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 !flex-1 !basis-0 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join('')}
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

const STATS = [
  {
    cue: "highlight-active-campaigns",
    icon: "chart",
    value: "39",
    label: "Active Campaigns",
    detail: "Campaigns live and making impact",
    tone: "blue",
  },
  {
    cue: "highlight-changemakers",
    icon: "people",
    value: "10",
    label: "Changemakers",
    detail: "Leaders driving real change",
    tone: "cyan",
  },
  {
    cue: "highlight-builders",
    icon: "people",
    value: "12,450+",
    label: "Builders Active",
    liveKey: "builders",
    detail: "Community builders in action",
    tone: "purple",
  },
  {
    cue: "highlight-countries",
    icon: "signal",
    value: "37",
    label: "Countries Reached",
    detail: "Global reach, local impact",
    tone: "blue",
  },
  {
    cue: "highlight-looplocks",
    icon: "lock",
    value: "3,420",
    label: "Qualified LoopLocks",
    liveKey: "looplocks",
    detail: "Trusted connections created",
    tone: "cyan",
  },
  {
    cue: "highlight-impact",
    icon: "heart",
    value: "Recognized Impact",
    label: "Tracking Live",
    detail: "Impact verified and updated in real time",
    tone: "purple",
  },
];

export const scene08 = {
  presenterZone: "inset",

  renderUnderlay(context) {
    const insetSide = context.presenterInset === "right" ? "right" : "left";

    return sceneMarkup(`
      <section class="scene proof-scene scene08 proof-enter presenter-inset-${insetSide} absolute inset-0 overflow-hidden font-sans text-bema-navy">
        ${renderBrand()}${renderLiveBadge()}
        <header class="proof-heading scene08-heading">
          <h2>IMPACT STATISTICS</h2>
          <p>Real movement across the <strong>Bema Hub</strong> ecosystem.</p>
        </header>
        <div class="scene08-presenter-space" aria-label="Configurable presenter inset placement"></div>
        <div class="scene08-stat-grid">
          ${STATS.map(
            (stat, index) => `
            <article class="impact-card tone-${stat.tone} rounded-card border border-white/30 bg-white/90 shadow-card backdrop-blur-xl" data-control-cue="${stat.cue}" style="--card-index:${index}">

              <div class="reference-card-icon mb-5 grid size-20 place-items-center p-2 rounded-2xl bg-current/5 [&_.broadcast-icon]:size-20">${icon(stat.icon)}</div>
              <strong class="impact-value"${stat.liveKey ? ` data-live-stat="${stat.liveKey}"` : ''}>${stat.value}</strong>
              <h3 class="text-2xl font-bold">${stat.label}</h3>
              <p class="font-bold text-lg">${stat.detail}</p>
            </article>
          `,
          ).join("")}
        </div>
      </section>
    `);
  },

  renderForeground(context) {
    const insetSide = context.presenterInset === "right" ? "right" : "left";

    return sceneMarkup(`
      <section class="scene-foreground scene08-foreground presenter-inset-${insetSide}">
        <div class="presenter-inset-frame" aria-hidden="true"><span>PRESENTER</span></div>
        ${renderForegroundBar([
          { icon: "chart", label: "Impact Statistics" },
          { icon: "people", label: "<strong data-live-footer-stat=\"builders\">12,450+</strong> Builders Active" },
          { icon: "lock", label: "<strong data-live-footer-stat=\"looplocks\">3,420</strong> Qualified LoopLocks" },
          { icon: "music", label: "Creative value in motion" },
        ])}
      </section>
    `);
  },
};
