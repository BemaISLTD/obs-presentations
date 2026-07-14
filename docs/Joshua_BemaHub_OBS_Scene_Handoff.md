Skip to content
Using Bema Music Corporation Mail with screen readers

25 of 2,064
BemaHub OBS Storyboard Implementation Handoff
External
Inbox
AI Overview
Eko assigned you to implement OBS storyboard scenes for BemaHub, starting with architecture-proof scenes 03, 08, 14, and 38.
Jide recommended adjusting presenter positioning for slides 8, 10, and 18, and modifying slide 28 to feature sequential fade-in animations.
By Gemini; there may be mistakes. Learn more

Eko The Beat
Attachments
Sat, Jul 11, 2:19 PM (2 days ago)
to me, Jide, David, Mercy

bg ref.zip
bemahub_storyboard_core_01_35_numbered.zip
Jide, instructions/requests for you are below.

Hi Joshua,

I’m sending the complete handoff for the BemaHub Open Enrollment OBS storyboard implementation.

I’ve copied Jide so that he can review the storyboard again, particularly the planned movements, transitions, presenter positioning, and overall visual flow. Jide, please review the storyboard and flag anything you disagree with or believe should be adjusted. This storyboard will serve as the first approved presentation plan we build from, so we need alignment before too much of the implementation is completed.

Joshua, I’m sharing the following materials with you:

The GitHub repository for the OBS presentation.: https://github.com/BemaISLTD/obs-presentations.git

The complete storyboard package, including the visual compositions, scene instructions, presenter guidance, and animation plans.

The current background-reference package.

The detailed technical handoff document attached to this email.

Please read the complete handoff document before beginning implementation.

Overall responsibility
Your responsibility is to implement all of the approved storyboard scenes as functional OBS-ready scenes.

The four scenes identified in the handoff—Scenes 03, 08, 14, and 38—are the initial architecture and layering proof. They are not the full scope of the assignment.

Please use those four scenes to confirm that the technical structure works correctly before applying the system across the rest of the storyboard. Once the architecture has been reviewed and approved, you should proceed with completing all remaining scenes.

The purpose of the early review is to prevent us from discovering a structural problem after every scene has already been built.

Required layer structure
Please think of each OBS scene as four layers, ordered from back to front:

Z0 — Background: The full-frame environmental background. For now, use the supplied PNG background references. I am separately working on animated Blender backgrounds that may replace some or all of these stills later.

Z1 — Midground scene graphics: The scene-specific visuals that sit behind the presenter. These include titles, cards, diagrams, statistics, interface demonstrations, charts, calls to action, and other storyboard elements.

Z2 — Presenter: The live presenter camera feed, keyed or background-removed inside OBS. This layer is not part of the browser graphics you are creating.

Z3 — Foreground graphics: The visual elements that appear in front of the presenter, such as tickers, lower thirds, front-edge accents, labels, and any other storyboard elements specifically intended to overlap the presenter.

Your main responsibility is to create and implement Z1 and Z3.

The supplied backgrounds serve as Z0 placeholders until the Blender versions are ready. Your implementation must allow us to replace a background still with a motion background later without rebuilding the scene graphics.

Separate OBS outputs are required
The presenter must be able to sit between the midground and foreground graphics. Therefore, the presentation cannot be delivered as one flattened browser source.

The application must provide:

An underlay browser output containing Z0 and Z1.

The live presenter camera in OBS as Z2.

A separate foreground browser output containing only Z3 on a transparent background.

The intended OBS order is:

Underlay browser source.

Presenter camera source.

Foreground browser source.

Please do not combine the behind-presenter and in-front-of-presenter graphics into one flattened output.

The existing overlay comparison mode in the repository is not the same thing as the required transparent foreground output. The attached handoff explains this distinction in detail.

Storyboard authority
The storyboard is the primary visual and motion reference.

For each scene, review:

The approved composition.

The purpose of the scene.

The presenter’s position.

What should appear behind the presenter.

What should appear in front of the presenter.

The entry movement.

The movement or activity during the scene.

The exit movement.

The timing and success criteria.

Please do not redesign the scenes or replace the approved layouts with a different interpretation because it is easier to implement.

Where the existing code differs from the approved storyboard, follow the storyboard unless I explicitly approve a change.

