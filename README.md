# BemaHub OBS Presentation System

Browser-based 1920×1080 OBS scenes with independent underlay (Z0 + Z1) and
transparent foreground (Z3) outputs. The live presenter camera remains an OBS
source between those two browser sources.

The React control room is the show controller for all three layers: it drives
the background presentation, the transparent ticker/foreground, and — over OBS
WebSocket — the presenter camera. OBS remains the compositor and final video
output.

```
                     CONTROLLER
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   /presentation      /ticker        OBS WebSocket
                                          ↓
                                   Presenter camera
```

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
The **OBS connection** panel connects to OBS, selects the scene and presenter
source to control, and provides manual Show/Hide for the presenter camera; see
"OBS control and the presenter camera" below.

The **Live data source** panel controls where Scenes 01, 08, 37, and the global
ticker read their numbers from: **Simulated**, **Backend (live)**, or **Hybrid**.
It also provides a **date picker to cue backend data from a chosen date through
today** — this sets the backend session start so joined counts, actions,
referrals, QR scans, and CTA clicks reflect that date range rather than only
"since page load." The date range applies only when the source is Backend or
Hybrid, and a **Clear** button returns to the default rolling session window.

Every button writes to SQLite through the control API. Connected display pages
receive that revision over server-sent events. A display opened later restores
the current scene, cue, question, ticker, animation, data source, and data
range settings from the database rather than starting from local browser
state. Changing the data source or date range reloads every connected display
so the OBS live-data client picks up the new query parameters consistently.

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

For step-by-step instructions on building the master scene, enabling OBS
WebSocket, and running the show, see [the OBS setup guide](./docs/obs.md).

Replace `08` with the required two-digit scene number.

Recommended synchronized sources (the scene number comes from the control room):

- Background presentation — `BASE_URL/presentation`
- Ticker / foreground — `BASE_URL/ticker`
- Composite program — `BASE_URL/program`

These are the addresses to paste into OBS. Each one is a short alias that
redirects to the equivalent canonical URL below, so OBS can be pointed at a bare
path with no query string to maintain:

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
- Blend live and simulated fields — add `&dataMode=hybrid`
- Cue backend data from a date through today — add `&dataSince=2026-07-01T00:00:00.000Z` (sets the backend session start so joins/actions/referrals/QR scans/CTA clicks reconcile from that date forward); pair with `&dataMode=live` or `&dataMode=hybrid`
- Override the API root — add `&apiBase=https%3A%2F%2Fexample.test%2Fwp-json%2Fbmh%2Fv1%2Fobs`
- Force the global ticker on or off — add `&ticker=show` or `&ticker=hide`

To inspect the two browser layers for a scene, open its `underlay` URL for the
background and editable scene graphics, then its `foreground` URL for the
transparent graphics placed over the presenter. Use `composite` to review both
together without a camera source. The background poster is part of the underlay;
`bgVideo=false` explicitly forces that poster instead of a future video loop.

In OBS, create the sources in this order from back to front:

1. Underlay browser source — `BASE_URL/presentation`
2. Presenter camera source — Camo, a capture card, NDI, or a webcam
3. Foreground browser source — `BASE_URL/ticker`

Listed top-to-bottom in the OBS source list, that master scene reads:

```
OPEN ENROLLMENT MASTER
  1. Ticker / Foreground   Browser Source   BASE_URL/ticker
  2. Presenter Camera      Video Capture Device / Camo / NDI
  3. Presentation          Browser Source   BASE_URL/presentation
```

OBS composites the live presenter between the two browser sources. Both pages
follow the same shared cue state, so they can never drift apart: the controller
remains the single source of truth for what each layer is showing.

Set both browser sources to 1920×1080. The foreground page is genuinely
transparent outside its lower thirds, tickers, and other Z3 elements.

## OBS control and the presenter camera

The control room connects directly to OBS over OBS WebSocket v5 and drives the
live presenter camera alongside the browser layers. Enable **Tools → WebSocket
Server Settings** in OBS, then fill in the **OBS connection** panel on
`/control`.

