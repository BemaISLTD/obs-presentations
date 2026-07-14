import { icon, renderBrand, renderForegroundBar, renderLiveBadge, renderQrCard } from '../components/broadcastChrome.js'

export function createLayeredScene(config) {
  return {
    presenterZone: 'left',

    renderUnderlay(context) {
      return `
        <section class="scene layered-scene layered-scene-${context.slide.id} layout-${config.layout} ${config.compact ? 'is-compact' : ''} ${config.darkPanel ? 'has-dark-panel' : ''}">
          ${renderBrand()}${renderLiveBadge()}
          <div class="layered-presenter-space" aria-label="Presenter camera placement"></div>
          <header class="layered-scene-heading">
            <h2>${config.title}</h2>
            <p>${config.subtitle}</p>
            <span class="layered-heading-rule">♥</span>
          </header>
          <div class="layered-content-grid" style="--item-count:${config.items.length};--grid-columns:${config.columns ?? getDefaultColumns(config.layout, config.items.length)}">
            ${config.items.map((item, index) => renderItem(item, index, config.layout)).join('')}
          </div>
          ${config.qr ? `<aside class="layered-qr">${renderQrCard('Scan to Join')}</aside>` : ''}
          ${config.callout ? `<div class="layered-callout">${icon('heart')}<strong>${config.callout}</strong></div>` : ''}
        </section>`
    },

    renderForeground(context) {
      return `
        <section class="scene-foreground layered-scene-foreground layered-scene-foreground-${context.slide.id}">
          <div class="layered-presenter-accent" aria-hidden="true"></div>
          ${renderForegroundBar(
            config.footer.map(([itemIcon, label]) => ({ icon: itemIcon, label })),
            config.utility ? 'LIVE NOW' : config.title.split(' ').slice(0, 3).join(' '),
          )}
        </section>`
    },
  }
}

function getDefaultColumns(layout, itemCount) {
  if (['stack', 'list', 'faq'].includes(layout)) return 1
  if (['flow', 'progress'].includes(layout)) return itemCount
  if (['tools', 'leaderboard'].includes(layout)) return 2
  if (layout === 'status') return itemCount > 4 ? 3 : 4
  if (layout === 'profiles') return 3
  return Math.min(itemCount, 3)
}

function renderItem(item, index, layout) {
  const value = item.value ? `<strong class="layered-card-value">${item.value}</strong>` : ''
  return `
    <article class="layered-card tone-${item.tone}" data-control-cue="${item.cue || `item-${index + 1}`}" style="--item-index:${index}">
      <div class="layered-card-icon">${icon(item.icon)}</div>
      <div class="layered-card-copy">
        ${layout === 'flow' || layout === 'progress' ? value : ''}
        <h3>${item.title}</h3>
        <p>${item.copy}</p>
      </div>
      ${layout === 'flow' ? '<span class="layered-flow-arrow">→</span>' : ''}
      ${layout !== 'flow' && layout !== 'progress' ? value : ''}
    </article>`
}
