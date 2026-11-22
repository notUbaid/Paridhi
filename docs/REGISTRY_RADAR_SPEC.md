# PARIDHI (परिधि) - REGISTRY RADAR SPECIFICATION
## Cadastral Revenue Record Watcher & Fraudulent Mutation Detection Engine
### Automated State Portal Monitoring, Caveat Triggers & Statutory Protection

---

## 1. Context: The Silent Bureaucratic Land Grab

In India, physical encroachment is frequently preceded or accompanied by **fraudulent revenue mutations** at the local Tehsil / Sub-Registrar Office (SRO).
Encroachers, often in nexus with dishonest local Village Revenue Officers (VROs) or Patwaris, file for:
1. **Mutation of Title (Pattadar Passbook / RTC alteration)** based on forged sale deeds or bogus General Power of Attorney (GPA).
2. **Legal Heirship / Virasat Mutation**: Falsely claiming the NRI owner has passed away or abandoned the land.
3. **Partition & Sub-division**: Carving out 200–500 sq. yard plots from a larger parcel and selling them to unsuspecting third-party buyers to create multi-party litigation.

Under Indian state land revenue codes (e.g. Karnataka Land Revenue Act 1964, Telangana Rights in Land and Pattadar Pass Books Act 2020, UP Revenue Code 2006):
- When a mutation application is registered, the Tehsildar issues a statutory public notice granting **15 to 30 days for interested parties to raise objections**.
- If no objection or caveat is filed within this window, the mutation is sanctioned, changing the government record!
- Reversing a sanctioned mutation requires years of appellate litigation before Revenue Divisional Officers (RDO) and Joint Collectors.

**Paridhi Registry Radar** solves this by programmatically watching the revenue records 24/7.

---

## 2. Supported State Land Portals & Data Connectors

| State | Portal Name | Public Query Endpoints | Monitored Identifiers |
| :--- | :--- | :--- | :--- |
| **Telangana** | **Dharani** | `dharani.telangana.gov.in` (Land Details Search, Mutation Tracking) | District, Mandal, Village, Survey No., Khata No. |
| **Karnataka** | **Bhoomi / Kaveri 2.0** | `bhoomoj.karnataka.gov.in` (RTC View, Mutation Status, Dispute Cases) | District, Taluk, Hobli, Village, Survey / Hissa No. |
| **Punjab** | **Jamabandi** | `jamabandi.punjab.gov.in` (Fard Nakal, Roznamcha, Mutation Register) | District, Tehsil, Village, Khewat / Khasra No. |
| **Maharashtra** | **Mahabhumi / e-Records** | `bhulekh.mahabhumi.gov.in` (7/12 & 8A Extract, Ferfar status) | District, Taluka, Village, Gat / Survey No. |
| **Uttar Pradesh** | **Bhulekh UP** | `upbhulekh.gov.in` (Khatauni, Khasra, Anti-Land Mafia Portal) | District, Tehsil, Pargana, Village, Khasra No. |
| **Gujarat** | **AnyRoR @ Anywhere** | `anyror.gujarat.gov.in` (VF-7, VF-8A, Entry Mutation Status) | District, Taluka, Village, Survey / Block No. |

---

## 3. Architecture of Registry Radar Polling Service

```
┌─────────────────────────────────────────────────────────────┐
│                 PARIDHI CADASTRE REGISTRY                   │
│  - Property ID: PRD-PROP-500081-042                         │
│  - Survey / Khasra No: 124/2A                               │
│  - State: Telangana | District: Rangareddy | Mandal: Serilingampally│
│  - Baseline Hash: SHA256(Current_RTC_Record_JSON)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Scheduled Weekly / Bi-Weekly
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 REGISTRY RADAR POLING CRON                  │
│  - Headless Browser + Captcha Solver / Portal API Engine     │
│  - Fetches Raw Revenue Extract (RTC / Pahani / 7-12)        │
│  - Fetches Mutation Pending Register (Form 12 / Ferfar)      │
│  - Fetches Encumbrance Certificate (EC) from IGRS            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SEMANTIC DIFF & ANOMALY DETECTOR            │
│  - Compares Extracted Owner Names vs Paridhi Verified Owner │
│  - Detects New Application IDs in Mutation Queue            │
│  - Detects New Lien / Mortgage / Stay Order Entries         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               IF Mutation Detected / Diff != 0
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  HIGH-SEVERITY RADAR ESCALATION             │
│  1. Instant SMS / WhatsApp / Email to NRI Owner:            │
│     "CRITICAL: Mutation Application #TG-2026-981 filed for   │
│      Survey 124/2A by [Applicant Name]. 22 days remaining   │
│      to file formal Caveat/Objection."                      │
│  2. 1-Click Caveat Generation: Pre-fills statutory          │
│     objection petition addressed to the jurisdictional      │
│     Tahsildar / Sub-Registrar.                              │
│  3. Retains empanelled High Court advocate to serve Caveat. │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Encumbrance & Mutation JSON Data Model

```json
{
  "property_id": "PRD-PROP-500081-042",
  "survey_number": "124/2A",
  "khasra_khata": "Khata #418",
  "cadastral_state": "Telangana",
  "district": "Rangareddy",
  "mandal": "Serilingampally",
  "village": "Gachibowli",
  "verified_owner_name": "Arjun Sundaram",
  "last_synced_at": "2026-11-22T04:00:00Z",
  "revenue_status": {
    "title_status": "CLEAN",
    "active_disputes_count": 0,
    "last_mutation_date": "2018-04-12",
    "encumbrance_certificate": {
      "verified_through": "2026-11-20",
      "liens": [],
      "unauthorized_transactions_flag": false
    },
    "pending_mutations": [
      {
        "application_id": "MUT-TG-2026-88192",
        "filing_date": "2026-11-19",
        "applicant_name": "K. Rama Rao (Claimant)",
        "mutation_type": "Succession / Sale Deed Claim",
        "objection_window_days_remaining": 19,
        "threat_severity": "CRITICAL",
        "portal_verification_url": "https://dharani.telangana.gov.in/mutation/status?id=MUT-TG-2026-88192"
      }
    ]
  }
}
```

---

## 5. Automated 1-Click Legal Caveat Generator

When an unauthorized transaction is flagged, the Paridhi portal auto-generates a formal objection petition under **Section 5 of the Rights in Land and Pattadar Pass Books Act**:
- Auto-populates property survey bounds, registered sale deed registration number, and book number.
- Cites applicant fraudulent details.
- Flags the electronic BSA 2023 certificate verifying continuous uninterrupted possession.
- Dispatches electronic copies directly to the District Collector and Tahsildar via registered postal speed-post and portal upload.
