// Shared broken-image fallback for header brand marks, matching scene01's behavior.
// Wired centrally so scenes only need the markup below, not their own error listeners:
//
//   <img ... data-asset-image />
//   <div class="brand-wordmark" data-asset-wrapper>
//     <img src="..." alt="bemaHub wordmark" data-asset-image />
//     <strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong>
//   </div>
export function bindBrandAssetFallback(root) {
  const handleError = (event) => {
    const image = event.target
    if (!(image instanceof HTMLImageElement) || !image.matches('[data-asset-image]')) return
    image.closest('[data-asset-wrapper]')?.classList.add('is-missing')
  }
  root.addEventListener('error', handleError, true)
  return () => root.removeEventListener('error', handleError, true)
}
