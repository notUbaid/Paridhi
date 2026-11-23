import fs from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { createApp, type CreateAppOptions } from '../src/app.js';
import type { AppConfig } from '../src/config.js';
import type { Database, QueryResult } from '../src/db.js';
import { createSeedProperties } from '../src/seed.js';
import { MemoryStore } from '../src/store.js';

export const FIXED_NOW = new Date('2026-11-23T10:00:00.000Z');

export interface TestServer {
  url: string;
  close: () => Promise<void>;
  get: (path: string, headers?: Record<string, string>) => Promise<{ status: number; body: any }>;
  post: (path: string, body?: unknown, headers?: Record<string, string>) => Promise<{ status: number; body: any }>;
}

export async function startServer(overrides: Partial<AppConfig> = {}, options: CreateAppOptions = {}): Promise<TestServer> {
  const config: AppConfig = {
    store: new MemoryStore(() => createSeedProperties(FIXED_NOW)),
    auth: null,
    deviceToken: null,
    signingKey: null,
    now: () => FIXED_NOW,
    ...overrides
  };
  const app = createApp(config, options);
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const parse = async (res: Response) => {
    const text = await res.text();
    try {
      return { status: res.status, body: JSON.parse(text) };
    } catch {
      return { status: res.status, body: text };
    }
  };

  return {
    url,
    close: () => new Promise((resolve) => server.close(() => resolve())),
    get: async (path, headers = {}) => parse(await fetch(url + path, { headers, signal: AbortSignal.timeout(5000) })),
    post: async (path, body, headers = {}) =>
      parse(
        await fetch(url + path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
          signal: AbortSignal.timeout(5000)
        })
      )
  };
}

const MIGRATIONS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../supabase/migrations');

/**
 * A real Postgres (PGlite, in-process) with the Supabase pieces the schema depends on
 * stubbed, and every migration applied.
 */
export async function createTestDatabase(): Promise<{ db: Database; pglite: PGlite }> {
  const pglite = new PGlite();
  await pglite.exec(`
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create role anon;
    create role authenticated;
  `);
  for (const file of fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    await pglite.exec(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
  }
  const db: Database = {
    query: <T>(sql: string, params?: unknown[]) => pglite.query(sql, params) as Promise<QueryResult<T>>,
    transaction: (fn) =>
      pglite.transaction((tx) => fn({ query: <T>(sql: string, params?: unknown[]) => tx.query(sql, params) as Promise<QueryResult<T>> })),
    close: () => pglite.close()
  };
  return { db, pglite };
}
