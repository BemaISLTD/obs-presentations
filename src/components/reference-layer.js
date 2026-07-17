export function renderReferenceLayer(slide, mode, opacity, isVisible) {
  return `
    <div class="reference-layer absolute inset-0" data-reference-layer aria-label="Storyboard reference ${mode === 'overlay' ? 'overlay' : 'review'}">
      <img
        class="block h-full w-full object-cover"
        src="${slide.referenceImage}"
        alt="Storyboard reference for scene ${slide.id}: ${slide.title}"
        style="opacity: ${opacity}; visibility: ${isVisible ? 'visible' : 'hidden'};"
      />
    </div>
  `
}
