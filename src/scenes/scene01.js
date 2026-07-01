export const scene01 = {
  render(context) {
    const waveBars = createWaveBars(56)
    const eqBars = createEqBars(32)
    const particles = createParticles(24)
    const broadcastTickerItems = [
      '1,246 builders online',
      '342 in chat',
      '37 countries building together',
      'Opening at 10:00',
      'Say hello in chat',
    ]
    const statIcons = ['AC', 'BE', 'EL', 'GQ']

    const metricCards = context.metrics.countdown.stats
      .map(
        (item, index) => `
          <article class="bema-card glass-card stat-card scene01-stat-card soft-glow" style="--delay:${index * 0.35}s">
            <div class="scene01-stat-icon" aria-hidden="true">${statIcons[index] ?? 'BH'}</div>
            <div class="scene01-stat-copy">
              <span class="eyebrow">${item.label}</span>
              <strong>${item.value}</strong>
              <p class="muted">${item.detail}</p>
            </div>
          </article>
        `,
      )
      .join('')

    const firstPrompt = context.questions[0] ?? {
      id: '01',
      question: 'Where are you building from today?',
      subtext: 'Drop your city or country in chat.',
      placement: 'lower_right',
      animation_in: 'fadeUp',
      animation_out: 'fadeDown',
      hold_effect: 'floatSlow',
      easing: 'easeOutCubic',
      animation_in_duration_ms: 650,
      animation_out_duration_ms: 500,
      background_cue: 'soft_cyan_pulse',
      qr_visibility: 'visible',
      ticker_override: '',
      api_trigger: '',
    }

    return `
      <section class="scene scene01">
        <div class="scene01-atmosphere" aria-hidden="true">
          <div class="scene01-stage-aura"></div>
          <div class="scene01-light-streak"></div>
          <div class="scene01-wave-track">${waveBars}</div>
          <div class="scene01-equalizer">${eqBars}</div>
          <div class="particle-layer scene01-particles">${particles}</div>
        </div>

        <header class="scene01-top">
          <div class="scene01-brand">
            <span class="scene01-logo-core" aria-hidden="true"></span>
            <div class="scene01-wordmark" aria-label="bemaHub">
              <strong><span class="scene01-wordmark-bema">bema</span><span class="scene01-wordmark-hub">Hub</span></strong>
            </div>
          </div>
          <div class="live-badge scene01-live-badge">LIVE</div>
        </header>

        <div class="scene01-layout">
          <div class="scene01-left-column">
            <section class="scene01-stats-grid">
              ${metricCards}
            </section>
          </div>

          <section class="scene01-center-column">
            <div class="scene01-heading">
              <h2 class="stage-title">
                <span>BEMA HUB</span>
                <span>OPEN ENROLLMENT</span>
                <span>2026</span>
              </h2>
              <p class="stage-subtitle">Stronger benefits. Built together.</p>
            </div>

            <section class="scene01-countdown-hero" aria-label="Countdown hero">
              <p class="scene01-countdown-label">We start in</p>
              <div class="countdown-clock" data-countdown-duration="${context.metrics.countdown.durationSeconds ?? 600}">
                <span class="clock-segment" data-clock-minutes>10</span>
                <span class="clock-divider">:</span>
                <span class="clock-segment" data-clock-seconds>00</span>
              </div>
              <div class="scene01-stage-platform" aria-hidden="true">
                <span class="scene01-stage-ring ring-outer"></span>
                <span class="scene01-stage-ring ring-inner"></span>
                <span class="scene01-stage-ring ring-core"></span>
              </div>
            </section>
          </section>

          <aside class="scene01-right-column">
            <section class="bema-card glass-card qr-card soft-glow scene01-qr-card">
              <h3 class="scene01-qr-title">Scan to join the conversation</h3>
              <div class="qr-row">
                <div class="qr-visual" aria-hidden="true"></div>
              </div>
              <div class="pill-row scene01-qr-pills">
                <span class="pill-label tag">${context.metrics.countdown.qr.codeLabel}</span>
                <span class="pill-label tag">Builders Live</span>
              </div>
            </section>
          </aside>
        </div>

        <section
          class="bema-card glass-card question-card scene01-question-wrap placement-${normalizeToken(firstPrompt.placement)} anim-in-${normalizeToken(firstPrompt.animation_in)} anim-out-${normalizeToken(firstPrompt.animation_out)} hold-${normalizeToken(firstPrompt.hold_effect)} ease-${normalizeToken(firstPrompt.easing)}"
          data-countdown-question
          style="--in-duration:${firstPrompt.animation_in_duration_ms}ms;--out-duration:${firstPrompt.animation_out_duration_ms}ms"
        >
          <div class="countdown-questions-title">
            <p class="eyebrow">Where are you building from?</p>
            <p class="muted" data-question-window>${firstPrompt.start_time || '00:00'}-${firstPrompt.end_time || '00:00'}</p>
          </div>
          <article class="countdown-question is-visible">
            <span class="eyebrow" data-question-index>Prompt ${firstPrompt.id}</span>
            <p data-question-text>${firstPrompt.question}</p>
            <p class="muted" data-question-subtext>${firstPrompt.subtext || ''}</p>
          </article>
        </section>

        ${renderBroadcastTicker(broadcastTickerItems)}
      </section>
    `
  },

  setup(root, context) {
    const countdownRoot = root.querySelector('[data-countdown-duration]')
    const minuteNode = countdownRoot?.querySelector('[data-clock-minutes]')
    const secondNode = countdownRoot?.querySelector('[data-clock-seconds]')
    const questionWrap = root.querySelector('[data-countdown-question]')
    const questionPanel = questionWrap?.querySelector('.countdown-question')
    const questionTextNode = root.querySelector('[data-question-text]')
    const questionIndexNode = root.querySelector('[data-question-index]')
    const questionSubtextNode = root.querySelector('[data-question-subtext]')
    const questionWindowNode = root.querySelector('[data-question-window]')
    const qrCard = root.querySelector('.scene01-qr-card')
    const sceneRoot = root.querySelector('.scene01')
    const tickerTrack = root.querySelector('.scene01-ticker .ticker-track')

    if (!countdownRoot || !minuteNode || !secondNode) {
      return
    }

    const totalDuration = Number(countdownRoot.dataset.countdownDuration || 600)
    const prompts = context?.questions?.length
      ? context.questions
      : [{
          id: '01',
          question: 'Where are you building from today?',
          subtext: 'Drop your city or country in chat.',
          placement: 'lower_right',
          animation_in: 'fadeUp',
          animation_out: 'fadeDown',
          hold_effect: 'floatSlow',
          easing: 'easeOutCubic',
          animation_in_duration_ms: 650,
          animation_out_duration_ms: 500,
          background_cue: 'soft_cyan_pulse',
          qr_visibility: 'visible',
          ticker_override: '',
          api_trigger: '',
          start_sec: 0,
          duration_sec: totalDuration,
          start_time: '00:00',
          end_time: '10:00',
        }]
    let remainingSeconds = totalDuration
    let activePromptId = null
    const defaultTickerMarkup = tickerTrack?.innerHTML ?? ''

    const applyPrompt = (prompt) => {
      if (!questionWrap || !questionTextNode || !questionIndexNode || !prompt || prompt.id === activePromptId) {
        return
      }

      const placementClass = `placement-${normalizeToken(prompt.placement || 'lower_right')}`
      const inClass = `anim-in-${normalizeToken(prompt.animation_in || 'fadeUp')}`
      const outClass = `anim-out-${normalizeToken(prompt.animation_out || 'fadeDown')}`
      const holdClass = `hold-${normalizeToken(prompt.hold_effect || 'floatSlow')}`
      const easeClass = `ease-${normalizeToken(prompt.easing || 'easeOutCubic')}`
      const classesToRemove = [...questionWrap.classList].filter((name) => (
        name.startsWith('placement-') ||
        name.startsWith('anim-in-') ||
        name.startsWith('anim-out-') ||
        name.startsWith('hold-') ||
        name.startsWith('ease-')
      ))

      questionWrap.classList.remove(...classesToRemove)
      questionWrap.classList.add(placementClass, inClass, outClass, holdClass, easeClass)
      questionWrap.style.setProperty('--in-duration', `${prompt.animation_in_duration_ms || 600}ms`)
      questionWrap.style.setProperty('--out-duration', `${prompt.animation_out_duration_ms || 450}ms`)

      questionPanel?.classList.remove('is-visible')
      window.clearTimeout(window.__bemahubQuestionFade)
      window.__bemahubQuestionFade = window.setTimeout(() => {
        questionIndexNode.textContent = `Prompt ${prompt.id}`
        questionTextNode.textContent = prompt.question
        if (questionSubtextNode) {
          questionSubtextNode.textContent = prompt.subtext || ''
        }
        if (questionWindowNode) {
          questionWindowNode.textContent = `${prompt.start_time || '--:--'}-${prompt.end_time || '--:--'}`
        }
        questionPanel?.classList.add('is-visible')
      }, 220)

      const cueClassPrefix = 'bg-cue-'
      const cueClasses = [...sceneRoot.classList].filter((name) => name.startsWith(cueClassPrefix))
      sceneRoot.classList.remove(...cueClasses)
      sceneRoot.classList.add(`${cueClassPrefix}${normalizeToken(prompt.background_cue || 'soft_cyan_pulse')}`)

      if (qrCard) {
        qrCard.classList.remove('qr-visible', 'qr-pulse', 'qr-hidden')
        const qrMode = normalizeToken(prompt.qr_visibility || 'visible')
        qrCard.classList.add(`qr-${qrMode}`)
      }

      if (tickerTrack) {
        if (prompt.ticker_override) {
          tickerTrack.innerHTML = `${defaultTickerMarkup}<span class="ticker-item ticker-override-item"><span class="ticker-dot">•</span>${prompt.ticker_override}</span>`
        } else {
          tickerTrack.innerHTML = defaultTickerMarkup
        }
      }

      if (prompt.api_trigger) {
        console.info('[Scene01 api_trigger]', prompt.api_trigger, { promptId: prompt.id })
      }

      activePromptId = prompt.id
    }

    const findActivePrompt = (elapsedSeconds) => prompts.find((prompt) => {
      const start = Number(prompt.start_sec || 0)
      const duration = Number(prompt.duration_sec || 0)
      return elapsedSeconds >= start && elapsedSeconds < start + duration
    })

    const updateCountdown = () => {
      const minutes = Math.floor(remainingSeconds / 60)
      const seconds = remainingSeconds % 60
      minuteNode.textContent = String(minutes).padStart(2, '0')
      secondNode.textContent = String(seconds).padStart(2, '0')

      countdownRoot.classList.remove('pulse')
      requestAnimationFrame(() => countdownRoot.classList.add('pulse'))

      const elapsed = totalDuration - remainingSeconds
      const activePrompt = findActivePrompt(elapsed)
      applyPrompt(activePrompt)

      if (remainingSeconds > 0) {
        remainingSeconds -= 1
      }
    }

    updateCountdown()
    window.clearInterval(window.__bemahubCountdown)
    window.__bemahubCountdown = window.setInterval(updateCountdown, 1000)
  },
}

