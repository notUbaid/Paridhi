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
- **Public website and lead capture.** A landing page at `/`, the sample-plot demo at `/demo`, owner accounts at
  `/app` with self sign-up (and Google sign-in once enabled in Supabase), and plot requests from the website form and
  from owners' accounts, listed for ops in the console. The staff console at `/staff` is hidden from everyone else.

## Next

1. **Notifications.** Email (then WhatsApp) to owners when a plot's status leaves "All clear", a monthly summary
   email, an email to ops for each new plot request, and to inspectors when a visit is requested. Needs an email
   provider (and custom SMTP in Supabase, so sign-up emails reach customers).
2. **From request to plot.** Let ops turn a plot request into a plot in one step, mark requests as contacted or closed,
   and collect the owner's documents (sale deed, record extracts) through the signed-in account.
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
10. **Payments.** A monthly subscription (Razorpay or Stripe) once the service is live.

## Before launch

- Advocate review of all legal wording: caveat explanation, draft caveat, warning sign, terms of service.
- Privacy policy for camera footage under the DPDP Act, 2023.
- Real hardware quotes and a field test through one monsoon.
