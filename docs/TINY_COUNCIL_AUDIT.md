# PARIDHI (परिधि) - Tiny Council 360° App Audit & Master Improvement Roadmap

> **Audit Date:** November 23, 2026  
> **Auditors (The Tiny Council):**  
> 1. **The Principal Systems & Security Architect** (Backend, Infrastructure, Serverless, Security, Cryptography)  
> 2. **The Senior Frontend & UI/UX Craftsman** (Layout, Accessibility, Information Hierarchy, Interaction Design)  
> 3. **The Indian Land Law & Field Operations Domain Expert** (BSA 2023, CPC §148A, Revenue Portals, Field Ops)  
> 4. **The Lead QA, Reliability & DevEx Engineer** (Test Coverage, Edge Cases, CI/CD, Build Pipeline, Tooling)

---

## 1. Executive Summary & Council Scorecard

The Tiny Council convened to conduct a first-principles, zero-bias audit of **PARIDHI (परिधि)**—the Remote Vacant Land Protection & Verified Title Defense platform for Non-Resident Indians (NRIs).

### The Big Picture: Strong Foundations, Critical Production Gaps
Paridhi possesses an exceptionally compelling value proposition, strong domain framing, and an authoritative architectural light-mode aesthetic that completely avoids generic "AI-slop". However, behind the polished presentation lies a hybrid of working prototypes, in-memory volatile data stores, broken integrations (e.g., Python daemon endpoint mismatch), legal statutory inaccuracies (CPC §148A 90-day caveat rule), and missing production security/auth layers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TINY COUNCIL AUDIT SCORECARD                    │
├───────────────────────────────────┬───────────────┬────────────────────┤
│ Domain                            │ Current Score │ Target Production  │
├───────────────────────────────────┼───────────────┼────────────────────┤
│ 1. Core Thesis & Value Proposition│ 9.5 / 10      │ 10.0 / 10          │
│ 2. Visual Aesthetic & Light Craft │ 9.0 / 10      │ 9.8 / 10           │
│ 3. Systems & Backend Architecture │ 6.0 / 10      │ 9.5 / 10           │
│ 4. Security & Sensitive PII Auth  │ 3.5 / 10      │ 9.5 / 10           │
│ 5. Frontend UX & Accessibility    │ 6.8 / 10      │ 9.2 / 10           │
│ 6. Indian Legal & Domain Accuracy │ 7.2 / 10      │ 9.6 / 10           │
│ 7. Test Coverage & Reliability    │ 5.5 / 10      │ 9.0 / 10           │
├───────────────────────────────────┴───────────────┴────────────────────┤
│ OVERALL PLATFORM HEALTH: 6.8 / 10 (High Potential Prototype)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tiny Council Individual Verdicts

### 🏛️ Council Member 1: Principal Systems & Security Architect
> *"The frontend looks great, but the backend is purely ephemeral RAM. Deploying this to Vercel causes state loss on every lambda cold-start. Worse, sensitive NRI asset and contact details are completely public without any authentication."*

1. **In-Memory Volatile Storage (`services/src/app.ts`):**  
   All mutations (dispatched inspections, caveat filings, simulated tampers) operate on an in-memory array `export const properties = JSON.parse(JSON.stringify(mockProperties))`. In serverless environments (Vercel), each request hits separate lambda isolates. State changes vanish on server restart or across lambda lifecycles.
2. **WebSocket & Vercel Serverless Incompatibility (`services/src/server.ts`):**  
   The standalone server runs a WebSocket server on port `4001`. Vercel Serverless does NOT support persistent WebSocket listener daemons on custom ports. The web client tries to connect to `ws://localhost:4001`, which will permanently fail on cloud deployments without a fallback to SSE (Server-Sent Events) or periodic polling.
3. **Zero Authentication & Complete PII Exposure:**  
   `GET /api/properties` exposes real names, overseas phone numbers, personal email addresses, cadastral survey numbers, and multi-crore valuations with zero authentication. Anyone can call `POST /api/properties/:id/simulate-tamper` or `/request-inspection` anonymously.
