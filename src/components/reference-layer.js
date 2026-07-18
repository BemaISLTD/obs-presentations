import { getReferenceCrop } from '../referenceCrops.js'

export function renderReferenceLayer(slide, { variant = 'composition', opacity = 1, isVisible = true } = {}) {
  if (variant === 'sheet') {
    return `
      <div class="reference-sheet" data-reference-layer data-reference-variant="sheet" aria-label="Full storyboard reference for scene ${slide.id}">
        <img
          class="reference-sheet-image"
          src="${slide.referenceImage}"
          alt="Storyboard reference for scene ${slide.id}: ${slide.title}"
        />
      </div>
    `
  }

  const { sourceWidth, sourceHeight, composition } = getReferenceCrop(slide.id)
  return `
    <div class="reference-layer reference-composition-layer absolute inset-0" data-reference-layer data-reference-variant="composition" aria-label="Storyboard composition for scene ${slide.id}" style="opacity:${opacity};visibility:${isVisible ? 'visible' : 'hidden'}">
      <svg class="reference-composition" viewBox="${composition.x} ${composition.y} ${composition.width} ${composition.height}" preserveAspectRatio="none" role="img" aria-label="Approved 1920 by 1080 composition for scene ${slide.id}">
        <image href="${slide.referenceImage}" x="0" y="0" width="${sourceWidth}" height="${sourceHeight}" preserveAspectRatio="none" />
      </svg>
    </div>
  `
}