The complete storyboard images contain both the approved visual composition and a written specification area. Only the visual composition should be recreated in the live 1920×1080 output. The written specification section must never appear in the broadcast output.

Animation and asset decisions
Where practical, please create the scene elements with HTML, CSS, SVG, Canvas, and JavaScript so that text, numbers, labels, charts, QR codes, and live information remain editable.

However, I do not want the implementation to look visually limited simply because everything was forced into JavaScript.

For effects that require greater visual richness—such as complex 3D movement, liquid effects, energy effects, cinematic transitions, or another treatment that would not look convincing when generated in the browser—you may create or use a short rendered media asset.

That may include AI-assisted asset creation where appropriate, but any AI-generated visual must match the approved storyboard and overall visual language. Please do not introduce a new visual direction without approval.

Do not render an entire scene as a single video. Text, live data, QR codes, and other information that may need to change should remain separate and editable.

Background implementation
For now, use the supplied background PNGs.

The repository currently references the background assets, but the background folder was not included in the uploaded repository package. The separate background-reference ZIP is therefore necessary.

Please add the supplied assets to the correct repository path and commit them so that the project does not produce missing-file errors.

The background system must support:

The supplied PNG as the current poster or fallback.

A Blender video loop when one becomes available.

Automatic fallback to the PNG if the video is missing or fails.

Background replacement without changing the Z1 or Z3 scene code.

Please also resolve the competing background configuration systems currently present in the repository. We need one clear active background manifest, not two parallel systems that future developers may update inconsistently.

Jide’s review responsibility
Jide, please review the complete storyboard with particular attention to:

Whether the planned movements support the message.

Whether any motion feels unnecessary, distracting, or inconsistent.

Whether the presenter positions work for the planned delivery.

Whether the transitions between scenes make sense.

Whether the information appears at the right moments.

Whether any scene should be simplified or clarified before implementation.

Whether the scene plan supports the way the presentation will actually be delivered.

Please send any concerns or recommended changes as early as possible, particularly before Joshua has completed the affected scene.

For now, we are building one complete, approved version of the presentation. In the future, we may create alternate versions for different situations, audiences, or presenters. A future presenter may also adjust aspects of the delivery to fit their personal presenting and closing style.

That future flexibility is not part of Joshua’s immediate assignment. The current goal is to build the first complete, dependable version from the approved storyboard.

Implementation sequence
Joshua, please use the following sequence:

Review the repository, storyboard, background package, and attached handoff.

Correct the repository structure and missing background assets.

Implement the separate underlay, foreground, and composite development outputs.

Complete the four architecture-proof scenes: 03, 08, 14, and 38.

Provide screenshots, short motion recordings, and the exact test URLs for review.

Make any required architecture corrections.

Continue through all remaining storyboard scenes.

Test every scene in underlay, foreground, composite, clean OBS, paused, reference, and fallback-background states.

Complete the full set of scenes and provide final review materials.

Please do not wait for my Blender backgrounds before beginning. The supplied still backgrounds are the approved placeholders and should allow the rest of the work to move forward now.

Definition of completion
The assignment is complete when:

Every approved storyboard scene has been implemented.

Each scene matches the approved composition and motion plan.

The presenter can be placed between the browser underlay and foreground outputs.

Z3 is genuinely transparent outside the intended foreground elements.

Background stills can later be replaced with Blender loops without rewriting the scenes.

All text and changeable information remain editable.

Clean OBS mode contains no guides, filenames, placeholders, debug controls, or specification text.

Paused mode freezes all browser-based motion.

There are no console errors, missing assets, or repeated failed requests.

The production build passes.

Jide and I have reviewed and approved the completed presentation.

Please acknowledge receipt of the repository, storyboard package, background package, and technical handoff. After reviewing them, send back any technical questions or any areas where the storyboard instructions appear to conflict with the existing repository.

Warmest Regards

Eko The Beat
@ekothebeat
FOLLOW - Tik Tok: @ekothebeat
SUBSCRIBE to my Youtube: Eko's Youtube Channel
I believe our meeting is not a coincidence, God has a promise for you, activate it!
#TeamJesus

One attachment
• Scanned by Gmail
2

Jide Omoleye
Sun, Jul 12, 11:30 AM (1 day ago)
kindly download the attachement and open.Lets see if the issue is from my end here, its not opening them. thanks K

