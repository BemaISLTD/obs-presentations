export function renderSpecSheet(slide, context) {
  if (slide.id === '01') {
    return renderSlide01SpecSheet(slide)
  }

  const bulletMarkup = slide.keyTerms
    .map((term) => `<span class="pill-label scene-tag">${term}</span>`)
    .join('')

  return `
    <section class="spec-sheet" aria-label="Storyboard specification sheet">
      <p class="eyebrow">Storyboard Specification Sheet</p>
      <h2 class="stage-title">${slide.title}</h2>
      <div class="spec-grid">
        <div class="spec-block">
          <span class="spec-label">Scene</span>
          <strong class="spec-value">${slide.id}</strong>
        </div>
        <div class="spec-block">
          <span class="spec-label">Mode</span>
          <strong class="spec-value">${context.mode}</strong>
        </div>
        <div class="spec-block">
          <span class="spec-label">Reference</span>
          <strong class="spec-value">${slide.referenceImage.split('/').pop()}</strong>
        </div>
        <div class="spec-block">
          <span class="spec-label">Presenter Layout</span>
          <strong class="spec-value">${context.presenterLayout}</strong>
        </div>
      </div>
      <p class="stage-subtitle muted">${slide.description}</p>
      <div class="scene-tags" style="margin-top: 16px;">${bulletMarkup}</div>
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
        <div class="spec-row">
          <span class="spec-label">${row.label}</span>
          <strong class="spec-value">${row.value}</strong>
        </div>
      `,
    )
    .join('')

  return `
    <section class="spec-sheet" aria-label="Storyboard specification sheet">
      <div class="spec-sheet-header">
        <p class="eyebrow">Storyboard Specification Sheet</p>
        <span class="pill-label spec-slide-no">Slide No. 01</span>
      </div>
      <h2 class="stage-title">${slide.title}</h2>
      <div class="spec-list">${rowMarkup}</div>
    </section>
  `
}