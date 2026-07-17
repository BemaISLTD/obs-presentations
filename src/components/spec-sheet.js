export function renderSpecSheet(slide, context) {
  if (slide.id === '01') {
    return renderSlide01SpecSheet(slide)
  }

  const bulletMarkup = slide.keyTerms
    .map((term) => `<span class="pill-label scene-tag inline-flex items-center rounded-full border border-bema-cyan/20 bg-gradient-to-br from-bema-cyan/10 to-bema-purple/10 px-3 py-1.5 text-sm font-bold text-bema-navy">${term}</span>`)
    .join('')

  return `
    <section class="spec-sheet relative z-[2] grid content-start gap-5 border-t border-sky-200/70 bg-white/85 px-16 py-10 font-sans text-bema-navy backdrop-blur-xl" aria-label="Storyboard specification sheet">
      <p class="eyebrow text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Storyboard Specification Sheet</p>
      <h2 class="stage-title font-display text-5xl font-black leading-none tracking-tight">${slide.title}</h2>
      <div class="spec-grid grid grid-cols-4 gap-4">
        <div class="spec-block rounded-card border border-sky-200/70 bg-white/80 p-5 shadow-card">
          <span class="spec-label block text-xs font-bold uppercase tracking-widest text-slate-500">Scene</span>
          <strong class="spec-value text-2xl font-black">${slide.id}</strong>
        </div>
        <div class="spec-block rounded-card border border-sky-200/70 bg-white/80 p-5 shadow-card">
          <span class="spec-label">Mode</span>
          <strong class="spec-value">${context.mode}</strong>
        </div>
        <div class="spec-block rounded-card border border-sky-200/70 bg-white/80 p-5 shadow-card">
          <span class="spec-label">Reference</span>
          <strong class="spec-value">${slide.referenceImage.split('/').pop()}</strong>
        </div>
        <div class="spec-block rounded-card border border-sky-200/70 bg-white/80 p-5 shadow-card">
          <span class="spec-label">Presenter Layout</span>
          <strong class="spec-value">${context.presenterLayout}</strong>
        </div>
      </div>
      <p class="stage-subtitle muted text-xl text-slate-600">${slide.description}</p>
      <div class="scene-tags mt-4 flex flex-wrap gap-2">${bulletMarkup}</div>
    </section>
  `
}

function renderSlide01SpecSheet(slide) {
  const rows = [
    {
      label: 'Scene Name',
      value: 'Live Stream Starting Soon Countdown',
    },
    {
      label: 'Purpose',
      value: 'Hold the audience in a branded pre-show state while live countdown, ticker, and prompts remain active.',
    },
    {
      label: 'Duration',
      value: '10 minutes',
    },
    {
      label: 'Presenter Script Summary',
      value: 'Host joins at 00:00 and welcomes Builders and Participants into today\'s Open Enrollment session.',
    },
    {
      label: 'Visual Layout',
      value: 'Top stage: logo, LIVE, title, countdown, stat cards, QR card, and ticker. Bottom: storyboard specification sheet.',
    },
    {
      label: 'Entry Animation',
      value: 'Soft wave drift, equalizer pulse, particles rise, and light streaks appear with low intensity.',
    },
    {
      label: 'During Scene',
      value: 'Countdown runs from 10:00, questions fade in/out, stat cards breathe, QR card glows every 6 seconds.',
    },
    {
      label: 'Exit Animation',
      value: 'Countdown reaches 00:00 and atmosphere effects stay subtle while transitioning to host welcome.',
    },
    {
      label: 'Success Criteria',
      value: 'Storyboard alignment is precise and live elements remain readable, functional, and on-brand.',
    },
  ]

  const rowMarkup = rows
    .map(
      (row) => `
        <div class="spec-row grid grid-cols-[260px_1fr] gap-6 border-b border-sky-100 py-3">
          <span class="spec-label text-xs font-bold uppercase tracking-widest text-slate-500">${row.label}</span>
          <strong class="spec-value text-base font-bold">${row.value}</strong>
        </div>
      `,
    )
    .join('')

  return `
    <section class="spec-sheet spec-sheet-slide01 relative z-[2] border-t border-sky-200/70 bg-white/90 px-16 py-8 font-sans text-bema-navy" aria-label="Storyboard specification sheet">
      <div class="spec-sheet-header flex items-center justify-between">
        <span class="spec-slide-index">SLIDE #: 01</span>
        <p class="eyebrow">Storyboard Specification Sheet</p>
      </div>
      <h2 class="stage-title">${slide.title}</h2>
      <div class="spec-list">${rowMarkup}</div>
    </section>
  `
}
