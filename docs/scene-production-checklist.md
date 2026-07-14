# Scene Production Review and Checklist

This checklist compares the supplied storyboard package, the referenced alignment
handoff, and the current repository. The storyboard remains the visual and motion
source of truth. “Ticker” below means a separable Z3 element, not part of the Z1 page.

## Current implementation review

| Scene | What matches | Remaining approximation or gap |
|---|---|---|
| 01 | Countdown, metrics, QR, prompts, atmospheric motion, live data hooks | Geometry and typography need overlay locking; ticker is now independently renderable |
| 02 | Coded waveform, equalizer, particles, center pulse | Brand treatment and spacing need reference alignment; ticker is now independently renderable |
| 03 | Studio poster, presenter opening, monitor content, host lower third, status bar | Presenter bounds need an approved OBS camera crop; exact monitor and studio assets remain approximated |
| 04 | Approved three statements, real logo assets, centered welcome sequence | Exact 3D logo reveal, sound design, and flash exit require rendered/OBS cues |
| 05 | Presenter opening, central title, ten-row data-driven agenda, CTA, Z3 ticker | Exact agenda glyphs and keyed-presenter crop are still missing |
| 08 | Editable statistics, configurable bordered presenter inset, Z3 status bar | Final inset visibility timing and OBS camera crop need approval |
| 14 | Editable access cards, QR, CTA, sequential highlighting, Z3 bar | Final access copy and timing need content-owner approval |
| 38 | Editable hold status, QR, ambient waveform, Z3 bar | Final utility timing and whether LIVE remains visible during interruption need approval |

## Slides 01–35 working matrix

| # | Scene | Presenter / position | Z1 editable content | Z3 | Entry / hold / exit | Status / next work |
|---:|---|---|---|---|---|---|
| 01 | Starting Soon Countdown | No | Countdown, metrics, prompt, QR | Ticker | Reveal / countdown + prompts / opening transition | Live; align and regression-test |
| 02 | Welcome Music Visualizer | Optional small inset | Waveform, equalizer, logo pulse | Ticker/status | Fade up / audio-reactive hold / camera dissolve | Live; align brand and spacing |
| 03 | Host Standby Camera | Center-left camera | Studio and monitor information | Host lower third + status bar | Camera dissolve / subtle studio motion / swipe to stinger | Proof implemented; confirm camera bounds |
| 04 | Grand Opening Stinger | None | Logo and three mission statements | LIVE chip only | 3D reveal / sequential statements / flash | Live approximation; final rendered reveal pending |
| 05 | Host Welcome and Agenda | Left keyed camera | Title, agenda, CTA | Ticker/status | Panels in / row highlights / fade out | Layered live implementation present |
| 06 | What Is Bema Hub | Left | Three explainer pillars | Ticker/status | Panel reveal / gentle emphasis / fade | Reference only; implement |
| 07 | What Is Bema CORE | Left | CORE definition and three pillars | Ticker/status | Panel reveal / icon emphasis / fade | Reference only; implement |
| 08 | Impact Statistics | Small bordered inset, configurable | Six metric cards | Inset border + status bar | Cards cascade / live metric glow / dissolve | Proof updated; confirm inset visibility timing |
| 09 | Programs Overview | Left | Four program cards | Ticker/status | Cards in / controlled highlights / fade | Reference only; implement |
| 10 | Participation Journey | Small bordered inset, configurable | Five-step journey diagram | Ticker/status | Path draws / step progression / fade | Reference only; preserve information focus |
| 11 | EchoLoop Explained | Left | Four-step loop diagram | Ticker/status | Loop draws / circulating emphasis / fade | Reference only; implement |
| 12 | Access Levels Vertical Climb | Left | Tier ladder and benefits | Ticker/status | Tiers rise / selected-tier glow / fade | Reference only; implement |
| 13 | Community Builder Tiers | Left | Five tier cards | Ticker/status | Cards sequence / tier emphasis / fade | Reference only; implement |
| 14 | Live Enrollment Invitation | Left | Access cards, QR, Builder CTA | Enrollment bar | Cards cascade / highlight cycle / transition | Proof implemented; content/timing approval needed |
| 15 | Loop Activity & Recognized Impact | Left | Activity list and impact explanation | Ticker/status | Rows reveal / live activity pulse / fade | Reference only; implement |
| 16 | Home Dashboard Walkthrough | Left | Editable product-screen reconstruction | Ticker/status | Screen in / guided hotspots / transition | Reference only; needs UI data model |
| 17 | Campaigns Page Walkthrough | Left | Campaign grid and filters | Ticker/status | Screen in / campaign highlights / transition | Reference only; needs product captures/data |
| 18 | Campaign Detail Page | Small bordered inset, configurable | Campaign detail and creative-value modules | Ticker/status | Page in / section focus / transition | Reference only; preserve product as primary focus |
| 19 | Choosing Your Access Level | Left | Three access cards | Ticker/status | Cards reveal / selection emphasis / fade | Reference only; implement |
| 20 | Participation Assets Delivered | Left | Four delivered-asset cards | Ticker/status | Assets arrive / confirmation hold / fade | Reference only; implement |
| 21 | LoopLink & LoopCode Activation | Left | Link/code, QR, progress/status | Ticker/status | Activation sequence / pulse / confirmation | Reference only; implement |
| 22 | LoopLock Confirmation | Left | Four-stage confirmation journey | Ticker/status | Stages confirm / success pulse / fade | Reference only; implement |
| 23 | Qualified LoopLocks | Left | Qualification cards/checks | Ticker/status | Checks reveal / qualification glow / fade | Reference only; implement |
| 24 | Recognized Impact Explained | Left | Impact inputs and result diagram | Ticker/status | Diagram builds / connector motion / fade | Reference only; implement |
| 25 | Trust & Transparency | Left | Trust list and dashboard panel | Ticker/status | Rows reveal / verification pulse / fade | Reference only; implement |
| 26 | Events Page Walkthrough | Left | Events list/calendar UI | Ticker/status | UI in / guided highlights / transition | Reference only; needs product data |
| 27 | Event Detail: Join the Moment | Left | Event detail and participation CTA | Ticker/status | Detail in / CTA emphasis / transition | Reference only; needs product data |
| 28 | Changemakers Overview | Intro only, then fades away | One creator at a time, then group | Optional recognition label | Intro / individual reveals / final group | Reference only; sequence, assets, timing, audio undecided |
| 29 | Creator Stories & Proof Updates | Left | Creator cards and proof feed | Ticker/status | Stories reveal / feed updates / fade | Reference only; creator data/assets needed |
| 30 | My Impact Dashboard | Left | Dashboard metrics and activity | Ticker/status | Metrics count / subtle updates / transition | Reference only; needs data schema |
| 31 | Builder Progress Tracker | Left | Milestone path and progress values | Ticker/status | Progress draws / milestone pulse / fade | Reference only; needs data schema |
| 32 | Top Referrers & Community Momentum | Left | Rankings and momentum cards | Ticker/status | Rankings cascade / value updates / fade | Reference only; needs live/mock rankings |
| 33 | Frequently Asked Questions | Left | Configurable FAQ list | Ticker/status | Questions reveal / selected answer hold / fade | Reference only; needs approved FAQ copy |
| 34 | Final Enrollment Call to Action | Left | QR and benefit/action cards | CTA/status bar | CTA builds / QR pulse / closing transition | Reference only; final URL/copy needed |
| 35 | Thank You and Next Steps | Left | Four next-step cards and QR | Closing status bar | Cards reveal / calm hold / close | Reference only; final links/copy needed |

