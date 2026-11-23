import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import {
  CAVEAT_VALIDITY_DAYS,
  INSPECTION_INTERVAL_DAYS,
  PHOTO_GEOFENCE_METERS,
  addDays,
  centerOf,
  isPhotoWithinGeofence,
  polygonAreaAcres
} from '../../shared/domain.js';
import type {
  BoundaryPeg,
  EvidenceRecord,
  IndianState,
  InspectionVisit,
  PropertyRecord,
  StaffMember,
  StaffRole,
  UploadedPhoto,
  Viewer
} from '../../shared/types.js';
import type { EvidenceSigner } from './evidence.js';
import {
  HttpError,
  handle,
  notFound,
  readBool,
  readDate,
  readNullableId,
  readNumber,
  readText,
  requireText,
  type AddActivity
} from './http.js';
import { ALL, UnknownUserError, type Scope, type Store, type StoredPhoto } from './store.js';

const INDIAN_STATES: IndianState[] = ['Telangana', 'Karnataka', 'Punjab', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Delhi-NCR'];
const PEG_CORNERS = ['NE', 'SE', 'SW', 'NW'];
const PHOTO_TYPES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'
};
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_PHOTOS_PER_VISIT = 12;

/** The plots a staff member may work on: all for ops (and the demo), otherwise only those assigned to them. */
export function staffScopeOf(viewer: Viewer): Scope {
  if (viewer.demo || viewer.staffRole === 'ops') return ALL;
  if (viewer.staffRole === 'inspector') return { kind: 'inspector', userId: viewer.userId! };
  if (viewer.staffRole === 'advocate') return { kind: 'advocate', userId: viewer.userId! };
  throw new HttpError(403, 'Staff access required');
}

