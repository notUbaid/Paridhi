import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import type { PGlite } from '@electric-sql/pglite';
import type { PropertyRecord } from '../../shared/types.js';
import { createTokenVerifier } from '../src/auth.js';
import type { Database } from '../src/db.js';
import { verifySignedRecord } from '../src/evidence.js';
import { createSeedProperties } from '../src/seed.js';
import { PostgresStore } from '../src/store.js';
import { FIXED_NOW, createTestDatabase, startServer, type TestServer } from './helpers.js';

const ISSUER = 'https://paridhi-test.supabase.co/auth/v1';
const OWNER_A = '11111111-1111-4111-8111-111111111111';
const OWNER_B = '22222222-2222-4222-8222-222222222222';
const DEVICE_TOKEN = 'device-token-for-tests-0123456789';

/** Sample plots for one owner, with ids made unique per owner. */
function plotsFor(suffix: string): PropertyRecord[] {
  return createSeedProperties(FIXED_NOW).map((p) => ({
    ...p,
    id: `${p.id}-${suffix}`,
    activity: p.activity.map((a) => ({ ...a, id: `${a.id}-${suffix}` }))
  }));
}

describe('Postgres storage with owner sign-in', () => {
  let db: Database;
  let pglite: PGlite;
  let store: PostgresStore;
  let server: TestServer;
  let tokenFor: (sub: string, overrides?: { issuer?: string; expiresIn?: string }) => Promise<string>;
  let foreignToken: string;

  before(async () => {
    ({ db, pglite } = await createTestDatabase());
    await db.query(`insert into auth.users (id, email) values ($1, 'a@example.com'), ($2, 'b@example.com')`, [
      OWNER_A,
      OWNER_B
    ]);
    store = new PostgresStore(db);
    for (const plot of plotsFor('a')) await store.insertProperty(OWNER_A, plot);
    await store.insertProperty(OWNER_B, plotsFor('b')[0]);

    // Stand-in for Supabase Auth: an ES256 key published as a JWKS.
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'test-key', alg: 'ES256' };
    tokenFor = (sub, { issuer = ISSUER, expiresIn = '1h' } = {}) =>
      new SignJWT({ email: `${sub.slice(0, 4)}@example.com`, role: 'authenticated' })
        .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
        .setSubject(sub)
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(privateKey);

    const other = await generateKeyPair('ES256');
    foreignToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
      .setSubject(OWNER_A)
      .setIssuer(ISSUER)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(other.privateKey);

    server = await startServer({
      store,
      deviceToken: DEVICE_TOKEN,
      auth: {
        verify: createTokenVerifier({ issuer: ISSUER, audience: 'authenticated', key: createLocalJWKSet({ keys: [jwk] }) }),
        supabaseUrl: 'https://paridhi-test.supabase.co',
        publishableKey: 'sb_publishable_test'
      }
    });
  });

  after(async () => {
    await server.close();
    await db.close();
  });

  const as = async (owner: string) => ({ Authorization: `Bearer ${await tokenFor(owner)}` });

  test('health tells the web app to show sign-in', async () => {
    const { body } = await server.get('/api/health');
    assert.equal(body.demoMode, false);
    assert.deepEqual(body.auth, {
      required: true,
      supabaseUrl: 'https://paridhi-test.supabase.co',
      publishableKey: 'sb_publishable_test'
    });
  });

  test('rejects missing, malformed, expired, foreign and wrong-issuer tokens', async () => {
    const expired = await tokenFor(OWNER_A, { expiresIn: '-1m' });
    const wrongIssuer = await tokenFor(OWNER_A, { issuer: 'https://evil.example.com/auth/v1' });
    for (const headers of [
      {} as Record<string, string>,
      { Authorization: 'Bearer not-a-jwt' },
      { Authorization: `Bearer ${expired}` },
      { Authorization: `Bearer ${foreignToken}` },
      { Authorization: `Bearer ${wrongIssuer}` }
    ]) {
      const { status } = await server.get('/api/properties', headers);
      assert.equal(status, 401, JSON.stringify(headers).slice(0, 40));
    }
  });

  test('each owner sees only their own plots', async () => {
    const a = await server.get('/api/properties', await as(OWNER_A));
    const b = await server.get('/api/properties', await as(OWNER_B));
    assert.deepEqual(
      (a.body.properties as PropertyRecord[]).map((p) => p.id).sort(),
      ['prop-devanahalli-88-a', 'prop-mohali-122-a', 'prop-shamshabad-412-a']
    );
    assert.deepEqual((b.body.properties as PropertyRecord[]).map((p) => p.id), ['prop-shamshabad-412-b']);
  });

  test("an owner cannot read or change another owner's plot", async () => {
    const headers = await as(OWNER_A);
    assert.equal((await server.get('/api/properties/prop-shamshabad-412-b', headers)).status, 404);
    assert.equal((await server.get('/api/properties/prop-shamshabad-412-b/dossier', headers)).status, 404);
    assert.equal((await server.post('/api/properties/prop-shamshabad-412-b/inspection-requests', {}, headers)).status, 404);

    const untouched = await store.getProperty('prop-shamshabad-412-b', OWNER_B);
    assert.equal(untouched?.latestInspection.onDemandRequest, null);
  });

  test('changes are saved to the database with their activity', async () => {
    const headers = await as(OWNER_A);
    const created = await server.post('/api/properties/prop-shamshabad-412-a/inspection-requests', { notes: 'Check NE peg' }, headers);
    assert.equal(created.status, 201);

    const reloaded = (await server.get('/api/properties/prop-shamshabad-412-a', headers)).body.property as PropertyRecord;
    assert.equal(reloaded.latestInspection.onDemandRequest?.notes, 'Check NE peg');
    assert.equal(reloaded.activity[0].title, 'On-demand inspection requested');

    const { rows } = await db.query<{ count: number }>(
      `select count(*)::int as count from public.activity_events where property_id = 'prop-shamshabad-412-a'`
    );
    assert.equal(rows[0].count, 4);
  });

  test('a rejected change is rolled back', async () => {
    const headers = await as(OWNER_A);
    const before = (await store.getProperty('prop-shamshabad-412-a', OWNER_A))!;
    const duplicate = await server.post('/api/properties/prop-shamshabad-412-a/inspection-requests', {}, headers);
    assert.equal(duplicate.status, 409);
    const after = (await store.getProperty('prop-shamshabad-412-a', OWNER_A))!;
    assert.deepEqual(after, before);
  });

  test('a registry check keeps the flagged mutation', async () => {
    const { body } = await server.post('/api/properties/prop-devanahalli-88-a/registry-checks', {}, await as(OWNER_A));
    assert.equal(body.property.revenue.flaggedMutations.length, 1);
    const stored = await store.getProperty('prop-devanahalli-88-a', OWNER_A);
    assert.equal(stored?.revenue.lastCheckedAt, FIXED_NOW.toISOString());
  });

  test('device incidents store signed, append-only evidence', async () => {
    const created = await server.post(
      '/api/properties/prop-mohali-122-a/incidents',
      { type: 'VEHICLE_ON_PLOT', description: 'Tractor parked inside the boundary' },
      { Authorization: `Bearer ${DEVICE_TOKEN}` }
    );
    assert.equal(created.status, 201);

    const { body } = await server.get('/api/properties/prop-mohali-122-a/evidence', await as(OWNER_A));
    assert.equal(body.records.length, 1);
    const key = (await server.get('/api/evidence/public-key')).body;
    assert.equal(verifySignedRecord(body.records[0], key.publicKeyPem), true);

    await assert.rejects(pglite.query(`update public.evidence_records set payload = 'forged'`), /append-only/);
    await assert.rejects(pglite.query(`delete from public.evidence_records`), /append-only/);
  });

  test('owner B cannot list owner A evidence', async () => {
    const { status } = await server.get('/api/properties/prop-mohali-122-a/evidence', await as(OWNER_B));
    assert.equal(status, 404);
  });

  test('demo routes do not exist when using the database', async () => {
    const { status } = await server.post('/api/demo/properties/prop-shamshabad-412-a/reset', {}, await as(OWNER_A));
    assert.equal(status, 404);
  });

  test('the activity log returns the 50 most recent events, newest first', async () => {
    const id = 'prop-devanahalli-88-a';
    for (let i = 0; i < 60; i++) {
      await db.query(
        `insert into public.activity_events (id, property_id, at, category, severity, title, description)
         values ($1, $2, $3, 'SYSTEM', 'INFO', $4, 'bulk')`,
        [`bulk-${crypto.randomUUID()}`, id, new Date(FIXED_NOW.getTime() + i * 60_000).toISOString(), `event ${i}`]
      );
    }
    const property = (await store.getProperty(id, OWNER_A))!;
    assert.equal(property.activity.length, 50);
    assert.equal(property.activity[0].title, 'event 59');
  });

  test('public Data API roles have no access to the tables', async () => {
    const { rows } = await db.query<{ grants: number }>(
      `select count(*)::int as grants from information_schema.role_table_grants
        where table_schema = 'public' and grantee in ('anon', 'authenticated')`
    );
    assert.equal(rows[0].grants, 0);
  });
});
