import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  CAVEAT_VALIDITY_DAYS,
  bearingDegrees,
  distanceMeters,
  formatQuadrantBearing,
  getCaveatStatus,
  isPhotoWithinGeofence,
  istDaysBetween
} from '../../shared/domain.js';
import type { LegalRetainer } from '../../shared/types.js';
import { createSeedProperties } from '../src/seed.js';
import { FIXED_NOW } from './helpers.js';

const daysAgo = (days: number) => new Date(FIXED_NOW.getTime() - days * 86_400_000).toISOString();
const legal = (lodgedDaysAgo: number | null, renewalRequestedAt: string | null = null): LegalRetainer => ({
  advocateName: 'Adv. Test',
  enrolmentNumber: 'X/0000/2000',
  courts: 'Test court',
  caveat: lodgedDaysAgo === null ? null : { court: 'Test court', lodgedOn: daysAgo(lodgedDaysAgo) },
  renewalRequestedAt
});

describe('Section 148A caveat validity', () => {
  test('lasts 90 days from lodging', () => {
    assert.equal(CAVEAT_VALIDITY_DAYS, 90);
    const status = getCaveatStatus(legal(26), FIXED_NOW);
    assert.equal(status.state, 'ACTIVE');
    assert.equal(status.daysRemaining, 64);
  });

  test('warns in the last 15 days and lapses after 90', () => {
    assert.equal(getCaveatStatus(legal(79), FIXED_NOW).state, 'EXPIRING');
    assert.equal(getCaveatStatus(legal(79), FIXED_NOW).daysRemaining, 11);
    assert.equal(getCaveatStatus(legal(90), FIXED_NOW).state, 'EXPIRED');
    assert.equal(getCaveatStatus(legal(null), FIXED_NOW).state, 'NONE');
  });

  test('the countdown counts Indian calendar days, so it holds all day and changes at midnight IST', () => {
    // Lodged 10:30 IST on 1 Oct; lapses on 30 Dec (IST). The count is the same at any time of day.
    const caveat: LegalRetainer = { ...legal(null), caveat: { court: 'Test court', lodgedOn: '2026-10-01T05:00:00.000Z' } };
    const at = (iso: string) => getCaveatStatus(caveat, new Date(iso)).daysRemaining;
    assert.equal(at('2026-11-23T18:31:00.000Z'), 36); // 00:01 IST, 24 Nov
    assert.equal(at('2026-11-24T04:59:00.000Z'), 36); // 10:29 IST, before the lodging time of day
    assert.equal(at('2026-11-24T05:01:00.000Z'), 36); // 10:31 IST, after it
    assert.equal(at('2026-11-24T18:29:00.000Z'), 36); // 23:59 IST
    assert.equal(at('2026-11-24T18:31:00.000Z'), 35); // 00:01 IST, 25 Nov
  });

  test('calendar days are counted in IST, not the server or viewer time zone', () => {
    // 23:00 UTC on 23 Nov is already 24 Nov in India.
    assert.equal(istDaysBetween('2026-11-23T10:00:00.000Z', '2026-11-23T23:00:00.000Z'), 1);
    assert.equal(istDaysBetween('2026-11-23T10:00:00.000Z', '2026-11-23T18:00:00.000Z'), 0);
  });

  test('only counts a renewal request made after the current caveat was lodged', () => {
    assert.equal(getCaveatStatus(legal(79, daysAgo(1)), FIXED_NOW).renewalRequested, true);
    assert.equal(getCaveatStatus(legal(79, daysAgo(100)), FIXED_NOW).renewalRequested, false);
  });
});

describe('Geometry', () => {
  test('distance and bearing', () => {
    const a = { lat: 17, lng: 78 };
    assert.ok(Math.abs(distanceMeters(a, { lat: 18, lng: 78 }) - 111_195) < 50);
    assert.ok(Math.abs(bearingDegrees(a, { lat: 17, lng: 79 }) - 90) < 1);
  });

  test('quadrant bearings', () => {
    assert.equal(formatQuadrantBearing(30), 'N 30° E');
    assert.equal(formatQuadrantBearing(96), 'S 84° E');
    assert.equal(formatQuadrantBearing(200), 'S 20° W');
    assert.equal(formatQuadrantBearing(350), 'N 10° W');
  });

  test('sample plot pegs match the stated plot size', () => {
    const [shamshabad] = createSeedProperties(FIXED_NOW);
    const [ne, se, sw] = shamshabad.location.boundaryPegs.map((p) => p.position);
    const width = distanceMeters(sw, se);
    const depth = distanceMeters(se, ne);
    assert.ok(Math.abs(width - 110) < 1, `width ${width}`);
    assert.ok(Math.abs(depth - 46) < 1, `depth ${depth}`);
    const acres = (width * depth) / 4046.86;
    assert.ok(Math.abs(acres - shamshabad.areaAcres) < 0.01, `area ${acres}`);
  });

  test('sample inspection photos fall inside the 50 m geofence of their peg', () => {
    for (const property of createSeedProperties(FIXED_NOW)) {
      for (const photo of property.inspection.latestVisit?.photos ?? []) {
        assert.ok(isPhotoWithinGeofence(photo, property.location.boundaryPegs), `${property.id} ${photo.pegId}`);
      }
    }
  });

  test('a photo far from its peg fails the geofence', () => {
    const [shamshabad] = createSeedProperties(FIXED_NOW);
    const photo = { ...shamshabad.inspection.latestVisit!.photos[0], position: { lat: 17.3, lng: 78.5 } };
    assert.equal(isPhotoWithinGeofence(photo, shamshabad.location.boundaryPegs), false);
  });
});
