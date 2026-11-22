# PARIDHI (परिधि) - EVIDENTIARY SPECIFICATION
## Cryptographic Chain of Custody & Statutory Certificate Generation
### Under Section 63 of the Bharatiya Sakshya Adhiniyam (BSA), 2023
*(Formerly Section 65B of the Indian Evidence Act, 1872)*

---

## 1. Statutory Context & Legal Requirements

On July 1, 2024, the Parliament of India enacted the **Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)**, completely repealing and replacing the Indian Evidence Act, 1872. Section 63 of BSA 2023 governs the admissibility of electronic records in civil, criminal, and revenue judicial proceedings across India.

### 1.1 The Judicial Trap for NRI Property Owners
When an encroacher or land grabber trespasses onto a vacant property, owners typically attempt to present smartphone video clips or standard CCTV footage before the Court or Police. In Indian jurisprudence:
1. *State (NCT of Delhi) v. Navjot Sandhu (2005)*, *Anvar P.V. v. P.K. Basheer (2014) 10 SCC 473*, and *Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1* establish that **electronic evidence is inadmissible unless accompanied by a contemporaneous statutory certificate**.
2. Standard consumer cameras lack tamper-proof cryptographic logs and can easily be challenged by defense counsel as "manipulated timestamps" or "tampered recordings".
3. Under BSA 2023 Section 63(4), the statutory certificate must be signed by the **person in official management or custody of the computer device or cryptographic process** that produced the record.

---

## 2. Paridhi Cryptographic Custody Protocol (PCCP)

The Paridhi Cryptographic Custody Protocol ensures that every frame and incident clip collected by an off-grid pod is provably genuine, mathematically untampered, and instantly admissible in High Courts, District Courts, and Revenue Tribunals.

```
┌─────────────────────────────────────────────────────────────┐
│                 ON-SITE 4G SOLAR POD (Edge)                 │
│  - 2K Optical Sensor Frame Pipeline                         │
│  - Hardware-Synchronized Timestamp                          │
│  - Instant 4G LTE Cloud Upload over Encrypted TLS 1.3       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PARIDHI MERKLE VAULT                      │
│  - Ingests Segments & Computes SHA-256 Checksum             │
│  - Inserts Hashes into Append-Only Binary Merkle Tree       │
│  - Anchors with Digital Signature (Ed25519)                 │
│  - Generates Merkle Inclusion Proof (Audit Path)            │
└──────────────────────────────┬──────────────────────────────┘
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

### 3.1 Per-Frame Atomic Checksum
For each video frame or visual snapshot $F_t$ captured at time $t$:
$$H_t = \operatorname{SHA-256}(F_t \parallel \mathrm{Metadata}_t)$$

### 3.2 Digital Signature
The cryptographic engine signs the payload hash:
$$\sigma = \operatorname{Sign}(SK_{\mathrm{vault}},\, H_t \parallel t)$$

### 3.3 Merkle Inclusion Proof
The cloud vault aggregates all active snapshot hashes into an append-only binary Merkle Tree:
$$\text{Root}_k = \operatorname{SHA-256}(\text{Left} \parallel \text{Right})$$

For any court dispute, the system generates an audit path $P = \{p_1, p_2, \dots, p_m\}$ verifying that the snapshot existed in that exact bitwise state at that exact second.

---

## 4. Statutory Certificate Template (BSA 2023 §63(4))

```markdown
IN THE COURT OF THE PRINCIPAL DISTRICT AND SESSIONS JUDGE / CIVIL JUDGE
AT [DISTRICT / TALUK], [STATE], INDIA

CIVIL SUIT / PETITION NO. _________ OF 202_
IN THE MATTER OF:
[OWNER NAME (NRI/OCI)]                                          ... PLAINTIFF
VERSUS
[ENCROACHER / UNKNOWN TRESPASSERS]                             ... DEFENDANTS

CERTIFICATE UNDER SECTION 63(4) OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
FOR ADMISSIBILITY OF ELECTRONIC RECORDS

I, [Authorized Systems Custodian], aged about 38 years, 
residing at [Address], Chief Systems Custodian and Head of Cryptographic 
Integrity at Paridhi Technologies India Pvt. Ltd., do hereby solemnly affirm 
and state on oath as under:

1. I am the authorized systems custodian responsible for the cryptographic 
   verification and maintenance of electronic evidence records produced by the 
   Paridhi Remote Land Protection Platform, deployed at the Plaintiff's property 
   situated at Survey / Khasra No. [KHASRA_NO], Village [VILLAGE], Mandal/Taluk [TALUK], 
   District [DISTRICT], [STATE].

2. I state that the 4G Solar Pod was regularly used to capture optical telemetry 
   of the perimeter of the property in the ordinary course of security monitoring.

3. I certify that throughout the period covering the incident dated [INCIDENT_TIMESTAMP], 
   the said pod was operating properly and in an uncompromised condition.

4. I further certify that the electronic record, having SHA-256 checksum hash:
   [SHA256_HEX_HASH]
   was generated instantaneously and anchored to the Paridhi Merkle Vault.

5. I certify that the contents of the said electronic record are a direct, untouched, 
   and mathematically verified reproduction of the event occurring at the property.

DEPONENT:
[Digital Signature / DSC Class 3]
Systems Custodian & Lead Cryptographic Officer
Paridhi Technologies India Pvt. Ltd.
Date: [TIMESTAMP_ISO]
```
