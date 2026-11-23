import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { describe, test } from 'node:test';
import {
  EvidenceSigner,
  canonicalJson,
  merkleProof,
  merkleRoot,
  sha256Hex,
  verifyMerkleProof,
  verifySignedRecord
} from '../src/evidence.js';

describe('Signing', () => {
  test('canonical JSON ignores key order', () => {
    assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
  });

  test('signed records verify, and any change breaks them', () => {
    const signer = new EvidenceSigner();
    const record = signer.sign({ event: 'test', value: 42 });
    assert.equal(record.sha256, sha256Hex(record.payload));
    assert.equal(signer.verify(record), true);
    assert.equal(verifySignedRecord({ ...record, payload: record.payload.replace('42', '43') }, signer.publicKeyPem), false);
    assert.equal(verifySignedRecord({ ...record, sha256: '0'.repeat(64) }, signer.publicKeyPem), false);
  });

  test('a configured key survives a restart; a throwaway key does not', () => {
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    const der = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

    const before = new EvidenceSigner(der);
    const afterRestart = new EvidenceSigner(pem.replace(/\n/g, '\\n'));
    assert.equal(before.ephemeral, false);
    assert.equal(before.keyId, afterRestart.keyId);
    assert.equal(afterRestart.verify(before.sign({ a: 1 })), true);

    assert.equal(new EvidenceSigner().verify(before.sign({ a: 1 })), false);
  });

  test('rejects keys that are not Ed25519', () => {
    const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    assert.throws(() => new EvidenceSigner(pem), /Ed25519/);
  });
});

describe('Merkle tree', () => {
  const leaves = (n: number) => Array.from({ length: n }, (_, i) => sha256Hex(`leaf-${i}`));

  test('every leaf has a valid inclusion proof, for trees of 1 to 9 leaves', () => {
    for (let size = 1; size <= 9; size++) {
      const tree = leaves(size);
      const root = merkleRoot(tree);
      for (let i = 0; i < size; i++) {
        const proof = merkleProof(tree, i);
        assert.equal(proof.root, root);
        assert.equal(verifyMerkleProof(proof), true, `size ${size} index ${i}`);
      }
    }
  });

  test('a tampered leaf fails its proof', () => {
    const proof = merkleProof(leaves(5), 2);
    assert.equal(verifyMerkleProof({ ...proof, leafHash: sha256Hex('forged') }), false);
  });

  test('an unpaired leaf is not duplicated, so [a,b,c] and [a,b,c,c] differ', () => {
    const [a, b, c] = leaves(3);
    assert.notEqual(merkleRoot([a, b, c]), merkleRoot([a, b, c, c]));
  });

  test('inner nodes cannot be passed off as leaves (second-preimage)', () => {
    const tree = leaves(4);
    const nodeAB = merkleProof(tree, 2).path[1].hash;
    const nodeCD = merkleProof(tree, 0).path[1].hash;
    assert.notEqual(merkleRoot([nodeAB, nodeCD]), merkleRoot(tree));
  });
});
