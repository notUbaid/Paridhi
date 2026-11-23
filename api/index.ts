// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
// Note that serverless instances do not share memory, so demo changes may not persist between requests.
import { createApp } from '../services/src/app.js';
import { loadConfig } from '../services/src/config.js';

export default createApp(loadConfig());
