# BemaHub OBS Background Assets Plan

This project uses one active manifest with 14 supplied background families across 39 scenes.

Final UI overlays remain HTML/CSS/JS; background loops are only for motion atmosphere.

## Active configuration

`src/backgrounds/backgroundManifest.js` is the only background registry and scene map.
Each entry defines the current PNG poster, the future loop-video path, presentation tint,
and motion intensity. Do not add a second registry or scene mapping file.

`videoReady` defaults to false so absent future videos do not create failed browser
requests. Set it to true on that manifest entry when the final loop is added; playback
will then fall back automatically to its PNG if the video cannot load or play.

Scene assignments live beside the asset definitions in the manifest so asset and scene
changes cannot drift apart.

## Expected Asset File Names

Posters are stored in `public/assets/backgrounds/ref/`. Future videos use the exact
`loopVideoPath` declared for each manifest entry under
`public/assets/backgrounds/videos/loops/`.

## Fallback Behavior

If a video is missing or cannot play:

1. Use poster image when available.
2. If poster is also missing, use CSS fallback family styling.
3. Keep overlays fully functional with no layout shift.

Fallback families:

- countdown-stage
- music-visualizer
- presenter-studio
- brand-stinger
- explainer-clean-wave
- dashboard-product
- enrollment-cta
- closing-hold

## Replacing Placeholder Assets Later

1. Add final `.mp4` loops under `public/assets/backgrounds/videos/loops/` using the manifest paths.
2. Keep the supplied PNG fallbacks under `public/assets/backgrounds/ref/`.
3. Set the manifest entry's `videoReady` flag to `true`; no scene code changes are needed.
4. If a new mapping is needed, edit `sceneBackgroundAssignments` in
   `src/backgrounds/backgroundManifest.js`.

## Asset Production Checklist

- Confirm each loop exports to seamless duration and frame-accurate loop points.
- Deliver 1920x1080 MP4 (H.264) for OBS/browser compatibility.
- Provide optional JPG poster per family for quick load fallback.
- Validate color space and brightness against overlay readability.
- Check that loop motion does not conflict with countdown/ticker legibility.
- Verify fallback CSS style still reflects scene mood when assets are unavailable.
