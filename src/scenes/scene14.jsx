// Scene 14 owns these design primitives so it can be edited independently.
const ICONS = {
  people:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  signal:
    '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  qr: '<svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2v2h-2zM19 14h2v4h-2zM14 19h4v2h-4zM20 20h1v1"/></svg>',
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
    <div class="proof-qr-card grid place-items-center gap-2 mt-16 rounded-card border border-sky-200/70 bg-white/95 p-4 text-center text-bema-navy shadow-card">
      <strong class="text-lg font-black uppercase tracking-wide">${title}</strong>
      <img class="size-[300px] rounded-xl bg-white p-1" src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" />
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

const LEVELS = [
  {
    title: "Participation Level",
    icon: "people",
    copy: "Start with core campaign value.",
    tone: "cyan",
  },
  {
    title: "VIP Access",
    icon: "heart",
    copy: "Go deeper into the creator experience.",
    tone: "blue",
  },
  {
    title: "Signature VIP",
    icon: "lock",
    copy: "Unlock the deepest access and exclusive assets.",
    tone: "purple",
  },
];

export const scene14 = {
  presenterZone: "left",

  renderUnderlay() {
    return sceneMarkup(`
      <section class="scene proof-scene scene14 proof-enter absolute inset-0 overflow-hidden font-sans text-bema-navy">
        ${renderBrand()}${renderLiveBadge()}
        <div class="scene14-presenter-space" aria-label="Presenter camera placement"></div>
        <header class="proof-heading scene14-heading">
          <h2>♪ LIVE ENROLLMENT ♪</h2>
          <p>Choose your access level and join today.</p>
          <span class="heading-rule">♥</span>
        </header>
        <div class="access-level-grid">
          ${LEVELS.map(
            (level, index) => `
            <article class="access-level-card tone-${level.tone} rounded-card border border-white/30 bg-white/90 shadow-card backdrop-blur-xl" style="--card-index:${index}">
              <h3 class="font-bold text-3xl">${level.title}</h3>
              ${icon(level.icon)}
              <p class="font-semibold text-xl">${level.copy}</p>
            </article>
          `,
          ).join("")}
        </div>
        <aside class="scene14-cta">
          ${renderQrCard()}
          <div class="builder-cta">${icon("people")}<p class="font-semibold text-lg"><strong class="font-semibold text-2xl">Join as a Builder.</strong><span>Help grow impact.<br />Earn recognition.<br />Build community.</span></p></div>
        </aside>
      </section>
    `);
  },

  renderForeground() {
    return sceneMarkup(
      renderForegroundBar(
        [
          { icon: "people", label: "Choose Your Access Level" },
          { icon: "qr", label: "Scan to Join" },
          { icon: "heart", label: "Join as a Builder" },
          { icon: "eye", label: "<strong>128</strong> Watching Live" },
        ],
        "LIVE ENROLLMENT",
      ),
    );
  },
};
