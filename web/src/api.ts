import type {
  Dossier,
  EvidenceRecord,
  HealthResponse,
  PlotRequest,
  PlotRequestInput,
  PropertyRecord,
  StaffMember,
  StaffProperty,
  StaffRole,
  UploadedPhoto,
  Viewer
} from '@shared/types';

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

async function send(path: string, init: RequestInit & { json?: unknown } = {}): Promise<Response> {
  const token = getAccessToken ? await getAccessToken() : null;
  const { json, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...rest,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      headers: {
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      }
    });
  } catch {
    throw new ApiError(0, 'Could not reach the Paridhi server.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, body?.error ?? `Request failed (${response.status}).`);
  }
  return response;
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const response = await send(path, init);
  return (response.status === 204 ? null : await response.json()) as T;
}

const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', json: body ?? {} });

const propertyPath = (id: string) => `/properties/${encodeURIComponent(id)}`;
const staffPath = (id: string) => `/staff/properties/${encodeURIComponent(id)}`;

type PropertyResponse = { property: PropertyRecord };
const property = (r: PropertyResponse) => r.property;

export interface NewPlotInput {
  ownerEmail: string;
  owner: { name: string; overseasCity: string; overseasCountry: string; timeZone: string; phone?: string };
  name: string;
  surveyNumber: string;
  plotSizeDisplay?: string;
  marketValuationINR?: number;
  location: {
    village: string;
    mandalTaluk: string;
    district: string;
    state: string;
    cityNear?: string;
    pegs: { lat: number; lng: number }[];
    boundaries: { north: string; east: string; south: string; west: string };
  };
  revenue: {
    portalName: string;
    portalUrl: string;
    surveyNumber: string;
    accountLabel: string;
    accountNumber: string;
    recordedOwner: string;
    recordStatus?: string;
    propertyTaxStatus?: string;
    encumbranceStatus?: string;
  };
  legal: { courts: string };
  inspectorUserId: string | null;
  advocateUserId: string | null;
  firstVisitDue: string;
}

export interface VisitInput {
  boundaryPegsIntact: boolean;
  debrisFound: boolean;
  neighborInquiryConducted: boolean;
  neighborFeedback: string;
  notes: string;
  photoIds: string[];
}

/** What an owner can do with their plots. The demo uses the same calls on the sample plots under /demo. */
export function createOwnerApi(base: '' | '/demo') {
  const path = (id: string) => `${base}${propertyPath(id)}`;
  return {
    demo: base === '/demo',
    listProperties: () => request<{ properties: PropertyRecord[] }>(`${base}/properties`).then((r) => r.properties),
    requestInspection: (id: string, notes: string) => post<PropertyResponse>(`${path(id)}/inspection-requests`, { notes }).then(property),
    checkRegistry: (id: string) => post<PropertyResponse>(`${path(id)}/registry-checks`).then(property),
    requestCaveatRenewal: (id: string) => post<PropertyResponse>(`${path(id)}/caveat-renewals`).then(property),
    getDossier: (id: string) => request<{ dossier: Dossier }>(`${path(id)}/dossier`).then((r) => r.dossier),
    simulateAlert: (id: string) => post<PropertyResponse>(`${path(id)}/simulate-alert`).then(property),
    resetDemo: (id: string) => post<PropertyResponse>(`${path(id)}/reset`).then(property)
  };
}

export type OwnerApi = ReturnType<typeof createOwnerApi>;

export const api = {
  health: () => request<HealthResponse>('/health'),
  me: () => request<{ viewer: Viewer }>('/me').then((r) => r.viewer),

  /** The public "book a free plot check" form. `website` is a hidden field people leave empty. */
  sendPlotRequest: (input: PlotRequestInput & { website: string }) => post<{ received: true }>('/plot-requests', input),
  myPlotRequests: () => request<{ requests: PlotRequest[] }>('/me/plot-requests').then((r) => r.requests),
  addMyPlotRequest: (input: PlotRequestInput) =>
    post<{ request: PlotRequest }>('/me/plot-requests', input).then((r) => r.request),

  photoBlob: async (propertyId: string, photoId: string) =>
    (await send(`${propertyPath(propertyId)}/photos/${encodeURIComponent(photoId)}`)).blob(),

  staff: {
    plotRequests: () => request<{ requests: PlotRequest[] }>('/staff/plot-requests').then((r) => r.requests),
    list: () => request<{ properties: StaffProperty[]; staff: StaffMember[] }>('/staff/properties'),
    createPlot: (input: NewPlotInput) => post<PropertyResponse>('/staff/properties', input).then(property),
    assign: (id: string, inspectorUserId: string | null, advocateUserId: string | null) =>
      post<PropertyResponse>(`${staffPath(id)}/assignments`, { inspectorUserId, advocateUserId }).then(property),
    uploadPhoto: (id: string, image: Blob, meta: { pegId: string; lat: number; lng: number; capturedAt: string }) =>
      request<{ photo: UploadedPhoto }>(
        `${staffPath(id)}/photos?${new URLSearchParams({
          pegId: meta.pegId,
          lat: String(meta.lat),
          lng: String(meta.lng),
          capturedAt: meta.capturedAt
        })}`,
        { method: 'POST', body: image, headers: { 'Content-Type': image.type } }
      ).then((r) => r.photo),
    recordVisit: (id: string, visit: VisitInput) =>
      post<{ property: PropertyRecord; evidence: EvidenceRecord }>(`${staffPath(id)}/inspection-visits`, visit),
    recordCheck: (id: string, note: string) => post<PropertyResponse>(`${staffPath(id)}/registry-checks`, { note }).then(property),
    flagMutation: (id: string, flag: { reference: string; filedOn: string; description: string }) =>
      post<PropertyResponse>(`${staffPath(id)}/flagged-mutations`, flag).then(property),
    resolveMutation: (id: string, mutationId: string, outcome: string) =>
      post<PropertyResponse>(`${staffPath(id)}/flagged-mutations/${encodeURIComponent(mutationId)}/resolve`, { outcome }).then(property),
    confirmCaveat: (id: string, court: string, lodgedOn: string) =>
      post<PropertyResponse>(`${staffPath(id)}/caveats`, { court, lodgedOn }).then(property),
    team: () => request<{ staff: StaffMember[] }>('/staff/team').then((r) => r.staff),
    addStaff: (member: { email: string; role: StaffRole; displayName: string; staffCode: string }) =>
      post<{ member: StaffMember }>('/staff/team', member).then((r) => r.member),
    removeStaff: (userId: string) => request<null>(`/staff/team/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  }
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