Host, port, and password are operator settings stored in the shared database, so
the controller can run on the OBS computer (`127.0.0.1:4455`) or on another
device on the same router (`192.168.x.x:4455`). Nothing here requires the
Internet; the protocol client is implemented in-repo against the browser's own
WebSocket and has no runtime dependency to install.

Once connected, the panel queries OBS for its scenes and for the sources inside
the selected scene, and offers both as dropdowns. Every value can also be typed
by hand, which is the fallback when OBS is closed or source discovery is not
wanted. **No OBS scene or source name is hard-coded anywhere in the app** — they
are configuration, stored per source role:

```js
obs = {
  host: '127.0.0.1',
  port: 4455,
  password: '',
  sceneName: 'OPEN ENROLLMENT MASTER',
  sources: {
    presenter: { label: 'Presenter', sourceName: 'Camo Camera', visible: false, preset: 'full' },
  },
}
```

`sources` is a keyed registry rather than a single presenter field, so
additional cameras (`presenter2`, `guestCamera`, `audienceCamera`) are a data
change and not a code change. The first version ships the `presenter` role and
its Show/Hide controls for manual testing.

If OBS is closed, refuses the password, or disconnects mid-show, the panel shows
the reason and the presentation controller keeps running normally — scene, cue,
ticker, and data controls are unaffected. Presenter state is still recorded, and
is re-applied to OBS on the next successful connection.

### Presenter cues

Presenter visibility is part of the cue system, not a separate set of buttons.
Each scene declares its presenter intent in `src/sceneControls.js`, so a single
operator action moves every layer at once:

```
Next cue → background scene + ticker/foreground + presenter camera
```

Scene 03's entry cue brings the camera in full-frame and its exit cue takes it
out; graphics-only scenes retire the camera on entry so it can never be left on
air under a full-screen layout. Cues with no presenter intent leave the camera
exactly as it is. Because cues and the manual Show/Hide buttons both write the
same shared state, the two can never disagree.

Placement presets (`full`, `lower-right`, `lower-left`, `center`, `pip`) are
declared in `src/obsPresenterDirector.js`. Version one applies them as an
immediate transform plus a visibility toggle. Animated entrances and exits —
slide, fade, scale, PiP-to-fullscreen — replace the body of
`applyPresenterState()` without changing a single caller, because callers
describe the state they want rather than issuing OBS commands:

```js
applyPresenterState(client, { sourceName: 'Presenter Camera', visible: true, preset: 'lower-right' })
```

## Live data and the global ticker

Only Scenes 01, 08, and 37 request scene-specific production values. All other
walkthrough scenes remain deterministic. The global activity ticker is part of
the foreground source and independently polls `/live-activity` on every scene.
Its live activity queue uses only public-safe backend events; canned fallback
messages are not inserted into the ticker. Operator visibility, pause, and
messages are stored centrally and synchronized to every system through the
control server.

The control room's **Live data source** panel switches this data between
**Simulated**, **Backend (live)**, and **Hybrid** without editing URLs, and its
date picker cues the backend to report data from a chosen date through the
current day (see "Control room" above). The ticker status pill reflects the
active source as `SIM`, `LIVE`, or `HYBRID`.

The control room provides Show/Hide, Pause/Resume, clear-announcement, and a
shared priority announcement. The ticker continues receiving safe public
activity while hidden or paused. It is muted by default on Scenes 38 and 39;
use `ticker=show` when it should remain visible there. API activity is rendered
only when `safe_for_public_display` is explicitly `true`.

The client (`src/obsLiveData.js`) reads `live-stats`, `goal-progress`,
`live-activity`, and `session-stats` from the Bema Hub OBS API
(`/wp-json/bmh/v1/obs`, documented in the backend repo's
`documentation/OBS_API.md`). That API also now exposes
`presentation-config`, `open-enrollment`, `events`, and `creators` for future
scenes; the presentation layer does not consume those yet.

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
