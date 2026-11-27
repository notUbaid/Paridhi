import crypto from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type RequestHandler, type Response, type Router } from 'express';
import { addDays, getCaveatStatus, getPropertyAlerts, getPropertyStatus } from '../../shared/domain.js';
import type { Dossier, EvidenceRecord, HealthResponse, PropertyRecord, Viewer } from '../../shared/types.js';
import type { AppConfig } from './config.js';
import { EvidenceSigner, merkleRoot } from './evidence.js';
import {
  HttpError,
  bearerToken,
  handle,
  makeActivityAdder,
  notFound,
  readText,
  safeEqual,
  type AddActivity
} from './http.js';
import { readPlotRequest } from './plotRequests.js';
import { createStaffRouter, staffScopeOf } from './staff.js';
import { ALL, type Scope, type Store, type UpdateContext } from './store.js';

const ON_DEMAND_VISIT_HOURS = 48;

export const INCIDENT_TYPES = [
  'MATERIAL_DUMPING',
  'VEHICLE_ON_PLOT',
  'NEW_STRUCTURE',
  'BOUNDARY_PEG_MOVED',
  'PERSON_ON_PLOT',
  'CAMERA_TAMPER',
  'OTHER'
] as const;
type IncidentType = (typeof INCIDENT_TYPES)[number];

export interface CreateAppOptions {
  /** Directory with the built web client to serve for non-API routes (standalone server only). */
  staticDir?: string;
}

/** The signed-in viewer. Only call this behind `requireSignIn`. */
export const viewerOf = (res: Response): Viewer => res.locals.viewer as Viewer;

const DEMO_VIEWER: Viewer = { demo: true, userId: null, email: null, staffRole: null };

interface OwnerRouteDeps {
  store: Store;
  signer: EvidenceSigner;
  now: () => Date;
  addActivity: AddActivity;
  /** The sample-data demo: everyone sees every sample plot, and a few extra demo actions exist. */
  demo: boolean;
}

/**
 * What an owner can do with their plots. Mounted twice: at /api/demo on the sample plots for
 * everyone, and at /api for signed-in owners on their own plots.
 */
