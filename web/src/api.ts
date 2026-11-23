import type { Dossier, HealthResponse, PropertyRecord } from '@shared/types';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let getAccessToken: (() => Promise<string | null>) | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called by the sign-in layer: how to get the current access token, and what to do when it is rejected. */
export function configureAuth(tokenProvider: typeof getAccessToken, unauthorizedHandler: typeof onUnauthorized) {
  getAccessToken = tokenProvider;
  onUnauthorized = unauthorizedHandler;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken ? await getAccessToken() : null;
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers
      }
    });
  } catch {
    throw new ApiError(0, 'Could not reach the Paridhi server.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, body?.error ?? `Request failed (${response.status}).`);
  }
  return body as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

const propertyPath = (id: string) => `/properties/${encodeURIComponent(id)}`;

type PropertyResponse = { property: PropertyRecord };

export const api = {
  health: () => request<HealthResponse>('/health'),
  listProperties: () => request<{ properties: PropertyRecord[] }>('/properties').then((r) => r.properties),
  requestInspection: (id: string, notes: string) =>
    post<PropertyResponse>(`${propertyPath(id)}/inspection-requests`, { notes }).then((r) => r.property),
  checkRegistry: (id: string) => post<PropertyResponse>(`${propertyPath(id)}/registry-checks`).then((r) => r.property),
  requestCaveatRenewal: (id: string) =>
    post<PropertyResponse>(`${propertyPath(id)}/caveat-renewals`).then((r) => r.property),
  getDossier: (id: string) => request<{ dossier: Dossier }>(`${propertyPath(id)}/dossier`).then((r) => r.dossier),
  simulateAlert: (id: string) =>
    post<PropertyResponse>(`/demo${propertyPath(id)}/simulate-alert`).then((r) => r.property),
  resetDemo: (id: string) => post<PropertyResponse>(`/demo${propertyPath(id)}/reset`).then((r) => r.property)
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
