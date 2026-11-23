import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { getPropertyAlerts, getPropertyStatus, getCaveatStatus } from '../../shared/domain.js';
import type { PropertyRecord } from '../../shared/types.js';
import { merkleRoot, verifySignedRecord } from '../src/evidence.js';
import { FIXED_NOW, startServer, type TestServer } from './helpers.js';

const status = (p: PropertyRecord) => getPropertyStatus(getPropertyAlerts(p, FIXED_NOW));

describe('API basics', () => {
  let server: TestServer;
  let webDir: string;

  before(async () => {
    webDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paridhi-web-'));
    fs.writeFileSync(path.join(webDir, 'index.html'), '<!doctype html><title>Paridhi</title>');
    server = await startServer({}, { staticDir: webDir });
  });
  after(async () => {
    await server.close();
    fs.rmSync(webDir, { recursive: true, force: true });
  });

  test('health reports demo mode, no sign-in and an ephemeral key', async () => {
    const { status: code, body } = await server.get('/api/health');
    assert.equal(code, 200);
    assert.equal(body.demoMode, true);
    assert.deepEqual(body.auth, { required: false });
    assert.equal(body.deviceIngestEnabled, false);
    assert.equal(body.signingKey.ephemeral, true);
  });

  test('lists the sample portfolio with no real-looking contact details', async () => {
    const { body } = await server.get('/api/properties');
    assert.equal(body.properties.length, 3);
    for (const property of body.properties as PropertyRecord[]) {
      assert.match(property.owner.email, /@example\.com$/);
    }
  });

  test('sample data covers clear, attention and action states', async () => {
    const { body } = await server.get('/api/properties');
    const byId = Object.fromEntries((body.properties as PropertyRecord[]).map((p) => [p.id, status(p)]));
    assert.deepEqual(byId, {
      'prop-shamshabad-412': 'ALL_CLEAR',
      'prop-devanahalli-88': 'ACTION_REQUIRED',
      'prop-mohali-122': 'ATTENTION_NEEDED'
    });
  });

  test('unknown API routes return 404 JSON instead of hanging, even with a web build present', async () => {
    const { status: code, body } = await server.get('/api/does-not-exist');
    assert.equal(code, 404);
    assert.equal(body.error, 'Not found');
  });

  test('non-API routes fall back to the web app', async () => {
    const { status: code, body } = await server.get('/some/client/route');
    assert.equal(code, 200);
    assert.match(body, /<title>Paridhi<\/title>/);
  });

  test('unknown property returns 404', async () => {
    const { status: code, body } = await server.get('/api/properties/prop-nope');
    assert.equal(code, 404);
    assert.equal(body.error, 'Property not found');
  });

  test('malformed JSON returns 400', async () => {
    const { status: code } = await server.post('/api/properties/prop-shamshabad-412/inspection-requests', '{not json');
    assert.equal(code, 400);
  });
});

describe('Owner actions', () => {
  let server: TestServer;
  before(async () => {
    server = await startServer();
  });
  after(() => server.close());

  test('on-demand inspection is recorded once and rejects duplicates', async () => {
    const first = await server.post('/api/properties/prop-shamshabad-412/inspection-requests', { notes: 'Check the NW peg' });
    assert.equal(first.status, 201);
    const property: PropertyRecord = first.body.property;
    assert.equal(property.inspection.onDemandRequest?.notes, 'Check the NW peg');
    assert.equal(property.activity[0].category, 'INSPECTION');

    const second = await server.post('/api/properties/prop-shamshabad-412/inspection-requests', {});
    assert.equal(second.status, 409);
  });

  test('inspection notes are length-limited', async () => {
    const { status: code } = await server.post('/api/properties/prop-mohali-122/inspection-requests', {
      notes: 'x'.repeat(501)
    });
    assert.equal(code, 400);
  });

  test('a registry check never clears a flagged mutation', async () => {
    const { status: code, body } = await server.post('/api/properties/prop-devanahalli-88/registry-checks');
    assert.equal(code, 200);
    const property: PropertyRecord = body.property;
    assert.equal(property.revenue.flaggedMutations.length, 1);
    assert.equal(property.revenue.lastCheckedAt, FIXED_NOW.toISOString());
    assert.equal(property.activity[0].severity, 'ALERT');
    assert.equal(status(property), 'ACTION_REQUIRED');
  });

  test('a registry check on a clean record logs a clean result', async () => {
    const { body } = await server.post('/api/properties/prop-shamshabad-412/registry-checks');
    assert.equal(body.property.activity[0].severity, 'SUCCESS');
  });

  test('caveat renewal is a request to the advocate, not an instant filing', async () => {
    const before = (await server.get('/api/properties/prop-mohali-122')).body.property as PropertyRecord;
    assert.equal(getCaveatStatus(before.legal, FIXED_NOW).state, 'EXPIRING');

    const { status: code, body } = await server.post('/api/properties/prop-mohali-122/caveat-renewals');
    assert.equal(code, 201);
    const after: PropertyRecord = body.property;
    assert.equal(after.legal.caveat?.lodgedOn, before.legal.caveat?.lodgedOn);
    assert.equal(getCaveatStatus(after.legal, FIXED_NOW).renewalRequested, true);

    const again = await server.post('/api/properties/prop-mohali-122/caveat-renewals');
    assert.equal(again.status, 409);
  });
});

