/**
 * Integrity records for evidence and dossiers.
 *
 * What this gives you: a SHA-256 hash and an Ed25519 signature over the exact
 * payload string, made by the server when it receives the data, plus a Merkle
 * root over a property's evidence. Anyone holding the public key can check that
 * a record has not changed since it was signed.
 *
 * What it does not give you: proof of what happened on the ground, or
 * admissibility in court. Under Section 63 of the Bharatiya Sakshya Adhiniyam,
 * 2023 that still needs a certificate signed by the responsible person, and the
 * court decides.
 */
import crypto, { type KeyObject } from 'node:crypto';
import type { SignedRecord } from '../../shared/types.js';

/** JSON with object keys sorted at every level, so the same data always produces the same bytes. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])])
    );
  }
  return value;
}

export function sha256Hex(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Accepts a PKCS#8 PEM (literal "\n" sequences allowed, for env vars) or the
 * base64 of a PKCS#8 DER key, as printed by `npm run keygen`.
 */
function parsePrivateKey(value: string): KeyObject {
  const trimmed = value.trim();
  const key = trimmed.includes('BEGIN')
    ? crypto.createPrivateKey(trimmed.replace(/\\n/g, '\n'))
    : crypto.createPrivateKey({ key: Buffer.from(trimmed, 'base64'), format: 'der', type: 'pkcs8' });
  if (key.asymmetricKeyType !== 'ed25519') {
    throw new Error('PARIDHI_SIGNING_KEY must be an Ed25519 private key');
  }
  return key;
}

export function verifySignedRecord(record: SignedRecord, publicKeyPem: string): boolean {
  if (sha256Hex(record.payload) !== record.sha256) return false;
  try {
    return crypto.verify(
      null,
      Buffer.from(record.payload),
      crypto.createPublicKey(publicKeyPem),
      Buffer.from(record.signature, 'base64')
    );
  } catch {
    return false;
  }
}

export class EvidenceSigner {
  readonly keyId: string;
  readonly publicKeyPem: string;
  /** True when no key was configured and a throwaway key was generated at startup. */
  readonly ephemeral: boolean;
  private readonly privateKey: KeyObject;

  constructor(privateKey?: string | null) {
    if (privateKey) {
      this.privateKey = parsePrivateKey(privateKey);
      this.ephemeral = false;
    } else {
      this.privateKey = crypto.generateKeyPairSync('ed25519').privateKey;
      this.ephemeral = true;
    }
    const publicKey = crypto.createPublicKey(this.privateKey);
    this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    this.keyId = sha256Hex(publicKey.export({ type: 'spki', format: 'der' })).slice(0, 16);
  }

  sign(data: unknown): SignedRecord {
    const payload = canonicalJson(data);
    return {
      payload,
      sha256: sha256Hex(payload),
      signature: crypto.sign(null, Buffer.from(payload), this.privateKey).toString('base64'),
      keyId: this.keyId,
      algorithm: 'Ed25519'
    };
  }

  verify(record: SignedRecord): boolean {
    return record.keyId === this.keyId && verifySignedRecord(record, this.publicKeyPem);
  }
}

/*
 * Merkle tree in the style of RFC 6962 (Certificate Transparency): leaves and
 * inner nodes use different prefixes, and an unpaired node is promoted rather
 * than duplicated. Both rules close known second-preimage tricks.
 */

const LEAF_PREFIX = Buffer.from([0x00]);
const NODE_PREFIX = Buffer.from([0x01]);

function hashLeaf(hexHash: string): Buffer {
  return crypto.createHash('sha256').update(LEAF_PREFIX).update(Buffer.from(hexHash, 'hex')).digest();
}

function hashNode(left: Buffer, right: Buffer): Buffer {
  return crypto.createHash('sha256').update(NODE_PREFIX).update(left).update(right).digest();
}

function buildLevels(leafHashes: string[]): Buffer[][] {
  const levels: Buffer[][] = [leafHashes.map(hashLeaf)];
  while (levels[levels.length - 1].length > 1) {
    const current = levels[levels.length - 1];
    const next: Buffer[] = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(i + 1 < current.length ? hashNode(current[i], current[i + 1]) : current[i]);
    }
    levels.push(next);
  }
  return levels;
}

export const EMPTY_MERKLE_ROOT = sha256Hex('');

export function merkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) return EMPTY_MERKLE_ROOT;
  const levels = buildLevels(leafHashes);
  return levels[levels.length - 1][0].toString('hex');
}

export interface MerkleProof {
  leafHash: string;
  path: { position: 'left' | 'right'; hash: string }[];
  root: string;
}

export function merkleProof(leafHashes: string[], index: number): MerkleProof {
  if (index < 0 || index >= leafHashes.length) {
    throw new RangeError(`Leaf index ${index} is outside the tree`);
  }
  const levels = buildLevels(leafHashes);
  const path: MerkleProof['path'] = [];
  let i = index;
  for (let level = 0; level < levels.length - 1; level++) {
    const nodes = levels[level];
    const sibling = i % 2 === 1 ? i - 1 : i + 1;
    if (sibling < nodes.length) {
      path.push({ position: i % 2 === 1 ? 'left' : 'right', hash: nodes[sibling].toString('hex') });
    }
    i = Math.floor(i / 2);
  }
  return { leafHash: leafHashes[index], path, root: levels[levels.length - 1][0].toString('hex') };
}

export function verifyMerkleProof(proof: MerkleProof): boolean {
  let node = hashLeaf(proof.leafHash);
  for (const step of proof.path) {
    const sibling = Buffer.from(step.hash, 'hex');
    node = step.position === 'left' ? hashNode(sibling, node) : hashNode(node, sibling);
  }
  return node.toString('hex') === proof.root;
}
