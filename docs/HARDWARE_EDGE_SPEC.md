# PARIDHI (परिधि)
## Hardware Edge Specification & Anti-Theft Engineering
### 4G Solar Edge Pods, Efficiency Calculus & Physical Security Matrix

---

## 1. On-Site Physical Pre-Requisites

Vacant land in India presents extreme environmental conditions: no electricity, high ambient heat (up to 48°C in summer), intense monsoons with weeks of overcast skies, and roaming cattle.

### Physical Installation Pre-Requisites
1. **Utility Requirements:** **Zero.** Neither grid power (230V mains) nor broadband Wi-Fi is required.
2. **Ground Footing:** A 2ft × 2ft × 2ft concrete footing (Grade M20 concrete) poured on the property perimeter.
3. **Mounting Mast:** A 15-foot (4.5m) heavy-gauge Galvanized Iron (GI) pole (3-inch outer diameter, Schedule 40) embedded 2 feet into the concrete footing.
4. **Perimeter Line of Sight:** Camera positioned to capture all 4 corner boundary pegs and the primary road frontage.

---

## 2. Supported Commercial Off-The-Shelf (COTS) Hardware

Paridhi deliberately avoids proprietary, hard-to-maintain custom silicon in favor of standard commercial hardware produced at global scale:

| Component Subsystem | Specification / Reference Hardware | Unit Cost (INR) | Unit Cost (USD) |
| :--- | :--- | :--- | :--- |
| **4G Solar PTZ Camera** | Hikvision DS-2XS6A25G0 / CP Plus Orange+ Solar 4G / Reolink Go PT Plus (2K/4MP, 110° FOV, IR Night Vision) | ₹8,500 | $102 |
| **Solar Power Panel** | 25W–30W Monocrystalline A-Grade PV Panel (IP67 Weatherproof) | ₹1,600 | $19 |
| **Battery Storage** | 12.8V 20Ah (256 Wh) Lithium Iron Phosphate (LiFePO4) with active BMS | ₹3,800 | $45 |
| **Cellular Connectivity** | Industrial 4G LTE IoT M2M SIM (Dual-Carrier Airtel & Reliance Jio) | ₹250 | $3 |
| **Mounting Hardware** | 15ft Galvanized Iron (GI) Pole, 360° Rotating Anti-Climb Sleeve, Torx Bolts | ₹2,200 | $26 |
| **Ground Concrete Footing** | M20 Concrete Footing + Site Labor | ₹1,500 | $18 |
| **TOTAL TURNKEY KIT** | **Complete On-Site 4G Solar Pod Installed** | **₹17,850** | **$213** |

---

## 3. Power Calculus, Efficiency & Monsoon Autonomy

A major challenge for solar security in India is the annual monsoon season (June to September), where continuous rain and cloud cover can persist for 5 to 10 consecutive days.

### Power Budget & Duty-Cycle Calculus
- **Quiescent Sleep Mode:** During normal conditions, the camera rests in low-power standby drawing just **0.25 Watts** ($20.8\text{ mA}$ at $12\text{V}$).
- **Active Capture Mode:** Wakes for scheduled snapshots and motion events, drawing **3.8 Watts** ($316\text{ mA}$ at $12\text{V}$) for 15 seconds per event.
- **Daily Operational Profile:**
  - 23.5 hours in quiescent sleep: $0.25\,\text{W} \times 23.5\,\text{h} = 5.875\,\text{Wh}$
  - 0.5 hours active capture (scheduled snapshots + 20 motion triggers): $3.8\,\text{W} \times 0.5\,\text{h} = 1.9\,\text{Wh}$
  - Total Daily Energy Consumption: $\approx \mathbf{7.78\,\text{Wh / day}}$

### Battery Autonomy Calculation
$$\text{Usable Battery Energy} = 12.8\,\text{V} \times 20\,\text{Ah} \times 0.85\,\text{DOD} = \mathbf{217.6\,\text{Wh}}$$
$$\text{Autonomy Duration} = \frac{217.6\,\text{Wh}}{7.78\,\text{Wh / day}} \approx \mathbf{27.9\text{ Days of Continuous Off-Grid Run}}$$

Even during the worst monsoon storms with 80% loss of solar efficiency, the system operates completely uninterrupted.

### Battery Chemistry: Why LiFePO4?
Standard consumer cameras use Lithium-ion NMC (Nickel Manganese Cobalt) cells, which degrade rapidly above 45°C and present serious fire and explosion risks in direct Indian sunlight. Paridhi exclusively mandates **Lithium Iron Phosphate ($\mathrm{LiFePO}_4$)**:
- Thermal stability up to **60°C ambient** ($270^\circ\text{C}$ thermal runaway threshold).
- Rated for **3,500+ full charge/discharge cycles** (over 9 years of daily cycling).
- Non-combustible, non-toxic chemistry safe for unattended outdoor deployment.

---

## 4. 6-Layer Real-World Anti-Theft & Tamper-Proof Engineering

A vacant plot in India has no watchman. Theft of solar panels, batteries, or cameras by local scrap thieves or encroachers is a primary concern. Paridhi implements a multi-barrier physical and operational defense:

### 1. Physical Elevation Out of Reach (4.5m / 15ft)
The camera and solar panel are mounted at the top of a 15-foot heavy-gauge steel pole embedded in concrete. It cannot be reached by hand or jumped to from the ground.

### 2. 360° Rotating Smooth Anti-Climb Sleeve
A 2-foot tall smooth metal collar is mounted loosely around the pole at an 8-foot height. If a trespasser attempts to wrap their arms or legs around the pole to climb it, the sleeve spins freely, preventing any upward traction without a tall ladder.

### 3. Concealed Wiring & Tamper-Proof Fasteners
- All electrical wiring, solar conduit, and antenna lines are routed completely **inside the hollow interior** of the galvanized pole. There are no exposed external wires that can be snipped.
- Enclosure doors and camera brackets are secured using **5-lobe pin tamper-resistant security Torx bolts** that cannot be removed with common wrenches, pliers, or screwdrivers.

### 4. Real-Time 4G Cloud Evidence Sync
Traditional CCTV DVR systems fail because a thief simply steals the memory card or DVR box.
- Paridhi cameras upload footage in **real-time over 4G LTE** directly to cloud storage (AWS S3 / Cloudflare R2).
- When a person or vehicle approaches the pole, motion triggers an immediate upload. Even if someone arrives with an electric saw to cut the pole down, **their face, license plate, and actions are already permanently stored in the cloud before the pole is touched**.

### 5. 60-Second Cloud Heartbeat & Instant Offline Alert
The on-site device sends a lightweight ping to the Paridhi cloud every 60 seconds. If power is disconnected, cellular signals drop, or a tamper switch inside the steel enclosure is tripped:
- The owner and the local field ops team receive an instant SMS and WhatsApp alert within 90 seconds.
- The last captured high-resolution snapshot is delivered immediately to the owner's phone.

### 6. Deterrent Legal Warning Board
A prominent reflective metal board is fixed at eye level:
> **"WARNING: 24/7 Cloud Surveillance & Legal Boundary Monitoring by Paridhi Technologies. All footage is continuously uploaded to remote legal servers. Any trespass, boundary stone shifting, or property damage is a cognizable criminal offense under Sections 324 & 303 of the Bharatiya Nyaya Sanhita (BNS)."**
In Indian rural and suburban land administration, formal legal signage backed by an active camera is the single most effective psychological deterrent against opportunistic encroachment.
