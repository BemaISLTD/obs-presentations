export function renderTicker(items, variant = 'local') {
  const repeatedItems = [...items, ...items]
  const itemMarkup = repeatedItems
    .map((item) => `<span class="ticker-item"><span class="ticker-dot">•</span>${item}</span>`)
    .join('')

  return `
    <div class="ticker ticker-bar ${variant}-ticker" aria-label="Presentation ticker">
      <span class="ticker-label live-badge">Bema CORE Live</span>
      <div class="ticker-track">${itemMarkup}</div>
    </div>
  `
}