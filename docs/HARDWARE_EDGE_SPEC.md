# PARIDHI (परिधि) - HARDWARE EDGE SPECIFICATION
## The Solar-LTE Autonomous Sentinel Node (Model: PRD-SENTINEL-X1)
### Hardware Architecture, Power Budget, Sensor Fusion, Edge NPU & Anti-Theft Hardening

---

## 1. System Philosophy: Zero Utility Dependency

The **Paridhi Sentinel Node (Model PRD-SENTINEL-X1)** is an off-grid, ruggedized, pole-mounted autonomous perimeter defense computer. It operates indefinitely on raw solar energy and cellular networks without requiring utility grid power, wired broadband, or on-site human maintenance.

```
                           ┌───────────────────────────────┐
                           │   25W Bifacial Solar Panel    │
                           │   (Grade-A Monocrystalline)   │
                           └───────────────┬───────────────┘
                                           │
                                           ▼
┌──────────────────────────┐   ┌───────────────────────────┐
│ 12.8V 24Ah LiFePO4 Pack  │◄──┤  Smart MPPT Solar Charger │
│ (307.2 Wh, Active BMS)   │   │  (98.4% Efficiency Peak)  │
└────────────┬─────────────┘   └───────────────────────────┘
             │
             ├──────────────────────────┐
             ▼                          ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Tier-1 Ultra-Low-Power Wake │ │ Tier-2 Neural Inference SBC │
│ ESP32-S3 (Xtensa Dual-Core) │ │ Rockchip RK3588S (6 TOPS)   │
│ • Deep Standby (15mA @ 12V) │ │ • 8-Core CPU + Tri-Core NPU │
│ • 24GHz FMCW Doppler Radar  │ │ • Dual Sony STARVIS 2 4K    │
│ • 6-Axis IMU Tamper Acceler │ │ • YOLOv11-nano INT8 (18ms)  │
│ • Quectel LTE Cat-4 Modem   │ │ • NVMe Encrypted Storage    │
└────────────┬────────────────┘ └──────────────┬──────────────┘
             │                                 │
             │   Wake-on-Interrupt (GPIO Pin)  │
             └────────────────────────────────►│
```

---

## 2. Hardware Tiers & Supported Configurations

Paridhi supports two deployment paradigms:

### Tier 1: Reference Industrial Sentinel Node (Model PRD-SENTINEL-X1)
The primary sovereign hardware stack manufactured specifically for high-stakes diaspora property protection.

| Component Subsystem | Part Description | Supplier / Spec | Unit Cost (USD) | Unit Cost (INR) |
| :--- | :--- | :--- | :--- | :--- |
| **Compute Core (SBC)** | Rockchip RK3588S 8-core ARM + 6 TOPS NPU, 8GB LPDDR4x | Radxa / OrangePi OEM | \$68.00 | ₹5,700 |
| **Microcontroller / Wake** | ESP32-S3-WROOM-1 with 8MB PSRAM + BLE/Wi-Fi | Espressif Systems | \$3.80 | ₹320 |
| **Primary Optical Sensor** | Dual Sony IMX678 1/1.8" STARVIS 2 4K 8MP HDR, $140^\circ$ FOV | Sony Semiconductor | \$32.00 | ₹2,690 |
| **Thermal Sensor (TIR)** | FLIR Lepton 3.5 Radiometric LWIR 160x120 (Optional Tier-2) | Teledyne FLIR | \$85.00 | ₹7,140 |
| **Perimeter Radar** | 24GHz FMCW Doppler Radar Module (40m human motion range) | Infineon / HLK-LD2410 | \$4.20 | ₹350 |
| **Cellular + GNSS** | Quectel EC200U-CN LTE Cat-4 + GPS/NavIC L5 Receiver | Quectel Wireless | \$14.50 | ₹1,220 |
| **Hardware Crypto (HSM)** | Microchip ATECC608A / Infineon OPTIGA Trust M | Microchip / Infineon | \$1.90 | ₹160 |
| **Energy: Solar Panel** | 25W Bifacial Monocrystalline A-Grade PV, IP68 | Loom Solar / Waaree | \$18.00 | ₹1,510 |
| **Energy: Battery Pack** | 12.8V 24Ah (307.2 Wh) LiFePO4 with active smart BMS | CALB / Gotion Cells | \$42.00 | ₹3,530 |
| **Active Deterrence** | 110dB Directional Piezo Horn + Dual 5000lm Strobe LEDs | Custom Automotive Grade | \$9.50 | ₹800 |
| **Enclosure & Mount** | Die-cast ADC12 Aluminum IP67 + Tamper Pole Bracket | Custom Die-cast Tooling | \$22.00 | ₹1,850 |
| **TOTAL BOM** | **Complete Industrial Autonomous Sentinel Node** | — | **\$231.90** | **₹19,480** |

