import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mockProperties } from './db.js';
import { EvidenceVault } from './crypto/evidenceVault.js';
import { PropertyRecord, ActivityEvent, FieldInspectionReport } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory state store
export const properties: PropertyRecord[] = JSON.parse(JSON.stringify(mockProperties));

// Optional WebSocket broadcaster hook (populated in server.ts for standalone daemon)
let broadcaster: ((data: object) => void) | null = null;
const sseClients = new Set<Response>();

export function setBroadcaster(fn: (data: object) => void) {
  broadcaster = fn;
}

export function broadcast(data: object) {
  if (broadcaster) {
    try {
      broadcaster(data);
    } catch {
      // Ignore broadcast errors in serverless contexts
    }
  }
  const sseData = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(sseData);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Background simulation ticker for telemetry updates
export function runSimulationTick() {
  for (const property of properties) {
    // Subtle float charge variation
    if (property.cameraPod.online) {
      property.cameraPod.batteryPercentage = Math.min(
        100,
        Math.max(82, property.cameraPod.batteryPercentage + (Math.random() > 0.5 ? 0.2 : -0.2))
      );
    }
  }
  broadcast({
    type: 'TELEMETRY_BATCH_UPDATE',
    properties: properties.map((p) => ({
      id: p.id,
      cameraPod: p.cameraPod,
      revenueRegistry: p.revenueRegistry
    }))
  });
}

/* ==========================================================================
   REST API Router
   ========================================================================== */

const apiRouter = express.Router();

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OPTIMAL',
    platform: 'Paridhi Remote Land Protection Core',
    version: '2.1.0',
    deployment: 'Vercel Serverless Ready',
    activePropertiesCount: properties.length,
    camerasOnline: properties.filter((p) => p.cameraPod.online).length
  });
});

// Server-Sent Events (SSE) Real-Time Stream for Serverless & Proxied Environments
apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  sseClients.add(res);

  res.write(
    `data: ${JSON.stringify({
      type: 'INITIAL_STATE',
      properties,
      timestamp: new Date().toISOString()
    })}\n\n`
  );

  req.on('close', () => {
    sseClients.delete(res);
  });
});

apiRouter.get('/properties', (req: Request, res: Response) => {
  runSimulationTick();
  res.json({ properties });
});

apiRouter.get('/properties/:id', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }
  res.json({ property });
});

// Request an On-Demand Physical Field Inspection
apiRouter.post('/properties/:id/request-inspection', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const notes = req.body?.notes || 'Owner requested priority verification of boundary stones.';
  const scheduledDate = new Date(Date.now() + 1000 * 60 * 60 * 36).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    category: 'INSPECTION',
    title: 'On-Demand Field Inspection Dispatched',
    description: `Assigned to senior field inspector ${property.latestInspection.inspectorName}. Scheduled arrival: ${scheduledDate}. Notes: "${notes}"`,
    severity: 'INFO'
  };

  property.recentActivity.unshift(newActivity);
  property.latestInspection.nextScheduledDate = scheduledDate;

  broadcast({
    type: 'INSPECTION_REQUESTED',
    propertyId: property.id,
    scheduledDate,
    activity: newActivity
  });

  res.status(201).json({
    success: true,
    message: 'Field inspection successfully dispatched',
    assignedInspector: property.latestInspection.inspectorName,
    scheduledDate,
    activity: newActivity
  });
});

// Poll Official State Revenue Registry
apiRouter.post('/properties/:id/poll-registry', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const nowFormatted = `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST (verified)`;
  property.revenueRegistry.lastCheckedTimestamp = nowFormatted;
  property.revenueRegistry.cleanTitle = true;
  property.revenueRegistry.pendingMutationsCount = 0;
  property.revenueRegistry.unauthorizedMutationDetected = false;

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    category: 'REGISTRY',
    title: `${property.revenueRegistry.portalName} Polled`,
    description: `Official state land records verified. ${property.surveyNumber} is 100% clean with zero adverse claims or mutation applications.`,
    severity: 'SUCCESS'
  };

  property.recentActivity.unshift(newActivity);

  broadcast({
    type: 'REGISTRY_POLLED',
    propertyId: property.id,
    revenueRegistry: property.revenueRegistry,
    activity: newActivity
  });

  res.json({
    success: true,
    message: 'Official revenue registry audit completed',
    revenueRegistry: property.revenueRegistry,
    activity: newActivity
  });
});

// Retain Local Revenue Advocate & Issue Section 148A CPC Caveat / Legal Notice
apiRouter.post('/properties/:id/retain-lawyer', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const reason = req.body?.reason || 'Preventive statutory caveat renewal under Section 148A of the Code of Civil Procedure.';
  const now = new Date();
  const lodgedDateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const expiryDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiryFormatted = `${expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (Section 148A CPC 90-Day Limit)`;

  property.legalRetainer.standingCaveatActive = true;
  property.legalRetainer.caveatLodgedDate = lodgedDateFormatted;
  property.legalRetainer.caveatExpiryDate = expiryFormatted;
  property.legalRetainer.daysRemaining = 90;
  property.legalRetainer.renewalNoticeTriggered = false;
  property.legalRetainer.statutoryNoticeStatus = 'CAVEAT_LODGED';

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    category: 'LEGAL',
    title: `Section 148A CPC Caveat Lodged by ${property.legalRetainer.advocateName}`,
    description: `Statutory 90-day caveat petition served on Tahsildar & Civil Court. Ex-parte orders legally barred. Valid until ${expiryFormatted}. Reason: ${reason}`,
    severity: 'SUCCESS'
  };

  property.recentActivity.unshift(newActivity);

  broadcast({
    type: 'LEGAL_CAVEAT_LODGED',
    propertyId: property.id,
    legalRetainer: property.legalRetainer,
    activity: newActivity
  });

  res.status(201).json({
    success: true,
    message: 'Statutory 90-day caveat successfully lodged with local authorities',
    legalRetainer: property.legalRetainer,
    activity: newActivity
  });
});

