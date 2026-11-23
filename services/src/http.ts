import crypto from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import type { ActivityEvent, PropertyRecord } from '../../shared/types.js';
import { MAX_ACTIVITY } from './store.js';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const notFound = () => new HttpError(404, 'Property not found');

/** Express 4 does not catch rejected promises, so route them to the error handler. */
export const handle =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

type Body = Record<string, unknown> | undefined;

const field = (body: unknown, name: string) => (body as Body)?.[name];

export function readText(body: unknown, name: string, { required = false, max = 500 } = {}): string | undefined {
  const value = field(body, name);
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `"${name}" is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `"${name}" must be a string`);
  const trimmed = value.trim();
  if (required && trimmed === '') throw new HttpError(400, `"${name}" is required`);
  if (trimmed.length > max) throw new HttpError(400, `"${name}" must be at most ${max} characters`);
  return trimmed || undefined;
}

export const requireText = (body: unknown, name: string, max = 120): string =>
  readText(body, name, { required: true, max })!;

export function readBool(body: unknown, name: string): boolean {
  const value = field(body, name);
  if (typeof value !== 'boolean') throw new HttpError(400, `"${name}" must be true or false`);
  return value;
}

export function readNumber(value: unknown, name: string, { min = -Infinity, max = Infinity } = {}): number {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isFinite(number) || number < min || number > max) {
    throw new HttpError(400, `"${name}" must be a number between ${min} and ${max}`);
  }
  return number;
}

/** A date or timestamp, returned as ISO 8601. Plain dates (YYYY-MM-DD) mean midnight UTC. */
export function readDate(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length > 40 || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, `"${name}" must be a date (YYYY-MM-DD) or ISO 8601 timestamp`);
  }
  return new Date(value).toISOString();
}

/** Optional string-or-null id field. Undefined means "not provided". */
export function readNullableId(body: unknown, name: string): string | null | undefined {
  const value = field(body, name);
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 80) throw new HttpError(400, `"${name}" must be an id or null`);
  return value;
}

export function bearerToken(req: Request): string {
  const header = req.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function makeActivityAdder(now: () => Date) {
  return (property: PropertyRecord, event: Omit<ActivityEvent, 'id' | 'at'>): void => {
    const activity: ActivityEvent = { id: `act-${crypto.randomUUID()}`, at: now().toISOString(), ...event };
    property.activity = [activity, ...property.activity].slice(0, MAX_ACTIVITY);
  };
}

export type AddActivity = ReturnType<typeof makeActivityAdder>;