### Tier 2: Commercial-Off-The-Shelf (COTS) Retrofit Architecture
For property owners who already possess commercial 4G solar cameras (Hikvision, Dahua, Reolink, CP Plus):
- **Paridhi Edge Micro-Gateway (Model PRD-GATEWAY-LITE):** A compact DIN-rail box based on Raspberry Pi Compute Module 4 + Hailo-8 NPU (26 TOPS) or Orange Pi 5.
- Connects to existing IP/4G cameras via local RTSP / ONVIF stream.
- Ingests video feeds, applies the **Planar Homography Cadastral Boundary Polygon**, performs BSA 2023 §63 cryptographic hashing on ATECC608A, and transmits alerts to the Paridhi cloud console.

---

## 3. Microgrid Calculus & Weather Hardening

### 3.1 Dual-State Asymmetric Sleep/Wake Pipeline
Power efficiency is achieved by never running the full 8-core CPU continuously:
1. **Quiescent Deep Standby Mode (98.2% of daily cycle):**
   - RK3588S SBC is completely unpowered via a high-side P-channel MOSFET power gate.
   - ESP32-S3 runs in low-power tickless mode.
   - 24GHz FMCW radar continuously sweeps at 5Hz looking for Doppler velocity signatures ($> 0.3\text{ m/s}$).
   - 6-axis IMU monitors mechanical shock.
   - LTE modem operates in eDRX (Extended Discontinuous Reception) mode.
   - **Power draw:** $P_{\mathrm{sleep}} = 12\,\mathrm{V} \times 18\,\mathrm{mA} = \mathbf{0.216\,\mathrm{Watts}}$.
2. **Alert & Neural Inference Mode (Active Intrusion):**
   - Radar or IMU triggers a hardware GPIO interrupt, booting RK3588S in **650 milliseconds**.
   - Dual Sony STARVIS 2 4K sensors activate.
   - Tri-core NPU runs quantized INT8 YOLOv11-nano at 25 FPS ($18\text{ms}$ inference latency).
   - **Power draw:** $P_{\mathrm{inference}} = 12\,\mathrm{V} \times 400\,\mathrm{mA} = \mathbf{4.80\,\mathrm{Watts}}$.
3. **Active Deterrence & 4G Uplink Mode:**
   - 110dB directional horn sounds localized regional warning.
   - 4G LTE transmits encrypted video evidence segment and cryptographic certificate.
   - **Power draw:** $P_{\mathrm{active}} = 12\,\mathrm{V} \times 950\,\mathrm{mA} = \mathbf{11.4\,\mathrm{Watts}}$.

### 3.2 24-Hour Energy Budget & Autonomy
Assuming a high-activity plot in an active encroachment corridor:
- 23.5 hours of Deep Sleep: $23.5\,\mathrm{h} \times 0.216\,\mathrm{W} = 5.08\,\mathrm{Wh}$
- 25 minutes of Neural Inference: $0.416\,\mathrm{h} \times 4.80\,\mathrm{W} = 2.00\,\mathrm{Wh}$
- 5 minutes of Active Horn & Uplink: $0.083\,\mathrm{h} \times 11.4\,\mathrm{W} = 0.95\,\mathrm{Wh}$
- **Total Daily Energy Consumption:** $E_{\mathrm{daily}} = \mathbf{8.03\,\mathrm{Wh/day}}$.

