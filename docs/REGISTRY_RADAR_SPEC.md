# Land record watch

How Paridhi watches state land records for fraudulent mutation applications, and what it can and cannot promise.

## Why it matters

Fraud on vacant land often starts on paper. Someone files a mutation application at the revenue office using a forged
sale deed or power of attorney, a false claim of inheritance, or a partition of the parcel. If nobody objects within
the notice period, the record changes, and reversing it means appeals before revenue officers or a civil suit.

## Portals

| State | Portal | Notes |
| :--- | :--- | :--- |
| Telangana | Bhu Bharati, `bhubharati.telangana.gov.in` | Replaced Dharani in April 2025 under the Telangana Bhu Bharati (Record of Rights in Land) Act. |
| Karnataka | Bhoomi, `landrecords.karnataka.gov.in` (agricultural RTC) and E-Swathu, `eswathu.karnataka.gov.in` (Gram Panchayat properties, Form 9 / 11B) | A layout site outside city limits is usually on E-Swathu, not Bhoomi. |
| Punjab | Jamabandi, `jamabandi.punjab.gov.in` | GMADA-allotted plots also need checks with the GMADA estate office. |
| Maharashtra | Mahabhumi (7/12, e-Ferfar) | Not yet modelled. |
| Uttar Pradesh | UP Bhulekh | Not yet modelled. |

Portal names, URLs and procedures change; check them before relying on this table.

Encumbrance certificates come from the registration department (Sub-Registrar), not the land records portal, and are
checked separately.

## How checks are done

None of these portals offers an API or sends notifications. Many use CAPTCHAs and have terms of use.

- **Paridhi does not bypass CAPTCHAs or scrape around access controls.** Checks are made by ops staff using the
  portal as a member of the public would, or through any official data access the state provides.
- Checks are periodic (target: weekly, and immediately before each caveat renewal). A filing can appear between
  checks, so the product must not promise "instant" detection.
- Each check records: when it was made, what the record showed (owner, status, account number), and any application
  that the owner did not start. Those become `flaggedMutations` in the data model.

## When something is flagged

1. The plot's status becomes **Action required** and the owner is alerted.
2. The owner confirms whether they started the application.
3. If not, the retained advocate files a written objection with the Tahsildar within the notice period, under the
   state's land records law, and considers whether a civil remedy is needed. A Section 148A CPC caveat helps only in
   civil court proceedings.
4. The flag stays until the advocate records the outcome. Running another check never clears it.

## Data model

See `RevenueRecord` and `MutationEntry` in [`shared/types.ts`](../shared/types.ts):

```ts
interface RevenueRecord {
  portalName: string;
  portalUrl: string;
  surveyNumber: string;
  accountLabel: string;     // the state's own term: Khata, e-Khata, Khewat, allotment no.
  accountNumber: string;
  recordedOwner: string;
  recordStatus: string;
  flaggedMutations: { reference: string; filedOn: string; description: string }[];
  lastCheckedAt: string;
  propertyTaxStatus: string;
  encumbranceStatus: string;
}
```
