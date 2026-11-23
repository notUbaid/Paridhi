import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const envFile = path.join(root, '.env');
// Local development reads secrets from the repo's .env (gitignored). Hosts set real env vars.
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const webDist = path.join(root, 'web/dist');
const port = Number(process.env.PORT) || 4000;
const config = loadConfig();

const app = createApp(config, { staticDir: fs.existsSync(webDist) ? webDist : undefined });

app.listen(port, () => {
  const mode = config.auth ? 'database with owner sign-in' : 'demo (sample data in memory)';
  console.log(`[paridhi] API on http://localhost:${port}/api (${mode})`);
  if (fs.existsSync(webDist)) {
    console.log(`[paridhi] Web app on http://localhost:${port}`);
  } else {
    console.log('[paridhi] No web build found. Run "npm run build" or use "npm run dev:web" on port 3000.');
  }
});