4. **Ephemeral Hardware Key Generation (`services/src/crypto/evidenceVault.ts`):**  
   `private static keyPair = crypto.generateKeyPairSync('ed25519');` is executed on module load. Every time the server restarts or a new serverless container boots, a new keypair is generated. Signatures generated earlier become mathematically un-verifiable.
5. **Permissive CORS & Missing Input Validation:**  
   `app.use(cors({ origin: '*' }))` is open to any origin. Route parameters (`:id`) and request bodies (`notes`, `reason`) have no schema validation (e.g., Zod), no character length limits, and no sanitization.

---

### 🎨 Council Member 2: Senior Frontend & UI/UX Craftsman
> *"The light mode drafting look is refreshing, but mobile viewports suffer from vertical clutter, modal accessibility is missing standard keyboard traps, and key interactive elements are dead ends."*

1. **Top-Heavy Mobile Layout:**  
   `PropertySelector.tsx` renders 3 vertical cards above the fold on mobile. On standard mobile screens (375px–420px), the user must scroll past 3 full property cards before seeing the actual active plot dashboard and camera feed.
2. **Dead-End Interactive Elements:**  
   - In `FieldInspectionCard.tsx`, clicking "View Full Photo" on inspection thumbnails does nothing (no modal, lightbox, or full-screen preview).
   - In `LegalActionCard.tsx`, clicking "Retain Advocate for Legal Notice" triggers an API call and adds an activity item, but provides zero inline toast or visual feedback, leaving the user wondering if the action succeeded.