describe('Device ingest and evidence', () => {
  const token = 'test-device-token-0123456789';
  let server: TestServer;
  before(async () => {
    server = await startServer({ deviceToken: token });
  });
  after(() => server.close());

  const incident = {
    type: 'MATERIAL_DUMPING',
    description: 'Bricks near the NE peg',
    snapshotSha256: 'a'.repeat(64),
    capturedAt: '2026-11-23T09:55:00.000Z'
  };

  test('is disabled when no device token is configured', async () => {
    const off = await startServer();
    const { status: code } = await off.post('/api/properties/prop-shamshabad-412/incidents', incident);
    assert.equal(code, 503);
    await off.close();
  });

  test('rejects missing and wrong tokens', async () => {
    const missing = await server.post('/api/properties/prop-shamshabad-412/incidents', incident);
    assert.equal(missing.status, 401);
    const wrong = await server.post('/api/properties/prop-shamshabad-412/incidents', incident, {
      Authorization: 'Bearer wrong'
    });
    assert.equal(wrong.status, 401);
  });

  test('validates the incident', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const badType = await server.post('/api/properties/prop-shamshabad-412/incidents', { ...incident, type: 'ALIENS' }, auth);
    assert.equal(badType.status, 400);
    const badHash = await server.post('/api/properties/prop-shamshabad-412/incidents', { ...incident, snapshotSha256: 'xyz' }, auth);
    assert.equal(badHash.status, 400);
  });

  test('stores a signed record that anyone can verify with the public key', async () => {
    const { status: code, body } = await server.post('/api/properties/prop-shamshabad-412/incidents', incident, {
      Authorization: `Bearer ${token}`
    });
    assert.equal(code, 201);
    assert.equal(body.property.camera.changeDetected, true);

    const { body: key } = await server.get('/api/evidence/public-key');
    assert.equal(verifySignedRecord(body.evidence, key.publicKeyPem), true);
    assert.equal(JSON.parse(body.evidence.payload).snapshotSha256, incident.snapshotSha256);

    const tampered = { ...body.evidence, payload: body.evidence.payload.replace('Bricks', 'Leaves') };
    assert.equal(verifySignedRecord(tampered, key.publicKeyPem), false);

    const { body: list } = await server.get('/api/properties/prop-shamshabad-412/evidence');
    assert.equal(list.records.length, 1);
    assert.equal(list.merkleRoot, merkleRoot([body.evidence.sha256]));
  });

  test('the dossier is signed and reflects the real status', async () => {
    const { body } = await server.get('/api/properties/prop-devanahalli-88/dossier');
    const { body: key } = await server.get('/api/evidence/public-key');
    assert.equal(verifySignedRecord(body.dossier, key.publicKeyPem), true);
    const payload = JSON.parse(body.dossier.payload);
    assert.equal(payload.status, 'ACTION_REQUIRED');
    assert.equal(payload.property.id, 'prop-devanahalli-88');
  });
});

describe('Demo routes', () => {
  test('simulate an alert and reset', async () => {
    const server = await startServer();
    const alerted = await server.post('/api/demo/properties/prop-shamshabad-412/simulate-alert');
    assert.equal(status(alerted.body.property), 'ATTENTION_NEEDED');
    const reset = await server.post('/api/demo/properties/prop-shamshabad-412/reset');
    assert.equal(status(reset.body.property), 'ALL_CLEAR');
    await server.close();
  });

});