interface StaffRouterDeps {
  store: Store;
  signer: EvidenceSigner;
  now: () => Date;
  addActivity: AddActivity;
  demoMode: boolean;
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function readHttpsUrl(body: unknown, name: string): string {
  const value = requireText(body, name, 300);
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new HttpError(400, `"${name}" must be an https:// address`);
  }
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'plot';

export function createStaffRouter({ store, signer, now, addActivity, demoMode }: StaffRouterDeps) {
  const router = express.Router();

  const viewerOf = (res: Response) => res.locals.viewer as Viewer;
  /** The staff member making the request (undefined in the demo, which has no accounts). */
  const staffOf = (res: Response) => res.locals.staff as StaffMember | undefined;
  const actorName = (res: Response) => staffOf(res)?.displayName ?? (viewerOf(res).demo ? 'Paridhi ops (demo)' : 'Paridhi staff');

  function allow(res: Response, ...roles: StaffRole[]) {
    const viewer = viewerOf(res);
    if (viewer.demo) return;
    if (!viewer.staffRole || !roles.includes(viewer.staffRole)) {
      throw new HttpError(403, 'Your role cannot do this');
    }
  }

  async function update<T>(req: Request, res: Response, change: Parameters<Store['updateProperty']>[2]) {
    const updated = await store.updateProperty(String(req.params.id), staffScopeOf(viewerOf(res)), change);
    if (!updated) throw notFound();
    return updated as { property: PropertyRecord; result: T };
  }

  async function staffMember(userId: string | null | undefined, role: StaffRole): Promise<StaffMember | null> {
    if (!userId) return null;
    const member = await store.getStaffMember(userId);
    if (!member || member.role !== role) throw new HttpError(400, `That person is not a ${role}`);
    return member;
  }

  router.use((_req, res, next) => {
    try {
      staffScopeOf(viewerOf(res));
      next();
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/properties',
    handle(async (_req, res) => {
      const viewer = viewerOf(res);
      const [properties, staff] = await Promise.all([store.listStaffProperties(staffScopeOf(viewer)), store.listStaff()]);
      res.json({ properties, staff });
    })
  );

  /* ---------- Plots (ops) ---------- */

  router.post(
    '/properties',
    handle(async (req, res) => {
      allow(res, 'ops');
      const body = req.body as Record<string, unknown>;
      const ownerInput = body.owner as Record<string, unknown> | undefined;
      const locationInput = body.location as Record<string, unknown> | undefined;
      const revenueInput = body.revenue as Record<string, unknown> | undefined;
      const legalInput = body.legal as Record<string, unknown> | undefined;
      if (!ownerInput || !locationInput || !revenueInput || !legalInput) {
        throw new HttpError(400, '"owner", "location", "revenue" and "legal" are required');
      }

      const ownerEmail = requireText(body, 'ownerEmail', 200).toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerEmail)) throw new HttpError(400, '"ownerEmail" is not an email address');
      const ownerUserId = await store.findUserIdByEmail(ownerEmail);
      if (!ownerUserId) {
        throw new HttpError(400, 'No account with that email. Add the owner in Supabase Authentication first.');
      }

      const timeZone = requireText(ownerInput, 'timeZone', 60);
      if (!isValidTimeZone(timeZone)) throw new HttpError(400, '"owner.timeZone" is not a known time zone');

      const state = requireText(locationInput, 'state', 40) as IndianState;
      if (!INDIAN_STATES.includes(state)) throw new HttpError(400, `"location.state" must be one of ${INDIAN_STATES.join(', ')}`);

      const pegInput = locationInput.pegs;
      if (!Array.isArray(pegInput) || pegInput.length !== 4) {
        throw new HttpError(400, '"location.pegs" must list the four corner pegs: NE, SE, SW, NW');
      }
      const pegs: BoundaryPeg[] = pegInput.map((peg, i) => ({
        id: `P${i + 1}`,
        corner: PEG_CORNERS[i],
        position: {
          lat: readNumber((peg as Record<string, unknown>)?.lat, `pegs[${i}].lat`, { min: 6, max: 37 }),
          lng: readNumber((peg as Record<string, unknown>)?.lng, `pegs[${i}].lng`, { min: 68, max: 98 })
        }
      }));
      const areaAcres = polygonAreaAcres(pegs);
      if (areaAcres <= 0.001) throw new HttpError(400, 'The four pegs do not enclose an area');

      const boundaries = (locationInput.boundaries ?? {}) as Record<string, unknown>;
      const inspector = await staffMember(readNullableId(body, 'inspectorUserId'), 'inspector');
      const advocate = await staffMember(readNullableId(body, 'advocateUserId'), 'advocate');
      const firstVisitDue = readDate(body.firstVisitDue ?? addDays(now().toISOString(), 7), 'firstVisitDue');

      const name = requireText(body, 'name');
      const property: PropertyRecord = {
        id: `prop-${slug(name)}-${crypto.randomBytes(3).toString('hex')}`,
        name,
        surveyNumber: requireText(body, 'surveyNumber', 60),
        plotSizeDisplay: readText(body, 'plotSizeDisplay', { max: 80 }) ?? `${areaAcres.toFixed(3)} acres`,
        areaAcres: Number(areaAcres.toFixed(4)),
        marketValuationINR: readNumber(body.marketValuationINR ?? 0, 'marketValuationINR', { min: 0, max: 1e12 }),
        location: {
          village: requireText(locationInput, 'village'),
          mandalTaluk: requireText(locationInput, 'mandalTaluk'),
          district: requireText(locationInput, 'district'),
          state,
          cityNear: readText(locationInput, 'cityNear', { max: 120 }) ?? '',
          center: centerOf(pegs),
          boundaryPegs: pegs,
          boundaries: {
            north: readText(boundaries, 'north', { max: 120 }) ?? '',
            east: readText(boundaries, 'east', { max: 120 }) ?? '',
            south: readText(boundaries, 'south', { max: 120 }) ?? '',
            west: readText(boundaries, 'west', { max: 120 }) ?? ''
          }
        },
        owner: {
          name: requireText(ownerInput, 'name'),
          overseasCity: requireText(ownerInput, 'overseasCity'),
          overseasCountry: requireText(ownerInput, 'overseasCountry'),
          timeZone,
          email: ownerEmail,
          phone: readText(ownerInput, 'phone', { max: 40 }) ?? ''
        },
        camera: null,
        inspection: {
          inspectorName: inspector?.displayName ?? 'Not assigned',
          inspectorId: inspector?.staffCode ?? '',
          nextVisitDue: firstVisitDue,
          onDemandRequest: null,
          latestVisit: null
        },
        revenue: {
          portalName: requireText(revenueInput, 'portalName'),
          portalUrl: readHttpsUrl(revenueInput, 'portalUrl'),
          surveyNumber: requireText(revenueInput, 'surveyNumber', 60),
          accountLabel: requireText(revenueInput, 'accountLabel', 40),
          accountNumber: requireText(revenueInput, 'accountNumber', 60),
          recordedOwner: requireText(revenueInput, 'recordedOwner', 200),
          recordStatus: readText(revenueInput, 'recordStatus', { max: 200 }) ?? '',
          flaggedMutations: [],
          lastCheckedAt: null,
          propertyTaxStatus: readText(revenueInput, 'propertyTaxStatus', { max: 200 }) ?? '',
          encumbranceStatus: readText(revenueInput, 'encumbranceStatus', { max: 200 }) ?? ''
        },
        legal: {
          advocateName: advocate?.displayName ?? 'Not assigned',
          enrolmentNumber: advocate?.staffCode ?? '',
          courts: readText(legalInput, 'courts', { max: 200 }) ?? '',
          caveat: null,
          renewalRequestedAt: null
        },
        activity: []
      };
      addActivity(property, {
        category: 'SYSTEM',
        title: 'Plot added to Paridhi',
        description: `Monitoring set up by ${actorName(res)}. First inspection due ${firstVisitDue.slice(0, 10)}.`,
        severity: 'INFO'
      });

      await store.createProperty(ownerUserId, property, {
        inspectorUserId: inspector?.userId ?? null,
        advocateUserId: advocate?.userId ?? null
      });
      res.status(201).json({ property });
    })
  );

  router.post(
    '/properties/:id/assignments',
    handle(async (req, res) => {
      allow(res, 'ops');
      const inspector = await staffMember(readNullableId(req.body, 'inspectorUserId'), 'inspector');
      const advocate = await staffMember(readNullableId(req.body, 'advocateUserId'), 'advocate');
      const { property } = await update(req, res, (p, ctx) => {
        p.inspection.inspectorName = inspector?.displayName ?? 'Not assigned';
        p.inspection.inspectorId = inspector?.staffCode ?? '';
        p.legal.advocateName = advocate?.displayName ?? 'Not assigned';
        p.legal.enrolmentNumber = advocate?.staffCode ?? '';
        ctx.setAssignments({ inspectorUserId: inspector?.userId ?? null, advocateUserId: advocate?.userId ?? null });
        addActivity(p, {
          category: 'SYSTEM',
          title: 'Team for this plot updated',
          description: `Inspector: ${p.inspection.inspectorName}. Advocate: ${p.legal.advocateName}.`,
          severity: 'INFO'
        });
      });
      res.json({ property });
    })
  );

  /* ---------- Inspections (ops, inspector) ---------- */

  router.post(
    '/properties/:id/photos',
    express.raw({ type: Object.keys(PHOTO_TYPES), limit: MAX_PHOTO_BYTES }),
    handle(async (req, res) => {
      allow(res, 'ops', 'inspector');
      const viewer = viewerOf(res);
      const property = await store.getProperty(String(req.params.id), staffScopeOf(viewer));
      if (!property) throw notFound();

      const contentType = String(req.headers['content-type'] ?? '').split(';')[0].trim();
      const data = req.body;
      if (!Buffer.isBuffer(data) || data.length === 0 || !PHOTO_TYPES[contentType]) {
        throw new HttpError(415, 'Upload a JPEG, PNG or WebP image');
      }
      if (!PHOTO_TYPES[contentType](data)) throw new HttpError(415, 'The file is not a valid image of that type');

      const pegId = String(req.query.pegId ?? '');
      if (!property.location.boundaryPegs.some((peg) => peg.id === pegId)) {
        throw new HttpError(400, '"pegId" must be one of the plot\'s pegs');
      }
      const position = {
        lat: readNumber(req.query.lat, 'lat', { min: -90, max: 90 }),
        lng: readNumber(req.query.lng, 'lng', { min: -180, max: 180 })
      };
      const current = now();
      const capturedAt = req.query.capturedAt ? readDate(req.query.capturedAt, 'capturedAt') : current.toISOString();
      if (new Date(capturedAt).getTime() > current.getTime() + 5 * 60_000) {
        throw new HttpError(400, '"capturedAt" is in the future');
      }

      const photo: StoredPhoto = {
        photoId: `ph-${crypto.randomUUID()}`,
        propertyId: property.id,
        visitId: null,
        pegId,
        contentType,
        sizeBytes: data.length,
        sha256: crypto.createHash('sha256').update(data).digest('hex'),
        capturedAt,
        position,
        uploadedBy: viewer.userId,
        uploadedAt: current.toISOString()
      };
      await store.addPhoto(photo, data);
      const uploaded: UploadedPhoto = {
        photoId: photo.photoId,
        sha256: photo.sha256,
        pegId,
        capturedAt,
        position
      };
      res.status(201).json({ photo: uploaded });
    })
  );

  router.post(
    '/properties/:id/inspection-visits',
    handle(async (req, res) => {
      allow(res, 'ops', 'inspector');
      const body = req.body as Record<string, unknown>;
      const boundaryPegsIntact = readBool(body, 'boundaryPegsIntact');
      const debrisFound = readBool(body, 'debrisFound');
      const neighborInquiryConducted = readBool(body, 'neighborInquiryConducted');
      const neighborFeedback = readText(body, 'neighborFeedback') ?? '';
      const notes = readText(body, 'notes', { required: true, max: 2000 })!;
      const photoIds = body.photoIds;
      if (!Array.isArray(photoIds) || photoIds.some((id) => typeof id !== 'string') || photoIds.length > MAX_PHOTOS_PER_VISIT) {
        throw new HttpError(400, `"photoIds" must be a list of up to ${MAX_PHOTOS_PER_VISIT} uploaded photo ids`);
      }
      if (new Set(photoIds).size !== photoIds.length) throw new HttpError(400, '"photoIds" contains duplicates');
      const viewer = viewerOf(res);
      const recorder = staffOf(res);

      const { property, result: evidence } = await update<EvidenceRecord>(req, res, async (p, ctx) => {
        const photos = await ctx.loadUnattachedPhotos(photoIds as string[]);
        if (photos.length !== photoIds.length) {
          throw new HttpError(400, 'Some photos were not found, belong to another plot, or are already part of a visit');
        }
        const inspectedAt = now().toISOString();
        const visit: InspectionVisit = {
          id: `visit-${crypto.randomUUID()}`,
          inspectedAt,
          inspectorName: recorder?.displayName ?? p.inspection.inspectorName,
          inspectorId: recorder?.staffCode ?? p.inspection.inspectorId,
          boundaryPegsIntact,
          debrisFound,
          neighborInquiryConducted,
          neighborFeedback,
          notes,
          photos: photos.map((photo) => ({
            photoId: photo.photoId,
            sha256: photo.sha256,
            pegId: photo.pegId,
            capturedAt: photo.capturedAt,
            position: photo.position
          }))
        };
        ctx.attachPhotos(photos.map((photo) => photo.photoId), visit.id);

        p.inspection.latestVisit = visit;
        p.inspection.onDemandRequest = null;
        p.inspection.nextVisitDue = body.nextVisitDue
          ? readDate(body.nextVisitDue, 'nextVisitDue')
          : addDays(inspectedAt, INSPECTION_INTERVAL_DAYS);

        const signed = signer.sign({
          kind: 'INSPECTION_VISIT',
          propertyId: p.id,
          surveyNumber: p.surveyNumber,
          visit,
          recordedBy: { userId: viewer.userId, email: viewer.email, role: viewer.staffRole },
          receivedAt: inspectedAt
        });
        const record: EvidenceRecord = { id: `EV-${crypto.randomUUID()}`, propertyId: p.id, kind: 'INSPECTION_VISIT', receivedAt: inspectedAt, ...signed };
        ctx.addEvidence(record);

        const inside = visit.photos.filter((photo) => isPhotoWithinGeofence(photo, p.location.boundaryPegs)).length;
        addActivity(p, {
          category: 'INSPECTION',
          title: 'Field inspection recorded',
          description: [
            `${visit.inspectorName} visited the plot.`,
            boundaryPegsIntact ? 'All pegs in place.' : 'Boundary pegs disturbed.',
            debrisFound ? 'Debris or dumped material found.' : 'No debris.',
            `${visit.photos.length} photo${visit.photos.length === 1 ? '' : 's'}, ${inside} within ${PHOTO_GEOFENCE_METERS} m of their peg.`
          ].join(' '),
          severity: !boundaryPegsIntact ? 'ALERT' : debrisFound ? 'WARNING' : 'SUCCESS'
        });
        return record;
      });
      res.status(201).json({ property, evidence });
    })
  );

  /* ---------- Land record (ops; advocates can resolve flags) ---------- */

  router.post(
    '/properties/:id/registry-checks',
    handle(async (req, res) => {
      allow(res, 'ops');
      const note = readText(req.body, 'note');
      const { property } = await update(req, res, (p) => {
        const { revenue } = p;
        revenue.lastCheckedAt = now().toISOString();
        const open = revenue.flaggedMutations.length;
        addActivity(p, {
          category: 'REGISTRY',
          title: `${revenue.portalName} checked`,
          description:
            (open === 0
              ? `${revenue.accountLabel} ${revenue.accountNumber} still shows ${revenue.recordedOwner}. No new mutation applications.`
              : `No new applications. ${open} earlier flag${open === 1 ? ' is' : 's are'} still open.`) +
            ` Checked by ${actorName(res)}.${note ? ` Note: ${note}` : ''}`,
          severity: open === 0 ? 'SUCCESS' : 'WARNING'
        });
      });
      res.json({ property });
    })
  );

  router.post(
    '/properties/:id/flagged-mutations',
    handle(async (req, res) => {
      allow(res, 'ops');
      const reference = requireText(req.body, 'reference', 80);
      const filedOn = readDate((req.body as Record<string, unknown>)?.filedOn, 'filedOn');
      const description = requireText(req.body, 'description', 500);
      if (new Date(filedOn).getTime() > now().getTime() + 86_400_000) throw new HttpError(400, '"filedOn" is in the future');
      const { property } = await update(req, res, (p) => {
        if (p.revenue.flaggedMutations.some((m) => m.reference === reference)) {
          throw new HttpError(409, 'That application is already flagged');
        }
        p.revenue.flaggedMutations.push({ id: `mut-${crypto.randomUUID()}`, reference, filedOn, description });
        p.revenue.lastCheckedAt = now().toISOString();
        addActivity(p, {
          category: 'REGISTRY',
          title: 'Mutation application flagged',
          description: `${reference} (filed ${filedOn.slice(0, 10)}): ${description} Flagged by ${actorName(res)}. Confirm with the owner and brief the advocate.`,
          severity: 'ALERT'
        });
      });
      res.status(201).json({ property });
    })
  );

  router.post(
    '/properties/:id/flagged-mutations/:mutationId/resolve',
    handle(async (req, res) => {
      allow(res, 'ops', 'advocate');
      const outcome = requireText(req.body, 'outcome', 500);
      const { property } = await update(req, res, (p) => {
        const flag = p.revenue.flaggedMutations.find((m) => m.id === req.params.mutationId);
        if (!flag) throw new HttpError(404, 'Flagged application not found');
        p.revenue.flaggedMutations = p.revenue.flaggedMutations.filter((m) => m.id !== flag.id);
        addActivity(p, {
          category: 'REGISTRY',
          title: 'Flagged application resolved',
          description: `${flag.reference}: ${outcome} Recorded by ${actorName(res)}.`,
          severity: 'SUCCESS'
        });
      });
      res.json({ property });
    })
  );

  /* ---------- Caveat (ops, advocate) ---------- */

  router.post(
    '/properties/:id/caveats',
    handle(async (req, res) => {
      allow(res, 'ops', 'advocate');
      const court = requireText(req.body, 'court', 200);
      const lodgedOn = readDate((req.body as Record<string, unknown>)?.lodgedOn, 'lodgedOn');
      const ageDays = (now().getTime() - new Date(lodgedOn).getTime()) / 86_400_000;
      if (ageDays < -1) throw new HttpError(400, '"lodgedOn" is in the future');
      if (ageDays >= CAVEAT_VALIDITY_DAYS) throw new HttpError(400, `A caveat lodged on that date has already lapsed (${CAVEAT_VALIDITY_DAYS} days)`);
      const { property } = await update(req, res, (p) => {
        p.legal.caveat = { court, lodgedOn };
        p.legal.renewalRequestedAt = null;
        addActivity(p, {
          category: 'LEGAL',
          title: 'Caveat lodged',
          description: `Lodged in ${court} on ${lodgedOn.slice(0, 10)}. It lapses on ${addDays(lodgedOn, CAVEAT_VALIDITY_DAYS).slice(0, 10)}. Recorded by ${actorName(res)}.`,
          severity: 'SUCCESS'
        });
      });
      res.status(201).json({ property });
    })
  );

  /* ---------- Team (ops) ---------- */

  router.get(
    '/team',
    handle(async (_req, res) => {
      allow(res, 'ops');
      res.json({ staff: await store.listStaff() });
    })
  );

  router.post(
    '/team',
    handle(async (req, res) => {
      allow(res, 'ops');
      if (demoMode) throw new HttpError(409, 'Team changes are not available in the demo');
      const role = requireText(req.body, 'role', 20) as StaffRole;
      if (!['ops', 'inspector', 'advocate'].includes(role)) throw new HttpError(400, '"role" must be ops, inspector or advocate');
      try {
        const member = await store.upsertStaff({
          email: requireText(req.body, 'email', 200).toLowerCase(),
          role,
          displayName: requireText(req.body, 'displayName'),
          staffCode: readText(req.body, 'staffCode', { max: 40 }) ?? ''
        });
        res.status(201).json({ member });
      } catch (error) {
        if (error instanceof UnknownUserError) {
          throw new HttpError(400, 'No account with that email. Add the person in Supabase Authentication first.');
        }
        throw error;
      }
    })
  );

  router.delete(
    '/team/:userId',
    handle(async (req, res) => {
      allow(res, 'ops');
      if (demoMode) throw new HttpError(409, 'Team changes are not available in the demo');
      if (req.params.userId === viewerOf(res).userId) throw new HttpError(400, 'You cannot remove your own staff access');
      if (!(await store.removeStaff(String(req.params.userId)))) throw new HttpError(404, 'Staff member not found');
      res.status(204).end();
    })
  );

  return router;
}
