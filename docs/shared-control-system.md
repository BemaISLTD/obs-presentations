# Shared OBS control system

## Runtime topology

One Node process is the authority for a show. It serves the presentation pages,
the `/control` operator page, JSON endpoints under `/api/control`, and the SSE
stream at `/api/control/events`. Its SQLite file defaults to
`data/obs-control.sqlite` and uses WAL mode.

Every synchronized browser source loads its initial state with
`GET /api/control/state`, then holds an `EventSource` connection. A control-room
write updates SQLite first and broadcasts the resulting revision. This gives
existing displays immediate updates and gives late/restarted displays the same
state from the database.

## Persisted state

- Active scene and presentation mode
- Global animation pause state
- Background video/poster preference
- Scene 36 selected question
- Ticker visibility, pause, and priority announcement
- Latest cue/animation command and monotonic command sequence

The command sequence is important: clicking the same cue twice creates a new
sequence, so displays replay the animation instead of treating the second click
as a duplicate.

## API

- `GET /api/control/state` — current snapshot
- `PATCH /api/control/state` — merge global settings
- `POST /api/control/command` — send a cue or change scene and increment sequence
- `GET /api/control/events` — server-sent state events and heartbeats

When `CONTROL_TOKEN` is set, both write endpoints require it. The control page
stores the entered token in `sessionStorage`; it is not written to SQLite.

## Display behavior

Use `sync=true` for OBS underlay, foreground, and composite browser sources.
Each display preserves its `render` role while scene navigation is shared. Scene
changes reload scene markup; cue commands apply immediately without a reload.
New displays apply the last stored cue during boot.

The home page has synchronization enabled when no explicit `scene` is supplied.
An explicit `scene=...` URL remains isolated unless `sync=true` is also present.

## Backups and relocation

Stop the Node server before copying the database for a cold backup. Set
`OBS_DB_PATH=/absolute/path/show.sqlite` to place it on another durable local
volume. SQLite is the shared store behind the server; clients must never open or
copy the database themselves.
