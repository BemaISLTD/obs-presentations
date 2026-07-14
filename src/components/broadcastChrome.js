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
}

export function icon(name) {
  return `<span class="broadcast-icon" aria-hidden="true">${ICONS[name] ?? ICONS.signal}</span>`
}

export function renderBrand({ enrollment = false } = {}) {
  return `
    <div class="broadcast-brand">
      <img src="/assets/logos/bemahub-mark.svg" alt="" />
      <img class="broadcast-wordmark" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" />
      ${enrollment ? '<strong>OPEN ENROLLMENT</strong><small>Your Benefits. Your Future. Our Priority.</small>' : ''}
    </div>
  `
}

export function renderLiveBadge() {
  return '<div class="broadcast-live"><span></span>LIVE</div>'
}

export function renderForegroundBar(items, lead = 'LIVE NOW') {
  return `
    <div class="foreground-bar">
      <div class="foreground-bar-lead">${icon('signal')}<strong>${lead}</strong></div>
      ${items.map((item) => `<div class="foreground-bar-item">${icon(item.icon)}<span>${item.label}</span></div>`).join('')}
    </div>
  `
}

export function renderQrCard(title = 'Scan to Join Now') {
  return `
    <div class="proof-qr-card">
      <strong>${title}</strong>
      <img src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" />
    </div>
  `
}
