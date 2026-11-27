import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import type { PGlite } from '@electric-sql/pglite';
import { getCaveatStatus, getPropertyAlerts, getPropertyStatus } from '../../shared/domain.js';
import type { PropertyRecord, StaffProperty } from '../../shared/types.js';
import { createTokenVerifier } from '../src/auth.js';
import type { Database } from '../src/db.js';
import { verifySignedRecord } from '../src/evidence.js';
import { createSeedProperties } from '../src/seed.js';
import { PostgresStore } from '../src/store.js';
import { FIXED_NOW, createTestDatabase, fakeJpeg, startServer, type TestServer } from './helpers.js';

const ISSUER = 'https://paridhi-test.supabase.co/auth/v1';
const USERS = {
  ownerA: '11111111-1111-4111-8111-111111111111',
  ownerB: '22222222-2222-4222-8222-222222222222',
  ops: '33333333-3333-4333-8333-333333333333',
  inspector: '44444444-4444-4444-8444-444444444444',
  otherInspector: '55555555-5555-4555-8555-555555555555',
  advocate: '66666666-6666-4666-8666-666666666666',
  newcomer: '77777777-7777-4777-8777-777777777777'
};
const EMAIL: Record<keyof typeof USERS, string> = {
  ownerA: 'owner.a@example.com',
  ownerB: 'owner.b@example.com',
  ops: 'ops@example.com',
  inspector: 'inspector@example.com',
  otherInspector: 'inspector2@example.com',
  advocate: 'advocate@example.com',
  newcomer: 'newcomer@example.com'
};
const PLOT = 'prop-shamshabad-412-a';
const statusOf = (p: PropertyRecord) => getPropertyStatus(getPropertyAlerts(p, FIXED_NOW));

