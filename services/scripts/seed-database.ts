// Adds the three sample plots to the database for one existing Supabase Auth user, so you
// can try the signed-in dashboard. For testing only; real plots are added by Paridhi ops.
//
//   npm run db:seed -- --email owner@example.com
//
// Needs DATABASE_URL (from the repo's .env or the environment).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPgDatabase } from '../src/db.js';
import { createSeedProperties } from '../src/seed.js';
import { PostgresStore } from '../src/store.js';

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const emailIndex = process.argv.indexOf('--email');
const email = emailIndex >= 0 ? process.argv[emailIndex + 1]?.trim().toLowerCase() : undefined;
if (!email) {
  console.error('Usage: npm run db:seed -- --email owner@example.com');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env or the environment.');
  process.exit(1);
}

const db = createPgDatabase(process.env.DATABASE_URL);
try {
  const { rows } = await db.query<{ id: string }>('select id from auth.users where lower(email) = $1', [email]);
  if (rows.length === 0) {
    console.error(`No Supabase Auth user with email ${email}. Add the user in Supabase first.`);
    process.exitCode = 1;
  } else {
    const store = new PostgresStore(db);
    const suffix = crypto.randomBytes(3).toString('hex');
    for (const property of createSeedProperties(new Date())) {
      const id = `${property.id}-${suffix}`;
      await store.insertProperty(rows[0].id, {
        ...property,
        id,
        activity: property.activity.map((event) => ({ ...event, id: `act-${crypto.randomUUID()}` }))
      });
      console.log(`Added ${property.name} as ${id}`);
    }
  }
} finally {
  await db.close();
}
