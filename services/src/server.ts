import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import { mockProperties } from './db.js';
import { EvidenceVault } from './crypto/evidenceVault.js';
import { SentinelSimulator } from './edge/sentinelSimulator.js';
import { RegistryRadarService } from './radar/registryRadar.js';
import { GroundMarshalService } from './marshal/groundMarshal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const WS_PORT = 4001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory state store
const properties = [...mockProperties];

// Periodic background simulation loop
setInterval(() => {
  for (const property of properties) {
    SentinelSimulator.updateTelemetry(property.sentinelNode);
    if (property.groundResponseTeam.status === 'EN_ROUTE') {
      GroundMarshalService.simulateMarshalStep(
        property.groundResponseTeam,
        property.cadastre.coordinates[0]
      );
    }
  }
  broadcast({
    type: 'TELEMETRY_BATCH_UPDATE',
    properties: properties.map((p) => ({
      id: p.id,
      sentinelNode: p.sentinelNode,
      groundResponseTeam: p.groundResponseTeam,
      registryRadar: p.registryRadar
    }))
  });
}, 3000);

/* ==========================================================================
   REST API Endpoints
   ========================================================================== */

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OPTIMAL',
    platform: 'Paridhi Sovereign Perimeter Defense Core',
    version: '1.0.0',
    statutoryFramework: 'Bharatiya Sakshya Adhiniyam, 2023 §63',
    activePropertiesCount: properties.length,
    activeSentinelsOnline: properties.filter(
      (p) => p.sentinelNode.systemStatus !== 'OFFLINE'
    ).length
  });
});

app.get('/api/properties', (req: Request, res: Response) => {
  res.json({ properties });
});

app.get('/api/properties/:id', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }
  res.json({ property });
});

// Trigger Edge Anomaly / Incident Detection
app.post('/api/properties/:id/trigger-incident', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { threatType, customDescription } = req.body;
  if (!threatType) {
    res.status(400).json({ error: 'threatType is required' });
    return;
  }

  const incident = SentinelSimulator.triggerIncident(
    property,
    threatType,
    customDescription
  );

  broadcast({
    type: 'INCIDENT_ALERT',
    propertyId: property.id,
    propertyName: property.name,
    incident
  });

  res.status(201).json({
    success: true,
    incident,
    propertyStatus: property.sentinelNode.systemStatus
  });
});

// Control Directional Acoustic Siren & Strobe Deterrence
app.post('/api/properties/:id/deterrence', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { active, language } = req.body;
  const result = SentinelSimulator.setDeterrence(property, Boolean(active), language);

  broadcast({
    type: 'DETERRENCE_STATUS_CHANGE',
    propertyId: property.id,
    status: result.status,
    message: result.broadcastMessage
  });

  res.json(result);
});

// Generate & Download BSA 2023 §63 Statutory Evidentiary Certificate
app.get('/api/properties/:id/incidents/:incidentId/certificate', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const incident = property.activeIncidents.find((i) => i.id === req.params.incidentId);
  if (!incident) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  const allHashes = property.activeIncidents.map((i) => i.sha256Hash);
  const certificate = EvidenceVault.generateBsa2023Certificate(incident, property, allHashes);

  res.json({ certificate });
});

// Generate 1-Click Caveat Petition under Section 148A CPC / Revenue Code
app.get('/api/properties/:id/caveat/:mutationId', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const alert = property.registryRadar.pendingMutations.find((m) => m.id === req.params.mutationId);
  if (!alert) {
    res.status(404).json({ error: 'Mutation alert not found' });
    return;
  }

  const caveatDoc = RegistryRadarService.generateCaveatPetition(property, alert);
  res.json({
    mutationAlert: alert,
    caveatPetitionMarkdown: caveatDoc.trim()
  });
});

// Dispatch On-Ground Tactical Ground Marshal Unit
app.post('/api/properties/:id/dispatch-marshal', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { incidentId } = req.body;
  const unit = GroundMarshalService.dispatchMarshal(
    property.groundResponseTeam,
    property,
    incidentId || property.activeIncidents[0]?.id || 'GENERAL_PATROL'
  );

  broadcast({
    type: 'GROUND_MARSHAL_DISPATCHED',
    propertyId: property.id,
    marshalUnit: unit
  });

  res.json({
    success: true,
    marshalUnit: unit,
    message: `Ground Marshal ${unit.callsign} (${unit.leadResponder}) dispatched. Guaranteed < 60-min SLA active.`
  });
});

// Poll State Land Records Portal
app.get('/api/properties/:id/poll-registry', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const pollResult = RegistryRadarService.pollRevenuePortal(property);
  property.registryRadar.lastChecked = new Date().toISOString();

  res.json(pollResult);
});

// Simulate an Unauthorized Fraudulent Mutation filing (Testing & Verification)
app.post('/api/properties/:id/simulate-mutation', (req: Request, res: Response) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { applicantName, claimedType } = req.body;
  const alert = RegistryRadarService.simulateUnauthorizedMutation(
    property,
    applicantName || 'Ch. Venkat Reddy & Associates',
    claimedType || 'Fraudulent Succession & Mutation Petition'
  );

  broadcast({
    type: 'REGISTRY_RADAR_ALERT',
    propertyId: property.id,
    alert
  });

  res.status(201).json({
    success: true,
    alert,
    message: 'Unauthorized mutation petition registered. 21-day statutory objection window active.'
  });
});

/* ==========================================================================
   Static Web Frontend Delivery (Single Unified Server)
   ========================================================================== */

const webDistPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

/* ==========================================================================
   WebSocket Real-time Broadcast Hub
   ========================================================================== */

const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  ws.send(
    JSON.stringify({
      type: 'INITIAL_STATE',
      properties
    })
  );

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

app.listen(PORT, () => {
  console.log(`[PARIDHI-CORE] REST Engine active on http://localhost:${PORT}`);
  console.log(`[PARIDHI-CORE] WebSocket Telemetry Hub active on ws://localhost:${WS_PORT}`);
  if (fs.existsSync(webDistPath)) {
    console.log(`[PARIDHI-CORE] Web Command Center delivered on http://localhost:${PORT}`);
  }
});
