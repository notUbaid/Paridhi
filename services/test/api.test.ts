import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { getPropertyAlerts, getPropertyStatus, getCaveatStatus } from '../../shared/domain.js';
import type { PropertyRecord } from '../../shared/types.js';
import { merkleRoot, verifySignedRecord } from '../src/evidence.js';
import { MemoryPlotRequestSink } from '../src/plotRequests.js';
import { DEMO_OWNER_ID } from '../src/store.js';
import { FIXED_NOW, fakeAuth, sampleStore, startServer, type TestServer } from './helpers.js';

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

  test('health reports the demo, no accounts, no sign-in and an ephemeral key', async () => {
    const { status: code, body } = await server.get('/api/health');
    assert.equal(code, 200);
    assert.equal(body.demo, true);
    assert.equal(body.accounts, false);
    assert.deepEqual(body.auth, { required: false });
    assert.deepEqual(body.contact, { whatsapp: null, email: null });
    assert.equal(body.deviceIngestEnabled, false);
    assert.equal(body.signingKey.ephemeral, true);
  });

  test('the demo lists the sample portfolio with no real-looking contact details', async () => {
    const { body } = await server.get('/api/demo/properties');
    assert.equal(body.properties.length, 3);
    for (const property of body.properties as PropertyRecord[]) {
      assert.match(property.owner.email, /@example\.com$/);
    }
  });

  test('sample data covers clear, attention and action states', async () => {
    const { body } = await server.get('/api/demo/properties');
    const byId = Object.fromEntries((body.properties as PropertyRecord[]).map((p) => [p.id, status(p)]));
    assert.deepEqual(byId, {
      'prop-shamshabad-412': 'ALL_CLEAR',
      'prop-devanahalli-88': 'ACTION_REQUIRED',
      'prop-mohali-122': 'ATTENTION_NEEDED'
    });
  });

  test('without a database, account routes say accounts are not set up', async () => {
    for (const route of ['/api/me', '/api/properties']) {
      const { status: code } = await server.get(route);
      assert.equal(code, 503, route);
    }
  });

  test('the staff console does not exist without accounts', async () => {
    const { status: code, body } = await server.get('/api/staff/properties');
    assert.equal(code, 404);
    assert.equal(body.error, 'Not found');
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

  test('account and staff pages ask search engines not to index them', async () => {
    const staff = await server.fetchRaw('/staff');
    assert.equal(staff.headers.get('x-robots-tag'), 'noindex, nofollow');
    const home = await server.fetchRaw('/');
    assert.equal(home.headers.get('x-robots-tag'), null);
  });

  test('unknown property returns 404', async () => {
    const { status: code, body } = await server.get('/api/demo/properties/prop-nope');
    assert.equal(code, 404);
    assert.equal(body.error, 'Property not found');
  });

  test('malformed JSON returns 400', async () => {
    const { status: code } = await server.post('/api/demo/properties/prop-shamshabad-412/inspection-requests', '{not json');
    assert.equal(code, 400);
  });
});

describe('Demo owner actions', () => {
  let server: TestServer;
  before(async () => {
    server = await startServer();
  });
  after(() => server.close());

  test('on-demand inspection is recorded once and rejects duplicates', async () => {
    const first = await server.post('/api/demo/properties/prop-shamshabad-412/inspection-requests', { notes: 'Check the NW peg' });
    assert.equal(first.status, 201);
    const property: PropertyRecord = first.body.property;
    assert.equal(property.inspection.onDemandRequest?.notes, 'Check the NW peg');
    assert.equal(property.activity[0].category, 'INSPECTION');

    const second = await server.post('/api/demo/properties/prop-shamshabad-412/inspection-requests', {});
    assert.equal(second.status, 409);
  });

  test('inspection notes are length-limited', async () => {
    const { status: code } = await server.post('/api/demo/properties/prop-mohali-122/inspection-requests', {
      notes: 'x'.repeat(501)
    });
    assert.equal(code, 400);
  });

  test('a registry check never clears a flagged mutation', async () => {
    const { status: code, body } = await server.post('/api/demo/properties/prop-devanahalli-88/registry-checks');
    assert.equal(code, 200);
    const property: PropertyRecord = body.property;
    assert.equal(property.revenue.flaggedMutations.length, 1);
    assert.equal(property.revenue.lastCheckedAt, FIXED_NOW.toISOString());
    assert.equal(property.activity[0].severity, 'ALERT');
    assert.equal(status(property), 'ACTION_REQUIRED');
  });

  test('a registry check on a clean record logs a clean result', async () => {
    const { body } = await server.post('/api/demo/properties/prop-shamshabad-412/registry-checks');
    assert.equal(body.property.activity[0].severity, 'SUCCESS');
  });

  test('caveat renewal is a request to the advocate, not an instant filing', async () => {
    const before = (await server.get('/api/demo/properties/prop-mohali-122')).body.property as PropertyRecord;
    assert.equal(getCaveatStatus(before.legal, FIXED_NOW).state, 'EXPIRING');

    const { status: code, body } = await server.post('/api/demo/properties/prop-mohali-122/caveat-renewals');
    assert.equal(code, 201);
    const after: PropertyRecord = body.property;
    assert.equal(after.legal.caveat?.lodgedOn, before.legal.caveat?.lodgedOn);
    assert.equal(getCaveatStatus(after.legal, FIXED_NOW).renewalRequested, true);

    const again = await server.post('/api/demo/properties/prop-mohali-122/caveat-renewals');
    assert.equal(again.status, 409);
  });

  test('simulate an alert and reset', async () => {
    const alerted = await server.post('/api/demo/properties/prop-shamshabad-412/simulate-alert');
    assert.equal(status(alerted.body.property), 'ATTENTION_NEEDED');
    const reset = await server.post('/api/demo/properties/prop-shamshabad-412/reset');
    assert.equal(status(reset.body.property), 'ALL_CLEAR');
  });

  test('a sample dossier is signed and marked as sample data inside the signature', async () => {
    const { body } = await server.get('/api/demo/properties/prop-devanahalli-88/dossier');
    const { body: key } = await server.get('/api/evidence/public-key');
    assert.equal(verifySignedRecord(body.dossier, key.publicKeyPem), true);
    const payload = JSON.parse(body.dossier.payload);
    assert.equal(payload.sampleData, true);
    assert.equal(payload.status, 'ACTION_REQUIRED');
  });
});

