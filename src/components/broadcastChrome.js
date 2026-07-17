const ICONS = {
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.4-4 2.3-6 6-6s5.6 2 6 6M14 14c3.8-.7 6.1 1 6.5 4.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  signal: '<svg viewBox="0 0 24 24"><path d="M5 9a5 5 0 0 0 0 6M2 6a9 9 0 0 0 0 12M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-8M22 20V2M2 20h22"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  qr: '<svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2v2h-2zM19 14h2v4h-2zM14 19h4v2h-4zM20 20h1v1"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  audio: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10H4zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>',
  wifi: '<svg viewBox="0 0 24 24"><path d="M2 8a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.2 5.2 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.5-5 3.2-7.5 8-7.5s7.5 2.5 8 7.5"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 7V3l-2.2 2.2A8 8 0 1 0 20 14M4 17v4l2.2-2.2"/></svg>',
  creator: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20c.4-4.2 2.4-6.3 6-6.3 2.1 0 3.7.7 4.7 2.1M17 4v10M17 4l4-1v3l-4 1M17 14c-2.6 0-3.5 1-3.5 2.3s1.1 2.2 2.6 2.2c1.8 0 2.9-1 2.9-2.8"/></svg>',
  sprout: '<svg viewBox="0 0 24 24"><path d="M12 21V9M12 12c-5 0-8-2.5-8-7 5 0 8 2.3 8 7Zm0 3c5 0 8-2.5 8-7-5 0-8 2.3-8 7ZM7 21h10"/></svg>',
  access: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20c.4-4.2 2.4-6.3 6-6.3 2.3 0 4 .8 5 2.4M15 12l1.5-4 2 2 2.5-2-1 5h-5Z"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v9H6V2Zm8 0v5h5M12 9v10m0 0-4-4m4 4 4-4M4 21h16"/></svg>',
  thumb: '<svg viewBox="0 0 24 24"><path d="M8 10 12 3c2 0 3 1.2 2.5 3L14 9h5c1.7 0 2.6 1.2 2.2 2.8l-1.5 6c-.3 1.3-1.2 2.2-2.7 2.2H8V10Zm0 0H3v10h5"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24"><path d="M6 3h12M6 21h12M7 3c0 4 1.6 6.5 5 9-3.4 2.5-5 5-5 9m10-18c0 4-1.6 6.5-5 9 3.4 2.5 5 5 5 9"/></svg>',
  award: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8M12 5v8M8 9h8"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="m3 11 18-8-7 18-3-7-8-3Zm8 3 10-11"/></svg>',
  diamond: '<svg viewBox="0 0 24 24"><path d="m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18M8 8l4-5 4 5"/></svg>',
  scale: '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 6h14M4 21h16M6 6l-4 8h8L6 6Zm12 0-4 8h8l-4-8Z"/></svg>',
  document: '<svg viewBox="0 0 24 24"><path d="M6 2h9l4 4v16H6V2Zm9 0v5h5M9 11h7M9 15h7M9 19h5"/></svg>',
  question: '<svg viewBox="0 0 24 24"><path d="M4 4h16v13H9l-5 4V4Z"/><path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.7M12 16h.01"/></svg>',
  play: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24"><path d="m4 13 13 5V5L4 10v3ZM17 9c2 0 3 1 3 2.5S19 14 17 14M7 14l1 5h4l-2-4"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></svg>',
  crown: '<svg viewBox="0 0 24 24"><path d="m3 7 5 4 4-7 4 7 5-4-2 11H5L3 7ZM5 21h14"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2c0 3 2 4 5 4M16 6h4v2c0 3-2 4-5 4M12 13v5M8 21h8M9 18h6"/></svg>',
  handshake: '<svg viewBox="0 0 24 24"><path d="m3 8 4-3 4 2 2-1 4 2 4 4-6 6-3-2-2 1-7-7V8ZM8 13l3-3 5 5M10 17l-2 2M13 18l-1 2"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.2 8.5 8 11 4.8-2.5 8-6 8-11V5l-8-3Z"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="3"/><path d="m13 11 7-7M16 4h4v4"/></svg>',
  gift: '<svg viewBox="0 0 24 24"><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15M12 6H8.5a2.5 2.5 0 1 1 2.5-2.5L12 6Zm0 0h3.5A2.5 2.5 0 1 0 13 3.5L12 6Z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/></svg>',
}

export function icon(name) {
  return `<span class="broadcast-icon inline-grid shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.8]" data-icon-name="${name}" data-icon-fallback="${ICONS[name] ? 'false' : 'true'}" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`
}

export function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand absolute left-[62px] top-[42px] z-20 flex items-center gap-3 font-sans text-bema-navy">
      <img class="h-14 w-auto" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
      <img class="broadcast-wordmark h-9 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" />
      ${enrollment ? '<strong class="ml-3 border-l border-current/20 pl-4 text-sm font-black tracking-[.14em]">OPEN ENROLLMENT</strong><small class="text-xs font-semibold opacity-70">Your Benefits. Your Future. Our Priority.</small>' : ''}
    </div>
  `
}

export function renderLiveBadge() {
  return '<div class="broadcast-live absolute right-[62px] top-[46px] z-20 inline-flex items-center gap-2 rounded-full border border-red-200/50 bg-white/90 px-4 py-2 text-sm font-black tracking-[.14em] text-bema-live shadow-lg backdrop-blur"><span class="size-2.5 animate-pulse rounded-full bg-bema-live shadow-[0_0_12px_rgba(255,45,31,.7)]"></span>LIVE</div>'
}

export function renderForegroundBar(items, lead = 'LIVE NOW', { audience = false, leadIcon = 'signal' } = {}) {
  return `
    <div class="foreground-bar absolute inset-x-[42px] bottom-[18px] z-30 flex h-[86px] items-stretch overflow-hidden rounded-[22px] border border-white/15 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur-xl">
      <div class="foreground-bar-lead flex min-w-[250px] items-center gap-3 bg-gradient-to-br from-bema-blue to-bema-purple px-7 [&_.broadcast-icon]:size-7"><strong class="text-base font-black tracking-wide">${lead}</strong></div>
      ${items.map((item) => `<div class="foreground-bar-item flex min-w-0 flex-1 items-center justify-center gap-3 border-l border-white/10 px-5 text-center text-sm font-bold text-indigo-50 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon(item.icon)}<span>${item.label}</span></div>`).join('')}
      ${audience ? `<div class="foreground-bar-audience flex min-w-[170px] items-center justify-center gap-2 border-l border-white/10 px-5 [&_.broadcast-icon]:size-6 [&_.broadcast-icon]:text-bema-cyan">${icon('people')}<strong class="text-xl">${audience}</strong><span class="text-[10px] leading-tight text-indigo-200">Watching<br>Live</span></div>` : ''}
    </div>
  `
}

export function renderQrCard(title = 'Scan to Join Now') {
  return `
    <div class="proof-qr-card grid place-items-center gap-2 rounded-card border border-sky-200/70 bg-white/95 p-4 text-center text-bema-navy shadow-card">
      <strong class="text-sm font-black uppercase tracking-wide">${title}</strong>
      <img class="size-[130px] rounded-xl bg-white p-1" src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" />
    </div>
  `
}
