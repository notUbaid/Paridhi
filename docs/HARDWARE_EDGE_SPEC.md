# PARIDHI (परिधि) - HARDWARE EDGE SPECIFICATION
## The Solar-LTE Autonomous Sentinel Node (Model: PRD-SENTINEL-X1)
### Hardware Architecture, Power Budget, Sensor Fusion & Edge NPU Pipeline

---

## 1. Hardware Architecture Overview

The **Paridhi Sentinel Node** is an off-grid, ruggedized, pole- or wall-mounted autonomous perimeter defense computer. It operates indefinitely on raw solar energy and cellular networks without requiring local utility power or broadband internet.

```
                           ┌───────────────────────────────┐
                           │   25W Bifacial Solar Panel    │
                           └───────────────┬───────────────┘
                                           │
                                           ▼
┌──────────────────────────┐   ┌───────────────────────────┐
│ 12.8V 24Ah LiFePO4 Pack  │◄──┤  MPPT Solar Charger / BMS │
└────────────┬─────────────┘   └───────────────────────────┘
             │
             ├──────────────────────────┐
             ▼                          ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│  Tier-1 Low-Power Coproc    │ │   Tier-2 Neural Edge SBC    │
│  ESP32-S3 (Xtensa Dual-Core)│ │   Rockchip RK3588S (6 TOPS) │
│  - Deep Sleep (15mA)        │ │   - 8-Core CPU + NPU        │
│  - 24GHz Doppler Radar      │ │   - Dual Sony STARVIS 2 4K  │
│  - 6-Axis Gyro/IMU Tamper   │ │   - FLIR Lepton 3.5 Thermal │
│  - Quectel EC200U 4G Modem  │ │   - NVMe Encrypted Storage  │
└────────────┬────────────────┘ └──────────────┬──────────────┘
             │                                 │
             │   Wake-on-Interrupt (GPIO Pin)  │
             └────────────────────────────────►│
```

---

## 2. Bill of Materials (BOM) & Industrial Costing

Designed for high-reliability field deployment across extreme Indian climate conditions (from $48^\circ\text{C}$ in Rajasthan / Punjab to heavy monsoon downpours in Kerala / Konkan).

| Component Subsystem | Part Description | Supplier / Spec | Unit Cost (USD) | Unit Cost (INR) |
| :--- | :--- | :--- | :--- | :--- |
| **Compute Core (SBC)** | Rockchip RK3588S 8-core ARM + 6 TOPS NPU, 8GB LPDDR4x | Radxa / OrangePi OEM | \$68.00 | ₹5,700 |
| **Microcontroller / Wake** | ESP32-S3-WROOM-1 with 8MB PSRAM + BLE/Wi-Fi | Espressif Systems | \$3.80 | ₹320 |
| **Primary Optical Sensor** | Dual Sony IMX678 1/1.8" STARVIS 2 4K 8MP HDR, $140^\circ$ FOV | Sony Semiconductor | \$32.00 | ₹2,690 |
| **Thermal Sensor (TIR)** | FLIR Lepton 3.5 Radiometric LWIR 160x120 (Optional Tier-2) | Teledyne FLIR | \$85.00 | ₹7,140 |
| **Perimeter Radar** | 24GHz FMCW Doppler Radar Module (40m range) | Infineon / HLK-LD2410 | \$4.20 | ₹350 |
| **Cellular + GNSS** | Quectel EC200U-CN LTE Cat-4 + GPS/NavIC Receiver | Quectel Wireless | \$14.50 | ₹1,220 |
| **Hardware Crypto (HSM)** | Microchip ATECC608A / Infineon OPTIGA Trust M | Microchip / Infineon | \$1.90 | ₹160 |
| **Energy: Solar Panel** | 25W Bifacial Monocrystalline A-Grade PV, IP68 | Loom Solar / Waaree | \$18.00 | ₹1,510 |
| **Energy: Battery Pack** | 12.8V 24Ah (307 Wh) LiFePO4 with active smart BMS | CALB / Gotion Cells | \$42.00 | ₹3,530 |
| **Active Deterrence** | 110dB Directional Piezo Horn + Dual 5000lm Strobe LEDs | Custom Automotive Grade | \$9.50 | ₹800 |
| **Enclosure & Mount** | Die-cast Aluminum IP67 Weatherproof + Tamper Pole Bracket | Custom Die-cast Tooling | \$22.00 | ₹1,850 |
| **Total Hardware BOM** | *Standard Optical + Radar + Solar/LTE configuration* | — | **\$231.90** | **₹19,480** |

