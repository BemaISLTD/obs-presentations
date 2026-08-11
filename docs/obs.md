# Setting up the presentation in OBS

This guide covers building the master scene in OBS, connecting the control room
to OBS WebSocket, and running the show. Follow it in order — each section
assumes the previous one is done.

Everything here runs on the local network. No Internet connection is required
during the show.

## Before you start

Start the presentation server on the show computer:

```sh
npm install
npm run build
npm start
```

The terminal prints the address to use everywhere below. On the OBS computer
that is normally `http://localhost:5173`. Note the LAN address too (for example
`http://192.168.1.25:5173`) if the control room will be operated from a laptop
or tablet.

Confirm the server is up by opening `http://localhost:5173/control`. Leave this
page open — it is the operator surface for the whole show.

> Node 24 or newer is required. Use `npm start`, not `vite`: the standalone Vite
> command does not serve the control API or shared state.

## The layer model

OBS composites three layers. The live presenter sits between two browser
sources, which is the entire reason the presentation and ticker are separate
pages:

```
TOP     Ticker / foreground   Browser source   /ticker
        Presenter camera      Video capture device
BOTTOM  Background            Browser source   /presentation
```

OBS draws the source list top-to-bottom, so the order in the list *is* the
layer order. The ticker must be above the camera and the presentation below it.

## Build the master scene

1. In OBS, create a scene. This guide calls it **OPEN ENROLLMENT MASTER**; any
   name works, since you will select it in the control room later.

2. Add the background presentation:
   - **Sources → + → Browser**, name it `Presentation`.
   - URL: `http://localhost:5173/presentation`
   - Width **1920**, Height **1080**.
   - Leave *Shutdown source when not visible* **unchecked**. The page needs to
     stay connected to shared state so it is never mid-reload on a cue.

3. Add the presenter camera:
   - **Sources → + → Video Capture Device** (or NDI, Camo, or a capture card).
   - Name it something you will recognise in a dropdown, for example
     `Presenter Camera`.
   - Position and size it as you want it to appear full-frame.

4. Add the ticker/foreground:
   - **Sources → + → Browser**, name it `Ticker`.
   - URL: `http://localhost:5173/ticker`
   - Width **1920**, Height **1080**.
   - Leave *Shutdown source when not visible* **unchecked**.

5. Drag the sources so the list reads, from top to bottom:

   ```
   Ticker              (browser source)
   Presenter Camera    (video capture device)
   Presentation        (browser source)
   ```

The `/ticker` page is genuinely transparent outside its lower thirds and ticker
bar, so the camera and presentation show through it. If the ticker page appears
as a solid rectangle, the URL is wrong — check that it is `/ticker` and not `/`.

> The exact URLs for your machine are listed on the control room page under
> **OBS browser sources → Synced URLs**, in the same top-to-bottom order as the
> OBS source list. Copy them from there when the control room is on another
> device, so you get the LAN address rather than `localhost`.

### Check the layering

Open `/control` and press **Play full sequence** on any scene. You should see
the presentation animate in behind the camera, with the ticker bar over the top.
If the camera is hidden behind the presentation, the source order is wrong.

## Connect the control room to OBS

The controller drives the presenter camera over OBS WebSocket.

1. In OBS: **Tools → WebSocket Server Settings**.
2. Tick **Enable WebSocket server**.
3. Note the **Server Port** (default `4455`).
4. Either untick **Enable Authentication**, or click **Show Connect Info** and
   copy the password.
5. Click **Apply**.

Then on the control room page, in the **OBS connection** panel:

| Field | Value |
| --- | --- |
| Host | `127.0.0.1` when the controller runs on the OBS computer, otherwise the OBS computer's LAN address (`192.168.1.25`) |
| Port | The port from step 3, normally `4455` |
| Password | The password from step 4, or blank if authentication is off |

Click **Connect**. The status pill turns green and reads **Connected**.

Next, still in that panel:

6. **Scene to control** — pick your master scene from the dropdown. The list is
   read live from OBS.
7. **OBS source** — pick your presenter camera from the dropdown. This list
   contains the sources inside the selected scene.

