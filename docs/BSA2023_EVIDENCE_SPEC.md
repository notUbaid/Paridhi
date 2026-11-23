# Evidence records

What the signed evidence in Paridhi proves, what it does not, and how to check it.

## Legal context

Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (which replaced Section 65B of the Indian Evidence Act) governs
electronic records as evidence. In short, and subject to an advocate's advice:

- An electronic record needs a certificate in the form set out in the Schedule to the Act. The Schedule has a part
  for the party producing the record and a part for an expert.
- The certificate is signed by people, not by software.
- Whether a record is admitted, and how much weight it gets, is for the court.

So Paridhi's job is to keep records that are easy to certify honestly: what was received, when, from which device, and
proof that it has not changed since.

## What the code does today

Implemented in [`services/src/evidence.ts`](../services/src/evidence.ts):

1. **Canonical payload.** The data is serialised as JSON with sorted keys, so the same data always gives the same
   bytes. That exact string is stored as `payload`.
2. **Hash.** `sha256` is the SHA-256 of `payload`.
3. **Signature.** `signature` is an Ed25519 signature over `payload`, made by the server when it receives the data.
   `keyId` identifies the key (first 16 hex characters of the SHA-256 of the public key).
4. **Merkle root.** Each plot's evidence hashes are combined into a Merkle root using the RFC 6962 construction
   (separate prefixes for leaves and nodes, unpaired nodes promoted, not duplicated). The root is included in the
   signed dossier.
5. **Dossier.** `GET /api/properties/:id/dossier` signs a snapshot of everything on file for the plot, including the
   computed status and alerts. The dashboard renders the dossier from the signed payload, so what you see is what was
   signed.

Camera incidents may include `snapshotSha256`, a hash of the image computed on the device. The server signs it along
with its own receipt time.

## Limits

- **Signed on receipt, not at capture.** Off-the-shelf cameras cannot sign with Paridhi's key, so the signature proves
  what the server received and when, not what the camera saw. Hardware signing at capture would need a camera with a
  secure element.
- **Key management.** Without `PARIDHI_SIGNING_KEY` the server generates a throwaway key at startup, and old signatures
  stop verifying after a restart. Production needs one long-lived key in a secret manager or KMS, with its public key
  published and rotation recorded.
- **No independent timestamp yet.** Times come from the server clock. An RFC 3161 timestamp from a trusted authority
  would make "when" independently checkable.
- **Photos from inspectors** carry phone GPS and clock data, which can be faked. The 50 m geofence check catches
  mistakes, not determined fraud.

## Verifying a record

Anyone with the public key can check a record. In Node.js:

```js
import crypto from 'node:crypto';

const { publicKeyPem } = await (await fetch(`${base}/api/evidence/public-key`)).json();
const { dossier } = await (await fetch(`${base}/api/properties/${id}/dossier`)).json();

const hashOk = crypto.createHash('sha256').update(dossier.payload).digest('hex') === dossier.sha256;
const signatureOk = crypto.verify(
  null,
  Buffer.from(dossier.payload),
  crypto.createPublicKey(publicKeyPem),
  Buffer.from(dossier.signature, 'base64')
);
```

Browsers can do the same with `crypto.subtle.verify('Ed25519', …)`.
