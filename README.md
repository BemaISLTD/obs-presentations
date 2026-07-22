# BemaHub OBS Presentation System

Browser-based 1920×1080 OBS scenes with independent underlay (Z0 + Z1) and
transparent foreground (Z3) outputs. The live presenter camera remains an OBS
source between those two browser sources.

## Run locally

```sh
npm install
npm run dev
```

Node 24 or newer is required for the built-in SQLite driver. The command starts
one HTTP server for the presentation, the control API, and the Vite development
app. Use the address shown in the terminal as `BASE_URL` (normally
`http://localhost:5173`). Open `BASE_URL/control` for the operator room and
`BASE_URL/` for the synchronized composite presentation.

To control displays on other computers, keep this server running on one host and
open that host's LAN address from every other system, for example
`http://192.168.1.25:5173/`. The server listens on all interfaces by default.

For a production build:

```sh
npm run build
npm start
```

For Coolify, deploy [docker-compose.yaml](./docker-compose.yaml) with the Docker
Compose build pack. This runs the Node/SQLite server and mounts its database on
a persistent volume; a static Vite/Nixpacks deployment will not provide shared
controls. See [the Coolify deployment guide](./docs/coolify-deployment.md).

Shared presentation state is persisted in the ignored
`data/obs-control.sqlite` database. SQLite WAL mode and a server-sent event
stream allow any number of display clients to read the same durable state and
receive changes immediately.

## Control room

All operator controls live at `BASE_URL/control`, separate from the scene output.
The page provides Previous/Next navigation, direct Scene 01–39 selection, and a
cue panel generated from `src/sceneControls.js` for the active scene. It includes
Reset, Entry, Background/Foreground/Footer entrances, Full Sequence, every
scene-specific During cue, and Exit. It also controls global animation pause,
background video/posters, live/reference/overlay mode, the ticker, and priority
announcements. Scene 36 question selection follows its active scene controls.

Every button writes to SQLite through the control API. Connected display pages
receive that revision over server-sent events. A display opened later restores
the current scene, cue, question, ticker, and animation settings from the
database rather than starting from local browser state.

Reference storyboard mode displays the complete original storyboard sheet at
its natural aspect ratio and allows the page to scroll to its specification
section. Clean 1920×1080 Reference output displays only the approved top
composition. Overlay places that composition and the coded live scene in the
same 1920×1080 coordinate space, with Reference only, Both, Live only, layer
order, and opacity controls. Continuous ambient effects are intentionally not
operator buttons; they resume when Entry is triggered.

The former on-canvas controls are hidden by default. They remain available for
isolated development with `legacyControls=true`; those local controls are not
the production shared-control path.

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

Recommended synchronized sources (the scene number comes from the control room):

- Underlay — `BASE_URL/?sync=true&output=obs&render=underlay&clean=true`
- Foreground — `BASE_URL/?sync=true&output=obs&render=foreground&clean=true`
- Composite — `BASE_URL/?sync=true&output=obs&render=composite&clean=true`

All three retain their own OBS layer role while following the same active scene
and commands. Plain `BASE_URL/` is also synchronized and defaults to a full-screen
composite. Use `sync=false` or omit `sync=true` on a URL containing `scene=...`
when an isolated, manually selected development view is required.

Static development URLs:

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
- Production API data (Scenes 01, 08, 37 and the ticker) — add `&dataMode=live&sessionId=open_enrollment_2026`
- Rehearsal/mock data — add `&dataMode=simulated` (the default)
- Override the API root — add `&apiBase=https%3A%2F%2Fexample.test%2Fwp-json%2Fbmh%2Fv1%2Fobs`
- Force the global ticker on or off — add `&ticker=show` or `&ticker=hide`

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

## Live data and the global ticker

Only Scenes 01, 08, and 37 request scene-specific production values. All other
walkthrough scenes remain deterministic. The global activity ticker is part of
the foreground source and independently polls `/live-activity` on every scene.
Its live activity queue still has a local fallback, while operator visibility,
pause, and priority-announcement settings are stored centrally and synchronized
to every system through the control server.

The control room provides Show/Hide, Pause/Resume, clear-announcement, and a
shared priority announcement. The ticker continues receiving safe public
activity while hidden or paused. It is muted by default on Scenes 38 and 39;
use `ticker=show` when it should remain visible there. API activity is rendered
only when `safe_for_public_display` is explicitly `true`.

Scene 36 question buttons are operator selections. Selection persists across a
reload, and four curated questions can be supplied with repeated `qa` query
parameters; `question=1` through `question=4` selects the initial item.

Scene 37 maps scans, LoopLinks, New Builders, enrollment progress, and public
recent activity from the documented OBS endpoints. The supplied API contract
does not currently define a dedicated `questions_answered` field, so the client
uses it when present and otherwise falls back to session actions. Confirm that
mapping with the backend owner before treating that figure as a production
question count.

## Layer animation controls

Entry now reveals only Z0 plus the logo/live header. Background In does the same
explicitly; Foreground In and Footer In reveal their respective Z3 elements.
Full Sequence resets the scene and plays background/header, foreground, then
footer in order. Reset returns every layer to its pre-entry state.

## Review evidence

Run `npm run review:capture` against the local Vite server to create an ignored
`review-package/` directory containing all 39 live, reference, overlay, diff,
and transparent-foreground captures, plus representative full-sequence motion
recordings for Scenes 01, 08, 37, and 39. The generated report includes alpha
checks for every foreground output.

## Architecture-proof scenes

Scenes 03, 08, 14, and 38 implement the initial layering proof requested in the
handoff. Their editable underlay and foreground markup is in `src/scenes/`.

Scene 08 is the initial coded proof scene. All scenes expose their catalogued
Entry, During, and Exit actions through the on-canvas controls, and Reset returns
the selected scene to its pre-entry state.

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
npm run test:server
npm run test:scenes
npm run test:visual
```

## Network security

On a trusted production network, set a write token before starting the server:

```sh
CONTROL_TOKEN='replace-with-a-long-random-value' npm start
```

Enter the same value under **Control server token** on `/control`. Presentation
clients need no token because they only read state. Put HTTPS and normal network
access controls in front of the server when it is reachable beyond a trusted
LAN. A single running server/database should be the authority for one show;
do not run independent SQLite copies on multiple hosts.

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
