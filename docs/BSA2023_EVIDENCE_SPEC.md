# PARIDHI (परिधि) - EVIDENTIARY SPECIFICATION
## Cryptographic Chain of Custody & Statutory Certificate Generation
### Under Section 63 of the Bharatiya Sakshya Adhiniyam (BSA), 2023
*(Formerly Section 65B of the Indian Evidence Act, 1872)*

---

## 1. Statutory Context & Legal Requirements

On July 1, 2024, the Parliament of India enacted the **Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)**, completely repealing and replacing the Indian Evidence Act, 1872. Section 63 of BSA 2023 governs the admissibility of electronic records in civil, criminal, and revenue judicial proceedings across India.

### 1.1 The Judicial Trap for NRI Property Owners
When an encroacher or land grabber trespasses onto a vacant property, property owners typically attempt to present smartphone video clips or standard CCTV camera footage before the Court or Police. In Indian jurisprudence:
1. *State (NCT of Delhi) v. Navjot Sandhu (2005)*, *Anvar P.V. v. P.K. Basheer (2014) 10 SCC 473*, and *Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1* establish that **electronic evidence is inadmissible unless accompanied by a contemporaneous statutory certificate**.
2. Standard consumer cameras lack hardware-rooted time, have no tamper-proof cryptographic logs, and can easily be challenged by defense counsel as "AI deepfakes", "manipulated timestamps", or "tampered recordings".
3. Under BSA 2023 Section 63(4), the statutory certificate must be signed by the **person in official management or custody of the computer device or cryptographic process** that produced the record.

---

## 2. Paridhi Cryptographic Custody Protocol (PCCP)

The Paridhi Cryptographic Custody Protocol ensures that every frame, telemetry sample, and incident clip collected by an off-grid Sentinel Node is provably genuine, mathematically untampered, and instantly admissible in High Courts, District Courts, and Revenue Tribunals.

```
┌─────────────────────────────────────────────────────────────┐
│                 SENTINEL HARDWARE (Edge Node)              │
│  - Sony STARVIS 2 4K Sensor Raw Frame Pipeline              │
│  - GNSS Receiver (GPS L1/L5 + NavIC IRNSS Atomic Clock)     │
│  - OPTIGA Trust M / ATECC608A Hardware Security Module      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Raw Video & Sensor Metadata
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               HARDWARE ATTESTATION & SIGNING                │
│  1. Compute Frame Hash:                                     │
│     h_i = SHA-256(Frame_i || Timestamp || GPS || Gyro)     │
│  2. Compute Video Segment Hash:                             │
│     H_segment = SHA-256(h_1 || h_2 || ... || h_k)           │
│  3. Hardware Ed25519 Signature:                             │
│     Sig_hw = Sign(SK_hardware, H_segment || Node_ID)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Encrypted TLS 1.3 Streaming over LTE
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PARIDHI MERKLE VAULT                      │
│  - Ingests Segments & Verifies Hardware Attestation         │
│  - Inserts H_segment into Append-Only Merkle Tree           │
│  - Requests RFC 3161 Qualified Timestamp from Cert Authority │
│  - Generates Merkle Inclusion Proof (Audit Path)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                   1-Click Injunction Request
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           BSA 2023 SECTION 63 STATUTORY CERTIFICATE         │
│  - Ready-to-print legal dossier formatted for Indian Courts │
│  - Class 3 DSC Digital Signature by System Custodian        │
│  - High Court Civil Suit (Order 39 Rules 1-2 CPC) Ready     │
│  - Criminal Trespass FIR (BNS 2023 Sec 329) Ready           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical & Cryptographic Formulation

### 3.1 Per-Frame Atomic Hash
For each video frame $f_i$ captured at atomic index $i \in \{1, \dots, N\}$:
$$\mathcal{T}_i = \{\operatorname{lat}: \phi, \operatorname{lon}: \lambda, \operatorname{alt}: h, \operatorname{time}: t_{\mathrm{atomic}}, \operatorname{pitch}: \theta, \operatorname{roll}: \psi, \operatorname{yaw}: \omega\}$$
$$h_i = \mathcal{H}_{\mathrm{SHA-256}}(f_i \parallel \mathcal{T}_i)$$

### 3.2 Evidentiary Video Segment
A contiguous 10-second evidentiary clip $\mathcal{C}$ consisting of $N = 300$ frames (at 30 FPS) is hashed into an aggregated segment identifier:
$$\mathcal{H}_{\mathcal{C}} = \mathcal{H}_{\text{SHA-256}}\left(\bigoplus_{i=1}^{N} h_i \parallel \text{SurveyNo} \parallel \text{DeviceId}\right)$$

### 3.3 Hardware Signature ($SK_{\text{HSM}}$)
The Sentinel's embedded secure crypto chip signs the segment hash:
$$\sigma_{\text{HW}} = \text{Ed25519-Sign}\left(SK_{\text{HSM}}, \mathcal{H}_{\mathcal{C}} \parallel t_{\text{atomic}}\right)$$

### 3.4 Merkle Inclusion Proof
The cloud vault aggregates all active sentinel segment hashes into an append-only binary Merkle Tree:
$$\text{Root}_k = \mathcal{H}\left(\text{Root}_{k-1} \parallel \mathcal{H}_{\mathcal{C}_k}\right)$$

For any court dispute, the system generates an audit path $\mathcal{P} = \{\pi_1, \pi_2, \dots, \pi_m\}$ such that:
$$\text{VerifyMerkleProof}(\mathcal{H}_{\mathcal{C}}, \mathcal{P}, \text{Root}) \equiv \text{True}$$

This provides mathematical, irrebuttable proof that the video recording existed in that exact bitwise state at that exact microsecond.

---

## 4. Statutory Certificate Template (BSA 2023 §63(4))

Below is the exact statutory certificate generated automatically by the Paridhi Evidence Vault engine:

```markdown
IN THE COURT OF THE PRINCIPAL DISTRICT AND SESSIONS JUDGE / CIVIL JUDGE
AT [DISTRICT / TALUK], [STATE], INDIA

