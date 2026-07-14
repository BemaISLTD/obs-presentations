let cleanupTimer

export function resetSceneCue(root) {
  clearTimeout(cleanupTimer)
  const stage = root.querySelector('.visual-stage')
  if (!stage) return
  stage.classList.remove('cue-entry', 'cue-during', 'cue-exit', 'is-cue-active')
  stage.removeAttribute('data-active-cue')
  stage.querySelectorAll('[data-control-cue]').forEach((element) => element.classList.remove('is-cue-target'))
  void stage.offsetWidth
}

export function applySceneCue(root, cue) {
  resetSceneCue(root)
  const stage = root.querySelector('.visual-stage')
  if (!stage || !cue) return
  stage.dataset.activeCue = cue
  stage.classList.add('is-cue-active', cue === 'entry' ? 'cue-entry' : cue === 'exit' ? 'cue-exit' : 'cue-during')
  stage.querySelectorAll(`[data-control-cue="${CSS.escape(cue)}"]`).forEach((element) => element.classList.add('is-cue-target'))
  cleanupTimer = window.setTimeout(() => {
    if (cue !== 'exit') stage.classList.remove('is-cue-active')
  }, 1800)
}
