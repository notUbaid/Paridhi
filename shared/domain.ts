/**
 * Pure domain rules shared by the API and the web client, so both sides
 * always agree on caveat expiry, geofencing and property status.
 */
import type { BoundaryPeg, GeoPoint, InspectionPhoto, LegalRetainer, PropertyRecord } from './types.js';

const DAY_MS = 86_400_000;
const EARTH_RADIUS_METERS = 6_371_000;

/** Section 148A(5) CPC: a caveat remains in force for ninety days from the date it was lodged. */
export const CAVEAT_VALIDITY_DAYS = 90;
export const CAVEAT_RENEWAL_WARNING_DAYS = 15;
/** An inspection photo counts as on-site when its GPS position is this close to the peg it shows. */
export const PHOTO_GEOFENCE_METERS = 50;

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

export type CaveatState = 'NONE' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED';

export interface CaveatStatus {
  state: CaveatState;
  expiresOn: string | null;
  /** Whole days left before the caveat lapses; negative once it has lapsed. */
  daysRemaining: number | null;
  renewalRequested: boolean;
}

export function getCaveatStatus(legal: LegalRetainer, now: Date): CaveatStatus {
  if (!legal.caveat) {
    return { state: 'NONE', expiresOn: null, daysRemaining: null, renewalRequested: false };
  }
  const expiresOn = addDays(legal.caveat.lodgedOn, CAVEAT_VALIDITY_DAYS);
  const daysRemaining = Math.ceil((new Date(expiresOn).getTime() - now.getTime()) / DAY_MS);
  const renewalRequested =
    legal.renewalRequestedAt !== null &&
    new Date(legal.renewalRequestedAt).getTime() > new Date(legal.caveat.lodgedOn).getTime();
  const state: CaveatState =
    daysRemaining <= 0 ? 'EXPIRED' : daysRemaining <= CAVEAT_RENEWAL_WARNING_DAYS ? 'EXPIRING' : 'ACTIVE';
  return { state, expiresOn, daysRemaining, renewalRequested };
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in metres (haversine). */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b, in degrees clockwise from true north (0–360). */
export function bearingDegrees(a: GeoPoint, b: GeoPoint): number {
  const y = Math.sin(toRadians(b.lng - a.lng)) * Math.cos(toRadians(b.lat));
  const x =
    Math.cos(toRadians(a.lat)) * Math.sin(toRadians(b.lat)) -
    Math.sin(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.cos(toRadians(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Surveyor's quadrant bearing, e.g. 96° becomes "S 84° E". */
export function formatQuadrantBearing(degrees: number): string {
  const d = ((degrees % 360) + 360) % 360;
  if (d <= 90) return `N ${Math.round(d)}° E`;
  if (d <= 180) return `S ${Math.round(180 - d)}° E`;
  if (d <= 270) return `S ${Math.round(d - 180)}° W`;
  return `N ${Math.round(360 - d)}° W`;
}

/** Distance from a photo's GPS position to the peg it claims to show, or null if the peg is unknown. */
export function photoDistanceToPeg(photo: InspectionPhoto, pegs: BoundaryPeg[]): number | null {
  const peg = pegs.find((p) => p.id === photo.pegId);
  return peg ? distanceMeters(photo.position, peg.position) : null;
}

export function isPhotoWithinGeofence(photo: InspectionPhoto, pegs: BoundaryPeg[]): boolean {
  const distance = photoDistanceToPeg(photo, pegs);
  return distance !== null && distance <= PHOTO_GEOFENCE_METERS;
}

export type AlertLevel = 'ACTION' | 'ATTENTION';
export type AlertArea = 'REGISTRY' | 'CAMERA' | 'INSPECTION' | 'LEGAL';

export interface PropertyAlert {
  level: AlertLevel;
  area: AlertArea;
  message: string;
}

export type PropertyStatus = 'ALL_CLEAR' | 'ATTENTION_NEEDED' | 'ACTION_REQUIRED';

/** Everything on a property that needs the owner's attention, most serious first. */
export function getPropertyAlerts(property: PropertyRecord, now: Date): PropertyAlert[] {
  const alerts: PropertyAlert[] = [];
  const { revenue, camera, latestInspection: inspection, legal } = property;

  const flagged = revenue.flaggedMutations.length;
  if (flagged > 0) {
    alerts.push({
      level: 'ACTION',
      area: 'REGISTRY',
      message: `${flagged} mutation application${flagged === 1 ? '' : 's'} on the land record not started by the owner`
    });
  }
  if (!inspection.boundaryPegsIntact) {
    alerts.push({ level: 'ACTION', area: 'INSPECTION', message: 'Inspector found boundary pegs disturbed' });
  }
  if (camera.changeDetected) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Weekly camera comparison flagged a change on the plot' });
  }
  if (!camera.online) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Camera is offline' });
  }
  if (!camera.tamperSwitchNormal) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Camera enclosure tamper switch tripped' });
  }
  if (inspection.debrisFound) {
    alerts.push({ level: 'ATTENTION', area: 'INSPECTION', message: 'Inspector found debris or dumped material' });
  }

  const caveat = getCaveatStatus(legal, now);
  if (caveat.state === 'EXPIRED') {
    alerts.push({ level: 'ATTENTION', area: 'LEGAL', message: 'Caveat has lapsed' });
  } else if (caveat.state === 'EXPIRING') {
    alerts.push({
      level: 'ATTENTION',
      area: 'LEGAL',
      message: `Caveat lapses in ${caveat.daysRemaining} day${caveat.daysRemaining === 1 ? '' : 's'}${
        caveat.renewalRequested ? ' (renewal requested)' : ''
      }`
    });
  }

  return alerts.sort((a, b) => (a.level === b.level ? 0 : a.level === 'ACTION' ? -1 : 1));
}

export function getPropertyStatus(alerts: PropertyAlert[]): PropertyStatus {
  if (alerts.some((a) => a.level === 'ACTION')) return 'ACTION_REQUIRED';
  if (alerts.length > 0) return 'ATTENTION_NEEDED';
  return 'ALL_CLEAR';
}
