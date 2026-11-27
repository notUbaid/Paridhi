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
/** Monthly inspections: the next visit is due this many days after the last one. */
export const INSPECTION_INTERVAL_DAYS = 30;
/** A visit is flagged as overdue this many days after it was due. */
export const INSPECTION_OVERDUE_GRACE_DAYS = 3;
/** The land record should be checked at least this often. */
export const REGISTRY_CHECK_STALE_DAYS = 14;

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

/** India Standard Time is UTC+5:30 all year (no daylight saving). */
const IST_OFFSET_MS = 330 * 60_000;

/** The calendar day in India that an instant falls on, as a day count (days since 1 Jan 1970, IST). */
export function istDayNumber(at: Date | string): number {
  return Math.floor((new Date(at).getTime() + IST_OFFSET_MS) / DAY_MS);
}

/**
 * Calendar days in India from `from` to `to`. Counting dates rather than 24-hour periods keeps a
 * countdown the same all day and makes it change at midnight IST, wherever the viewer is.
 */
export function istDaysBetween(from: Date | string, to: Date | string): number {
  return istDayNumber(to) - istDayNumber(from);
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
  // Ninety days from the date it was lodged, counted in Indian calendar days.
  const expiresOn = addDays(legal.caveat.lodgedOn, CAVEAT_VALIDITY_DAYS);
  const daysRemaining = istDaysBetween(now, expiresOn);
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
  const { revenue, camera, inspection, legal } = property;
  const visit = inspection.latestVisit;

  const flagged = revenue.flaggedMutations.length;
  if (flagged > 0) {
    alerts.push({
      level: 'ACTION',
      area: 'REGISTRY',
      message: `${flagged} mutation application${flagged === 1 ? '' : 's'} on the land record not started by the owner`
    });
  }
  if (visit && !visit.boundaryPegsIntact) {
    alerts.push({ level: 'ACTION', area: 'INSPECTION', message: 'Inspector found boundary pegs disturbed' });
  }
  if (camera?.changeDetected) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Weekly camera comparison flagged a change on the plot' });
  }
  if (camera && !camera.online) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Camera is offline' });
  }
  if (camera && !camera.tamperSwitchNormal) {
    alerts.push({ level: 'ATTENTION', area: 'CAMERA', message: 'Camera enclosure tamper switch tripped' });
  }
  if (visit?.debrisFound) {
    alerts.push({ level: 'ATTENTION', area: 'INSPECTION', message: 'Inspector found debris or dumped material' });
  }
  const overdueDays = istDaysBetween(inspection.nextVisitDue, now);
  if (overdueDays >= INSPECTION_OVERDUE_GRACE_DAYS) {
    alerts.push({
      level: 'ATTENTION',
      area: 'INSPECTION',
      message: visit ? `Monthly inspection is ${overdueDays} days overdue` : 'First inspection visit is overdue'
    });
  }
  const checkAgeDays = revenue.lastCheckedAt ? istDaysBetween(revenue.lastCheckedAt, now) : null;
  if (checkAgeDays === null || checkAgeDays >= REGISTRY_CHECK_STALE_DAYS) {
    alerts.push({
      level: 'ATTENTION',
      area: 'REGISTRY',
      message:
        checkAgeDays === null
          ? 'Land record has not been checked yet'
          : `Land record not checked for ${checkAgeDays} days`
    });
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

/** Centre of a set of pegs (simple average, fine at plot scale). */
export function centerOf(pegs: BoundaryPeg[]): GeoPoint {
  const lat = pegs.reduce((sum, p) => sum + p.position.lat, 0) / pegs.length;
  const lng = pegs.reduce((sum, p) => sum + p.position.lng, 0) / pegs.length;
  return { lat, lng };
}

const SQUARE_METERS_PER_ACRE = 4046.8564224;

/** Area enclosed by the pegs in acres (shoelace formula on a local flat projection). */
export function polygonAreaAcres(pegs: BoundaryPeg[]): number {
  if (pegs.length < 3) return 0;
  const origin = centerOf(pegs);
  const metersPerDegLat = (Math.PI / 180) * EARTH_RADIUS_METERS;
  const metersPerDegLng = metersPerDegLat * Math.cos(toRadians(origin.lat));
  const points = pegs.map((p) => ({
    x: (p.position.lng - origin.lng) * metersPerDegLng,
    y: (p.position.lat - origin.lat) * metersPerDegLat
  }));
  let twiceArea = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    twiceArea += a.x * b.y - b.x * a.y;
  }
  return Math.abs(twiceArea) / 2 / SQUARE_METERS_PER_ACRE;
}