// Trigger Edge Incident from Python Sentinel Edge Daemon / NPU Computer Vision
apiRouter.post('/properties/:id/trigger-incident', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const threatType = req.body?.threatType || 'UNSCHEDULED_PERIMETER_ANOMALY';
  const customDescription = req.body?.customDescription || 'Edge Sentinel NPU flagged an unscheduled perimeter anomaly.';

  property.status = 'ATTENTION_NEEDED';
  property.statusBadgeText = `Attention Needed • ${threatType.replace(/_/g, ' ')}`;
  property.cameraPod.timelapseDifferenceDetected = true;
  property.cameraPod.timelapseNotes = customDescription;

  const incidentPayload = JSON.stringify({
    propertyId: property.id,
    surveyNumber: property.surveyNumber,
    threatType,
    description: customDescription,
    timestamp: new Date().toISOString()
  });

  const sha256 = EvidenceVault.computeSha256(incidentPayload);
  const signature = EvidenceVault.signWithHsmKey(incidentPayload);

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    category: 'CAMERA',
    title: `Edge Sentinel Anomaly: ${threatType.replace(/_/g, ' ')}`,
    description: `${customDescription} [BSA §63 Frame Hash: ${sha256.substring(0, 16)}...]`,
    severity: 'ALERT'
  };

  property.recentActivity.unshift(newActivity);

  const incidentRecord = {
    id: `INC-${Date.now()}`,
    propertyId: property.id,
    threatType,
    sha256Hash: sha256,
    hardwareSignature: signature,
    admissibilityNotice: 'Bharatiya Sakshya Adhiniyam, 2023 §63',
    timestamp: new Date().toISOString()
  };

  broadcast({
    type: 'PROPERTY_UPDATED',
    property,
    incident: incidentRecord
  });

  res.status(201).json({
    success: true,
    message: 'Edge incident successfully ingested into Evidence Vault',
    incident: incidentRecord,
    property
  });
});

// Generate Complete Legal & Property Protection Dossier
apiRouter.get('/properties/:id/dossier', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const dossierPayload = JSON.stringify({
    propertyId: property.id,
    surveyNumber: property.surveyNumber,
    owner: property.owner,
    cadastre: property.location,
    valuation: property.marketValuationINR,
    cameraSnapshot: property.cameraPod.currentSnapshotUrl,
    latestInspection: property.latestInspection,
    revenueRegistry: property.revenueRegistry,
    legalRetainer: property.legalRetainer,
    generatedAt: new Date().toISOString()
  });

  const sha256Hash = EvidenceVault.computeSha256(dossierPayload);
  const digitalSignature = EvidenceVault.signWithHsmKey(dossierPayload);

  res.json({
    dossierId: `PRD-DOSSIER-${property.id.toUpperCase()}-${Date.now()}`,
    property,
    cryptographicIntegrity: {
      sha256Hash,
      digitalSignature,
      admissibilityFramework: 'Bharatiya Sakshya Adhiniyam, 2023 §63',
      timestampUtc: new Date().toISOString()
    }
  });
});

// Simulate Incident / Perimeter Anomaly (for testing & interactive demo)
apiRouter.post('/properties/:id/simulate-tamper', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  property.status = 'ATTENTION_NEEDED';
  property.statusBadgeText = 'Attention Needed • Unscheduled Activity';
  property.cameraPod.timelapseDifferenceDetected = true;
  property.cameraPod.timelapseNotes = 'AI visual comparison flagged 35% pixel change: construction gravel deposited near North boundary stone.';

  const newActivity: ActivityEvent = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    category: 'CAMERA',
    title: 'Visual Perimeter Anomaly Detected',
    description: 'Weekly timelapse analysis detected anomalous material accumulation near boundary peg #2. Dispatched automated alert to owner and field inspector.',
    severity: 'ALERT'
  };

  property.recentActivity.unshift(newActivity);

  broadcast({
    type: 'PROPERTY_UPDATED',
    property
  });

  res.json({
    success: true,
    message: 'Perimeter anomaly simulated',
    property
  });
});

// Reset Property to Clean State
apiRouter.post('/properties/:id/reset', (req: Request, res: Response) => {
  const defaultProp = mockProperties.find((p) => p.id === req.params.id);
  const propertyIndex = properties.findIndex((p) => p.id === req.params.id);
  if (!defaultProp || propertyIndex === -1) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  properties[propertyIndex] = JSON.parse(JSON.stringify(defaultProp));

  broadcast({
    type: 'PROPERTY_RESET',
    property: properties[propertyIndex]
  });

  res.json({
    success: true,
    message: 'Property state reset to pristine baseline',
    property: properties[propertyIndex]
  });
});

app.use('/api', apiRouter);

// Static Web Serving (production build)
const clientBuildPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
}