---

## 3. Microgrid Power Budget & Monsoon Resilience Calculations

### 3.1 Power Consumption Modes
1. **Quiescent Deep Standby Mode (98.2% of the day)**:
   - ESP32-S3 active in ultra-low power mode.
   - 24GHz Doppler Radar sweeping at 5Hz.
   - 6-axis IMU accelerometer monitoring pole vibration.
   - LTE modem in eDRX (extended discontinuous reception) idle mode.
   - **Power draw**: $P_{\text{sleep}} = 12\text{V} \times 18\text{mA} = 0.216\text{ Watts}$.
2. **Alert & Neural Inference Mode (Active Breach / Patrol)**:
   - RK3588S SBC powered up via high-side MOSFET switch.
   - Dual Sony STARVIS 2 4K optical stream active.
   - 6 TOPS NPU running YOLOv11-nano object & material classifier at 25 FPS.
   - **Power draw**: $P_{\text{inference}} = 12\text{V} \times 400\text{mA} = 4.80\text{ Watts}$.
3. **Active Deterrence & 4K Uplink Mode**:
   - 4G LTE transmitting encrypted 1080p WebRTC stream and event clip.
   - High-decibel horn sounding vernacular warning + strobe pulsing.
   - **Power draw**: $P_{\text{active}} = 12\text{V} \times 950\text{mA} = 11.4\text{ Watts}$.

### 3.2 24-Hour Energy Consumption Budget
Assuming a highly active site with:
- 23.5 hours of Quiescent Sleep: $23.5\text{ h} \times 0.216\text{ W} = 5.08\text{ Wh}$.
- 25 minutes of Neural Inference: $0.416\text{ h} \times 4.80\text{ W} = 2.00\text{ Wh}$.
- 5 minutes of Active Deterrence & 4G Uplink: $0.083\text{ h} \times 11.4\text{ W} = 0.95\text{ Wh}$.
- **Total Daily Energy Consumption**: $E_{\text{daily}} = 8.03\text{ Watt-hours/day}$.

### 3.3 Solar Generation & Battery Reserve Analysis
- Battery Capacity: $307.2\text{ Wh}$ (12.8V, 24Ah).
- With an $80\%$ depth-of-discharge (DoD) margin: Usable Energy = $245.76\text{ Wh}$.
- **Zero-Sunlight Continuous Autonomy**:
  $$\text{Days of Autonomy} = \frac{245.76\text{ Wh}}{8.03\text{ Wh/day}} = \mathbf{30.6\text{ Days}}$$
Even under the most catastrophic continuous Indian monsoon (e.g. Kerala or Mumbai July rains with zero direct sunlight for 3 consecutive weeks), the Sentinel Node remains 100% operational.

---

## 4. Edge Neural Processing & Encroachment Classifier

The RK3588 NPU runs a quantized INT8 model based on YOLOv11-nano, optimized via Rockchip's RKNN toolkit.

### 4.1 Specialized Encroachment Target Classes
Unlike standard COCO models that classify generic items (dog, cup, cat, chair), the Paridhi model classifies **illegal occupation vectors**:
1. `human_trespasser`: Pedestrians crossing cadastral tripwires.
2. `dump_truck_tipper`: Commercial trucks dumping debris/aggregate.
3. `jcb_excavator`: Earthmoving machinery digging trenches or leveling land.
4. `brick_sand_pile`: Construction materials dumped on vacant plots.
5. `tin_sheet_structure`: Makeshift roofs, tarpaulins, or squatter huts.
6. `fencing_breach`: Cutting or removal of barbed wire or chain-link fence.
7. `religious_symbol`: Makeshift idols, saffron/green flags, or shrine stones.

### 4.2 Cadastral Homography Tripwire Algorithm
To avoid false alerts from people walking along public roads outside the plot:
1. The property's official legal survey polygon is loaded onto the device.
2. The Sentinel uses a planar homography matrix $\mathbf{H}$ mapping camera pixels $(u, v)$ to real-world ground coordinates $(X, Y)$:
   $$\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} \sim \mathbf{H} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$$
3. The model detects the bounding box contact point (feet of human, wheels of vehicle).
4. If and only if $(X, Y)$ crosses the legal cadastral boundary into the surveyed plot, a **Verified Perimeter Breach** is triggered.
