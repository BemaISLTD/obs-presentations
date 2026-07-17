export function renderTicker(items, variant = 'local') {
  const repeatedItems = [...items, ...items]
  const itemMarkup = repeatedItems
    .map((item) => `<span class="ticker-item inline-flex shrink-0 items-center gap-5 px-8 text-xl font-bold"><span class="ticker-dot text-bema-cyan">•</span>${item}</span>`)
    .join('')

  return `
    <div class="ticker ticker-bar ${variant}-ticker absolute inset-x-0 bottom-0 z-30 flex h-[74px] items-center overflow-hidden border-t border-white/20 bg-bema-deep-navy/95 font-sans text-white shadow-2xl backdrop-blur" aria-label="Presentation ticker">
      <span class="ticker-label live-badge relative z-10 inline-flex h-full shrink-0 items-center gap-2 bg-gradient-to-r from-bema-blue to-bema-purple px-8 text-base font-black uppercase tracking-wider before:size-2.5 before:animate-pulse before:rounded-full before:bg-bema-live before:content-['']">Bema CORE Live</span>
      <div class="ticker-track flex min-w-max items-center animate-[ticker-scroll_28s_linear_infinite]">${itemMarkup}</div>
    </div>
  `
}
