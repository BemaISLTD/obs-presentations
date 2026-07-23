const cueState = new WeakMap()

export const LAYER_CUES = Object.freeze({
  background: 'background-in',
  foreground: 'foreground-in',
  footer: 'footer-in',
  full: 'full-sequence',
})

const LAYER_ANIMATION_CLASSES = [
  'cue-layer-background',
  'cue-layer-foreground',
  'cue-layer-footer',
  'cue-layer-full',
]

const LAYER_VISIBLE_CLASSES = [
  'is-layer-background-visible',
  'is-layer-foreground-visible',
  'is-layer-footer-visible',
]

const SCENE04_REVEAL_CUES = Object.freeze({
  'reveal-creator': 0,
  'reveal-builder': 1,
  'reveal-community': 2,
  'statement-1': 0,
  'statement-2': 1,
  'statement-3': 2,
})

const HEADER_SELECTOR = [
  '.broadcast-brand',
  '.broadcast-live',
  '.scene01-top',
  '.scene-live-chip',
  '.scene-brand-wordmark',
  '.scene04-brand-row',
  '.scene02-brand',
  '.scene02-live',
].join(',')

const FOOTER_SELECTOR = [
  '.foreground-bar',
  '.ticker',
  '.host-lower-third',
].join(',')

function getCueState(root) {
  if (!cueState.has(root)) cueState.set(root, { timers: new Set(), cleanups: new Set() })
  return cueState.get(root)
}

function clearCueTimers(root) {
  const state = getCueState(root)
  state.timers.forEach((timer) => window.clearTimeout(timer))
  state.timers.clear()
}

export function registerSceneCleanup(root, cleanup) {
  if (typeof cleanup === 'function') getCueState(root).cleanups.add(cleanup)
}

export function disposeSceneLifecycle(root) {
  const state = getCueState(root)
  clearCueTimers(root)
  state.cleanups.forEach((cleanup) => cleanup())
  state.cleanups.clear()
}

function clearSceneCue(root) {
  clearCueTimers(root)
  const stage = root.querySelector('.visual-stage')
  if (!stage) return null
  stage.classList.remove('cue-entry', 'cue-during', 'cue-exit', 'is-cue-active', 'is-scene-reset', ...LAYER_ANIMATION_CLASSES)
  stage.removeAttribute('data-active-cue')
  stage.removeAttribute('data-scene-cue')
  stage.querySelectorAll('[data-control-cue]').forEach((element) => {
    element.classList.remove('is-cue-target', 'is-cue-complete')
    element.removeAttribute('data-cue-active')
  })
  void stage.offsetWidth
  return stage
}

function markForegroundBranches(element) {
  Array.from(element.children).forEach((child) => {
    if (child.matches(HEADER_SELECTOR)) {
      child.dataset.layerAnimationTarget = 'background'
    } else if (child.querySelector(HEADER_SELECTOR)) {
      markForegroundBranches(child)
    } else {
      child.dataset.layerAnimationTarget = 'foreground'
    }
  })
}

function markFooterBranches(element) {
  Array.from(element.children).forEach((child) => {
    if (child.matches(FOOTER_SELECTOR)) {
      child.dataset.layerAnimationTarget = 'footer'
    } else if (child.querySelector(FOOTER_SELECTOR)) {
      markFooterBranches(child)
    } else {
      child.dataset.layerAnimationTarget = 'foreground'
    }
  })
}

export function hydrateLayerAnimationTargets(root) {
  const stage = root.querySelector('.visual-stage')
  if (!stage) return

  stage.querySelectorAll('[data-background-layer]').forEach((element) => {
    element.dataset.layerAnimationTarget = 'background'
  })
  stage.querySelectorAll('[data-live-layer="underlay"] > *').forEach(markForegroundBranches)
  stage.querySelectorAll('[data-live-layer="foreground"]').forEach(markFooterBranches)
}

function setLayerVisibility(stage, visibleLayers, { replace = false } = {}) {
  stage.classList.add('has-layer-cue-state')
  if (replace) stage.classList.remove(...LAYER_VISIBLE_CLASSES)
  visibleLayers.forEach((layer) => stage.classList.add(`is-layer-${layer}-visible`))
}

export function resetSceneCue(root) {
  const stage = clearSceneCue(root)
  if (!stage) return
  stage.classList.add('has-layer-cue-state')
  stage.classList.remove(...LAYER_VISIBLE_CLASSES)
  stage.classList.add('is-scene-reset')
  stage.dataset.activeCue = 'reset'
}

export function applySceneCue(root, cue) {
  const stage = clearSceneCue(root)
  if (!stage || !cue) return
  stage.dataset.activeCue = cue
  stage.dataset.sceneCue = cue

  const scene04RevealIndex = SCENE04_REVEAL_CUES[cue]
  if (scene04RevealIndex != null && stage.querySelector('.scene04')) {
    stage.querySelectorAll('.scene04-statement-reveal').forEach((element, index) => {
      const isSelected = index === scene04RevealIndex
      element.classList.toggle('is-cue-complete', isSelected)
      element.classList.toggle('is-cue-target', isSelected)
      if (isSelected) element.dataset.cueActive = 'true'
    })
    stage.classList.add('is-cue-active', 'cue-during')
    return
  }

  if (cue === 'entry') {
    setLayerVisibility(stage, ['background'], { replace: true })
    stage.classList.add('cue-layer-background')
    return
  }
  if (cue === LAYER_CUES.background) {
    setLayerVisibility(stage, ['background'])
    stage.classList.add('cue-layer-background')
    return
  }
  if (cue === LAYER_CUES.foreground) {
    setLayerVisibility(stage, ['foreground'])
    stage.classList.add('cue-layer-foreground')
    return
  }
  if (cue === LAYER_CUES.footer) {
    setLayerVisibility(stage, ['footer'])
    stage.classList.add('cue-layer-footer')
    return
  }
  if (cue === LAYER_CUES.full) {
    setLayerVisibility(stage, ['background', 'foreground', 'footer'], { replace: true })
    stage.classList.add('cue-layer-full')
    return
  }
  stage.classList.add('is-cue-active', cue === 'entry' ? 'cue-entry' : cue === 'exit' ? 'cue-exit' : 'cue-during')
  stage.querySelectorAll(`[data-control-cue="${CSS.escape(cue)}"]`).forEach((element) => {
    element.classList.add('is-cue-target')
    element.dataset.cueActive = 'true'
  })
}
