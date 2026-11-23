# Architecture

This document covers how the code is organised today and how the service is meant to work once it is connected to
real cameras, staff and advocates. For what is simulated in the current build, see the README.

## Service model

```
 Owner abroad ──────── web dashboard ──────────┐
                                               │
             ┌─────────────────────────────────┴──────────────────────────────┐
             │                        Paridhi API                              │
             │  properties · activity log · requests · signed evidence         │
             └──────▲──────────────────▲───────────────────▲──────────────▲───┘
                    │                  │                   │              │
          incidents + snapshots   visit reports     record checks    caveat status
                    │                  │                   │              │
            Solar 4G camera     Field inspector     Ops staff check   Retained local
            on a 4.5 m pole     (monthly + on       state land        advocate
                                 request)           records portal
```

1. **Camera.** Uploads scheduled snapshots and motion clips over 4G, plus a heartbeat every 60 seconds. A weekly
   comparison against a baseline image flags change. Incidents reach the API at
   `POST /api/properties/:id/incidents`, authenticated with a device token.
2. **Field inspection.** A monthly visit, plus extra visits the owner requests. The inspector's photos carry GPS
   metadata, which the app compares with the surveyed corner pegs (a photo counts as on-site within 50 m).
3. **Land record watch.** Staff check the state portal for mutation applications the owner did not start, and record
   anything found as a flagged mutation. There is no portal API; see [REGISTRY_RADAR_SPEC.md](REGISTRY_RADAR_SPEC.md).
4. **Advocate.** Lodges and renews caveats in the civil court, files objections with the revenue office when a
   mutation is flagged, and confirms filings back into the system.

## Code layout

```
shared/types.ts        Data model used by both sides (ISO 8601 timestamps throughout)
shared/domain.ts       Rules both sides must agree on: caveat expiry (90 days), geofence (50 m),
                       distances and bearings, and the alerts that drive a plot's status
services/src/app.ts    Express app factory: identifies the viewer, owner and device routes, photos, errors
services/src/staff.ts  Staff console routes and role checks
services/src/http.ts   Validation helpers, errors, activity log helper
services/src/config.ts Chooses the mode from the environment: database with sign-in, or open demo
services/src/store.ts  Storage interface with MemoryStore (demo) and PostgresStore, scoped per request
services/src/db.ts     Postgres pool and transactions
services/src/auth.ts   Verifies Supabase Auth access tokens (JWKS, or a legacy shared secret)
services/src/seed.ts   Sample portfolio, with dates generated relative to startup
supabase/migrations/   Database schema
services/src/evidence.ts  Canonical JSON, SHA-256, Ed25519 signing, RFC 6962-style Merkle tree
services/src/server.ts Standalone server: API plus the built web app
api/index.ts           Vercel serverless entry for the same Express app
web/src/               React owner view, sign-in screen and staff console (web/src/staff, at /staff)
```

### Two modes

`loadConfig` picks the mode from the environment:

- **Database with sign-in** (`DATABASE_URL` set): data lives in Postgres and owners sign in with Supabase Auth. The
  server will not start without the Supabase settings, so real data is never served openly.
- **Open demo** (no `DATABASE_URL`): three sample plots in memory, no sign-in, and the `/api/demo` routes.

### Storage

`properties` holds each plot as a JSON document plus its `owner_id`. The activity log and signed evidence are separate
tables, because they grow and are append-only. Owner actions go through `Store.updateProperty`, which locks the row,
applies the change, and writes the property, new activity and any evidence in one transaction; if the change is
rejected (for example a duplicate request), nothing is saved. A trigger refuses any update or delete on
`evidence_records`.

### Roles and scopes

Every request is resolved to a viewer: an owner, a staff member (`staff_members` row: ops, inspector or advocate),
or the open demo. Each store call takes a scope:

| Scope | Plots |
| :--- | :--- |
| `owner` | Plots whose `owner_id` is the viewer |
| `inspector` / `advocate` | Plots whose `inspector_user_id` / `advocate_user_id` is the viewer |
| `all` | Every plot: ops staff, camera devices, and the demo |

The scope is part of the SQL `where` clause, so a plot outside it is simply not found (404). Role checks on top decide
which actions each role may take; see the table in the README.

### Inspection photos

The inspector's phone shrinks each photo to at most 1600 px, records its GPS position, and uploads it with the peg it
shows. The server checks the file is a real JPEG, PNG or WebP, hashes it, and stores it unattached. Saving the visit
attaches the photos (each photo can belong to one visit only) and signs a visit record that includes every photo's
hash. A trigger stops photo content, location or visit link from changing, and stops photos being deleted. Photos are
served through the API with the same access checks as the plot.

### Sign-in and isolation

The web app reads the Supabase URL and publishable key from `/api/health` and signs owners in with supabase-js
(password, or an emailed link). Each API request carries the access token. The server verifies it against the
project's public key set (ES256), then scopes every query to that owner's id, so another owner's plot simply returns
404. The tables have row level security on and no grants to the Data API roles, so the publishable key cannot read
them directly. Accounts are created by Paridhi; public sign-up should be turned off in Supabase.

### Status is derived, never stored

A plot's status (`ALL_CLEAR`, `ATTENTION_NEEDED` or `ACTION_REQUIRED`) is computed by `getPropertyAlerts` in
`shared/domain.ts` from the underlying facts: flagged mutations, inspection findings, camera state and caveat expiry.
The API uses it when signing a dossier and the dashboard uses it for every badge, so the two cannot disagree and no
screen can show "clear" while something is flagged.

### Owner actions are requests

Requesting an inspection or a caveat renewal records a request and an activity entry. It does not claim the visit
happened or the caveat was filed; those are confirmed later by the inspector or advocate.

### Evidence

The server signs what it receives. Each record stores the exact payload string, its SHA-256, an Ed25519 signature and
the signing key id. The public key is served at `/api/evidence/public-key`. Details and limits are in
[BSA2023_EVIDENCE_SPEC.md](BSA2023_EVIDENCE_SPEC.md).

### Real-time updates

The dashboard polls the API every 30 seconds while the tab is visible, and refreshes immediately after each action.
This works the same on a long-running server and on serverless hosts. Polling is enough for this domain, where
events are measured in hours, not seconds.

## Deployment notes

- **Standalone:** `npm run build && npm start` serves the API and the dashboard from one Node process.
- **Vercel:** `api/index.ts` exposes the same app as a serverless function. Use Supabase's transaction pooler URL for
  `DATABASE_URL`. Without a database, memory is per instance and demo changes may not persist.
- **Secrets:** set `DATABASE_URL`, `PARIDHI_SIGNING_KEY` and `PARIDHI_DEVICE_TOKEN` in the host's secret store, never
  in the repo.
