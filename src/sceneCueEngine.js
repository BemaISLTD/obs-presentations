const cueState = new WeakMap()

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
  stage.classList.remove('cue-entry', 'cue-during', 'cue-exit', 'is-cue-active', 'is-scene-reset')
  stage.removeAttribute('data-active-cue')
  stage.removeAttribute('data-scene-cue')
  stage.querySelectorAll('[data-control-cue]').forEach((element) => {
    element.classList.remove('is-cue-target', 'is-cue-complete')
    element.removeAttribute('data-cue-active')
  })
  void stage.offsetWidth
  return stage
}

export function resetSceneCue(root) {
  const stage = clearSceneCue(root)
  if (!stage) return
  stage.classList.add('is-scene-reset')
  stage.dataset.activeCue = 'reset'
}

export function applySceneCue(root, cue) {
  const stage = clearSceneCue(root)
  if (!stage || !cue) return
  stage.dataset.activeCue = cue
  stage.dataset.sceneCue = cue
  stage.classList.add('is-cue-active', cue === 'entry' ? 'cue-entry' : cue === 'exit' ? 'cue-exit' : 'cue-during')
  stage.querySelectorAll(`[data-control-cue="${CSS.escape(cue)}"]`).forEach((element) => {
    element.classList.add('is-cue-target')
    element.dataset.cueActive = 'true'
  })
}
