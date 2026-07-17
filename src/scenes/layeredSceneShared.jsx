import {
  icon,
  renderBrand,
  renderForegroundBar,
  renderLiveBadge,
  renderQrCard,
} from '../components/broadcastChrome.js'
import { sceneMarkup } from './SceneMarkup.jsx'

const TONE_CLASSES = Object.freeze({
  blue: 'border-blue-300/60 bg-gradient-to-br from-white to-blue-50 [&_.broadcast-icon]:text-bema-blue',
  cyan: 'border-cyan-300/60 bg-gradient-to-br from-white to-cyan-50 [&_.broadcast-icon]:text-cyan-600',
  purple: 'border-violet-300/60 bg-gradient-to-br from-white to-violet-50 [&_.broadcast-icon]:text-bema-purple',
  pink: 'border-pink-300/60 bg-gradient-to-br from-white to-pink-50 [&_.broadcast-icon]:text-pink-600',
  amber: 'border-amber-300/60 bg-gradient-to-br from-white to-amber-50 [&_.broadcast-icon]:text-amber-600',
  green: 'border-emerald-300/60 bg-gradient-to-br from-white to-emerald-50 [&_.broadcast-icon]:text-emerald-600',
})

const cardSurface = 'rounded-card border bg-white/90 shadow-card backdrop-blur transition duration-300'
const toneClasses = (tone) => TONE_CLASSES[tone] ?? TONE_CLASSES.blue

export { icon, renderBrand, renderQrCard }

export const card = (title, copy, iconName = 'signal', value = '', tone = 'blue', cue = '') => ({
  title,
  copy,
  icon: iconName,
  value,
  tone,
  cue,
})

export function renderLayeredUnderlay(id, config, body) {
  const dottedHeading = ['09', '12', '26', '27'].includes(id)
  return sceneMarkup(`
    <section class="scene layered-scene reference-built-scene reference-scene-${id} layout-${config.layout} absolute inset-0 overflow-hidden font-sans text-bema-navy ${config.compact ? 'is-compact' : ''} ${config.darkPanel ? 'has-dark-panel' : ''}">
      ${renderBrand()}${renderLiveBadge()}
      <div class="layered-presenter-space absolute inset-y-0 left-0 w-[34%]" aria-label="Presenter camera placement"></div>
      <header class="layered-scene-heading absolute z-10 text-center">
        <h2 class="font-display font-black tracking-[-.045em] text-bema-navy">${config.title}</h2>
        ${dottedHeading ? '<span class="layered-heading-rule">•</span>' : ''}
        <p class="font-semibold text-slate-600">${config.subtitle}</p>
        ${dottedHeading ? '' : '<span class="layered-heading-rule">♥</span>'}
      </header>
      <div class="reference-scene-body absolute z-10"><div class="scene-card-composition scene-card-composition-${id} h-full w-full" data-scene-card-design="${id}">${body}</div></div>
      ${config.qr && !['27', '34', '37', '39'].includes(id) ? `<aside class="layered-qr">${renderQrCard('Scan to Join')}</aside>` : ''}
      ${config.callout && !['06', '11', '15'].includes(id) ? `<div class="layered-callout">${icon('heart')}<strong>${config.callout}</strong></div>` : ''}
    </section>`)
}

export function renderLayeredForeground(id, config) {
  const items = config.footer.map(([itemIcon, label]) => ({ icon: itemIcon, label }))
  const lead = config.footerLead ?? (config.utility ? 'LIVE NOW' : config.title.split(' ').slice(0, 3).join(' '))
  return sceneMarkup(`<section class="scene-foreground layered-scene-foreground layered-scene-foreground-${id} pointer-events-none absolute inset-0 font-sans"><div class="layered-presenter-accent" aria-hidden="true"></div>${renderForegroundBar(items, lead, { audience: config.audience, leadIcon: config.footerLeadIcon })}</section>`)
}

