import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');
const port = Number(process.env.PORT) || 4000;
const config = loadConfig();

const app = createApp(config, { staticDir: fs.existsSync(webDist) ? webDist : undefined });

app.listen(port, () => {
  console.log(`[paridhi] API on http://localhost:${port}/api (demo mode: ${config.demoMode ? 'on' : 'off'})`);
  if (fs.existsSync(webDist)) {
    console.log(`[paridhi] Web app on http://localhost:${port}`);
  } else {
    console.log('[paridhi] No web build found. Run "npm run build" or use "npm run dev:web" on port 3000.');
  }
});
