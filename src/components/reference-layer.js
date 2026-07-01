export function renderReferenceLayer(slide, mode, opacity, isVisible) {
  return `
    <div class="reference-layer" aria-label="Storyboard reference ${mode === 'overlay' ? 'overlay' : 'review'}">
      <div class="reference-stage-fit">
        <img
          src="${slide.referenceImage}"
          alt="Storyboard reference for scene ${slide.id}: ${slide.title}"
          style="opacity: ${opacity}; visibility: ${isVisible ? 'visible' : 'hidden'};"
        />
      </div>
    </div>
  `
}