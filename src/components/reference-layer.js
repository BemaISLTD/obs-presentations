export function renderReferenceLayer(slide, mode, opacity, isVisible) {
  return `
    <div class="reference-layer" aria-label="Storyboard reference ${mode === 'overlay' ? 'overlay' : 'review'}">
      <img
        src="${slide.referenceImage}"
        alt="Storyboard reference for scene ${slide.id}: ${slide.title}"
        style="opacity: ${opacity}; visibility: ${isVisible ? 'visible' : 'hidden'};"
      />
    </div>
  `
}