function createOwnerRouter({ store, signer, now, addActivity, demo }: OwnerRouteDeps): Router {
  const router = express.Router();
  const scopeOf = (res: Response): Scope => (demo ? ALL : { kind: 'owner', userId: viewerOf(res).userId! });

  async function update<T>(
    id: string,
    scope: Scope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ): Promise<{ property: PropertyRecord; result: T }> {
    const updated = await store.updateProperty(id, scope, change);
    if (!updated) throw notFound();
    return updated;
  }

  async function load(req: Request, res: Response): Promise<PropertyRecord> {
    const property = await store.getProperty(String(req.params.id), scopeOf(res));
    if (!property) throw notFound();
    return property;
  }

  router.get(
    '/properties',
    handle(async (_req, res) => {
      res.json({ properties: await store.listProperties(scopeOf(res)) });
    })
  );

  router.get(
    '/properties/:id',
    handle(async (req, res) => {
      res.json({ property: await load(req, res) });
    })
  );

  // Owner asks for an extra visit by the field inspector.
  router.post(
    '/properties/:id/inspection-requests',
    handle(async (req, res) => {
      const notes = readText(req.body, 'notes');
      const { property } = await update(String(req.params.id), scopeOf(res), (p) => {
        const current = now();
        const { inspection } = p;
        if (inspection.onDemandRequest && new Date(inspection.onDemandRequest.targetVisitBy) > current) {
          throw new HttpError(409, 'An on-demand visit is already scheduled for this plot');
        }
        inspection.onDemandRequest = {
          requestedAt: current.toISOString(),
          targetVisitBy: addDays(current.toISOString(), ON_DEMAND_VISIT_HOURS / 24),
          notes: notes ?? ''
        };
        addActivity(p, {
          category: 'INSPECTION',
          title: 'On-demand inspection requested',
          description: `Assigned to ${inspection.inspectorName}, with a target of a visit within ${ON_DEMAND_VISIT_HOURS} hours.${
            notes ? ` Owner's note: "${notes}"` : ''
          }`,
          severity: 'INFO'
        });
      });
      res.status(201).json({ property });
    })
  );

  // Ask the retained advocate to file (or re-file) the caveat. Filing happens offline;
  // the advocate confirms the new lodging date in the staff console.
  router.post(
    '/properties/:id/caveat-renewals',
    handle(async (req, res) => {
      const { property } = await update(String(req.params.id), scopeOf(res), (p) => {
        const { legal } = p;
        if (getCaveatStatus(legal, now()).renewalRequested) {
          throw new HttpError(409, 'A caveat renewal has already been requested');
        }
        legal.renewalRequestedAt = now().toISOString();
        addActivity(p, {
          category: 'LEGAL',
          title: legal.caveat ? 'Caveat renewal requested' : 'Caveat filing requested',
          description: legal.caveat
            ? `Sent to ${legal.advocateName}. A fresh caveat will be lodged in ${legal.caveat.court} before the current one lapses.`
            : `Sent to ${legal.advocateName} to lodge a caveat in the civil court with jurisdiction over the plot.`,
          severity: 'INFO'
        });
      });
      res.status(201).json({ property });
    })
  );

  router.get(
    '/properties/:id/evidence',
    handle(async (req, res) => {
      const property = await load(req, res);
      const records = await store.listEvidence(property.id);
      res.json({ records, merkleRoot: merkleRoot(records.map((r) => r.sha256)) });
    })
  );

  // A signed snapshot of everything on file for the property, for the owner and their advocate.
  router.get(
    '/properties/:id/dossier',
    handle(async (req, res) => {
      const property = await load(req, res);
      const generatedAt = now().toISOString();
      const evidence = await store.listEvidence(property.id);
      const evidenceMerkleRoot = merkleRoot(evidence.map((r) => r.sha256));
      const alerts = getPropertyAlerts(property, now());

      const signed = signer.sign({
        kind: 'PROPERTY_DOSSIER',
        // Marked inside the signed payload, so a sample dossier can never pass for a real one.
        ...(demo ? { sampleData: true } : {}),
        generatedAt,
        status: getPropertyStatus(alerts),
        alerts,
        property,
        evidence: evidence.map((r) => ({ id: r.id, sha256: r.sha256 })),
        evidenceMerkleRoot
      });
      const dossier: Dossier = {
        id: `DOS-${property.id}-${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
        generatedAt,
        evidenceCount: evidence.length,
        evidenceMerkleRoot,
        signingKeyEphemeral: signer.ephemeral,
        ...signed
      };
      res.json({ dossier });
    })
  );

  // Inspection photos, for the plot's owner and for staff who can see the plot.
  router.get(
    '/properties/:id/photos/:photoId',
    handle(async (req, res) => {
      const id = String(req.params.id);
      const viewer = demo ? DEMO_VIEWER : viewerOf(res);
      const visible =
        (await store.getProperty(id, scopeOf(res))) ??
        (viewer.staffRole ? await store.getProperty(id, staffScopeOf(viewer)) : undefined);
      if (!visible) throw notFound();
      const photo = await store.getPhoto(id, String(req.params.photoId));
      if (!photo) throw new HttpError(404, 'Photo not found');
      res.set({
        'Content-Type': photo.meta.contentType,
        'Content-Length': String(photo.data.length),
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        ETag: `"${photo.meta.sha256}"`
      });
      res.send(photo.data);
    })
  );

  if (!demo) return router;

  /* ---------- Demo only ---------- */

  // A simulated land record check. For customers, checks are recorded by staff.
  router.post(
    '/properties/:id/registry-checks',
    handle(async (req, res) => {
      const { property } = await update(String(req.params.id), ALL, (p) => {
        const { revenue } = p;
        revenue.lastCheckedAt = now().toISOString();
        const flagged = revenue.flaggedMutations.length;
        addActivity(
          p,
          flagged === 0
            ? {
                category: 'REGISTRY',
                title: `${revenue.portalName} checked`,
                description: `${revenue.accountLabel} ${revenue.accountNumber} still shows ${revenue.recordedOwner}. No new mutation applications.`,
                severity: 'SUCCESS'
              }
            : {
                category: 'REGISTRY',
                title: `${revenue.portalName} checked: ${flagged} application${flagged === 1 ? '' : 's'} still flagged`,
                description: revenue.flaggedMutations.map((m) => `${m.reference}: ${m.description}`).join(' · '),
                severity: 'ALERT'
              }
        );
      });
      res.json({ property });
    })
  );

  router.post(
    '/properties/:id/simulate-alert',
    handle(async (req, res) => {
      const { property } = await update(String(req.params.id), ALL, (p) => {
        if (!p.camera) throw new HttpError(409, 'This plot has no camera');
        p.camera.changeDetected = true;
        p.camera.changeNotes = 'Simulated: weekly comparison shows new gravel near the north boundary peg.';
        addActivity(p, {
          category: 'CAMERA',
          title: 'Camera comparison flagged a change (simulated)',
          description: 'Demo alert: new material near the north boundary peg. The owner and inspector would be notified.',
          severity: 'ALERT'
        });
      });
      res.json({ property });
    })
  );

  router.post(
    '/properties/:id/reset',
    handle(async (req, res) => {
      const property = await store.reset?.(String(req.params.id));
      if (!property) throw notFound();
      res.json({ property });
    })
  );

  return router;
}

export function createApp(config: AppConfig, options: CreateAppOptions = {}) {
  const now = config.now ?? (() => new Date());
  const { demo, store, auth } = config;
  if (store && !auth) throw new Error('Customer data needs sign-in: set auth whenever store is set.');
  const signer = new EvidenceSigner(config.signingKey);
  const addActivity = makeActivityAdder(now);

  if (signer.ephemeral && !config.now) {
    console.warn(
      '[paridhi] No PARIDHI_SIGNING_KEY set: using a throwaway signing key. Signatures will not verify after a restart.'
    );
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  const api = express.Router();
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  /* ---------- Public ---------- */

  api.get('/health', (_req, res) => {
    const body: HealthResponse = {
      status: 'ok',
      demo: demo !== null,
      accounts: store !== null,
      deviceIngestEnabled: store !== null && config.deviceToken !== null,
      signingKey: { keyId: signer.keyId, ephemeral: signer.ephemeral },
      auth: auth
        ? { required: true, supabaseUrl: auth.supabaseUrl, publishableKey: auth.publishableKey }
        : { required: false },
      contact: config.contact
    };
    res.json(body);
  });

  api.get('/evidence/public-key', (_req, res) => {
    res.json({
      keyId: signer.keyId,
      algorithm: 'Ed25519',
      publicKeyPem: signer.publicKeyPem,
      ephemeral: signer.ephemeral
    });
  });

  // "Book a free plot check" on the website. Anyone can send one.
  api.post(
    '/plot-requests',
    handle(async (req, res) => {
      // Bots fill in every field, including this one, which people never see.
      if (readText(req.body, 'website', { max: 200 })) {
        res.status(201).json({ received: true });
        return;
      }
      const request = readPlotRequest(req.body);
      try {
        await (store ?? config.plotRequests).addPlotRequest({ ...request, source: 'website', userId: null });
      } catch (error) {
        console.error('[paridhi] Could not save a plot request', error);
        throw new HttpError(502, 'We could not save your request just now. Please try again in a few minutes.');
      }
      res.status(201).json({ received: true });
    })
  );

  /* ---------- Camera devices (device token) ---------- */

  api.post(
    '/properties/:id/incidents',
    handle(async (req, res) => {
      if (!store || !config.deviceToken) {
        throw new HttpError(503, 'Device ingest is disabled. It needs a database and PARIDHI_DEVICE_TOKEN.');
      }
      if (!safeEqual(bearerToken(req), config.deviceToken)) {
        throw new HttpError(401, 'Missing or invalid device token');
      }

      const type = readText(req.body, 'type', { required: true, max: 40 }) as IncidentType;
      if (!INCIDENT_TYPES.includes(type)) {
        throw new HttpError(400, `"type" must be one of ${INCIDENT_TYPES.join(', ')}`);
      }
      const description = readText(req.body, 'description', { required: true })!;
      const snapshotSha256 = readText(req.body, 'snapshotSha256', { max: 64 })?.toLowerCase();
      if (snapshotSha256 && !/^[0-9a-f]{64}$/.test(snapshotSha256)) {
        throw new HttpError(400, '"snapshotSha256" must be a 64-character hex SHA-256');
      }
      const capturedAt = readText(req.body, 'capturedAt', { max: 40 });
      if (capturedAt && Number.isNaN(Date.parse(capturedAt))) {
        throw new HttpError(400, '"capturedAt" must be an ISO 8601 timestamp');
      }

      // Devices are not tied to a plot yet, so the shared token can report on any plot with a camera.
      const updated = await store.updateProperty(String(req.params.id), ALL, (p, ctx) => {
        if (!p.camera) throw new HttpError(409, 'No camera is registered for this plot');
        const receivedAt = now().toISOString();
        const signed = signer.sign({
          kind: 'CAMERA_INCIDENT',
          propertyId: p.id,
          surveyNumber: p.surveyNumber,
          type,
          description,
          snapshotSha256: snapshotSha256 ?? null,
          capturedAt: capturedAt ? new Date(capturedAt).toISOString() : null,
          receivedAt
        });
        const record: EvidenceRecord = {
          id: `EV-${crypto.randomUUID()}`,
          propertyId: p.id,
          kind: 'CAMERA_INCIDENT',
          receivedAt,
          ...signed
        };
        ctx.addEvidence(record);

        p.camera.changeDetected = true;
        p.camera.changeNotes = description;
        if (type === 'CAMERA_TAMPER') p.camera.tamperSwitchNormal = false;
        addActivity(p, {
          category: 'CAMERA',
          title: `Camera incident: ${type.replace(/_/g, ' ').toLowerCase()}`,
          description: `${description} Evidence ${record.id.slice(0, 11)}… recorded with SHA-256 ${record.sha256.slice(0, 12)}….`,
          severity: 'ALERT'
        });
        return record;
      });
      if (!updated) throw notFound();
      res.status(201).json({ evidence: updated.result, property: updated.property });
    })
  );

  /* ---------- The demo: sample plots, open to everyone ---------- */

  if (demo) {
    api.use('/demo', createOwnerRouter({ store: demo, signer, now, addActivity, demo: true }));
  }

  /* ---------- Customer accounts ---------- */

  if (store && auth) {
    const accounts = express.Router();

    // Works out who is signed in. A missing or bad token is not an error yet: the staff routes
    // answer 404 to anyone who is not staff, and everything else answers 401.
    const identify: RequestHandler = (req, res, next) => {
      const token = bearerToken(req);
      if (!token) {
        next();
        return;
      }
      auth
        .verify(token)
        .then(
          async (user) => {
            const staff = await store.getStaffMember(user.id);
            res.locals.staff = staff;
            res.locals.viewer = { demo: false, userId: user.id, email: user.email, staffRole: staff?.role ?? null } satisfies Viewer;
          },
          () => {
            res.locals.authError = 'Your session has expired. Please sign in again.';
          }
        )
        .then(() => next(), next);
    };

    const requireStaff: RequestHandler = (_req, res, next) => {
      const viewer = res.locals.viewer as Viewer | undefined;
      // Hidden from everyone else: the same answer as a route that does not exist.
      next(viewer?.staffRole ? undefined : new HttpError(404, 'Not found'));
    };

    const requireSignIn: RequestHandler = (_req, res, next) => {
      next(res.locals.viewer ? undefined : new HttpError(401, (res.locals.authError as string | undefined) ?? 'Sign in required'));
    };

    accounts.use(identify);
    accounts.use('/staff', requireStaff, createStaffRouter({ store, signer, now, addActivity }));
    accounts.use(requireSignIn);

    accounts.get('/me', (_req, res) => {
      res.json({ viewer: viewerOf(res) });
    });

    // A signed-in owner adds a plot. Staff survey it before it is monitored.
    accounts.get(
      '/me/plot-requests',
      handle(async (_req, res) => {
        res.json({ requests: await store.listPlotRequestsForUser(viewerOf(res).userId!) });
      })
    );

    accounts.post(
      '/me/plot-requests',
      handle(async (req, res) => {
        const viewer = viewerOf(res);
        const request = await store.addPlotRequest({
          ...readPlotRequest({ ...req.body, email: viewer.email ?? req.body?.email }),
          source: 'account',
          userId: viewer.userId
        });
        res.status(201).json({ request });
      })
    );

    accounts.use(createOwnerRouter({ store, signer, now, addActivity, demo: false }));
    api.use(accounts);
  } else {
    api.use('/staff', (_req, _res, next) => next(new HttpError(404, 'Not found')));
    api.use(['/me', '/properties'], (_req, _res, next) =>
      next(new HttpError(503, 'Customer accounts are not set up on this server yet.'))
    );
  }

  app.use('/api', api);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')));

  if (options.staticDir) {
    const indexHtml = path.join(options.staticDir, 'index.html');
    app.use(express.static(options.staticDir));
    app.get('*', (req, res) => {
      if (/^\/(staff|app)(\/|$)/.test(req.path)) res.set('X-Robots-Tag', 'noindex, nofollow');
      res.sendFile(indexHtml);
    });
  }

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    const bodyError = err as { type?: string };
    if (bodyError.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Request body is not valid JSON' });
      return;
    }
    if (bodyError.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large' });
      return;
    }
    console.error('[paridhi] Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