describe('Staff console with roles', () => {
  let db: Database;
  let pglite: PGlite;
  let store: PostgresStore;
  let server: TestServer;
  let as: (user: keyof typeof USERS) => Promise<Record<string, string>>;

  before(async () => {
    ({ db, pglite } = await createTestDatabase());
    for (const [key, id] of Object.entries(USERS)) {
      await db.query('insert into auth.users (id, email) values ($1, $2)', [id, EMAIL[key as keyof typeof USERS]]);
    }
    store = new PostgresStore(db);
    for (const plot of createSeedProperties(FIXED_NOW)) {
      await store.insertProperty(USERS.ownerA, {
        ...plot,
        id: `${plot.id}-a`,
        activity: plot.activity.map((a) => ({ ...a, id: `${a.id}-a` }))
      });
    }
    await store.upsertStaff({ email: EMAIL.ops, role: 'ops', displayName: 'Asha Ops', staffCode: 'PRD-OPS-01' });
    await store.upsertStaff({ email: EMAIL.inspector, role: 'inspector', displayName: 'Ravi Inspector', staffCode: 'PRD-INSP-501' });
    await store.upsertStaff({ email: EMAIL.otherInspector, role: 'inspector', displayName: 'Other Inspector', staffCode: 'PRD-INSP-502' });
    await store.upsertStaff({ email: EMAIL.advocate, role: 'advocate', displayName: 'Adv. Test', staffCode: 'TS/0000/2020' });

    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'ES256' };
    as = async (user) => ({
      Authorization: `Bearer ${await new SignJWT({ email: EMAIL[user] })
        .setProtectedHeader({ alg: 'ES256', kid: 'k1' })
        .setSubject(USERS[user])
        .setIssuer(ISSUER)
        .setAudience('authenticated')
        .setExpirationTime('1h')
        .sign(privateKey)}`
    });

    server = await startServer({
      store,
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

  const staffPlots = async (user: keyof typeof USERS) =>
    (await server.get('/api/staff/properties', await as(user))).body.properties as StaffProperty[];

  test('/api/me reports the staff role', async () => {
    assert.equal((await server.get('/api/me', await as('ops'))).body.viewer.staffRole, 'ops');
    assert.equal((await server.get('/api/me', await as('ownerA'))).body.viewer.staffRole, null);
  });

  test('the staff console is hidden: 404 for owners, signed-out visitors and bad tokens', async () => {
    assert.equal((await server.get('/api/staff/properties', await as('ownerA'))).status, 404);
    assert.equal((await server.get('/api/staff/properties')).status, 404);
    assert.equal((await server.get('/api/staff/properties', { Authorization: 'Bearer not-a-jwt' })).status, 404);
    assert.equal((await server.post('/api/staff/team', { email: 'x@example.com', role: 'ops', displayName: 'X' }, await as('ownerA'))).status, 404);
  });

  test('ops see every plot request; other staff cannot', async () => {
    await server.post('/api/plot-requests', { name: 'Lead', email: 'lead@example.com', state: 'Telangana', district: 'Ranga Reddy' });
    const ops = await server.get('/api/staff/plot-requests', await as('ops'));
    assert.equal(ops.status, 200);
    assert.ok(ops.body.requests.some((r: { email: string }) => r.email === 'lead@example.com'));
    assert.equal((await server.get('/api/staff/plot-requests', await as('inspector'))).status, 403);
  });

  test('ops see every plot; inspectors and advocates only see plots assigned to them', async () => {
    const ops = await staffPlots('ops');
    assert.equal(ops.length, 3);
    assert.equal(ops[0].ownerEmail, EMAIL.ownerA);
    assert.equal((await staffPlots('inspector')).length, 0);
    assert.equal((await staffPlots('advocate')).length, 0);
  });

  test('ops assign an inspector and advocate, and the plot shows their names', async () => {
    const forbidden = await server.post(`/api/staff/properties/${PLOT}/assignments`, {}, await as('inspector'));
    assert.equal(forbidden.status, 403);

    const wrongRole = await server.post(
      `/api/staff/properties/${PLOT}/assignments`,
      { inspectorUserId: USERS.advocate, advocateUserId: null },
      await as('ops')
    );
    assert.equal(wrongRole.status, 400);

    const { status, body } = await server.post(
      `/api/staff/properties/${PLOT}/assignments`,
      { inspectorUserId: USERS.inspector, advocateUserId: USERS.advocate },
      await as('ops')
    );
    assert.equal(status, 200);
    assert.equal(body.property.inspection.inspectorName, 'Ravi Inspector');
    assert.equal(body.property.legal.enrolmentNumber, 'TS/0000/2020');

    assert.deepEqual((await staffPlots('inspector')).map((p) => p.property.id), [PLOT]);
    assert.deepEqual((await staffPlots('advocate')).map((p) => p.property.id), [PLOT]);
    assert.equal((await staffPlots('otherInspector')).length, 0);
  });

  test('photo uploads are checked, hashed and limited to assigned inspectors', async () => {
    const jpeg = fakeJpeg('upload');
    const path = `/api/staff/properties/${PLOT}/photos?pegId=P1&lat=17.2405&lng=78.4299`;

    const notImage = await server.postRaw(path, Buffer.from('plain text pretending'), 'image/jpeg', await as('inspector'));
    assert.equal(notImage.status, 415);
    const badPeg = await server.postRaw(path.replace('P1', 'P9'), jpeg, 'image/jpeg', await as('inspector'));
    assert.equal(badPeg.status, 400);
    const unassigned = await server.postRaw(path, jpeg, 'image/jpeg', await as('otherInspector'));
    assert.equal(unassigned.status, 404);
    const advocate = await server.postRaw(path, jpeg, 'image/jpeg', await as('advocate'));
    assert.equal(advocate.status, 403);

    const ok = await server.postRaw(path, jpeg, 'image/jpeg', await as('inspector'));
    assert.equal(ok.status, 201);
    assert.equal(ok.body.photo.sha256, crypto.createHash('sha256').update(jpeg).digest('hex'));
  });

  test('a recorded visit attaches photos, is signed, and the owner can view the photos', async () => {
    const jpeg = fakeJpeg('visit');
    const upload = await server.postRaw(
      `/api/staff/properties/${PLOT}/photos?pegId=P3&lat=17.2401&lng=78.4290`,
      jpeg,
      'image/jpeg',
      await as('inspector')
    );
    const photoId = upload.body.photo.photoId as string;

    const visit = {
      boundaryPegsIntact: true,
      debrisFound: false,
      neighborInquiryConducted: true,
      neighborFeedback: 'Neighbour saw nothing unusual',
      notes: 'All four pegs checked',
      photoIds: [photoId]
    };
    const advocateTry = await server.post(`/api/staff/properties/${PLOT}/inspection-visits`, visit, await as('advocate'));
    assert.equal(advocateTry.status, 403);

    const { status, body } = await server.post(`/api/staff/properties/${PLOT}/inspection-visits`, visit, await as('inspector'));
    assert.equal(status, 201);
    const latest = body.property.inspection.latestVisit;
    assert.equal(latest.inspectorName, 'Ravi Inspector');
    assert.equal(latest.photos[0].photoId, photoId);
    assert.equal(body.property.inspection.onDemandRequest, null);
    assert.equal(body.property.inspection.nextVisitDue, new Date(FIXED_NOW.getTime() + 30 * 86_400_000).toISOString());

    const key = (await server.get('/api/evidence/public-key')).body;
    assert.equal(body.evidence.kind, 'INSPECTION_VISIT');
    assert.equal(verifySignedRecord(body.evidence, key.publicKeyPem), true);
    assert.equal(JSON.parse(body.evidence.payload).visit.photos[0].sha256, crypto.createHash('sha256').update(jpeg).digest('hex'));

    const reuse = await server.post(`/api/staff/properties/${PLOT}/inspection-visits`, visit, await as('inspector'));
    assert.equal(reuse.status, 400);

    const photo = await server.fetchRaw(`/api/properties/${PLOT}/photos/${photoId}`, await as('ownerA'));
    assert.equal(photo.status, 200);
    assert.equal(photo.headers.get('content-type'), 'image/jpeg');
    assert.deepEqual(Buffer.from(await photo.arrayBuffer()), jpeg);

    const stranger = await server.fetchRaw(`/api/properties/${PLOT}/photos/${photoId}`, await as('ownerB'));
    assert.equal(stranger.status, 404);

    await assert.rejects(pglite.query(`update public.photos set bytes = '\\x00'::bytea where id = $1`, [photoId]), /immutable/);
    await assert.rejects(pglite.query(`delete from public.photos where id = $1`, [photoId]), /cannot be deleted/);
  });

  test('ops flag a mutation application and the advocate resolves it', async () => {
    const flagged = await server.post(
      `/api/staff/properties/${PLOT}/flagged-mutations`,
      { reference: 'BB-2026-77', filedOn: '2026-11-20', description: 'Sale deed the owner did not sign' },
      await as('ops')
    );
    assert.equal(flagged.status, 201);
    assert.equal(statusOf(flagged.body.property), 'ACTION_REQUIRED');
    const mutationId = flagged.body.property.revenue.flaggedMutations[0].id;

    const duplicate = await server.post(
      `/api/staff/properties/${PLOT}/flagged-mutations`,
      { reference: 'BB-2026-77', filedOn: '2026-11-20', description: 'again' },
      await as('ops')
    );
    assert.equal(duplicate.status, 409);

    const inspectorTry = await server.post(
      `/api/staff/properties/${PLOT}/flagged-mutations/${mutationId}/resolve`,
      { outcome: 'x' },
      await as('inspector')
    );
    assert.equal(inspectorTry.status, 403);

    const resolved = await server.post(
      `/api/staff/properties/${PLOT}/flagged-mutations/${mutationId}/resolve`,
      { outcome: 'Objection filed; the Tahsildar rejected the application.' },
      await as('advocate')
    );
    assert.equal(resolved.status, 200);
    assert.equal(resolved.body.property.revenue.flaggedMutations.length, 0);
  });

  test('the advocate confirms a caveat lodging, which clears the renewal request', async () => {
    await server.post(`/api/properties/${PLOT}/caveat-renewals`, {}, await as('ownerA'));
    const lapsed = await server.post(
      `/api/staff/properties/${PLOT}/caveats`,
      { court: 'Junior Civil Judge, Rajendranagar', lodgedOn: '2026-06-01' },
      await as('advocate')
    );
    assert.equal(lapsed.status, 400);

    const { status, body } = await server.post(
      `/api/staff/properties/${PLOT}/caveats`,
      { court: 'Junior Civil Judge, Rajendranagar', lodgedOn: '2026-11-22' },
      await as('advocate')
    );
    assert.equal(status, 201);
    const caveat = getCaveatStatus(body.property.legal, FIXED_NOW);
    assert.equal(caveat.state, 'ACTIVE');
    assert.equal(caveat.renewalRequested, false);
    assert.equal(body.property.legal.renewalRequestedAt, null);
  });

  test('ops record a clean land record check', async () => {
    const { body } = await server.post(`/api/staff/properties/${PLOT}/registry-checks`, { note: 'Checked on Bhu Bharati' }, await as('ops'));
    assert.equal(body.property.revenue.lastCheckedAt, FIXED_NOW.toISOString());
    assert.match(body.property.activity[0].description, /Checked by Asha Ops/);
  });

  test('ops add a plot for an existing owner account', async () => {
    const plot = {
      ownerEmail: EMAIL.ownerB,
      owner: { name: 'Owner B', overseasCity: 'Toronto', overseasCountry: 'Canada', timeZone: 'America/Toronto' },
      name: 'Tellapur Plot',
      surveyNumber: 'Sy. No. 77/B',
      marketValuationINR: 15_000_000,
      location: {
        village: 'Tellapur',
        mandalTaluk: 'Ramachandrapuram',
        district: 'Sangareddy',
        state: 'Telangana',
        pegs: [
          { lat: 17.4612, lng: 78.2851 },
          { lat: 17.4608, lng: 78.2851 },
          { lat: 17.4608, lng: 78.2846 },
          { lat: 17.4612, lng: 78.2846 }
        ],
        boundaries: { north: 'Road', east: 'Sy. 78', south: 'Sy. 76', west: 'Canal' }
      },
      revenue: {
        portalName: 'Bhu Bharati (Telangana land records)',
        portalUrl: 'https://bhubharati.telangana.gov.in',
        surveyNumber: '77/B',
        accountLabel: 'Khata',
        accountNumber: 'KT-1',
        recordedOwner: 'Owner B'
      },
      legal: { courts: 'Sangareddy civil courts' },
      inspectorUserId: USERS.inspector,
      advocateUserId: null,
      firstVisitDue: '2026-11-30'
    };

    const unknown = await server.post('/api/staff/properties', { ...plot, ownerEmail: 'nobody@example.com' }, await as('ops'));
    assert.equal(unknown.status, 400);
    const notOps = await server.post('/api/staff/properties', plot, await as('inspector'));
    assert.equal(notOps.status, 403);
    const badZone = await server.post('/api/staff/properties', { ...plot, owner: { ...plot.owner, timeZone: 'Mars/Base' } }, await as('ops'));
    assert.equal(badZone.status, 400);

    const { status, body } = await server.post('/api/staff/properties', plot, await as('ops'));
    assert.equal(status, 201, JSON.stringify(body));
    const created: PropertyRecord = body.property;
    assert.equal(created.camera, null);
    assert.equal(created.inspection.latestVisit, null);
    assert.equal(created.inspection.inspectorName, 'Ravi Inspector');
    // 0.0004° of latitude (44.5 m) by 0.0005° of longitude at 17.46°N (53.0 m) is about 2,360 m², or 0.58 acres.
    assert.ok(Math.abs(created.areaAcres - 0.583) < 0.01, `area ${created.areaAcres}`);
    assert.equal(statusOf(created), 'ATTENTION_NEEDED'); // land record not checked yet

    const ownerB = (await server.get('/api/properties', await as('ownerB'))).body.properties as PropertyRecord[];
    assert.deepEqual(ownerB.map((p) => p.id), [created.id]);
  });

  test('ops manage the team; others cannot', async () => {
    assert.equal((await server.get('/api/staff/team', await as('inspector'))).status, 403);
    const unknown = await server.post('/api/staff/team', { email: 'ghost@example.com', role: 'inspector', displayName: 'Ghost' }, await as('ops'));
    assert.equal(unknown.status, 400);

    const added = await server.post(
      '/api/staff/team',
      { email: EMAIL.newcomer, role: 'inspector', displayName: 'New Inspector', staffCode: 'PRD-INSP-900' },
      await as('ops')
    );
    assert.equal(added.status, 201);
    assert.equal((await server.get('/api/me', await as('newcomer'))).body.viewer.staffRole, 'inspector');

    assert.equal((await server.del(`/api/staff/team/${USERS.ops}`, await as('ops'))).status, 400);
    assert.equal((await server.del(`/api/staff/team/${USERS.newcomer}`, await as('ops'))).status, 204);
    assert.equal((await server.get('/api/me', await as('newcomer'))).body.viewer.staffRole, null);
  });

  test('deleting a staff account keeps the photos they uploaded', async () => {
    await db.query('delete from auth.users where id = $1', [USERS.inspector]);
    const { rows } = await db.query<{ kept: number }>(
      `select count(*)::int as kept from public.photos where uploaded_by is null and visit_id is not null`
    );
    assert.ok(rows[0].kept >= 1);
    const plot = (await staffPlots('ops')).find((p) => p.property.id === PLOT)!;
    assert.equal(plot.inspectorUserId, null);
  });
});
