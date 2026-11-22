import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import { app, properties, setBroadcaster, runSimulationTick } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const WS_PORT = 4001;

/* ==========================================================================
   WebSocket Real-time Broadcast Hub (Local Standalone Daemon)
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

setBroadcaster((data: object) => {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
});

// Periodic background simulation loop
setInterval(() => {
  runSimulationTick();
}, 3000);

// Launch standalone HTTP server
const webDistPath = path.resolve(__dirname, '../../web/dist');

app.listen(PORT, () => {
  console.log(`[PARIDHI-CORE] REST Engine active on http://localhost:${PORT}`);
  console.log(`[PARIDHI-CORE] WebSocket Telemetry Hub active on ws://localhost:${WS_PORT}`);
  if (fs.existsSync(webDistPath)) {
    console.log(`[PARIDHI-CORE] Web Command Center delivered on http://localhost:${PORT}`);
  }
});
