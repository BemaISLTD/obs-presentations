# Live-to-Reference Alignment Handoff

## Scope Completed

This pass focused on scenes 03 to 05 in live mode and tightened the layout hierarchy to better mirror the approved storyboard references.

Implemented updates:

- Scene 03 now follows reference composition more closely:
  - brand wordmark in top-left
  - red LIVE chip in top-right
  - monitor panel visual on right side with branded pillars
  - lower-third host card in lower-left
  - presenter frame behavior retained for `presenter=boxed` and `presenter=overlay`
- Scene 04 now follows reference message structure:
  - centered logo row (mark + wordmark)
  - three mission statements with emphasized keywords
  - closing welcome line with event callout
  - top-right LIVE chip retained
- Scene 05 now follows reference screen structure:
  - top-left brand + top-right LIVE chip
  - center title block with year lockup
  - right agenda panel with ten rows driven by slide metadata
  - right-lower CTA panel
  - retained ticker lane
- Runtime context now passes `allSlides` into scene renderers from `src/main.js` so scene 05 can derive agenda list content from `slides.json`.

## Files Changed

- `src/main.js`
- `src/scenes/scene03.js`
- `src/scenes/scene04.js`
- `src/scenes/scene05.js`
- `src/style.css`

## What Is Still Approximate

These elements are currently approximated and should be replaced for exact parity:

- Presenter cutout/photography is not using isolated talent assets.
- Several visual motifs are reconstructed with CSS gradients instead of authored design assets.
- Scene 04 iconography in statement rows is text-led rather than exact icon set.
- Scene 05 agenda-row right-side glyphs are not yet implemented.
- Typography weight, kerning, and exact scale are close but not pixel-locked to source comps.

## Recommended Next Tasks (In Order)

1. Add production assets

- Isolated presenter PNG/WebP with alpha for scene 03 and 05.
- Scene-specific overlay PNG layers exported from design files (lights, rings, monitor sheen, CTA panel polish).
- Exact icon set SVGs for scene 04 statement bullets and scene 05 agenda row actions.

2. Introduce scene-level design tokens

- Create per-scene token maps (spacing, type scale, panel radius, border alpha, glow intensity).
- Keep global theme variables for shared brand colors only.

3. Lock scene geometry to reference guides

- Add explicit 1920x1080 anchoring variables for key regions:
  - `brandAnchor`
  - `liveChipAnchor`
  - `presenterFrameBounds`
  - `agendaPanelBounds`
  - `lowerThirdBounds`
- Use a single scaling model from stage coordinates to CSS pixels.

4. Add visual regression checks

- Capture baseline screenshots for scenes 03 to 05 in:
  - `?mode=live&output=obs`
  - `?mode=overlay&output=storyboard&refOnTop=true&refOpacity=0.6`
- Add screenshot diff threshold gate in CI for layout drift.

5. Data-driven copy locking

- Move scene 03 host lower-third content and scene 04 statements into `slides.json` fields.
- Keep scene code responsible for layout only.

## Testing Notes

Verified in local Vite build:

- `npm run build` passes.
- Manual checks run on:
  - `/?scene=03`
  - `/?scene=04`
  - `/?scene=05`

## Developer Continuation Notes

- If exact reference matching is required, prioritize composited overlay assets from design tools over pure CSS reconstruction.
- Keep support for both presenter modes in scene 03 (`boxed` and `overlay`) because OBS handoff workflows depend on it.
- Scene 05 agenda currently uses first ten slide titles from `slides.json`; confirm final naming conventions with content owner before freeze.
