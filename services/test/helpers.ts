import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp, type CreateAppOptions } from '../src/app.js';
import type { AppConfig } from '../src/config.js';

export const FIXED_NOW = new Date('2026-11-23T10:00:00.000Z');

export interface TestServer {
  url: string;
  close: () => Promise<void>;
  get: (path: string) => Promise<{ status: number; body: any }>;
  post: (path: string, body?: unknown, headers?: Record<string, string>) => Promise<{ status: number; body: any }>;
}

export async function startServer(overrides: Partial<AppConfig> = {}, options: CreateAppOptions = {}): Promise<TestServer> {
  const config: AppConfig = {
    demoMode: true,
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
    get: async (path) => parse(await fetch(url + path, { signal: AbortSignal.timeout(3000) })),
    post: async (path, body, headers = {}) =>
      parse(
        await fetch(url + path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
          signal: AbortSignal.timeout(3000)
        })
      )
  };
}
