# Contributing to PARIDHI (परिधि)

Thank you for contributing to **PARIDHI**, the open platform for remote vacant land protection and verified title defense for the Indian diaspora.

---

## 1. Core Engineering Disciplines

1. **Anti-Slop Craft Standards:**
   - The UI strictly adheres to **Light Mode Only** using an authoritative, high-trust architectural aesthetic (`#f8fafc` background, `#ffffff` card surfaces, `#0f172a` deep slate typography, `#e2e8f0` hairline borders).
   - Zero generic AI templates, zero faux-military jargon, and zero placeholder functions.

2. **Evidentiary Integrity:**
   - Visual telemetry and inspection reports support cryptographic chain of custody under Section 63 of the **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.
   - Any new camera snapshot or field inspection log must support deterministic SHA-256 payload hashing and digital signing.

---

## 2. Key Contribution Vectors

### A. State Land Revenue Registry Connectors
We welcome parsers and polling routines for additional state land record portals:
- Maharashtra: **Mahabhumi 7/12 & e-Ferfar**
- Uttar Pradesh: **Bhulekh UP**
- Gujarat: **AnyRoR Urban & Rural**
- Rajasthan: **Apna Khata**

Each portal integration should:
1. Normalize parcel search by Survey Number / Khasra / Khata.
2. Monitor adverse mutation filings and unauthorized partition notices.
3. Supply metadata for automated generation of **Section 148A CPC Caveat Petitions**.

### B. Indian Perimeter Computer Vision
We welcome computer vision improvements for weekly visual timelapse change detection:
- Tipper trucks dumping red clay bricks, stone gravel, or sand aggregates
- Earthmoving equipment (JCBs, tractors) excavating or leveling boundaries
- Makeshift squatter structures (tin-sheet sheds, barbed-wire boundary shifting)
- Shifting or removal of white/yellow boundary survey stones

### C. 4G Solar Hardware & Anti-Theft Optimizations
- COTS 4G Solar camera integrations (Hikvision, Dahua, Reolink, CP Plus)
- Low-power duty-cycling and LiFePO4 battery health monitoring
- Physical anti-climb collar designs and pole tamper sensors

---

## 3. Local Development & Testing

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Test Suite:**
   ```bash
   npm test
   ```

3. **Build Web Client:**
   ```bash
   npm run build
   ```

4. **Start Local Backend Daemon:**
   ```bash
   npm start
   ```

---

## 4. Submitting Pull Requests

- Ensure all 10 test suites pass (`npm test`).
- Ensure `npm run build` exits with code 0.
- Write clear conventional commit messages (e.g. `feat: add Tamil Nadu Patta Chitta registry connector`).
