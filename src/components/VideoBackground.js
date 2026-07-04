import { backgroundRegistry } from '../config/backgroundRegistry.js'

const DEFAULT_BACKGROUND_ID = 'bg05'

export function renderVideoBackground({
  backgroundId,
  className = '',
  dimLevel = 0,
  showDiagnostics = false,
  allowDiagnosticsInCleanObs = false,
  isCleanObs = false,
} = {}) {
  const background = backgroundRegistry[backgroundId] ?? backgroundRegistry[DEFAULT_BACKGROUND_ID]
  const normalizedDim = Number.isFinite(dimLevel) ? Math.min(Math.max(dimLevel, 0), 1) : 0
  const diagnosticsVisible = showDiagnostics && (!isCleanObs || allowDiagnosticsInCleanObs)

  return `
    <div
      class="video-background ${className} fallback-${background.fallbackType}"
      data-video-background-id="${background.id}"
      data-video-background-fallback="${background.fallbackType}"
      style="--bg-dim-level:${normalizedDim};"
      aria-hidden="true"
    >
      <div class="video-background-fallback-layer"></div>
      <img class="video-background-poster" src="${background.posterPath}" alt="" data-video-bg-poster />
      <video
        class="video-background-video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        poster="${background.posterPath}"
        data-video-bg-video
      >
        <source src="${background.videoPath}" type="video/mp4" />
      </video>
      <div class="video-background-dim"></div>
      ${diagnosticsVisible
        ? `<div class="video-background-badge" data-video-bg-badge><span>${background.id}</span><strong>fallback</strong></div>`
        : ''}
    </div>
  `
}

export function initVideoBackground(root) {
  root.querySelectorAll('[data-video-background-id]').forEach((container) => {
    const video = container.querySelector('[data-video-bg-video]')
    const poster = container.querySelector('[data-video-bg-poster]')
    const badge = container.querySelector('[data-video-bg-badge] strong')

    const setStatus = (status) => {
      container.dataset.videoStatus = status
      if (badge) {
        badge.textContent = status
      }
    }

    setStatus('fallback')

    poster?.addEventListener('load', () => {
      container.classList.add('has-poster')
    }, { once: true })

    poster?.addEventListener('error', () => {
      container.classList.remove('has-poster')
    }, { once: true })

    video?.addEventListener('canplay', async () => {
      container.classList.add('has-video')
      setStatus('video')

      try {
        await video.play()
      } catch {
        container.classList.remove('has-video')
        setStatus('fallback')
      }
    }, { once: true })

    video?.addEventListener('error', () => {
      container.classList.remove('has-video')
      setStatus('fallback')
    }, { once: true })
  })
}