CIVIL SUIT / PETITION NO. _________ OF 202_
IN THE MATTER OF:
[OWNER NAME (NRI/OCI)]                                          ... PLAINTIFF
VERSUS
[ENCROACHER / UNKNOWN TRESPASSERS]                             ... DEFENDANTS

CERTIFICATE UNDER SECTION 63(4) OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
(READ WITH SECTION 63(2) THEREOF) FOR ADMISSIBILITY OF ELECTRONIC RECORDS

I, [Authorized Systems Custodian], S/o [Father Name], aged about 38 years, 
residing at [Address], Chief Systems Custodian and Head of Cryptographic 
Integrity at Paridhi Technologies India Pvt. Ltd., do hereby solemnly affirm 
and state on oath as under:

1. I am the authorized systems custodian responsible for the cryptographic 
   verification and maintenance of electronic evidence records produced by the 
   autonomous Paridhi Sentinel Infrastructure, including the Sentinel Edge Node 
   bearing Serial No. [DEVICE_SERIAL_NO] deployed at the Plaintiff's property 
   situated at Survey / Khasra No. [KHASRA_NO], Village [VILLAGE], Mandal/Taluk [TALUK], 
   District [DISTRICT], [STATE].

2. I state that the Sentinel Edge Node aforesaid was during the relevant period 
   regularly used to capture optical, thermal, and spatial telemetry of the 
   perimeter of the property aforesaid in the ordinary course of security monitoring 
   and perimeter defense.

3. I certify that throughout the period covering the incident dated [INCIDENT_TIMESTAMP], 
   the said Sentinel Edge Node, including its optical sensors, GNSS NavIC receiver, 
   micro-grid battery subsystem, and Hardware Security Module (HSM), was operating 
   properly and in an uncompromised condition.

4. I further certify that the electronic record, being the high-definition video 
   recording and perimeter breach telemetry marked as EXHIBIT 'P-1', having SHA-256 
   checksum hash:
   [SHA256_HEX_HASH]
   was generated instantaneously by the Hardware Security Module (OPTIGA Trust M) 
   of the device and anchored to the Paridhi Merkle Transparency Vault with RFC 3161 
   Qualified Timestamp token:
   [QTA_TIMESTAMP_TOKEN]

5. I certify that the contents of the said electronic record are a direct, untouched, 
   and mathematically verified reproduction of the event occurring at the said 
   property, without any truncation, alteration, manual interpolation, or deepfake 
   synthesis.

DEPONENT:
[Digital Signature / DSC Class 3]
Systems Custodian & Lead Cryptographic Officer
Paridhi Technologies India Pvt. Ltd.
Date: [TIMESTAMP_ISO]
```

This certificate completely bypasses the traditional 2-year delay of getting police forensic labs (CFSL / FSL) to authenticate CCTV pen-drives.
