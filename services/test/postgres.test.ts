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

  test('health tells the web app that accounts are on and how to sign in', async () => {
    const { body } = await server.get('/api/health');
    assert.equal(body.accounts, true);
    assert.equal(body.demo, true);
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

    const untouched = await store.getProperty('prop-shamshabad-412-b', { kind: 'owner', userId: OWNER_B });
    assert.equal(untouched?.inspection.onDemandRequest, null);
  });

  test('changes are saved to the database with their activity', async () => {
    const headers = await as(OWNER_A);
    const created = await server.post('/api/properties/prop-shamshabad-412-a/inspection-requests', { notes: 'Check NE peg' }, headers);
    assert.equal(created.status, 201);

    const reloaded = (await server.get('/api/properties/prop-shamshabad-412-a', headers)).body.property as PropertyRecord;
    assert.equal(reloaded.inspection.onDemandRequest?.notes, 'Check NE peg');
    assert.equal(reloaded.activity[0].title, 'On-demand inspection requested');

    const { rows } = await db.query<{ count: number }>(
      `select count(*)::int as count from public.activity_events where property_id = 'prop-shamshabad-412-a'`
    );
    assert.equal(rows[0].count, 4);
  });

  test('a rejected change is rolled back', async () => {
    const headers = await as(OWNER_A);
    const before = (await store.getProperty('prop-shamshabad-412-a', { kind: 'owner', userId: OWNER_A }))!;
    const duplicate = await server.post('/api/properties/prop-shamshabad-412-a/inspection-requests', {}, headers);
    assert.equal(duplicate.status, 409);
    const after = (await store.getProperty('prop-shamshabad-412-a', { kind: 'owner', userId: OWNER_A }))!;
    assert.deepEqual(after, before);
  });

  test('owners cannot record land record checks outside the demo', async () => {
    const { status } = await server.post('/api/properties/prop-devanahalli-88-a/registry-checks', {}, await as(OWNER_A));
    assert.equal(status, 404);
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

  test('the demo only ever touches the sample plots, never the database', async () => {
    const customerPlot = await server.post('/api/demo/properties/prop-shamshabad-412-a/simulate-alert', {}, await as(OWNER_A));
    assert.equal(customerPlot.status, 404);

    const sample = await server.post('/api/demo/properties/prop-shamshabad-412/simulate-alert');
    assert.equal(sample.status, 200);
    const { rows } = await db.query<{ count: number }>(`select count(*)::int as count from public.properties`);
    assert.equal(rows[0].count, 4);
    const stored = (await store.getProperty('prop-shamshabad-412-a', { kind: 'owner', userId: OWNER_A }))!;
    assert.equal(stored.camera?.changeDetected, false);
  });

  test('owners add a plot request to their account and see only their own', async () => {
    const request = {
      name: 'Owner A',
      email: 'ignored@example.com',
      state: 'Karnataka',
      district: 'Bengaluru Rural',
      village: 'Shettigere',
      surveyNumber: '88/2C'
    };
    const created = await server.post('/api/me/plot-requests', request, await as(OWNER_A));
    assert.equal(created.status, 201);
    assert.equal(created.body.request.source, 'account');
    assert.equal(created.body.request.status, 'new');
    // The account's own email is used, not whatever was typed.
    assert.equal(created.body.request.email, `${OWNER_A.slice(0, 4)}@example.com`);

    const mine = await server.get('/api/me/plot-requests', await as(OWNER_A));
    assert.equal(mine.body.requests.length, 1);
    const theirs = await server.get('/api/me/plot-requests', await as(OWNER_B));
    assert.equal(theirs.body.requests.length, 0);
    assert.equal((await server.get('/api/me/plot-requests')).status, 401);
  });

  test('website plot requests are saved to the database without an account', async () => {
    const { status } = await server.post('/api/plot-requests', {
      name: 'Visitor',
      email: 'visitor@example.com',
      state: 'Punjab',
      district: 'SAS Nagar'
    });
    assert.equal(status, 201);
    const { rows } = await db.query<{ source: string; user_id: string | null }>(
      `select source, user_id from public.plot_requests where email = 'visitor@example.com'`
    );
    assert.deepEqual(rows, [{ source: 'website', user_id: null }]);
  });

  test('the public anon role can add a website request but never read or claim one', async () => {
    await pglite.exec(`
      set role anon;
      insert into public.plot_requests (name, email, state, district) values ('Anon', 'anon@example.com', 'Telangana', 'Medchal');
      reset role;
    `);
    await assert.rejects(pglite.exec(`set role anon; select * from public.plot_requests;`), /permission denied/);
    await pglite.exec('reset role');
    await assert.rejects(
      pglite.exec(`set role anon; insert into public.plot_requests (name, email, state, district, user_id)
        values ('Anon', 'anon2@example.com', 'Telangana', 'Medchal', '${OWNER_A}');`),
      /permission denied/
    );
    await pglite.exec('reset role');
    await assert.rejects(
      pglite.exec(`set role anon; update public.plot_requests set status = 'closed';`),
      /permission denied/
    );
    await pglite.exec('reset role');
    await assert.rejects(
      pglite.exec(`set role authenticated; insert into public.plot_requests (name, email, state, district)
        values ('Auth', 'auth@example.com', 'Telangana', 'Medchal');`),
      /permission denied/
    );
    await pglite.exec('reset role');
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
    const property = (await store.getProperty(id, { kind: 'owner', userId: OWNER_A }))!;
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
