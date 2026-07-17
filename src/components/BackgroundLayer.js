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
      class="background-layer ${className} ${overlayClass} pointer-events-none absolute inset-0 z-0 overflow-hidden [&[data-media-state=poster]_.background-layer-poster]:opacity-[var(--bg-video-opacity)] [&[data-media-state=video]_.background-layer-video]:opacity-[var(--bg-video-opacity)] [&[data-media-state=video]_.background-layer-fallback]:opacity-0 [&[data-media-state=video]_.background-layer-poster]:opacity-0"
      data-background-layer
      data-background-id="${resolvedBackgroundId}"
      data-video-enabled="${shouldUseVideo ? 'true' : 'false'}"
      style="--bg-video-opacity:${background.defaultOpacity};--bg-motion-intensity:${background.motionIntensity};"
      aria-hidden="true"
    >
      <div class="background-layer-fallback absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_50%_64%,rgba(18,207,226,.2),transparent_42%),linear-gradient(165deg,#0a224a_0%,#132f66_36%,#0a1b3e_100%)] transition-opacity" data-bg-fallback></div>
      <img class="background-layer-poster absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity" src="${background.posterPath}" alt="" data-bg-poster />
      ${shouldUseVideo
        ? `<video
          class="background-layer-video absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity"
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
      <div class="background-layer-bloom absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_50%_58%,rgba(157,226,255,.48),transparent_46%),radial-gradient(circle_at_82%_20%,rgba(106,167,255,.24),transparent_36%)]"></div>
      <div class="background-layer-overlay ${overlayClass} absolute inset-0 h-full w-full"></div>
      ${bgDebugEnabled
        ? `<div class="background-layer-debug absolute bottom-4 left-4 z-50 grid gap-1 rounded-xl bg-slate-950/80 p-3 font-mono text-xs text-white" data-bg-debug>
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
