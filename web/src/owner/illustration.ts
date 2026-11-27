import type { PropertyLocation } from '@shared/types';

/** A sample plot, drawn on the website and the sign-in screen as an illustration. */
export const ILLUSTRATION: PropertyLocation = {
  village: 'Sample plot',
  mandalTaluk: '',
  district: '',
  state: 'Telangana',
  cityNear: '',
  center: { lat: 17.24, lng: 78.43 },
  boundaryPegs: [
    { id: 'P1', corner: 'NE', position: { lat: 17.24025, lng: 78.43048 } },
    { id: 'P2', corner: 'SE', position: { lat: 17.23984, lng: 78.43041 } },
    { id: 'P3', corner: 'SW', position: { lat: 17.2398, lng: 78.42952 } },
    { id: 'P4', corner: 'NW', position: { lat: 17.24019, lng: 78.42958 } }
  ],
  boundaries: { north: 'Village road', east: 'Canal feeder', south: 'Sy. No. 413', west: 'Sy. No. 411' }
};
