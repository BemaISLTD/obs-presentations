export function renderReferenceLayer(slide, { variant = 'composition', opacity = 1, isVisible = true } = {}) {
  if (variant === 'sheet') {
    return `
      <div class="reference-sheet" data-reference-layer data-reference-variant="sheet" aria-label="Full storyboard reference for scene ${slide.id}">
        <img
          class="reference-sheet-image"
          src="${slide.storyboardImage ?? slide.referenceImage}"
          alt="Storyboard reference for scene ${slide.id}: ${slide.title}"
        />
      </div>
    `
  }

  return `
    <div class="reference-layer reference-composition-layer absolute inset-0" data-reference-layer data-reference-variant="composition" aria-label="Storyboard composition for scene ${slide.id}" style="opacity:${opacity};visibility:${isVisible ? 'visible' : 'hidden'}">
      <img
        class="reference-composition absolute inset-0 h-full w-full"
        src="${slide.referenceImage}"
        alt="Approved 1920 by 1080 composition for scene ${slide.id}: ${slide.title}"
        width="1920"
        height="1080"
        style="object-fit:fill;"
      />
    </div>
  `
}
