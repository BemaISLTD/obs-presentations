# Deploying the shared OBS server on Coolify

This project must run as the Node server in `server/server.js`. A static Vite
deployment is not sufficient: it does not provide `/control`, the control API,
the SSE event stream, or persistent SQLite state.

## Create the resource

1. In Coolify, create a new resource from this Git repository.
2. Select **Docker Compose** as the build pack.
3. Use `/` as the base directory.
4. Set the Compose location to `/docker-compose.yaml`.
5. Deploy the `obs-presentation` service.
6. Assign the public domain to container port `3000`. In Coolify's domain field,
   use a value such as `https://obs.example.com:3000`. The `:3000` tells the
   Coolify proxy which internal container port to target; visitors still use
   normal HTTPS.

Do not add a custom Docker network. Coolify connects its proxy to the Compose
stack's managed network automatically.

## Persistent database

The Compose stack mounts the named volume `obs-control-data` at `/app/data`.
The database path inside the container is:

```text
/app/data/obs-control.sqlite
```

The volume survives image rebuilds and normal redeployments. Never mount the
repository's `data` directory into the container and never store the production
database in the image itself.

Keep this service at one replica. SQLite is appropriate for many connected
browser clients, but this application's SSE broadcaster is a single Node
process and should not be horizontally scaled without moving state/events to a
network database and message broker.

## Environment variables

Set these in the Coolify service environment:

```text
CONTROL_TOKEN=<a-long-random-secret>
```

The remaining values are supplied by Compose:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
OBS_DB_PATH=/app/data/obs-control.sqlite
```

After deployment, open `/control`, expand **Control server token**, and enter
the same `CONTROL_TOKEN`. It is stored only in that browser tab.

## Verification

Check these URLs on the deployed domain:

```text
/api/control/health
/api/control/state
/control
/?sync=true&output=obs&render=composite&clean=true
```

The health endpoint should return JSON containing `"status":"ok"`. Open two
synchronized display pages, select a different scene in `/control`, and confirm
both pages change and animate the background.

## Existing deployments

If the current Coolify resource uses Nixpacks or a static build pack, create a
new Docker Compose resource or change its build pack to Docker Compose. Merely
adding `npm run build` will continue to omit the server runtime.