function createWaveBars(total) {
  return Array.from({ length: total }, (_, index) => {
    const height = 30 + ((index * 11) % 80)
    const delay = (index % 9) * 0.28
    return `<span class="scene01-wave-bar" style="height:${height}px;animation-delay:${delay}s"></span>`
  }).join('')
}

function createEqBars(total) {
  return Array.from({ length: total }, (_, index) => {
    const height = 32 + ((index * 7) % 110)
    const delay = (index % 12) * 0.18
    return `<span class="scene01-eq-bar" style="height:${height}px;animation-delay:${delay}s"></span>`
  }).join('')
}

function createParticles(total) {
  return Array.from({ length: total }, (_, index) => {
    const left = 4 + ((index * 4.1) % 92)
    const delay = (index % 7) * 0.9
    const duration = 8 + (index % 5)
    const size = 5 + (index % 4) * 2
    return `<span class="particle" style="left:${left}%;bottom:-20px;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${duration}s"></span>`
  }).join('')
}

function normalizeToken(value) {
  return String(value || 'default').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function renderBroadcastTicker(items) {
  const repeatedItems = [...items, ...items]
  const itemMarkup = repeatedItems
    .map((item) => `<span class="ticker-item"><span class="ticker-dot">•</span>${item}</span>`)
    .join('')

  return `
    <div class="ticker scene01-ticker" aria-label="BemaHub live ticker">
      <span class="ticker-label">BEMA HUB LIVE</span>
      <div class="ticker-track">${itemMarkup}</div>
    </div>
  `
}