### 3.3 Zero-Sunlight Continuous Autonomy
- Battery Pack: $12.8\,\mathrm{V} \times 24\,\mathrm{Ah} = 307.2\,\mathrm{Wh}$.
- Usable Energy at $80\%$ Depth-of-Discharge (DoD): $245.76\,\mathrm{Wh}$.
$$\text{Days of Continuous Autonomy} = \frac{245.76\,\mathrm{Wh}}{8.03\,\mathrm{Wh/day}} = \mathbf{30.6\text{ Days}}$$

Even under extreme continuous monsoon cloud cover (July downpours in Konkan, Mumbai, or Kerala with $0\,\mathrm{kWh/m^2/day}$ solar yield), **the Sentinel operates continuously for over 30 days without shutting down.**

### 3.4 Thermal Hardening (Indian Climate Extremes)
- **Extreme Heat Tolerance:** Operates from $-10^\circ\text{C}$ up to $+55^\circ\text{C}$ ambient (internal junction temperature rated to $105^\circ\text{C}$). In peak May/June heat in Rajasthan or Punjab ($48^\circ\text{C}$ in the shade), the extruded ADC12 aluminum housing acts as a monolithic heatsink with zero cooling fans (eliminating motor failure and dust clogging).
- **Battery Chemistry:** Paridhi strictly rejects standard Lithium-ion (NMC/LCO), which degrades rapidly in Indian heat and poses thermal runaway risks above $150^\circ\text{C}$. Instead, we use **Automotive-Grade Lithium Iron Phosphate ($\mathrm{LiFePO}_4$)**:
  - Thermal runaway threshold: **$270^\circ\text{C}$**.
  - Cycle life: **3,500+ charge cycles at 80% DoD** (> 9.5 years operational life).
  - Integrated active cell balancing and low-temperature cutoff BMS.

---

## 4. The 6-Layer Anti-Theft & Anti-Tamper Security Architecture

Because vacant diaspora land is unmonitored by nature, the Sentinel Node itself is a target for metal thieves, hostile encroachers, or squatters attempting to destroy evidence. Paridhi implements six defense layers to make the node virtually theft-proof and tamper-proof:

### Layer 1: Mechanical Elevation & Anti-Climb Pole Engineering
- **Installation Height:** Mounted at $4.5\,\mathrm{m}$ to $5.2\,\mathrm{m}$ ($15 - 17\text{ feet}$) above ground level on a $3\text{-inch}$ Class-B Galvanized Iron (GI) pole anchored in a $1.0\,\mathrm{m}^3$ M20 concrete foundation block.
- **Anti-Climb Collar:** A $360^\circ$ outward-flaring spinning conical collar is installed at $2.5\,\mathrm{m}$ height, preventing human climbers from gripping the pole or using ladders against it.
- **Concealed Internal Wiring:** Zero exposed cables. Solar leads, battery wiring, antenna connectors, and horn wires are routed through the interior of the sealed hollow steel pole. Wire-cutting attacks are mechanically impossible without heavy industrial angle grinders.
- **Tamper-Proof Fasteners:** All enclosure access bolts utilize 5-lobe pin tamper-resistant Torx screws and security shear nuts that break off upon reaching tightening torque, requiring specialized extraction tools.

### Layer 2: 6-Axis Mechanical IMU Shock & Tilt Detection
- The board integrates dual 6-axis MEMS accelerometers/gyroscopes (Bosch BMI270) sampled at 200Hz.
- **High-G Impact Event:** If the pole is struck with a sledgehammer, pushed with a tractor, or shaken by an intruder, any acceleration $> 0.4g$ or tilt $> 2.0^\circ$ instantly triggers a **Mechanical Tamper Interrupt** in under $20\text{ milliseconds}$.
- The node captures high-speed pre-buffered frames, hashes the tamper telemetry, sounds the siren, and uplinks the attacker's image to the cloud.

### Layer 3: Optical Flow Lens Occlusion & Blinding Detection
- **Spray-Paint / Tarpaulin Attack:** If an encroacher attempts to blind the camera using spray paint, cloth, or laser diodes, the vision pipeline calculates frame entropy and optical flow.
- A drop in frame entropy ($E < 0.15$) or instantaneous color saturation change without lighting variation flags an **Optical Tamper Breach**, freezing and cryptographically signing the last pristine frame showing the perpetrator approaching with the aerosol can or stick.

