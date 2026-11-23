import crypto from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { addDays, getCaveatStatus, getPropertyAlerts, getPropertyStatus } from '../../shared/domain.js';
import type { ActivityEvent, Dossier, EvidenceRecord, HealthResponse, PropertyRecord } from '../../shared/types.js';
import type { AppConfig } from './config.js';
import { EvidenceSigner, merkleRoot } from './evidence.js';
import { MAX_ACTIVITY, type OwnerScope, type UpdateContext } from './store.js';

const MAX_TEXT = 500;
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

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const notFound = () => new HttpError(404, 'Property not found');

function readText(body: unknown, field: string, { required = false, max = MAX_TEXT } = {}): string | undefined {
  const value = (body as Record<string, unknown> | undefined)?.[field];
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `"${field}" is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `"${field}" must be a string`);
  const trimmed = value.trim();
  if (required && trimmed === '') throw new HttpError(400, `"${field}" is required`);
  if (trimmed.length > max) throw new HttpError(400, `"${field}" must be at most ${max} characters`);
  return trimmed || undefined;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function bearerToken(req: Request): string {
  const header = req.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
}

/** Express 4 does not catch rejected promises, so route them to the error handler. */
const handle =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export interface CreateAppOptions {
  /** Directory with the built web client to serve for non-API routes (standalone server only). */
  staticDir?: string;
}

export function createApp(config: AppConfig, options: CreateAppOptions = {}) {
  const now = config.now ?? (() => new Date());
  const { store, auth } = config;
  const demoMode = store.kind === 'memory';
  const signer = new EvidenceSigner(config.signingKey);

  if (signer.ephemeral && !config.now) {
    console.warn(
      '[paridhi] No PARIDHI_SIGNING_KEY set: using a throwaway signing key. Signatures will not verify after a restart.'
    );
  }

  function addActivity(property: PropertyRecord, event: Omit<ActivityEvent, 'id' | 'at'>): void {
    const activity: ActivityEvent = { id: `act-${crypto.randomUUID()}`, at: now().toISOString(), ...event };
    property.activity = [activity, ...property.activity].slice(0, MAX_ACTIVITY);
  }

  const ownerOf = (res: Response): OwnerScope => (res.locals.ownerId as string | undefined) ?? null;

  async function update<T>(
    req: Request,
    res: Response,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ): Promise<{ property: PropertyRecord; result: T }> {
    const updated = await store.updateProperty(String(req.params.id), ownerOf(res), change);
    if (!updated) throw notFound();
    return updated;
  }

  async function load(req: Request, res: Response): Promise<PropertyRecord> {
    const property = await store.getProperty(String(req.params.id), ownerOf(res));
    if (!property) throw notFound();
    return property;
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  const api = express.Router();
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  /* ---------- Public ---------- */

  api.get('/health', (_req, res) => {
    const body: HealthResponse = {
      status: 'ok',
      demoMode,
      deviceIngestEnabled: config.deviceToken !== null,
      signingKey: { keyId: signer.keyId, ephemeral: signer.ephemeral },
      auth: auth
        ? { required: true, supabaseUrl: auth.supabaseUrl, publishableKey: auth.publishableKey }
        : { required: false }
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

  /* ---------- Camera devices (device token) ---------- */

  api.post(
    '/properties/:id/incidents',
    handle(async (req, res) => {
      if (!config.deviceToken) {
        throw new HttpError(503, 'Device ingest is disabled. Set PARIDHI_DEVICE_TOKEN to enable it.');
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

      // Devices are not tied to an owner yet, so the shared token can report on any plot.
      const { property, result: evidence } = await update(req, res, (p, ctx) => {
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
      res.status(201).json({ evidence, property });
    })
  );

  /* ---------- Owners (signed in, or the open demo) ---------- */

  const requireOwner: RequestHandler = (req, res, next) => {
    if (!auth) {
      next();
      return;
    }
    const token = bearerToken(req);
    if (!token) {
      next(new HttpError(401, 'Sign in required'));
      return;
    }
    auth.verify(token).then(
      (user) => {
        res.locals.ownerId = user.id;
        next();
      },
      () => next(new HttpError(401, 'Your session has expired. Please sign in again.'))
    );
  };
  api.use(requireOwner);

  api.get(
    '/properties',
    handle(async (_req, res) => {
      res.json({ properties: await store.listProperties(ownerOf(res)) });
    })
  );

  api.get(
    '/properties/:id',
    handle(async (req, res) => {
      res.json({ property: await load(req, res) });
    })
  );

  // Owner asks for an extra visit by the field inspector.
  api.post(
    '/properties/:id/inspection-requests',
    handle(async (req, res) => {
      const notes = readText(req.body, 'notes');
      const { property } = await update(req, res, (p) => {
        const current = now();
        const inspection = p.latestInspection;
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

  // Re-check the land record. There is no portal integration yet, so this re-reads the
  // stored record; it never clears flags that are already there.
  api.post(
    '/properties/:id/registry-checks',
    handle(async (req, res) => {
      const { property } = await update(req, res, (p) => {
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

  // Ask the retained advocate to file (or re-file) the caveat. Filing happens offline;
  // the advocate confirms the new lodging date afterwards.
  api.post(
    '/properties/:id/caveat-renewals',
    handle(async (req, res) => {
      const { property } = await update(req, res, (p) => {
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

  api.get(
    '/properties/:id/evidence',
    handle(async (req, res) => {
      const property = await load(req, res);
      const records = await store.listEvidence(property.id);
      res.json({ records, merkleRoot: merkleRoot(records.map((r) => r.sha256)) });
    })
  );

  // A signed snapshot of everything on file for the property, for the owner and their advocate.
  api.get(
    '/properties/:id/dossier',
    handle(async (req, res) => {
      const property = await load(req, res);
      const generatedAt = now().toISOString();
      const evidence = await store.listEvidence(property.id);
      const evidenceMerkleRoot = merkleRoot(evidence.map((r) => r.sha256));
      const alerts = getPropertyAlerts(property, now());

      const signed = signer.sign({
        kind: 'PROPERTY_DOSSIER',
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

  if (demoMode) {
    api.post(
      '/demo/properties/:id/simulate-alert',
      handle(async (req, res) => {
        const { property } = await update(req, res, (p) => {
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

    api.post(
      '/demo/properties/:id/reset',
      handle(async (req, res) => {
        const property = await store.reset?.(String(req.params.id));
        if (!property) throw notFound();
        res.json({ property });
      })
    );
  }

  app.use('/api', api);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')));

  if (options.staticDir) {
    const indexHtml = path.join(options.staticDir, 'index.html');
    app.use(express.static(options.staticDir));
    app.get('*', (_req, res) => res.sendFile(indexHtml));
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