Both fields also accept a typed name, which is the fallback when OBS is closed
or you prefer not to use discovery. Nothing is hard-coded: these are settings,
saved to the shared database, and they persist across restarts.

Once connected, the controller reconnects automatically the next time the
control room is opened.

### Test it

Use **Show** and **Hide** in the Presenter row. The camera should appear and
disappear in the OBS preview. If it does not, see Troubleshooting below.

## Running the show

Presenter visibility is part of the cue system, so normal operation needs no
separate camera handling. One cue moves every layer together:

```
Next cue → background scene + ticker/foreground + presenter camera
```

Camera scenes bring the presenter in on their entry cue and take it out on their
exit cue. Graphics-only scenes retire the camera on entry, so it can never be
left on air underneath a full-screen layout.

The **Show** and **Hide** buttons remain available at any time for manual
control and testing. They write the same shared state the cues use, so the two
can never disagree.

### Where the camera appears

These scenes bring the presenter in automatically, at the placement shown:

| Preset | Scenes |
| --- | --- |
| Full frame | 03, 05, 35, 36 |
| Lower right | 06, 07, 14, 24, 25, 33, 34, 39 |
| Picture in picture | 02, 08, 09, 10, 11, 12, 13, 18, 19, 37 |

All other scenes (01, 04, 15–17, 20–23, 26–32, 38) hide the camera on entry.

Placement presets are declared in [`src/obsPresenterDirector.js`](../src/obsPresenterDirector.js)
and the per-scene plan in [`src/sceneControls.js`](../src/sceneControls.js).
Version one applies a preset as an immediate move; animated entrances and exits
are a planned extension of the same presets.

> **Preset positioning is a starting point.** The lower-right, centre, and PiP
> coordinates assume a 1920×1080 camera framed to fill the canvas. Check them
> against your actual camera during rehearsal and adjust the values in
> `PRESENTER_PRESETS` to match your framing. If you would rather position the
> camera by hand in OBS, leave every source on **Full frame** — that preset
> applies no transform and preserves your OBS framing exactly.

## Recording and streaming

OBS remains responsible for video capture, background removal, camera
transforms, compositing, audio, recording, streaming, and the final HDMI output.
Configure those in OBS as normal — the controller does not touch them.

Program audio (the music controls in the control room) plays from the
`/presentation` browser source, so it is captured by OBS along with everything
else. Keep that source unmuted in the OBS audio mixer.

## Troubleshooting

**The ticker page is a solid block, hiding the camera.**
The URL is wrong. It must be `/ticker`, which is transparent. The plain `/` and
`/program` addresses are full composites and are not meant to sit above a
camera.

**The status pill says Disconnected.**
Check that the WebSocket server is enabled in OBS, that the port matches, and —
when the controller is on another device — that you used the OBS computer's LAN
address rather than `127.0.0.1`. The panel shows the specific reason
underneath, including a rejected password.

**Show/Hide does nothing, and the panel reports the source was not found.**
The configured source name does not exist in the selected scene. Re-pick it from
the **OBS source** dropdown, or click **Refresh from OBS** if you renamed it in
OBS after connecting.

**OBS disconnected mid-show.**
The presentation keeps running. Scene, cue, ticker, and data controls are
unaffected, and presenter state continues to be recorded — it is re-applied when
OBS reconnects. Press **Connect** again once OBS is back.

**The browser sources show a stale scene.**
Confirm both URLs contain `sync=true` (the `/presentation` and `/ticker`
aliases add it automatically). A source pinned to an explicit `?scene=` is
intentionally not synchronized.

**The presenter is visible on a scene where it should not be.**
Cues set presenter state on entry and exit. If a scene was reached without
firing its entry cue, press **Reset scene**, which clears the camera.

## Reference

- Browser source URLs and control room details — [`README.md`](../README.md)
- Shared control architecture — [`docs/shared-control-system.md`](./shared-control-system.md)
- Scene-by-scene production notes — [`docs/scene-production-checklist.md`](./scene-production-checklist.md)