describe('Plot requests from the website', () => {
  let server: TestServer;
  let sink: MemoryPlotRequestSink;
  const request = {
    name: 'Test Owner',
    email: 'Owner@Example.com',
    phone: '+1 555 0100',
    country: 'United States',
    state: 'Telangana',
    district: 'Ranga Reddy',
    village: 'Mamidipally',
    surveyNumber: '412/A',
    notes: 'Plot bought in 2015.'
  };

  before(async () => {
    sink = new MemoryPlotRequestSink({ log: false });
    server = await startServer({ plotRequests: sink });
  });
  after(() => server.close());

  test('a valid request is saved as a website request', async () => {
    const { status: code, body } = await server.post('/api/plot-requests', request);
    assert.equal(code, 201);
    assert.deepEqual(body, { received: true });
    assert.equal(sink.requests.length, 1);
    assert.equal(sink.requests[0].email, 'owner@example.com');
    assert.equal(sink.requests[0].source, 'website');
    assert.equal(sink.requests[0].userId, null);
  });

  test('name, email, state and district are required; email must look like one', async () => {
    for (const field of ['name', 'email', 'state', 'district']) {
      const { status: code } = await server.post('/api/plot-requests', { ...request, [field]: '' });
      assert.equal(code, 400, field);
    }
    const bad = await server.post('/api/plot-requests', { ...request, email: 'not-an-email' });
    assert.equal(bad.status, 400);
  });

  test('a filled-in hidden field is accepted but not saved (bots)', async () => {
    const before = sink.requests.length;
    const { status: code } = await server.post('/api/plot-requests', { ...request, website: 'http://spam.example' });
    assert.equal(code, 201);
    assert.equal(sink.requests.length, before);
  });

  test('a storage failure is reported, not swallowed', async () => {
    const failing = await startServer({
      plotRequests: { kind: 'broken', addPlotRequest: () => Promise.reject(new Error('down')) }
    });
    const original = console.error;
    console.error = () => {};
    try {
      const { status: code } = await failing.post('/api/plot-requests', request);
      assert.equal(code, 502);
    } finally {
      console.error = original;
      await failing.close();
    }
  });
});

describe('Device ingest and evidence', () => {
  const token = 'test-device-token-0123456789';
  const ownerToken = 'owner-token';
  const ownerAuth = { Authorization: `Bearer ${ownerToken}` };
  let server: TestServer;
  before(async () => {
    server = await startServer({
      store: sampleStore(),
      auth: fakeAuth({ [ownerToken]: { id: DEMO_OWNER_ID, email: 'owner@example.com' } }),
      deviceToken: token
    });
  });
  after(() => server.close());

  const incident = {
    type: 'MATERIAL_DUMPING',
    description: 'Bricks near the NE peg',
    snapshotSha256: 'a'.repeat(64),
    capturedAt: '2026-11-23T09:55:00.000Z'
  };

  test('is disabled without a device token or without a database', async () => {
    const noToken = await startServer({ store: sampleStore(), auth: fakeAuth() });
    assert.equal((await noToken.post('/api/properties/prop-shamshabad-412/incidents', incident)).status, 503);
    await noToken.close();

    const demoOnly = await startServer({ deviceToken: token });
    const { status: code } = await demoOnly.post('/api/properties/prop-shamshabad-412/incidents', incident, {
      Authorization: `Bearer ${token}`
    });
    assert.equal(code, 503);
    await demoOnly.close();
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

    const { body: list } = await server.get('/api/properties/prop-shamshabad-412/evidence', ownerAuth);
    assert.equal(list.records.length, 1);
    assert.equal(list.merkleRoot, merkleRoot([body.evidence.sha256]));
  });

  test("the owner's dossier is signed, reflects the real status and is not marked as sample data", async () => {
    const { body } = await server.get('/api/properties/prop-devanahalli-88/dossier', ownerAuth);
    const { body: key } = await server.get('/api/evidence/public-key');
    assert.equal(verifySignedRecord(body.dossier, key.publicKeyPem), true);
    const payload = JSON.parse(body.dossier.payload);
    assert.equal(payload.status, 'ACTION_REQUIRED');
    assert.equal(payload.property.id, 'prop-devanahalli-88');
    assert.equal(payload.sampleData, undefined);
  });

  test('a device incident changes the customer plot, never the demo copy', async () => {
    const { body } = await server.get('/api/demo/properties/prop-shamshabad-412');
    assert.equal(body.property.camera.changeDetected, false);
  });
});
