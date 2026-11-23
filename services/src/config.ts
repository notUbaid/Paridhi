import { createSupabaseVerifier, type TokenVerifier } from './auth.js';
import { createPgDatabase } from './db.js';
import { SAMPLE_ASSIGNMENTS, SAMPLE_STAFF, createSeedProperties } from './seed.js';
import { MemoryStore, PostgresStore, type Store } from './store.js';

export interface AuthConfig {
  verify: TokenVerifier;
  /** Public values the web app needs to show the sign-in form. */
  supabaseUrl: string;
  publishableKey: string;
}

export interface AppConfig {
  store: Store;
  /** Owner sign-in. Required with a database; null for the open demo. */
  auth: AuthConfig | null;
  /** Shared secret camera devices send as "Authorization: Bearer <token>". Device ingest is off without it. */
  deviceToken: string | null;
  /** Ed25519 private key for signing evidence. Without it a throwaway key is generated at startup. */
  signingKey: string | null;
  /** Clock override, used by tests. */
  now?: () => Date;
}

const value = (env: NodeJS.ProcessEnv, name: string) => env[name]?.trim() || null;

/**
 * With DATABASE_URL set, Paridhi stores data in Postgres and requires owner sign-in through
 * Supabase Auth. Without it, the app runs as an open demo on sample data held in memory.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = value(env, 'DATABASE_URL');
  const shared = {
    deviceToken: value(env, 'PARIDHI_DEVICE_TOKEN'),
    signingKey: value(env, 'PARIDHI_SIGNING_KEY')
  };

  if (!databaseUrl) {
    const store = new MemoryStore({
      properties: () => createSeedProperties(new Date()),
      staff: SAMPLE_STAFF,
      assignments: SAMPLE_ASSIGNMENTS
    });
    return { ...shared, store, auth: null };
  }

  const supabaseUrl = value(env, 'SUPABASE_URL');
  const publishableKey = value(env, 'SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !publishableKey) {
    // Never serve real data without sign-in.
    throw new Error('DATABASE_URL is set, so SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required for owner sign-in.');
  }

  return {
    ...shared,
    store: new PostgresStore(createPgDatabase(databaseUrl)),
    auth: {
      verify: createSupabaseVerifier(supabaseUrl, value(env, 'SUPABASE_JWT_SECRET')),
      supabaseUrl,
      publishableKey
    }
  };
}
