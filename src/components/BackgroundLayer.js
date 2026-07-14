import { getBackgroundForScene } from '../backgrounds/backgroundManifest.js'

export function renderBackgroundLayer({
  sceneId,
  backgroundId,
  className = '',
  debug = false,
} = {}) {
  const params = new URLSearchParams(window.location.search)
  const bgVideoDisabled = params.get('bgVideo') === 'false'
  const paused = params.get('paused') === 'true'
  const bgDebugEnabled = debug || params.get('bgDebug') === 'true'
  const { backgroundId: resolvedBackgroundId, background } = getBackgroundForScene(sceneId, backgroundId)
  const hasLoopVideo = Boolean(background.loopVideoPath) && background.videoReady === true
  const shouldUseVideo = hasLoopVideo && !bgVideoDisabled
  const overlayClass = background.overlayTint === 'navy-gradient' ? 'is-navy-gradient' : 'is-soft-wash'
  const activeAssetPath = shouldUseVideo ? background.loopVideoPath : background.posterPath

  return `
    <div
      class="background-layer ${className} ${overlayClass}"
      data-background-layer
      data-background-id="${resolvedBackgroundId}"
      data-video-enabled="${shouldUseVideo ? 'true' : 'false'}"
      style="--bg-video-opacity:${background.defaultOpacity};--bg-motion-intensity:${background.motionIntensity};"
      aria-hidden="true"
    >
      <div class="background-layer-fallback" data-bg-fallback></div>
      <img class="background-layer-poster" src="${background.posterPath}" alt="" data-bg-poster />
      ${shouldUseVideo
        ? `<video
          class="background-layer-video"
          ${paused ? '' : 'autoplay'}
          muted
          loop
          playsinline
          preload="auto"
          poster="${background.posterPath}"
          data-bg-video
        >
          <source src="${background.loopVideoPath}" type="video/mp4" />
        </video>`
        : ''}
      <div class="background-layer-bloom"></div>
      <div class="background-layer-overlay ${overlayClass}"></div>
      ${bgDebugEnabled
        ? `<div class="background-layer-debug" data-bg-debug>
          <span>${resolvedBackgroundId}</span>
          <strong>${activeAssetPath}</strong>
        </div>`
        : ''}
    </div>
  `
}

export function initBackgroundLayer(root) {
  const paused = new URLSearchParams(window.location.search).get('paused') === 'true'

  root.querySelectorAll('[data-background-layer]').forEach((container) => {
    const video = container.querySelector('[data-bg-video]')
    const poster = container.querySelector('[data-bg-poster]')
    const isVideoEnabled = container.dataset.videoEnabled === 'true'

    const setState = (state) => {
      container.dataset.mediaState = state
    }

    setState('fallback')

    if (poster?.complete && poster.naturalWidth > 0) {
      container.classList.add('has-poster')
      if (!isVideoEnabled) {
        setState('poster')
      }
    }

    poster?.addEventListener(
      'load',
      () => {
        container.classList.add('has-poster')
        if (!isVideoEnabled) {
          setState('poster')
        }
      },
      { once: true },
    )

    poster?.addEventListener(
      'error',
      () => {
        container.classList.remove('has-poster')
      },
      { once: true },
    )

    if (!video || !isVideoEnabled) {
      return
    }

    video.addEventListener(
      'canplay',
      async () => {
        try {
          if (paused) {
            video.pause()
            video.currentTime = 0
          } else {
            await video.play()
          }
          container.classList.add('has-video')
          setState('video')
        } catch {
          container.classList.remove('has-video')
          setState(container.classList.contains('has-poster') ? 'poster' : 'fallback')
        }
      },
      { once: true },
    )

    video.addEventListener(
      'error',
      () => {
        container.classList.remove('has-video')
        setState(container.classList.contains('has-poster') ? 'poster' : 'fallback')
      },
      { once: true },
    )
  })
}
