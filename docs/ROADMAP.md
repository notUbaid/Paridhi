# Roadmap

Where the code stands and what to build next, in order.

## Done

- Dashboard driven entirely by API data. Status, badges and checklists are computed from the underlying facts, so
  nothing can show "clear" while an alert is open.
- Shared data model and domain rules (`shared/`) used by both API and web app.
- Caveat expiry from the lodging date (90 days under Section 148A(5) CPC), with a 15-day warning.
- Inspection photo geofence check (50 m from the surveyed peg) and survey bearings and lengths from peg coordinates.
- Device ingest with a shared token, input validation and JSON errors.
- Server-side SHA-256 and Ed25519 signing with a configurable key, a published public key, and an RFC 6962-style
  Merkle root over each plot's evidence.
- Tests that exercise the real HTTP API, the domain rules and the signing code.
- **Postgres storage** (`supabase/migrations/`, `PostgresStore`): properties, an activity log and append-only
  evidence. Every change runs in a transaction and rolls back if rejected. Tests run the real schema in PGlite.
- **Owner sign-in** with Supabase Auth (email and password, or an emailed link). The API verifies access tokens
  against the project's public key set, and every query is scoped to the signed-in owner. Tables are closed to the
  Supabase Data API (RLS on, no grants to `anon` or `authenticated`).
- **Staff roles and the staff console.** Ops, inspector and advocate roles, each limited to what they may see and do.
  Ops add plots (for existing owner accounts) and assign staff; inspectors record visits with geotagged photos that are
  hashed on arrival and saved as signed evidence; ops record land record checks and flag applications; advocates
  confirm caveat lodgings and record outcomes. Plots can exist without a camera.

## Next

1. **Owner invitations.** Create owner and staff accounts from the console (Supabase admin API), instead of adding
   them in the Supabase dashboard first.
2. **Notifications.** Email (then WhatsApp) to owners when a flag, disturbed peg or lapsing caveat appears, and to
   inspectors when a visit is requested.
3. **Per-device credentials.** One token or key per camera, tied to its plot, instead of a shared token, with
   revocation.
4. **Camera integration.** Receive snapshots from the chosen camera model (FTP or HTTP upload) and register cameras
   to plots from the console.
5. **Photo storage.** Move photo bytes from Postgres to object storage once volume grows; keep the hash and metadata
   in Postgres.
6. **Visit history.** Show earlier visits and their photos, not only the latest.
7. **Evidence hardening.** Signing key in a KMS, RFC 3161 timestamps, and a certificate workflow under Section 63
   BSA with the responsible person's sign-off.
8. **Frontend tests.** Vitest and React Testing Library for sign-in, the owner view and the staff console.
9. **More states.** Maharashtra (Mahabhumi), Uttar Pradesh (Bhulekh), Tamil Nadu.

## Before launch

- Advocate review of all legal wording: caveat explanation, draft caveat, warning sign, terms of service.
- Privacy policy for camera footage under the DPDP Act, 2023.
- Real hardware quotes and a field test through one monsoon.