### Layer 4: Immediate Local Autonomous Countermeasures (Zero-Cloud Latency)
- The node does not wait for cloud clearance to defend itself.
- Upon confirmed physical tamper or boundary breach:
  1. The **110dB Directional Horn** activates a sweeping acoustic deterrent audible across 500 meters.
  2. Dual **5,000-lumen pulsed strobe LEDs** fire at 12Hz, disorienting night-time intruders and illuminating the scene for maximum facial recognition detail.
  3. The local voice engine broadcasts vernacular warnings (Telugu, Punjabi, Kannada, Hindi) warning trespassers that local police (SHO) have been dispatched under CrPC §145.

### Layer 5: Electronic Anti-Jamming & Black-Box Storage
- **RF Jamming Defense:** If encroachers operate handheld 4G/LTE or GPS jammers:
  - The Quectel modem continuously measures Carrier-to-Noise Ratio (CNR) across LTE bands.
  - A sudden spike in broadband RF noise floor combined with sudden RSSI collapse triggers an **Electronic Warfare / RF Jamming Alarm**.
  - The node immediately fires the local acoustic siren and enters **Black Box Lockdown Mode**.
- **Tamper-Proof eMMC Storage:** While jammed, the node records all 4K video, radar tracks, and IMU data to hardware-encrypted on-board eMMC storage (AES-XTS-256). As soon as the jammer moves out of range or ground marshals arrive with an authorized local NFC/BLE key, the full encrypted DAG is offloaded and verified.

### Layer 6: Silicon eFuse Bricking & GPS Anti-Theft Beacon
If an organized syndicate cuts the entire steel pole and transports the unit away:
- **Silicon Key Eradication:** The private keys ($SK_{\mathrm{node}}$) reside inside the tamper-resistant boundary of the ATECC608A crypto co-processor. If physical enclosure penetration is detected via internal microswitches, the chip instantly wipes its internal SRAM register and blows hardware eFuses, rendering the RK3588S processor and stored data a permanently unusable piece of dead silicon.
- **Autonomous Recovery Beacon:** The power subsystem includes an isolated backup supercapacitor that keeps a low-power GNSS/LTE tracking beacon alive, broadcasting GPS coordinates every 60 seconds to enable rapid police recovery under Section 379 of the Indian Penal Code (Theft).

---

## 5. Pre-Requisite Site & Owner Requirements

| Dimension | Site Pre-Requisites (Vacant Land) | Owner Pre-Requisites (NRI Client) |
| :--- | :--- | :--- |
| **Power** | **None.** Operates on integrated 25W Solar + 24Ah LiFePO4 battery. | Standard smartphone or PC with internet. |
| **Internet / Broadband** | **None.** Integrated 4G LTE Cat-4 dual-eSIM (Airtel + Jio). | Any modern web browser (Chrome, Safari, Firefox). |
| **Physical Foundation** | $1.0\,\mathrm{m}^3$ M20 concrete footing with $4\times \text{M16}$ anchor bolts for GI pole. | None. Remote dashboard access via HTTPS. |
| **Legal Demarcation** | 4 registered boundary corner pegs surveyed by state revenue authorities. | Copy of Registered Sale Deed & Survey / Khata Number. |

---

## 6. Manufacturing & Field Deployment Protocol

1. **Factory Provisioning:**
   - Generation of unique cryptographic keypair in ATECC608A HSM.
   - Public key registered into Paridhi Root Certificate Authority.
   - Laser-engraved QR code on chassis linking to statutory hardware certificate.
2. **Field Pegging & Homography Calibration:**
   - Certified installer anchors the pole, mounts the PRD-SENTINEL-X1, and aligns the solar panel ($15^\circ$ South tilt for Indian subcontinent).
   - Installer stands at each of the 4 boundary pegs with a high-contrast calibration marker.
   - Sentinel takes 4 snapshot calibration points, computes the Planar Homography matrix $\mathbf{H}$, and locks the calibrated virtual tripwire into cryptographic flash.
3. **Commissioning Sign-Off:**
   - System runs 7-point self-test: Solar charge rate, battery internal resistance, LTE RSSI, radar noise floor, IMU calibration, audio sweep test, and cloud handshake.
   - Generates the initial **Commissioning Certificate under Section 63 BSA 2023** attesting that the recording apparatus is operating under lawful custody.