Jide Omoleye <jaytoon85@gmail.com>
Sun, Jul 12, 5:18 PM (1 day ago)
to Eko, David, Boluwatife, me

Recommended changes.
SLIDES 8, 10 and 18 on the storyboard could do better with presenter positioning, the presenter could appear in the small bothered square to enable more focus on the information in those slides which talks about IMPACT STATISTICS, PARTICIPATION JOURNEY AND CAMPAIGN DETAIL PAGE.

SLIDE 28 (CHANGEMAKERS OVERVIEW) I feel this can resonate more with only creator activities. The presenter could fade off after a few seconds of introductory remarks for that panel as i do feel its critical for our success criteria which is visible movements and meaningful works that helps build trust for the platform. The changemakers may not appear in a grid form at first we can build suspense and anticipation if they appear(fade in) cheers and applause or ovation audio in the background as the image is centered then fades out as the second person appears then after the last person appears we can then have all of them appear on screen. That way they feel more individually important.

# Joshua Handoff — BemaHub Open Enrollment OBS Scene Build

**Primary implementer:** Joshua  
**Secondary reviewer/support:** Gide  
**Background motion owner:** Eko  
**Project:** BemaHub Open Enrollment OBS presentation

---

## 1. Objective

Build the approved BemaHub Open Enrollment storyboard scenes as OBS-ready browser graphics without waiting for the final Blender background loops.

The final system must let OBS place the live presenter **between** the graphics that belong behind the presenter and the graphics that belong in front of the presenter.

Joshua’s primary responsibility is to build:

- **Z1 — Midground scene content:** titles, cards, diagrams, charts, product walkthrough visuals, live metrics, QR/CTA modules, and other scene-specific graphics that remain behind the presenter.
- **Z3 — Foreground broadcast graphics:** ticker, lower thirds, labels, front-edge accents, foreground particles, and any approved element intended to pass in front of the presenter.

Joshua is **not** responsible for creating the final Z0 Blender motion backgrounds. He must integrate the supplied still backgrounds now and make the system ready for Eko to replace those stills with video loops later without rewriting each scene.

---

## 2. Sources of Truth

Use the materials in this priority order:

### A. Storyboard ZIP — visual and animation source of truth

`bemahub_storyboard_core_01_35_numbered.zip`

Despite the filename, the package contains **39 scenes**, including utility scenes 36–39.

Each storyboard image contains:

- The approved scene composition at the top.
- Scene purpose and timing.
- Presenter guidance.
- Visual-layout instructions.
- Entry, during, and exit animation guidance.
- Success criteria.

The top composition is the visual target. The specification section is production guidance and must never appear in the OBS output.

### B. BG Reference ZIP — current Z0 source of truth

`bg ref.zip`

This contains 14 current background stills. Use these as the backmost background assets until Eko supplies Blender-rendered loops.

### C. GitHub repository — implementation source of truth

Use the GitHub repo Eko provides as the only working codebase. Do not create a separate replacement project.

The existing code is a starting point, not the approval reference. Where the code and storyboard differ, the storyboard wins unless Eko explicitly approves a change.

---

## 3. Use One Layer Vocabulary Only

Use this back-to-front naming everywhere in code, tickets, commits, and conversations:

| Z layer | Name       | Owner/source           | Contents                                                                      |
| ------- | ---------- | ---------------------- | ----------------------------------------------------------------------------- |
| **Z0**  | Background | Eko / supplied BG refs | Full-frame environment: still now, Blender loop later                         |
| **Z1**  | Midground  | Joshua                 | Scene-specific graphics that must remain behind the presenter                 |
| **Z2**  | Presenter  | OBS production         | Live keyed or background-removed camera feed                                  |
| **Z3**  | Foreground | Joshua                 | Ticker, lower thirds, front accents, and approved elements over the presenter |

Do not also call Z0 “Layer 4.” That reverse numbering will cause implementation and OBS-order mistakes.

---

## 4. Required OBS Architecture

A single flattened browser page cannot place the live presenter between Z1 and Z3. Therefore, the web app must expose separate OBS render outputs.

### OBS source order, back to front

