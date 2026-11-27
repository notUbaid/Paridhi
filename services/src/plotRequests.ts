import type { PlotRequestInput } from '../../shared/types.js';
import { HttpError, readText, requireText } from './http.js';
import type { NewPlotRequest } from './store.js';

/** Somewhere to save plot requests from the public website. */
export interface PlotRequestSink {
  /** Shown in logs and health checks: "database", "supabase" or "memory". */
  readonly kind: string;
  addPlotRequest(request: NewPlotRequest): Promise<unknown>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Reads and checks a plot request from a request body. Limits match the database constraints. */
export function readPlotRequest(body: unknown): PlotRequestInput {
  const email = requireText(body, 'email', 254).toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
  const phone = readText(body, 'phone', { max: 40 }) ?? null;
  if (phone && !/^[+\d][\d\s().-]{5,}$/.test(phone)) throw new HttpError(400, 'Enter a valid phone number');
  return {
    name: requireText(body, 'name', 120),
    email,
    phone,
    country: readText(body, 'country', { max: 80 }) ?? null,
    state: requireText(body, 'state', 60),
    district: requireText(body, 'district', 80),
    village: readText(body, 'village', { max: 120 }) ?? null,
    surveyNumber: readText(body, 'surveyNumber', { max: 80 }) ?? null,
    notes: readText(body, 'notes', { max: 1000 }) ?? null
  };
}

/**
 * Saves website requests through the Supabase Data API with the publishable key. Used while the
 * server has no database connection: the anon role may only insert new website requests
 * (see supabase/migrations/20261127000000_plot_requests.sql).
 */
export class SupabasePlotRequestSink implements PlotRequestSink {
  readonly kind = 'supabase';
  private readonly endpoint: string;
  private readonly publishableKey: string;

  constructor(supabaseUrl: string, publishableKey: string) {
    this.endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/plot_requests`;
    this.publishableKey = publishableKey;
  }

  async addPlotRequest(request: NewPlotRequest): Promise<void> {
    if (request.source !== 'website' || request.userId) throw new Error('Only website requests can be saved this way');
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { apikey: this.publishableKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        name: request.name,
        email: request.email,
        phone: request.phone,
        country: request.country,
        state: request.state,
        district: request.district,
        village: request.village,
        survey_number: request.surveyNumber,
        notes: request.notes
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
      throw new Error(`Supabase rejected the plot request (${response.status}): ${(await response.text()).slice(0, 200)}`);
    }
  }
}

/** Keeps requests in memory and logs them. For local development and tests only. */
export class MemoryPlotRequestSink implements PlotRequestSink {
  readonly kind = 'memory';
  readonly requests: NewPlotRequest[] = [];
  private readonly log: boolean;

  constructor({ log = true } = {}) {
    this.log = log;
  }

  async addPlotRequest(request: NewPlotRequest): Promise<void> {
    this.requests.push(request);
    if (this.log) {
      console.warn(`[paridhi] Plot request from ${request.email} kept in memory only. Set DATABASE_URL or SUPABASE_URL to save requests.`);
    }
  }
}
