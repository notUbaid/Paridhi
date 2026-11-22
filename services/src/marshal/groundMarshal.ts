import { GeoCoordinate, GroundMarshalUnit, PropertyRecord } from '../types.js';

export class GroundMarshalService {
  /**
   * Calculates Haversine distance in kilometers between two geo points
   */
  public static calculateDistanceKm(from: GeoCoordinate, to: GeoCoordinate): number {
    const R = 6371; // Earth radius in km
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Dispatches Ground Marshal unit to a designated property
   */
  public static dispatchMarshal(
    unit: GroundMarshalUnit,
    property: PropertyRecord,
    incidentId: string
  ): GroundMarshalUnit {
    const propertyCoord = property.cadastre.coordinates[0];
    const distanceKm = this.calculateDistanceKm(unit.currentLocation, propertyCoord);
    // Assume average response speed of 35 km/h in Indian suburban traffic
    const estimatedMinutes = Math.max(8, Math.round((distanceKm / 35) * 60));

    unit.status = 'EN_ROUTE';
    unit.incidentAssignedId = incidentId;
    unit.etaMinutes = estimatedMinutes;

    return unit;
  }

  /**
   * Advances the responder step by step closer to the property coordinates
   */
  public static simulateMarshalStep(unit: GroundMarshalUnit, destination: GeoCoordinate): void {
    if (unit.status !== 'EN_ROUTE') return;

    if (unit.etaMinutes > 2) {
      unit.etaMinutes -= 1;
      // Interpolate 10% closer to destination
      unit.currentLocation.latitude += (destination.latitude - unit.currentLocation.latitude) * 0.12;
      unit.currentLocation.longitude += (destination.longitude - unit.currentLocation.longitude) * 0.12;
    } else {
      unit.etaMinutes = 0;
      unit.status = 'ON_SITE_ESCORT';
      unit.currentLocation = { ...destination };
    }
  }
}