## Architecture decisions now reflected in code

- `mode` selects reference, live, or overlay comparison.
- `output` selects the 1920×1580 storyboard review or 1920×1080 OBS frame.
- `render` selects underlay, foreground, or composite physical layers.
- Z0 posters come from one manifest and can be replaced by video without scene changes.
- Z2 is always an OBS camera source; browser presenter regions are positioning metadata only.
- Z3-only OBS output is transparent outside foreground elements.

## Specific clarifying questions to send

1. **Repository setup — referenced commit:** The working tree’s `main` does not contain
   commit `9426478`, although that commit object is available locally. Should the final
   delivery be rebased onto that commit, or should its relevant alignment changes remain
   selectively integrated into the current work? Selective integration is safer while
   the tree contains uncommitted architecture work.
2. **Assets — Scene 03/05 presenter:** Please provide the intended OBS camera crop/aspect
   ratio and keyed-presenter bounds. The current interpretation is a live OBS source in
   the storyboard’s left/center-left opening; no presenter image will be embedded.
3. **Assets — Scene 04/05 icons:** Are exact SVG exports available for the three Scene 04
   statement icons and ten Scene 05 agenda glyphs? CSS/general icons should remain marked
   as temporary until those exports arrive.
4. **Presenter positioning — Scenes 08/10/18:** Should the small bordered presenter inset
   remain visible for the full scene, or fade after the introduction? Recommended: keep it
   visible but configurable, with a reduced-emphasis state during information animation.
5. **Scene 28 — changemaker data:** Please provide the ordered creator names, portraits,
   individual display duration, final group arrangement, and whether the presenter returns.
6. **Scene 28 — audio:** Should applause be triggered as a dedicated OBS audio cue or by
   an explicit browser control? Recommended: a separate OBS cue, because opening a browser
   source for development must never trigger applause unexpectedly.
7. **Live data:** Which scenes require production API data at launch versus editable mock
   JSON (especially 08, 30, 31, and 32)? The current recommendation is stable mock/data
   adapters until API contracts are supplied.
8. **OBS integration — foreground continuity:** Should the top-right LIVE chip remain in
   the underlay or be promoted to Z3 globally? Current implementation keeps it with scene
   graphics unless it intentionally overlaps the presenter.
9. **Animation:** Are entry and exit transitions triggered by OBS source activation, a
   browser command, or a timed scene controller? This decision is required before exit
   animations can be reliably implemented and tested.
10. **Scene 38:** During a technical hold, should the LIVE badge remain visible and should
    the ticker report the interruption state? Current proof keeps LIVE visible.
