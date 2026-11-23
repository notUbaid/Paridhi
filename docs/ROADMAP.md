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

## Next

1. **Database.** Replace `PropertyStore` with Postgres (for example Supabase). Needed before any real customer, and to
   make the Vercel deployment consistent.
2. **Accounts and access control.** Owner login; each owner sees only their own plots. Separate roles for inspectors,
   ops staff and advocates.
3. **Per-device credentials.** One token or key per camera instead of a shared token, with revocation.
4. **Camera integration.** Receive snapshots from the chosen camera model (FTP or HTTP upload), store them in object
   storage, and hash them on arrival.
5. **Inspector app.** Mobile web form that captures photos with GPS and time, and posts the visit report.
6. **Ops tools.** Screens for staff to record land record checks and flagged applications, and for advocates to
   confirm caveat filings and objections.
7. **Notifications.** Email and WhatsApp alerts for owners.
8. **Evidence hardening.** Signing key in a KMS, RFC 3161 timestamps, and a certificate workflow under Section 63
   BSA with the responsible person's sign-off.
9. **Frontend tests.** Vitest and React Testing Library for the main flows.
10. **More states.** Maharashtra (Mahabhumi), Uttar Pradesh (Bhulekh), Tamil Nadu.

## Before launch

- Advocate review of all legal wording: caveat explanation, draft caveat, warning sign, terms of service.
- Privacy policy for camera footage under the DPDP Act, 2023.
- Real hardware quotes and a field test through one monsoon.
