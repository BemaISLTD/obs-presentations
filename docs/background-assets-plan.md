# BemaHub OBS Background Assets Plan

This project uses 8 reusable motion-background families across 35 scenes.

Final UI overlays remain HTML/CSS/JS; background loops are only for motion atmosphere.

## Background Families

| ID | Label | Typical Use |
|---|---|---|
| bg01 | Countdown Stage | Opening countdown scenes with center-stage glow |
| bg02 | Music Visualizer | Music-driven visualizer moments |
| bg03 | Presenter Studio | Presenter standby/live studio environments |
| bg04 | Brand Stinger | Cinematic brand stinger/reveal moments |
| bg05 | Explainer Clean Wave | Clean explainer and informational scenes |
| bg06 | Dashboard / Product Walkthrough | Product walkthrough and dashboard scenes |
| bg07 | Enrollment CTA | Enrollment invitation and action-focused scenes |
| bg08 | Closing Hold | Closing cards, hold slides, and wrap-up scenes |

## Scene Assignment (1-35)

- bg01: scene 1
- bg02: scene 2
- bg03: scenes 3, 5
- bg04: scene 4
- bg05: scenes 6, 7, 9, 10, 11, 12, 13, 15, 19, 20, 21, 22, 23, 24, 25, 28
- bg06: scenes 8, 16, 17, 18, 26, 27, 29, 30, 31, 32
- bg07: scenes 14, 34
- bg08: scenes 33, 35

## Expected Asset File Names

Video files:

- public/assets/backgrounds/video/bg01-countdown-stage-loop.mp4
- public/assets/backgrounds/video/bg02-music-visualizer-loop.mp4
- public/assets/backgrounds/video/bg03-presenter-studio-loop.mp4
- public/assets/backgrounds/video/bg04-brand-stinger-loop.mp4
- public/assets/backgrounds/video/bg05-explainer-clean-wave-loop.mp4
- public/assets/backgrounds/video/bg06-dashboard-product-loop.mp4
- public/assets/backgrounds/video/bg07-enrollment-cta-loop.mp4
- public/assets/backgrounds/video/bg08-closing-hold-loop.mp4

Optional poster images:

- public/assets/backgrounds/posters/bg01-countdown-stage-loop.jpg
- public/assets/backgrounds/posters/bg02-music-visualizer-loop.jpg
- public/assets/backgrounds/posters/bg03-presenter-studio-loop.jpg
- public/assets/backgrounds/posters/bg04-brand-stinger-loop.jpg
- public/assets/backgrounds/posters/bg05-explainer-clean-wave-loop.jpg
- public/assets/backgrounds/posters/bg06-dashboard-product-loop.jpg
- public/assets/backgrounds/posters/bg07-enrollment-cta-loop.jpg
- public/assets/backgrounds/posters/bg08-closing-hold-loop.jpg

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

1. Add final `.mp4` loops to `public/assets/backgrounds/video/` using existing names.
2. Add `.jpg` posters to `public/assets/backgrounds/posters/` using existing names.
3. No scene code changes needed when replacing files.
4. If a new mapping is needed, edit `src/config/sceneBackgroundMap.js`.

## Asset Production Checklist

- Confirm each loop exports to seamless duration and frame-accurate loop points.
- Deliver 1920x1080 MP4 (H.264) for OBS/browser compatibility.
- Provide optional JPG poster per family for quick load fallback.
- Validate color space and brightness against overlay readability.
- Check that loop motion does not conflict with countdown/ticker legibility.
- Verify fallback CSS style still reflects scene mood when assets are unavailable.
