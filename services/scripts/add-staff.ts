// Gives an existing Supabase Auth user a staff role. Use it to create the first ops account;
// after that, ops staff can manage the team in the staff console.
//
//   npm run staff:add -- --email ops@example.com --role ops --name "Asha Reddy" [--code PRD-OPS-01]
//
// Needs DATABASE_URL (from the repo's .env or the environment).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StaffRole } from '../../shared/types.js';
import { createPgDatabase } from '../src/db.js';
import { PostgresStore, UnknownUserError } from '../src/store.js';

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const arg = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
};
const email = arg('email')?.toLowerCase();
const role = arg('role') as StaffRole | undefined;
const displayName = arg('name');

if (!email || !role || !['ops', 'inspector', 'advocate'].includes(role) || !displayName) {
  console.error('Usage: npm run staff:add -- --email you@example.com --role ops|inspector|advocate --name "Full Name" [--code ID]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env or the environment.');
  process.exit(1);
}

const db = createPgDatabase(process.env.DATABASE_URL);
try {
  const member = await new PostgresStore(db).upsertStaff({ email, role, displayName, staffCode: arg('code') ?? '' });
  console.log(`${member.displayName} (${member.email}) is now ${member.role}.`);
} catch (error) {
  console.error(error instanceof UnknownUserError ? `${error.message}. Add the user in Supabase Authentication first.` : error);
  process.exitCode = 1;
} finally {
  await db.close();
}
