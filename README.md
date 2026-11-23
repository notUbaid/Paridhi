# Paridhi (परिधि)

**Remote protection for vacant land in India owned by people living abroad.**

Paridhi combines a solar 4G camera on the plot, a monthly visit by a local field inspector, regular checks of the state
land record, and a retained local advocate. The owner sees all of it in one dashboard.

> **Status: early product.** The dashboard, API, Postgres storage, owner sign-in, signed evidence records and tests
> are real code. Camera, land records and court work is still simulated, and without a database the app runs as an
> open demo on sample data. See [what is real and what is simulated](#what-is-real-and-what-is-simulated).

![Dashboard overview](assets/screenshots/dashboard-overview.png)

## The problem

Vacant plots usually have no mains power, no internet and no compound wall, so ordinary home cameras don't work
there. Encroachment tends to start small: dumped bricks or gravel, a boundary peg moved a foot, a tin shed. Fraud can
also start on paper, with a mutation application at the revenue office. Owners living abroad often hear about it late,
and land disputes in Indian civil courts can take many years to resolve.

## How it works

| Layer | What happens |
| :--- | :--- |
| **Solar 4G camera** | An off-the-shelf solar 4G camera on a 4.5 m pole uploads scheduled snapshots and motion clips. A weekly comparison flags new material, vehicles or structures. See [docs/HARDWARE_EDGE_SPEC.md](docs/HARDWARE_EDGE_SPEC.md). |
| **Field inspection** | A local inspector visits monthly, checks every corner peg and talks to neighbours. Photo GPS positions are checked against the surveyed pegs (within 50 m). Owners can request an extra visit. |
| **Land record watch** | Staff check the state portal (Bhu Bharati in Telangana, Bhoomi and E-Swathu in Karnataka, Jamabandi in Punjab) for mutation applications the owner did not start. See [docs/REGISTRY_RADAR_SPEC.md](docs/REGISTRY_RADAR_SPEC.md). |
| **Advocate and caveat** | A retained advocate can lodge a caveat under Section 148A CPC in the civil court and file objections to a mutation with the revenue office. A caveat lasts 90 days and must be renewed. |

Proposed pricing is ₹4,999 a month per plot. The unit economics and what they leave out are in
[docs/FOUNDER_INVESTOR_MEMO.md](docs/FOUNDER_INVESTOR_MEMO.md).

## What is real and what is simulated

| Area | In this repository |
| :--- | :--- |
| Dashboard | Real. Every status, badge and checklist is computed from the data; nothing is hard-coded as "clear". |
| API | Real Express API with input validation, JSON errors and tests. |
| Data | Real when `DATABASE_URL` is set: Postgres (Supabase), with every query scoped to the signed-in owner and evidence stored append-only. Without it, an open demo on three sample plots held in memory. |
| Sign-in | Real when a database is set: Supabase Auth with email and password or an emailed sign-in link. Paridhi creates owner accounts; there is no public sign-up. |
| Staff console | Real. Ops staff add plots and assign people; inspectors record visits with geotagged photos; ops record land record checks and flag applications; advocates confirm caveat lodgings and resolve flags. See [Staff console](#staff-console). |
| Land record checks | Recorded by staff after checking the portal by hand; there is no portal integration. In the demo, "Check now" on the owner view simulates one. Checks never clear an existing flag. |
| Camera | **Simulated.** `services/device-simulator/device_simulator.py` plays the part of a camera. New plots start without a camera and are protected by inspections alone. |
| Evidence integrity | Real. Incidents and dossiers are hashed (SHA-256) and signed (Ed25519) by the server, and can be verified with the public key. See [docs/BSA2023_EVIDENCE_SPEC.md](docs/BSA2023_EVIDENCE_SPEC.md). |

The plan for closing these gaps is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Running it locally

Requires Node.js 22 or later.

```bash
npm install
npm test          # API, database, sign-in, domain and evidence tests
npm run build     # build the web app into web/dist
npm start         # API and web app on http://localhost:4000
```

With no `.env`, this is the open demo. For development with hot reload, run these in two terminals and open
http://localhost:3000:

```bash
npm run dev:api
npm run dev:web
```

### Using the database and sign-in

1. Create a Supabase project and apply `supabase/migrations/` (Supabase CLI: `supabase db push`, or paste the SQL
   into the SQL editor).
2. In Supabase Authentication, turn off **Allow new users to sign up**, set the **Site URL** to where the app runs
   (and add `http://localhost:4000` to the redirect URLs for local use), and add each owner under **Users**.
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (the transaction pooler string from **Connect**),
   `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
4. Optionally load the sample plots for an owner to try it out:

   ```bash
   npm run db:seed -- --email owner@example.com
   ```

5. Make yourself the first ops staff member (after that, ops can manage the team in the console):

   ```bash
   npm run staff:add -- --email you@example.com --role ops --name "Your Name"
   ```

6. `npm run build && npm start`, open http://localhost:4000 and sign in.

The server refuses to start with a database but no sign-in settings, so real data is never served openly.

### Configuration

Copy `.env.example` to `.env` (gitignored) or set these in your hosting provider.

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Postgres connection string. Set it to store data in the database and require owner sign-in. Leave it out for the open demo. |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Supabase project URL and publishable key, used for sign-in. Required with `DATABASE_URL`. Both are public values. |
| `SUPABASE_JWT_SECRET` | Only for projects still on the legacy shared JWT secret. New projects use the public key set instead. |
| `DATABASE_CA_CERT` | Optional CA certificate (PEM) so the database certificate is verified. |
| `PARIDHI_DEVICE_TOKEN` | Shared secret cameras send as `Authorization: Bearer …`. Device ingest is disabled without it. |
| `PARIDHI_SIGNING_KEY` | Ed25519 private key for signing evidence. Generate one with `npm run keygen`. Without it the server makes a throwaway key, and signatures stop verifying after a restart. |
| `PORT` | Port for `npm start`. Defaults to 4000. |

### Staff console

Staff sign in like owners and land on `/staff`. What each role can do:

| Role | Sees | Can |
| :--- | :--- | :--- |
| Ops | Every plot | Add plots for existing owner accounts, assign inspectors and advocates, record land record checks, flag and resolve mutation applications, record visits, confirm caveats, manage the team |
| Inspector | Plots assigned to them | Record visits: checklist, notes, and a photo of each corner peg. Photos are shrunk on the phone, stamped with its GPS position, hashed on arrival and checked against the surveyed peg (50 m). Each visit is saved as signed evidence. |
| Advocate | Plots assigned to them | Confirm a caveat was lodged (starts the 90-day period and closes the owner's renewal request), record the outcome of a flagged application |

Staff accounts are ordinary Supabase Auth users with a row in `staff_members`. In the open demo you act as ops on the
sample plots; open **Staff console** from the owner view.

Photos are stored in Postgres for the pilot (resized to about 250 KB each). Move them to object storage as volume
grows.

### Simulating a camera incident

```bash
export PARIDHI_DEVICE_TOKEN=pick-a-long-random-string
npm start
# in another terminal, with the same token exported:
python services/device-simulator/device_simulator.py --property prop-shamshabad-412
```

The plot turns to "Needs attention" and the incident appears in the activity log and the signed dossier.

## API

With a database configured, every route except `/api/health`, `/api/evidence/public-key` and device incidents needs
`Authorization: Bearer <Supabase access token>`. Owner routes only return the signed-in owner's plots, and staff
routes only the plots the staff member may see; anything else returns 404.

| Method and path | Description |
| :--- | :--- |
| `GET /api/health` | Demo or database mode, sign-in settings for the web app, device ingest, signing key id. |
| `GET /api/properties` | The owner's plots. |
| `GET /api/properties/:id` | One plot. |
| `POST /api/properties/:id/inspection-requests` | Ask for an extra inspection. Body: `{ "notes": "…" }` (up to 500 characters). |
| `GET /api/me` | Who is signed in and their staff role, if any. |
| `GET /api/properties/:id/photos/:photoId` | An inspection photo, for the owner or staff who can see the plot. |
| `POST /api/properties/:id/caveat-renewals` | Ask the advocate to renew (or file) the caveat. |
| `POST /api/properties/:id/incidents` | Camera incident. Requires the device token. Body: `type`, `description`, optional `snapshotSha256`, `capturedAt`. |
| `GET /api/properties/:id/evidence` | Signed evidence records and their Merkle root. |
| `GET /api/properties/:id/dossier` | A signed snapshot of everything on file for the plot. |
| `GET /api/evidence/public-key` | Public key for verifying signatures. |
| `GET /api/staff/properties` | Plots the staff member can see, with owner email and assignments, plus the staff list. |
| `POST /api/staff/properties` | Ops: add a plot for an existing owner account (four corner pegs, land record, team). |
| `POST /api/staff/properties/:id/assignments` | Ops: set the inspector and advocate. |
| `POST /api/staff/properties/:id/photos?pegId=&lat=&lng=` | Ops, inspector: upload a JPEG/PNG/WebP (up to 3 MB) for a peg. |
| `POST /api/staff/properties/:id/inspection-visits` | Ops, inspector: record a visit with uploaded photo ids. |
| `POST /api/staff/properties/:id/registry-checks` | Ops: record a land record check. |
| `POST /api/staff/properties/:id/flagged-mutations` | Ops: flag a mutation application. |
| `POST /api/staff/properties/:id/flagged-mutations/:mutationId/resolve` | Ops, advocate: record the outcome. |
| `POST /api/staff/properties/:id/caveats` | Ops, advocate: confirm a caveat was lodged. |
| `GET`, `POST /api/staff/team`, `DELETE /api/staff/team/:userId` | Ops: list, add or remove staff (database mode only). |
| `POST /api/properties/:id/registry-checks` | Demo only: simulated check from the owner view. |
| `POST /api/demo/properties/:id/simulate-alert` | Demo only. |
| `POST /api/demo/properties/:id/reset` | Demo only. |

## Deploying to Vercel

Import the repository with the project root as the root directory. `vercel.json` builds the web app into `web/dist`
and routes `/api/*` to the Express app through `api/index.ts`.

Set `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PARIDHI_SIGNING_KEY` and `PARIDHI_DEVICE_TOKEN` in the
Vercel project's environment variables. Use Supabase's transaction pooler connection string, which suits serverless
functions. Without `DATABASE_URL` the deployment is the open demo, and because demo data lives in memory, each
serverless instance has its own copy and changes may not stick between requests.

## Project layout

```
shared/               Types and domain rules used by both the API and the web app
services/             Express API, storage (memory and Postgres), sign-in checks, evidence signing,
                      tests, seed and key scripts, device simulator
web/                  React + Vite + Tailwind dashboard and sign-in screen
api/                  Vercel serverless entry
supabase/migrations/  Database schema
docs/                 Hardware, registry, evidence, roadmap and business notes
```

## Legal notes

Paridhi is not a law firm and the app is not legal advice. Points to confirm with a practising advocate before
launch:

- A caveat under Section 148A CPC is lodged in a civil court. The court must give the caveator notice before passing
  an order on an application, but it does not stop orders being made. It lapses after 90 days, and notice of it must be
  served on the person expected to apply.
- Objections to a mutation before the Tahsildar fall under each state's land records law, not the CPC.
- Signed records show data has not changed since it was signed. In court, electronic records need a certificate under
  Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, signed by the responsible person, and admissibility is for the
  court.
- Camera footage covering neighbouring land or roads involves personal data, so it needs a policy under the Digital
  Personal Data Protection Act, 2023.
- The wording of the warning sign on site should be approved by the local advocate.

## More screenshots

| Staff console | Signed dossier |
| :---: | :---: |
| ![Staff console](assets/screenshots/staff-console.png) | ![Signed property dossier](assets/screenshots/dossier.png) |

## License

[MIT](LICENSE)