3. **Modal Dialog Accessibility Failures (WCAG 2.1 AA):**  
   - Modals lack `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
   - Modals do not listen for the `Escape` key.
   - Clicking the backdrop overlay does not dismiss the modal.
   - Focus is not trapped inside the modal when open.
4. **Dead Code Leftovers:**  
   - `web/src/App.css` contains 184 lines of unreferenced boilerplate leftover from the default Vite starter template.
5. **Duplicated Client/Server Data:**  
   - `web/src/defaultData.ts` and `services/src/db.ts` contain identical 350-line mock property datasets. Any change to property schema or values requires editing both files simultaneously, creating guaranteed drift.

---

### ⚖️ Council Member 3: Indian Land Law & Field Operations Domain Expert
> *"Your Section 148A CPC caveat expiry dates are legally impossible. Caveats strictly expire after 90 days under Indian law. Furthermore, BSA 2023 Section 63 requires a dual certificate format."*

1. **Statutory 90-Day CPC §148A Caveat Expiry Bug:**  
   In `db.ts`, caveat expiry dates are set to arbitrary future dates (e.g. `Feb 14, 2027` or `March 10, 2027`). Under **Section 148A(5) of the Code of Civil Procedure, 1908**, a caveat remains in force for **exactly 90 days** from the date on which it was lodged. A standing caveat system must operate on a 90-day renewal cycle with an automated warning 15 days prior to expiration.
2. **BSA 2023 Section 63 Statutory Certificate Format:**  
   The certificate generated in `evidenceVault.ts` uses a custom markdown format. Under the Schedule to the Bharatiya Sakshya Adhiniyam, 2023, Section 63(4) certificates require a standardized **Part A (Certificate by person producing the computer output)** and **Part B (Certificate by person in lawful custody / management of the system)** with specific statutory declarations.
3. **Broken Python Edge Sentinel Integration (`services/edge-sentinel/sentinel_daemon.py`):**  
   The daemon script dispatches incidents to `POST /api/properties/{self.property_id}/trigger-incident`. That endpoint does NOT exist in `app.ts` (which only defines `/simulate-tamper`), and the daemon's hardcoded property ID `PRD-PROP-500081-01` does not exist in `db.ts`. Running the Python edge script fails with 404.
4. **Geographic Coverage Limitation:**  
   Currently, only Telangana (Dharani), Karnataka (Bhoomi), and Punjab (Jamabandi) are modeled. The top NRI plotted land corridors also include Maharashtra (Mahabhumi 7/12 & e-Ferfar for Pune/Nashik), Uttar Pradesh (Bhulekh UP for Noida/Yamuna Expressway), and Tamil Nadu (Patta Chitta for Chennai/OMR).
5. **Field Audit Proof-of-Presence Verification:**  
   The field audit card asserts human inspections, but doesn't demonstrate how Paridhi enforces that the inspector actually visited the plot rather than taking a photo from a highway. Real-world trust requires explicit EXIF GPS geofence checks (within 50m of survey boundary) and physical peg NFC/QR verification.

---

### 🧪 Council Member 4: Lead QA, Reliability & Platform Engineer
> *"Your CI pipeline only tests 8 backend assertions. There are zero automated tests for the React frontend, no error boundaries, and root-level scripts fail due to missing dependencies."*

1. **Zero Frontend Test Suite:**  
   There are no unit or integration tests for `web/` (no Vitest, Jest, or Playwright component tests). If a component throws an uncaught exception, CI will report 100% green because it only checks `services/test/runTests.ts` and `tsc -b`.
2. **No React Error Boundaries:**  
   If an unexpected null property or rendering error occurs in any card, React unmounts the entire component tree, displaying a completely blank white screen to the user.
3. **Root Dependency & Tooling Issue:**  
   Root `package.json` defines `"start": "npm --prefix services start"`, but `services/package.json` relies on `tsx`. Running `npx tsx` at the root fails because `tsx` is only installed inside `services/node_modules`.
4. **Silent API & WebSocket Failures:**  
   In `web/src/App.tsx`, network failures for `fetch('/api/properties')` and the WebSocket connection are caught with empty `catch {}` blocks. The user is given no visual cue indicating whether they are viewing live cloud data or stale offline fallback data.

---

## 3. Prioritized Master Improvement Backlog

### 🔴 Phase 1: Critical Fixes & Broken Functionality (P0 - Immediate)
- [ ] **Fix 1.1: Resolve Python Edge Sentinel Endpoint & ID Mismatch**  
  Update `services/edge-sentinel/sentinel_daemon.py` and `services/src/app.ts` to implement `/api/properties/:id/trigger-incident` accepting edge telemetry and threat classification, and align the default property ID to `prop-shamshabad-412`.
- [ ] **Fix 1.2: Correct CPC Section 148A Statutory 90-Day Caveat Expiry Rule**  
  Update all mock data, types, and UI calculations so caveats follow the statutory 90-day validity rule under Section 148A(5) CPC, showing days remaining (e.g., "74 days remaining") and a renewal trigger.
- [ ] **Fix 1.3: Fix Modal Accessibility & Interaction Barriers**  
  Add `Escape` key listeners, backdrop-click dismiss, `role="dialog"`, `aria-modal="true"`, and focus trapping to all modals (`RequestInspectionModal`, `LegalCaveatModal`, `DossierModal`, `HowItWorksModal`).
- [ ] **Fix 1.4: Remove Unused Dead Code (`web/src/App.css`)**  
  Delete the leftover Vite 184-line default `App.css` file to eliminate project bloat.
- [ ] **Fix 1.5: Implement Interactive Image Lightbox for Field Inspection Photos**  
  Connect the "View Full Photo" buttons in `FieldInspectionCard.tsx` to an actual modal lightbox displaying high-resolution geotagged ground evidence photos with GPS coordinates and timestamps.

---

### 🟡 Phase 2: High-Priority Architectural & Security Enhancements (P1)
- [ ] **Enhancement 2.1: Persistent Storage Layer / SQLite or JSON DB**  
  Replace volatile in-memory JavaScript array mutations with a structured local SQLite (or filesystem-persisted JSON database adapter) so state mutations persist across server restarts and serverless warm containers.
- [ ] **Enhancement 2.2: Deterministic Hardware HSM Key Management for BSA 2023**  
  Store a persistent Ed25519 signing keypair (or configurable environment secret) in `EvidenceVault` so cryptographic signatures remain verifiable across restarts and deployments.
- [ ] **Enhancement 2.3: Basic Session/API Key Authentication & PII Masking**  
  Implement role-based data masking (e.g. masking owner phone/email for unauthenticated sessions) and require bearer tokens or session cookies for mutating state (`request-inspection`, `retain-lawyer`, `simulate-tamper`).
- [ ] **Enhancement 2.4: Input Validation with Zod**  
  Add strict schema validation for all incoming REST payloads in `services/src/app.ts` to prevent payload injection and unbounded input strings.
- [ ] **Enhancement 2.5: Serverless Real-Time Fallback (SSE / Smart Polling)**  
  Implement Server-Sent Events (SSE) or a client-side polling fallback so real-time updates function smoothly on serverless hosts (Vercel) where WebSocket daemons are not supported.

---

### 🟢 Phase 3: UI/UX Craft & Cadastral Feature Polish (P2)
- [ ] **Polish 3.1: Mobile Ergonomics & Responsive Property Selector**  
  Transform `PropertySelector.tsx` on small screens into a compact horizontal scroll or dropdown selector to keep the active property dashboard above the fold.
- [ ] **Polish 3.2: Interactive Cadastral Boundary Overlay & Peg Coordinates**  
  In `PlotVisualCard.tsx`, add an interactive cadastral survey overlay toggle displaying surveyed GPS boundary pegs (Peg #1 to #4) and polygon perimeter dimensions over the property image.
- [ ] **Polish 3.3: Action Confirmation Toasts & Feedback Loop**  
  Implement clean toast notifications when actions complete (e.g. "Section 148A Caveat Lodged", "State Registry Polled Clean", "Field Agent Dispatched within 48h").
- [ ] **Polish 3.4: Direct State Revenue Portal Quick-Links**  
  In `RevenueWatchCard.tsx`, add direct verified deep-links to official state portals (Dharani, Bhoomi, Jamabandi) pre-populated with search guidance for the user's survey number.
- [ ] **Polish 3.5: Offline & Live Cloud Sync Status Indicator**  
  Add a subtle connectivity pill in the header indicating whether the dashboard is connected to Live Cloud REST/WS or operating in Offline Local Fallback mode.

---

### 🔵 Phase 4: Domain Expansion & Operational Realism (P3)
- [ ] **Expansion 4.1: Pan-India State Revenue Registry Connectors**  
  Add data models and query specifications for:
  - Maharashtra: **Mahabhumi 7/12 & e-Ferfar** (Pune / Hinjewadi)
  - Uttar Pradesh: **Bhulekh UP** (Noida / Greater Noida / Yamuna Expressway)
  - Tamil Nadu: **Patta Chitta & Tamil Nilam** (Chennai / OMR)
- [ ] **Expansion 4.2: BSA 2023 §63 Standardized Statutory Schedule Format**  
  Format the legal certificate output into exact statutory **Part A & Part B Court Schedule Certificates** compliant with the latest high court filing guidelines.
- [ ] **Expansion 4.3: Proof-of-Ground-Truth Protocol for Field Audits**  
  Add field inspector verification metadata: GPS proximity verification (<50m geofence), live EXIF capture timestamp, and physical corner peg tag verification.
- [ ] **Expansion 4.4: Automated 90-Day Caveat Renewal Workflow**  
  Implement automated caveat expiration warnings at day 75 with a 1-click advocate renewal re-filing authorization.

---

### 🟣 Phase 5: Testing, Reliability & DevEx (P4)
- [ ] **Reliability 5.1: Frontend Automated Test Suite with Vitest**  
  Set up Vitest and React Testing Library in `web/` covering:
  - Property switching logic
  - Modal opening, submission, and closing behavior
  - State updates following inspection requests and registry polls
- [ ] **Reliability 5.2: React Error Boundary Implementation**  
  Wrap the main dashboard with a graceful Error Boundary fallback card to prevent blank-screen crashes.
- [ ] **Reliability 5.3: Single Source of Truth for Shared Types & Mock Data**  
  Create a shared package or symlinked source for `types.ts` and baseline property data to eliminate duplication between `web/src/defaultData.ts` and `services/src/db.ts`.
- [ ] **Reliability 5.4: Full-Stack CI Pipeline**  
  Update `.github/workflows/ci.yml` to run backend tests, frontend tests, linting (`oxlint`), and web build verification on every pull request.

---

## 4. Next Action Steps

1. **Immediate Execution:** Implement P0 fixes (Python daemon endpoint alignment, CPC §148A 90-day caveat correction, modal a11y, photo lightbox viewer, and dead code cleanup).
2. **Review & Approval:** Solicit feedback from the user on whether to proceed directly with Phase 1 fixes.
