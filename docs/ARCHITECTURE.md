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
services/src/app.ts    Express app factory: routes, validation, device auth, error handling
services/src/store.ts  In-memory store (to be replaced by a database)
services/src/seed.ts   Sample portfolio, with dates generated relative to startup
services/src/evidence.ts  Canonical JSON, SHA-256, Ed25519 signing, RFC 6962-style Merkle tree
services/src/server.ts Standalone server: API plus the built web app
api/index.ts           Vercel serverless entry for the same Express app
web/src/               React dashboard; all data comes from the API
```

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
- **Vercel:** `api/index.ts` exposes the same app as a serverless function. Memory is per instance, so a database is
  required before real use.
- **Secrets:** set `PARIDHI_SIGNING_KEY` and `PARIDHI_DEVICE_TOKEN` in the host's secret store, never in the repo.
