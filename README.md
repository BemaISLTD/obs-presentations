# BemaHub OBS Presentation System

Browser-based 1920×1080 OBS scenes with independent underlay (Z0 + Z1) and
transparent foreground (Z3) outputs. The live presenter camera remains an OBS
source between those two browser sources.

## Run locally

```sh
npm install
npm run dev
```

Use the Vite address shown in the terminal as `BASE_URL` (normally
`http://localhost:5173`).

## On-canvas controls

Composite presentation pages include an operator layer over the bottom of the
scene. The bottom strip provides direct Scene 01–39 selection. Four buttons
above it provide Reference, Overlay, Live / Replay Entry, and Exit controls.

Add `&controls=false` when the operator layer should be hidden from a final OBS
program capture. A fixed top-right button toggles the bottom controls back on
or off without reloading the scene. Underlay and foreground-only browser
sources never render the control layer.

## Keyboard navigation

Click the browser preview once so it has keyboard focus, then use:

- `←` / `→` to move to the previous or next scene. Live and overlay modes skip
  scenes that do not have a live renderer yet; reference mode includes all scenes.
- `↑` / `↓` to cycle through the storyboard view and physical layer previews
  while keeping the current scene and URL options. The generated layer aliases
  remain compatible with the canonical `output=obs&render=...` URLs below.

Navigation wraps at both ends. It also works with `clean=true`, so the shortcuts
can be used in a browser preview without adding controls to the OBS output.

## OBS browser-source URLs

Replace `08` with the required two-digit scene number.

- Underlay — `BASE_URL/?scene=08&mode=live&output=obs&render=underlay&clean=true`
- Foreground — `BASE_URL/?scene=08&mode=live&output=obs&render=foreground&clean=true`
- Composite review — `BASE_URL/?scene=08&mode=live&output=obs&render=composite&clean=true`
- Storyboard development — `BASE_URL/?scene=08&mode=overlay&output=storyboard&render=composite`
- Reference — `BASE_URL/?scene=08&mode=reference&output=obs&render=composite&clean=true`
- Clean OBS composite — `BASE_URL/?scene=08&mode=live&output=obs&render=composite&clean=true`
- Paused — add `&paused=true`
- Force the PNG poster — add `&bgVideo=false`
- Background diagnostics — add `&bgDebug=true` and omit `clean=true`
- Scene 08 presenter inset side — add `&presenterInset=right` (defaults to `left`)

To inspect the two browser layers for a scene, open its `underlay` URL for the
background and editable scene graphics, then its `foreground` URL for the
transparent graphics placed over the presenter. Use `composite` to review both
together without a camera source. The background poster is part of the underlay;
`bgVideo=false` explicitly forces that poster instead of a future video loop.

In OBS, create the sources in this order from back to front:

1. Underlay browser source
2. Presenter camera source
3. Foreground browser source

Set both browser sources to 1920×1080. The foreground page is genuinely
transparent outside its lower thirds, tickers, and other Z3 elements.

## Architecture-proof scenes

Scenes 03, 08, 14, and 38 implement the initial layering proof requested in the
handoff. Their editable underlay and foreground markup is in `src/scenes/`.

Scene 08 is the initial coded proof scene. Its Entry can be replayed and its Exit
can be triggered from the on-canvas controls.

Scenes 06–37 and 39 use editable code-native layered renderers rather than
storyboard-image fallbacks. Their background, presenter-safe area, content
underlay, foreground accent, and lower broadcast bar can be loaded separately
through the standard `render=underlay`, `render=foreground`, and
`render=composite` URLs.

The source storyboard filenames for Slides 20 and 23 contain each other's
internal scene. `public/data/slides.json` intentionally swaps only those two
reference paths so Scene 20 remains Participation Assets Delivered and Scene 23
remains Qualified LoopLocks throughout the controller and presentation.

Backgrounds use the single manifest at
`src/backgrounds/backgroundManifest.js`. Current PNGs are posters/fallbacks;
future Blender loops plug into the declared video paths without changing scene
markup.

## Production checks

```sh
npm run build
npm run test:scenes
npm run test:visual
```

The interface is built with Tailwind CSS 4 through the Vite plugin. Static
scene geometry and scene-specific compositions live in Tailwind component
utilities, while `src/style.css` contains custom keyframes only. Playwright
smoke coverage exercises every scene in storyboard, underlay, foreground, and
composite output; committed Chromium snapshots cover all live composites and
the key storyboard shells. Use `npm run test:visual:update` only when an
intentional visual change has been reviewed.

For OBS captures, always include `clean=true`. Use `paused=true` when a still,
fully composed frame is needed; browser animation and background video playback
will be frozen.
