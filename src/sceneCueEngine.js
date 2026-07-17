let cleanupTimer

const TARGET_CLASSES = ['relative', 'z-20', '-translate-y-[7px]', 'scale-[1.035]', 'brightness-110', 'saturate-[1.08]', 'shadow-[0_0_0_3px_rgba(38,222,235,.92),0_18px_44px_rgba(20,60,160,.32)]', 'animate-[controller-cue-highlight_1.45s_ease_both]']
const ENTRY_CLASSES = ['animate-[controller-entry_700ms_cubic-bezier(.2,.8,.2,1)_both]']
const EXIT_CLASSES = ['animate-[controller-exit_650ms_ease-in_both]']

export function resetSceneCue(root) {
  clearTimeout(cleanupTimer)
  const stage = root.querySelector('.visual-stage')
  if (!stage) return
  stage.classList.remove('cue-entry', 'cue-during', 'cue-exit', 'is-cue-active')
  stage.removeAttribute('data-active-cue')
  stage.querySelectorAll('.scene, .live-layer').forEach((element) => element.classList.remove(...ENTRY_CLASSES, ...EXIT_CLASSES))
  stage.querySelectorAll('[data-control-cue]').forEach((element) => {
    element.classList.remove('is-cue-target', ...TARGET_CLASSES)
    element.removeAttribute('data-cue-active')
  })
  void stage.offsetWidth
}

export function applySceneCue(root, cue) {
  resetSceneCue(root)
  const stage = root.querySelector('.visual-stage')
  if (!stage || !cue) return
  stage.dataset.activeCue = cue
  stage.classList.add('is-cue-active', cue === 'entry' ? 'cue-entry' : cue === 'exit' ? 'cue-exit' : 'cue-during')
  if (cue === 'entry') stage.querySelectorAll('.proof-scene, .scene').forEach((element) => element.classList.add(...ENTRY_CLASSES))
  if (cue === 'exit') stage.querySelectorAll('.live-layer').forEach((element) => element.classList.add(...EXIT_CLASSES))
  stage.querySelectorAll(`[data-control-cue="${CSS.escape(cue)}"]`).forEach((element) => {
    element.classList.add('is-cue-target', ...TARGET_CLASSES)
    element.dataset.cueActive = 'true'
  })
  cleanupTimer = window.setTimeout(() => {
    if (cue !== 'exit') stage.classList.remove('is-cue-active')
  }, 1800)
}