1. **Bema Underlay browser source** — renders Z0 + Z1.
2. **Presenter camera source** — Z2, controlled in OBS.
3. **Bema Foreground browser source** — renders Z3 on a transparent canvas.

### Required URLs

Add a render parameter without breaking the existing scene, mode, output, clean, paused, or debug parameters.

Recommended form:

```text
/?scene=03&mode=live&output=obs&clean=true&render=underlay
/?scene=03&mode=live&output=obs&clean=true&render=foreground
/?scene=03&mode=live&output=storyboard&render=composite
```

Required values:

- `render=underlay` — Z0 + Z1 only.
- `render=foreground` — Z3 only, fully transparent except for intended graphics.
- `render=composite` — development/review view combining Z0, Z1, a presenter-safe-zone placeholder, and Z3.
- Optional: `render=background` for Z0-only diagnostics.

The existing `mode=overlay` is currently a storyboard-reference comparison mode. It must **not** be treated as the Z3 foreground output. Keep those concepts separate.

### Foreground transparency

In `render=foreground`:

- `html`, `body`, `#app`, the canvas, and visual stage must be transparent.
- Do not render the background fallback, poster, video, bloom, or tint.
- Do not render Z1.
- Do not render a fake presenter or presenter box.
- Render only Z3 elements.

---

## 5. Current Repository Audit

The uploaded repository ZIP was inspected and currently builds successfully with `npm run build`. Before full scene production, fix the following structural issues.

### A. Background files are referenced but missing

The active manifest points to paths such as:

```text
/public/assets/backgrounds/ref/bg01-countdown-stage-light.png
```

However, `public/assets/backgrounds/` is not present in the repository ZIP.

Create and commit this structure:

```text
public/assets/backgrounds/
  ref/
  videos/
    loops/
    intros/
    outros/
```

Copy the 14 supplied BG-reference PNGs into `public/assets/backgrounds/ref/` using their existing filenames.

Until Blender videos exist, the PNG must load cleanly with no 404 errors.

### B. Two competing background systems exist

The current app uses:

```text
src/backgrounds/backgroundManifest.js
src/components/BackgroundLayer.js
```

The repo also contains an older parallel system:

```text
src/config/backgroundRegistry.js
src/config/sceneBackgroundMap.js
src/components/VideoBackground.js
docs/background-assets-plan.md
```

Do not build against both systems.

Use `src/backgrounds/backgroundManifest.js` as the active system. Port any still-needed behavior, then remove or clearly deprecate the older system so a future developer cannot update the wrong map.

### C. Only scenes 01–05 have live renderers

`src/scenes/index.js` currently registers scenes 01–05 only. Scenes 06–39 are reference placeholders and will throw an error in live or overlay mode.

Do not report the presentation as complete until every approved scene has a registered renderer.

### D. Utility scenes 36–39 need background assignments

The active background assignment map currently ends at scene 35.

Add explicit assignments for:

- **36 — Live Q&A:** utility/Q&A wave family.
- **37 — Enrollment Progress Live:** dashboard/product-tech family.
- **38 — Please Stand By:** utility/hold-wave family.
- **39 — Close Loop:** utility/closing-wave family unless Eko approves another background.

### E. Duplicate storyboard asset folders exist

The repo currently has both:

```text
public/assets/storyboard/core/
public/assets/storyboards/core/
```

`slides.json` uses the plural path. Standardize on one directory and remove the duplicate after checking references.

### F. Do not stretch the complete storyboard image into the live frame

The storyboard PNG includes both the scene composition and the specification sheet. It is not itself a 1920×1080 live slide.

For live output:

- Rebuild the top composition at 1920×1080.
- Never display the specification sheet.
- Never use the entire storyboard PNG as a flattened live scene.
- In reference/review mode, preserve the source aspect ratio or crop intentionally. Do not use `object-fit: fill` if it distorts the reference.

### G. Presenter placeholders are development aids only

Any `.presenter-frame` or model image used for alignment must disappear in `output=obs&clean=true`.

The actual Z2 presenter comes from OBS, not the browser page.

---

## 6. Scene Component Contract

Every scene module must separate Z1 and Z3 instead of returning one undifferentiated block.

Recommended contract:

