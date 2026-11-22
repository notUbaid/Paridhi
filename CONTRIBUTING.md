# Contributing to PARIDHI (परिधि)

Thank you for contributing to **PARIDHI**, the open sovereign perimeter intelligence and cryptographic legal immutability platform for diaspora vacant land defense.

---

## 1. Core Engineering Disciplines

1. **Anti-Slop Craft Standards:**
   - The UI strictly adheres to **Light Mode Only** utilizing an architectural drafting design token system (`#f8fafc` canvas, `#ffffff` card surfaces, `#0f172a` carbon ink, `#e2e8f0` hairline borders).
   - Never introduce dark glassmorphism, neon green glows, generic SaaS templates, or placeholder functions.

2. **Evidentiary Integrity:**
   - All sensory inputs must maintain cryptographic chain of custody under Section 63 of the **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.
   - Any new sensor or camera pipeline must support contemporaneous SHA-256 frame-level hashing and hardware HSM signing before memory flush.

---

## 2. Key Contribution Vectors

### A. State Land Revenue Registry Scrapers
Located in `services/src/radar/registryRadar.ts`. We welcome parsers and polling routines for additional state land record portals:
- Maharashtra: **Mahabhumi 7/12 e-Ferfar**
- Uttar Pradesh: **Bhulekh UP**
- Gujarat: **AnyRoR Urban & Rural**
- Rajasthan: **Apna Khata**

Each portal integration must:
1. Normalize parcel search by Survey Number / Khasra / Khata.
2. Monitor adverse mutation filings and unauthorized partition notices.
3. Supply metadata for automated generation of **Section 148A CPC Caveat Petitions**.

### B. Indian Encroachment Neural Taxonomy
Located in `services/edge-sentinel/sentinel_daemon.py` and `services/src/edge/sentinelSimulator.ts`. We accept training sets and synthetic weights for:
- Tipper trucks dumping red clay bricks or river sand aggregates
- Earthmovers (JCB 3DX) leveling boundaries or excavating foundation trenches
- Makeshift squatter structures (tin-sheet roofs, bamboo scaffolding)
- Physical pole tamper, tilt shock, and cellular RF jamming

### C. Hardware Microgrid & Sensor Bill of Materials
Located in `docs/HARDWARE_EDGE_SPEC.md`. Submit improvements for:
- Low-power radar sensors (FMCW 24GHz / 60GHz)
- High-efficiency bifacial solar PV panels and MPPT charge controllers
- LiFePO4 battery thermal management for extreme Indian climates (-5°C to 50°C)

---

## 3. Local Development & Testing

1. **Install Dependencies:**
   ```bash
   npm install
   npm --prefix web install
   npm --prefix services install
   ```

2. **Run Test Suite:**
   ```bash
   npm test
   ```
   *All 7 tests must pass before opening a Pull Request.*

3. **Verify Build:**
   ```bash
   npm run build
   ```
   *Ensure 0 TypeScript errors and clean client bundle generation.*

---

## 4. Submitting Pull Requests

1. Create a feature branch (`git checkout -b feat/add-mahabhumi-radar`).
2. Adhere to Conventional Commits:
   - `feat(...)`: New features or portal monitors
   - `fix(...)`: Bug fixes or mathematical corrections
   - `docs(...)`: Documentation or hardware spec updates
3. Verify that GitHub Actions CI passes with green status.
