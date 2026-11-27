import type { ContactInfo } from '../../shared/types.js';
import { createSupabaseVerifier, type TokenVerifier } from './auth.js';
import { createPgDatabase } from './db.js';
import { MemoryPlotRequestSink, SupabasePlotRequestSink, type PlotRequestSink } from './plotRequests.js';
import { SAMPLE_ASSIGNMENTS, SAMPLE_STAFF, createSeedProperties } from './seed.js';
import { MemoryStore, PostgresStore, type Store } from './store.js';

export interface AuthConfig {
  verify: TokenVerifier;
  /** Public values the web app needs to show the sign-in form. */
  supabaseUrl: string;
  publishableKey: string;
}

export interface AppConfig {
  /** Sample plots served at /api/demo to anyone. Null turns the demo off. */
  demo: Store | null;
  /** Customer data. Null until a database is configured; then `auth` is required. */
  store: Store | null;
  /** Sign-in for owners and staff. Required whenever `store` is set. */
  auth: AuthConfig | null;
  /** Where website plot requests go when there is no `store`. */
  plotRequests: PlotRequestSink;
  contact: ContactInfo;
  /** Shared secret camera devices send as "Authorization: Bearer <token>". Device ingest is off without it. */
  deviceToken: string | null;
  /** Ed25519 private key for signing evidence. Without it a throwaway key is generated at startup. */
  signingKey: string | null;
  /** Clock override, used by tests. */
  now?: () => Date;
}

const value = (env: NodeJS.ProcessEnv, name: string) => env[name]?.trim() || null;

export function createDemoStore(now = new Date()): MemoryStore {
  return new MemoryStore({ properties: () => createSeedProperties(now), staff: SAMPLE_STAFF, assignments: SAMPLE_ASSIGNMENTS });
}

/** "+91 98000 00000" becomes "919800000000", the form wa.me links need. */
function whatsappNumber(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) throw new Error('PARIDHI_CONTACT_WHATSAPP must be a phone number with its country code');
  return digits;
}

/**
 * The sample plots at /demo are always available (set PARIDHI_DEMO=off to remove them).
 * Customer accounts need DATABASE_URL plus SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY for sign-in.
 * Without a database, website plot requests are still saved through Supabase when SUPABASE_URL
 * and SUPABASE_PUBLISHABLE_KEY are set.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = value(env, 'DATABASE_URL');
  const supabaseUrl = value(env, 'SUPABASE_URL');
  const publishableKey = value(env, 'SUPABASE_PUBLISHABLE_KEY');

  const base = {
    demo: value(env, 'PARIDHI_DEMO') === 'off' ? null : createDemoStore(),
    contact: { whatsapp: whatsappNumber(value(env, 'PARIDHI_CONTACT_WHATSAPP')), email: value(env, 'PARIDHI_CONTACT_EMAIL') },
    deviceToken: value(env, 'PARIDHI_DEVICE_TOKEN'),
    signingKey: value(env, 'PARIDHI_SIGNING_KEY')
  };

  if (!databaseUrl) {
    return {
      ...base,
      store: null,
      auth: null,
      plotRequests:
        supabaseUrl && publishableKey ? new SupabasePlotRequestSink(supabaseUrl, publishableKey) : new MemoryPlotRequestSink()
    };
  }

  if (!supabaseUrl || !publishableKey) {
    // Never serve real data without sign-in.
    throw new Error('DATABASE_URL is set, so SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required for sign-in.');
  }

  const store = new PostgresStore(createPgDatabase(databaseUrl));
  return {
    ...base,
    store,
    plotRequests: store,
    auth: {
      verify: createSupabaseVerifier(supabaseUrl, value(env, 'SUPABASE_JWT_SECRET')),
      supabaseUrl,
      publishableKey
    }
  };
}