```js
export const scene06 = {
  renderUnderlay(context) {
    // Z1 only. Z0 is supplied by the shared BackgroundLayer.
  },

  renderForeground(context) {
    // Z3 only.
  },

  setup(root, context) {
    // Timers, data updates, and animation setup.
  },

  cleanup(root, context) {
    // Remove timers, observers, and listeners.
  },
};
```

The app shell decides which render method to call from the `render` query parameter.

Shared items such as ticker, lower third, live badge, QR module, and presenter-safe-zone guides should be reusable components rather than copied into each scene.

---

## 7. Presenter-Safe Layout Rules

The storyboard’s presenter photo is a position and scale reference, not a final asset.

Each scene configuration must declare one of:

```text
presenter: none
presenter: left
presenter: center
presenter: right
presenter: full
```

Z1 must preserve the declared presenter safe zone.

Rules:

- Do not place essential text, QR codes, or data behind the presenter’s face or torso.
- Do not place rapidly moving particles directly behind the face.
- Z3 may cross the lower torso only when the storyboard clearly calls for a ticker or lower third.
- Z3 must not cover the presenter’s eyes, mouth, or primary hand gestures.
- Scenes with `presenter: none` may use the full frame.

Include a visible presenter-safe-zone guide in development mode and hide it in clean OBS mode.

---

## 8. Asset and Animation Rules

### Preferred implementation order

1. **HTML/CSS/SVG** for text, cards, icons, diagrams, progress bars, charts, counters, and UI panels.
2. **Canvas or lightweight JavaScript** for waveform, particle, path-following, and data-reactive effects.
3. **Pre-rendered media** only when code would visibly reduce the quality or make the animation unnecessarily expensive.

### Approved reasons to use pre-rendered media

Use a short rendered asset for effects such as:

- Complex 3D movement.
- Liquid, glass, fabric, smoke, or energy simulation.
- Rich cinematic transitions.
- One-off illustrated motion that is not data-driven.
- An effect that cannot match the storyboard convincingly with CSS/SVG/Canvas.

### Media requirements

- Do not flatten the entire scene into a video.
- Keep all text, numbers, QR codes, and live data editable in HTML.
- For transparent Z3 motion, use transparent WebM/VP9 or a transparent PNG sequence. MP4 does not provide a transparent alpha channel.
- For rectangular Z1 clips, MP4 is acceptable.
- All media must be local in the repo; do not depend on external URLs.
- Use muted autoplay, `playsinline`, and loop only where the storyboard specifies ongoing motion.
- Include a still fallback.
- AI-generated assets must match the approved visual language and require Eko’s approval before being treated as final.

### Performance rules

- Animate `transform` and `opacity` wherever possible.
- Avoid large continuously animated blur filters.
- Do not create hundreds of DOM nodes for particles when a canvas or video would be more efficient.
- No console errors, missing-file errors, or repeated failed network requests.
- Respect `paused=true` by freezing timers, CSS animation, video, canvas, and ticker movement.

---

## 9. Background Replacement Contract

Eko must be able to replace a still with a Blender loop without Joshua rewriting scene code.

For every background entry:

```js
{
  id,
  posterPath,
  loopVideoPath,
  introVideoPath, // optional
  outroVideoPath, // optional
  preferredScenes,
}
```

Required behavior:

1. Try the loop video when present.
2. Fall back to the supplied PNG poster if the video is absent or fails.
3. Fall back to a CSS color/gradient only if both media assets fail.
4. Do not shift, resize, or reflow Z1 when the background changes.
5. Preserve scene legibility with a configurable tint/opacity layer.
6. Background motion must never contain text, QR codes, live metrics, or scene-specific information.

---

## 10. Scene-Build Procedure

Follow this sequence for every scene.

### Step 1 — Read the complete storyboard panel

Record:

- Scene number and title.
- Whether a presenter is present.
- Presenter position.
- Required Z1 elements.
- Required Z3 elements.
- Entry animation.
- During/hold animation.
- Exit animation.
- Scene duration.
- Any live or mock data.

### Step 2 — Create or update scene data

Keep text and metrics out of the markup whenever practical.

Use `slides.json`, a scene-specific JSON file, or shared data files for:

- Titles and subtitles.
- Card labels.
- Counters and percentages.
- Ticker items.
- Questions.
- CTA copy.
- QR destinations.
- Names and profile information.