export function renderFeatureCards(id, config) {
  return `<div class="reference-feature-grid columns-${config.columns ?? config.items.length} grid h-full gap-5">${config.items.map((item, index) => `<article class="reference-feature-card tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative overflow-hidden p-7" data-control-cue="${item.cue}" style="--item-index:${index}"><div class="reference-card-icon mb-5 grid size-16 place-items-center rounded-2xl bg-current/5 [&_.broadcast-icon]:size-9">${icon(item.icon)}</div><h3 class="text-2xl font-black tracking-tight">${item.title}</h3><p class="mt-3 text-base leading-relaxed text-slate-600">${item.copy}</p>${item.value ? `<strong class="reference-pill mt-5 inline-flex rounded-full bg-bema-navy px-3 py-1 text-sm font-black text-white">${item.value}</strong>` : ''}<span class="reference-card-link mt-6 inline-flex items-center gap-2 text-sm font-black text-bema-blue">${id === '09' ? 'Explore program' : id === '19' ? 'View what is included' : 'Learn more'} <b>→</b></span></article>`).join('')}</div>`
}

export function renderFlow(id, config) {
  return `<div class="reference-flow reference-flow-${id}"><div class="reference-flow-line"></div>${config.items.map((item, index) => `<article class="reference-flow-step tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative grid place-items-center p-6 text-center" data-control-cue="${item.cue}" style="--item-index:${index}"><strong class="reference-flow-index">${item.value}</strong><div class="reference-flow-icon">${icon(item.icon)}</div><h3>${item.title}</h3><p>${item.copy}</p>${index < config.items.length - 1 ? '<span class="reference-flow-arrow">→</span>' : ''}</article>`).join('')}</div>`
}

export function renderTierTrack(config) {
  return `<div class="reference-tier-track"><div class="reference-tier-line"><span></span></div>${config.items.map((item, index) => `<article class="reference-tier tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative grid place-items-center p-5 text-center" data-control-cue="${item.cue}" style="--item-index:${index}"><div class="reference-tier-medal">${icon(item.icon)}</div><strong>${item.title}</strong><span>${item.copy}</span><small>${item.value}</small></article>`).join('')}</div>`
}

export function renderAccessLadder(config) {
  return `<div class="reference-access-layout"><div class="reference-access-intro"><strong>ACCESS<br />LEVELS</strong><p>The vertical climb within the campaign.</p><span>Choose the experience that fits you.</span></div><div class="reference-access-ladder">${config.items.map((item, index) => `<article class="reference-access-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-6 p-6" data-control-cue="${item.cue}" style="--item-index:${index}"><strong class="reference-access-rank">${item.value}</strong><div>${icon(item.icon)}</div><section><h3>${item.title}</h3><p>${item.copy}</p><small>${index === 0 ? 'CORE ACCESS' : index === 1 ? 'DEEPER EXPERIENCE' : 'DEEPEST ACCESS'}</small></section></article>`).join('')}</div></div>`
}

export function renderStatus(id, config) {
  return `<div class="reference-status-panel"><div class="reference-status-rail"></div>${config.items.map((item, index) => `<article class="reference-status-row tone-${item.tone} ${cardSurface} ${toneClasses(item.tone)} relative flex items-center gap-5 p-5" data-control-cue="${item.cue}" style="--item-index:${index}"><span class="reference-status-dot">${icon(item.icon)}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><strong>${item.value}</strong><span class="reference-status-check">${id === '23' && index === 3 ? '×' : '✓'}</span></article>`).join('')}</div>`
}

export function renderAppShell(content) {
  return `<div class="reference-app-shell"><div class="reference-app-topbar"><span class="reference-app-logo">bema<span>Hub</span></span><label>Search Bema Hub</label><i></i><i></i><b>JR</b></div><nav class="reference-app-sidebar"><strong>Overview</strong><span>Home</span><span>Campaigns</span><span>Events</span><span>Changemakers</span><span>My Impact</span><small>ACCOUNT</small><span>Messages</span><span>Settings</span></nav><main class="reference-app-content">${content}</main></div>`
}
