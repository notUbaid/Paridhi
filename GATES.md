# PARIDHI (परिधि) - ACCEPTANCE GATES & ENGINEERING MILESTONES

## Gate 1: Foundational Architecture & Documentation [COMPLETE]
- [x] Executive System Architecture (`docs/ARCHITECTURE.md`)
- [x] BSA 2023 Section 63 Cryptographic Evidence Specification (`docs/BSA2023_EVIDENCE_SPEC.md`)
- [x] Off-Grid Solar-LTE Hardware & Edge NPU Specification (`docs/HARDWARE_EDGE_SPEC.md`)
- [x] Cadastral Revenue Registry Radar Specification (`docs/REGISTRY_RADAR_SPEC.md`)
- [x] Founder & Investor Pitch Memo (`docs/FOUNDER_INVESTOR_MEMO.md`)

## Gate 2: Core Engineering Backend & Edge Simulators [IN PROGRESS]
- [ ] **Cryptographic Evidence Engine (`evidence-vault`)**:
  - Implements SHA-256 frame-level hashing and segment chaining.
  - Generates tamper-proof Merkle Trees and inclusion proofs.
  - Produces statutory BSA 2023 §63 Court Admissibility Certificates with DSC Class 3 validation.
- [ ] **State Land Records Registry Radar (`registry-radar`)**:
  - Simulates active real-time polling across Indian state land portals (Dharani, Bhoomi, Jamabandi).
  - Emits mutation status diffs, encumbrance alerts, and 30-day caveat countdowns.
- [ ] **Edge Sentinel Daemon & Sensor Streamer (`edge-sentinel`)**:
  - Emulates 24GHz Doppler radar tripwire triggers, optical homography projection, and material dumping classifiers.
  - Telemetry generation: Battery state-of-charge (SoC), solar MPPT wattage, 4G LTE signal metrics, optical flow tamper scores.
- [ ] **Central Command API Server (`core-api`)**:
  - REST & WebSocket endpoints connecting NRI Command Center with edge nodes and registry watchers.
  - Multi-property cadastral management (survey boundaries, geo-coordinates, live incident logs).

## Gate 3: Sovereign NRI Command Center Web Application
- [ ] High-craft, dark-mode tactical command console (`paridhi-web`):
  - **Live Cadastral Perimeter Map**: Interactive polygon boundary overlays, virtual homography tripwire markers, GPS coordinates.
  - **Real-Time Edge Sentinel Video Feed**: Simulated 4K ultra-low latency stream with active neural bounding boxes (trespassers, material dumping, earthmovers).
  - **BSA 2023 Evidence Vault Modal**: 1-click generation and preview of court-admissible legal dossiers and Section 63 statutory certificates.
  - **Registry Radar Live Feed**: Real-time mutation alerts, pending Patwari applications, caveat timeline countdown.
  - **Ground Marshal Dispatch Simulator**: Live responder GPS location, bodycam feed preview, 60-minute SLA status.
  - **Acoustic & Strobe Deterrence Trigger**: Manual and automated 110dB siren activation with vernacular audio deterrent selector.

## Gate 4: Verification & Automated Test Suite
- [ ] Unit & Integration tests for cryptographic hashing and Merkle root verification.
- [ ] Unit tests for mutation diff algorithms and caveat generators.
- [ ] Full end-to-end operational verification across backend and web interfaces.