Do not invent new copy or rename approved terms.

### Step 3 — Build Z1 first

Reproduce the approved composition behind the presenter.

Use the supplied BG still only as Z0. Do not bake the background into Z1.

### Step 4 — Test with a presenter placeholder

In composite development mode, show a neutral silhouette or outlined safe zone at Z2.

Do not use a generated presenter as the final implementation.

### Step 5 — Build Z3 separately

Add only elements that truly belong in front of the presenter.

The foreground output must be transparent outside those elements.

### Step 6 — Add animation in three phases

Implement the storyboard’s:

- Entry.
- During/hold.
- Exit.

Do not add unrelated parallax, camera drift, bouncing, or decorative motion merely because it is easy to generate.

### Step 7 — Test all outputs

For each scene, test:

```text
render=underlay
render=foreground
render=composite
mode=reference
mode=overlay
output=obs
output=storyboard
clean=true
paused=true
bgVideo=false
```

### Step 8 — Capture proof

For each completed scene, provide:

- Underlay screenshot.
- Foreground screenshot shown over a checkerboard or contrasting background.
- Composite screenshot with presenter placeholder.
- 5–10 second screen recording showing the approved motion.
- The exact URLs used for testing.

---

## 11. Development Milestones

Do not build all 39 scenes before review.

### Milestone 1 — Architecture proof

Complete the render split and prove the layer order using these four scenes:

- **03 — Host Standby Camera:** presenter layering and ticker.
- **08 — Impact Statistics Overview:** data cards and infographic motion.
- **14 — Live Enrollment Invitation:** presenter, QR, CTA, and foreground elements.
- **38 — Please Stand By:** no-presenter utility scene and looping motion.

Stop and get Eko’s approval before scaling the pattern.

### Milestone 2 — Core scenes 01–15

Implement and review scenes 01–15.

### Milestone 3 — Walkthrough and impact scenes 16–35

Implement and review scenes 16–35.

### Milestone 4 — Utility scenes 36–39

Implement and review the four utility outputs.

### Milestone 5 — Final background integration

After Eko supplies Blender loops:

- Add videos to the manifest paths.
- Verify fallback behavior.
- Confirm readability.
- Confirm seamless looping.
- Confirm no scene code changed merely to swap the background.

---

## 12. Definition of Done for Each Scene

A scene is done only when all of the following are true:

- The composition matches the approved storyboard.
- The live output is 1920×1080.
- The spec sheet is not visible.
- Z0 and Z1 render in the underlay output.
- Z3 renders independently on transparency.
- A real OBS camera can sit between them.
- Presenter-safe placement matches the storyboard.
- Entry, hold, and exit behavior follow the animation notes.
- Text and data remain editable.
- The background still loads when no Blender video exists.
- Missing video does not create an error or blank scene.
- `paused=true` freezes all motion.
- `clean=true` hides guides, debug controls, filenames, and placeholders.
- No deprecated terminology is introduced.
- No console errors or asset 404s occur.
- `npm run build` passes.
- Eko has approved the proof screenshot and motion capture.

---

## 13. Do Not Do These Things

- Do not redesign the storyboard.
- Do not substitute your own layout because it is easier to code.
- Do not combine Z1 and Z3 into one OBS source.
- Do not use `mode=overlay` as the foreground-render solution.
- Do not leave the presenter baked into an image.
- Do not use the full storyboard screenshot as the live slide.
- Do not create a second independent repo.
- Do not build against both background registries.
- Do not hardcode live data into a video.
- Do not add generic parallax or random motion that is absent from the storyboard.
- Do not proceed from the four-scene architecture proof to the full batch without approval.

---

## 14. First Pull Request Expected

The first pull request should contain only the architecture foundation and the four-scene proof.

It must include:

1. Background reference assets committed to the correct path.
2. One active background manifest.
3. `render=underlay|foreground|composite`.
4. Transparent foreground output.
5. Presenter safe-zone tooling.
6. Scene-component split for Z1 and Z3.
7. Explicit mappings for scenes 36–39.
8. Pilot implementation for scenes 03, 08, 14, and 38.
9. Updated README with OBS source-order instructions.
10. Proof screenshots and test URLs.
11. A passing production build.

Do not begin mass-producing the remaining scenes until that pull request is reviewed and approved.
