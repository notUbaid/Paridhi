/**
 * Sample portfolio used in demo mode. Every person, phone number, enrolment
 * number and record reference here is made up. Dates are generated relative to
 * `now`, so the demo always looks current instead of drifting out of date.
 */
import type { BoundaryPeg, GeoPoint, InspectionPhoto, PropertyRecord } from '../../shared/types.js';

const MINUTE_MS = 60_000;
const METERS_PER_DEGREE_LAT = 111_320;

interface Ago {
  days?: number;
  hours?: number;
  minutes?: number;
}

function makeClock(now: Date) {
  const offset = ({ days = 0, hours = 0, minutes = 0 }: Ago) =>
    (days * 24 * 60 + hours * 60 + minutes) * MINUTE_MS;
  return {
    ago: (a: Ago) => new Date(now.getTime() - offset(a)).toISOString(),
    ahead: (a: Ago) => new Date(now.getTime() + offset(a)).toISOString()
  };
}

/**
 * Four corner pegs (NE, SE, SW, NW) of a rectangular plot of the given size,
 * rotated clockwise by `rotationDeg` around its centre.
 */
function rectanglePegs(center: GeoPoint, widthM: number, depthM: number, rotationDeg: number): BoundaryPeg[] {
  const theta = (rotationDeg * Math.PI) / 180;
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180);
  const corners: [string, number, number][] = [
    ['NE', widthM / 2, depthM / 2],
    ['SE', widthM / 2, -depthM / 2],
    ['SW', -widthM / 2, -depthM / 2],
    ['NW', -widthM / 2, depthM / 2]
  ];
  return corners.map(([corner, east, north], i) => {
    const e = east * Math.cos(theta) + north * Math.sin(theta);
    const n = -east * Math.sin(theta) + north * Math.cos(theta);
    return {
      id: `P${i + 1}`,
      corner,
      position: {
        lat: Number((center.lat + n / METERS_PER_DEGREE_LAT).toFixed(6)),
        lng: Number((center.lng + e / metersPerDegreeLng).toFixed(6))
      }
    };
  });
}

/** A photo taken a few metres from the given peg. */
function photoAt(peg: BoundaryPeg, url: string, capturedAt: string, offsetMeters = 6): InspectionPhoto {
  return {
    url,
    pegId: peg.id,
    capturedAt,
    position: {
      lat: Number((peg.position.lat + offsetMeters / METERS_PER_DEGREE_LAT).toFixed(6)),
      lng: peg.position.lng
    }
  };
}

const FIELD_PHOTO = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
const TREE_LINE_PHOTO = 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80';

export function createSeedProperties(now: Date = new Date()): PropertyRecord[] {
  const { ago, ahead } = makeClock(now);

  const shamshabadCenter = { lat: 17.2403, lng: 78.4294 };
  const shamshabadPegs = rectanglePegs(shamshabadCenter, 110, 46, 6);

  const devanahalliCenter = { lat: 13.2483, lng: 77.7126 };
  const devanahalliPegs = rectanglePegs(devanahalliCenter, 18.3, 12.2, -4);

  const mohaliCenter = { lat: 30.6425, lng: 76.7865 };
  const mohaliPegs = rectanglePegs(mohaliCenter, 25.4, 16.5, 0);

  return [
    {
      id: 'prop-shamshabad-412',
      name: 'Shamshabad Aero-Corridor Plot',
      surveyNumber: 'Sy. No. 412/A',
      plotSizeDisplay: '1.25 Acres (6,050 Sq. Yds)',
      areaAcres: 1.25,
      marketValuationINR: 48_500_000,
      location: {
        village: 'Mamidipally',
        mandalTaluk: 'Shamshabad',
        district: 'Ranga Reddy',
        state: 'Telangana',
        cityNear: 'Hyderabad (18 km from RGI Airport)',
        center: shamshabadCenter,
        boundaryPegs: shamshabadPegs,
        boundaries: { north: 'Approach road', east: 'Canal feeder', south: 'Sy. No. 413', west: 'Sy. No. 411' }
      },
      owner: {
        name: 'Sundeep Rao',
        overseasCity: 'San Jose, California',
        overseasCountry: 'USA',
        timeZone: 'America/Los_Angeles',
        email: 'sundeep.rao@example.com',
        phone: '+1 (408) 555-0192'
      },
      camera: {
        deviceModel: 'Hikvision 4G solar camera kit',
        carrier: 'Airtel IoT 4G',
        online: true,
        batteryPercentage: 94,
        solarCharging: true,
        signalStrengthDbm: -74,
        poleHeightMeters: 4.8,
        tamperSwitchNormal: true,
        lastHeartbeatAt: ago({ minutes: 1 }),
        heartbeatIntervalSeconds: 60,
        latestSnapshot: { url: FIELD_PHOTO, capturedAt: ago({ minutes: 32 }) },
        baselineSnapshot: { url: FIELD_PHOTO, capturedAt: ago({ days: 7, minutes: 32 }) },
        changeDetected: false,
        changeNotes: 'No new material, vehicles or structures compared with last week. All four boundary pegs visible.'
      },
      latestInspection: {
        id: 'insp-shamshabad-latest',
        inspectedAt: ago({ days: 3, hours: 5 }),
        inspectorName: 'Ramesh Kumar',
        inspectorId: 'PRD-INSP-104',
        boundaryPegsIntact: true,
        debrisFound: false,
        neighborInquiryConducted: true,
        neighborFeedback: 'Spoke with the caretaker of the adjacent farm. No one has asked about the plot or raised a boundary dispute.',
        notes: 'Walked the full perimeter. Cleared scrub near the south-west peg and repainted the survey flags.',
        photos: [
          photoAt(shamshabadPegs[0], FIELD_PHOTO, ago({ days: 3, hours: 5 })),
          photoAt(shamshabadPegs[2], TREE_LINE_PHOTO, ago({ days: 3, hours: 4, minutes: 51 }))
        ],
        nextVisitDue: ahead({ days: 26 }),
        onDemandRequest: null
      },
      revenue: {
        portalName: 'Bhu Bharati (Telangana land records)',
        portalUrl: 'https://bhubharati.telangana.gov.in',
        surveyNumber: '412/A',
        accountLabel: 'Khata',
        accountNumber: 'KT-9182',
        recordedOwner: 'Sundeep Rao S/o K. V. Rao',
        recordStatus: 'Pattadar passbook active',
        flaggedMutations: [],
        lastCheckedAt: ago({ hours: 2, minutes: 30 }),
        propertyTaxStatus: 'Paid for FY 2026-27',
        encumbranceStatus: 'Nil encumbrance, 1996–2026 (Sub-Registrar EC)'
      },
      legal: {
        advocateName: 'Adv. K. V. Subba Rao',
        enrolmentNumber: 'TS/0000/1998',
        courts: 'Rajendranagar civil courts, Ranga Reddy district',
        caveat: { court: 'Junior Civil Judge, Rajendranagar', lodgedOn: ago({ days: 26 }) },
        renewalRequestedAt: null
      },
      activity: [
        {
          id: 'act-shamshabad-1',
          at: ago({ minutes: 32 }),
          category: 'CAMERA',
          title: 'Scheduled snapshot received',
          description: 'Afternoon perimeter snapshot uploaded. Battery at 94% and charging.',
          severity: 'INFO'
        },
        {
          id: 'act-shamshabad-2',
          at: ago({ hours: 2, minutes: 30 }),
          category: 'REGISTRY',
          title: 'Bhu Bharati record checked',
          description: 'Khata KT-9182 still shows the owner as pattadar. No new mutation applications.',
          severity: 'SUCCESS'
        },
        {
          id: 'act-shamshabad-3',
          at: ago({ days: 3, hours: 5 }),
          category: 'INSPECTION',
          title: 'Monthly field inspection completed',
          description: 'Ramesh Kumar checked all four boundary pegs and spoke with the neighbouring caretaker.',
          severity: 'SUCCESS'
        }
      ]
    },
    {
      id: 'prop-devanahalli-88',
      name: 'Devanahalli Airport Corridor Plot',
      surveyNumber: 'Sy. No. 88/2B',
      plotSizeDisplay: '2,400 Sq. Ft (60 × 40 corner plot)',
      areaAcres: 0.055,
      marketValuationINR: 21_000_000,
      location: {
        village: 'Shettigere',
        mandalTaluk: 'Devanahalli',
        district: 'Bengaluru Rural',
        state: 'Karnataka',
        cityNear: 'North Bengaluru (12 km from KIA)',
        center: devanahalliCenter,
        boundaryPegs: devanahalliPegs,
        boundaries: { north: 'Site No. 87', east: '30 ft layout road', south: '40 ft layout road', west: 'Site No. 89' }
      },
      owner: {
        name: 'Priya & Arvind Natarajan',
        overseasCity: 'London',
        overseasCountry: 'UK',
        timeZone: 'Europe/London',
        email: 'natarajan.family@example.com',
        phone: '+44 20 7946 0912'
      },
      camera: {
        deviceModel: 'CP Plus 4G solar camera kit',
        carrier: 'Jio IoT 4G',
        online: true,
        batteryPercentage: 88,
        solarCharging: true,
        signalStrengthDbm: -78,
        poleHeightMeters: 4.6,
        tamperSwitchNormal: true,
        lastHeartbeatAt: ago({ minutes: 1 }),
        heartbeatIntervalSeconds: 60,
        latestSnapshot: { url: TREE_LINE_PHOTO, capturedAt: ago({ hours: 1, minutes: 45 }) },
        baselineSnapshot: { url: TREE_LINE_PHOTO, capturedAt: ago({ days: 7, hours: 1, minutes: 45 }) },
        changeDetected: false,
        changeNotes: 'Corner markers in place. Construction on the neighbouring site has not crossed the boundary.'
      },
      latestInspection: {
        id: 'insp-devanahalli-latest',
        inspectedAt: ago({ days: 6, hours: 2 }),
        inspectorName: 'Manjunath Gowda',
        inspectorId: 'PRD-INSP-208',
        boundaryPegsIntact: true,
        debrisFound: false,
        neighborInquiryConducted: true,
        neighborFeedback: 'Met the layout security supervisor. No visitors to this site in the past month.',
        notes: 'Concrete corner pegs intact. Cleared leaves along the road frontage.',
        photos: [photoAt(devanahalliPegs[1], TREE_LINE_PHOTO, ago({ days: 6, hours: 2 }), 4)],
        nextVisitDue: ahead({ days: 23 }),
        onDemandRequest: null
      },
      revenue: {
        portalName: 'E-Swathu (Karnataka rural property records)',
        portalUrl: 'https://eswathu.karnataka.gov.in',
        surveyNumber: '88/2B',
        accountLabel: 'e-Khata',
        accountNumber: 'EK-4491',
        recordedOwner: 'Arvind Natarajan & Priya Natarajan',
        recordStatus: 'Form 11B issued by Gram Panchayat',
        flaggedMutations: [
          {
            reference: 'SAMPLE-KT-2026-0412',
            filedOn: ago({ days: 4 }),
            description: 'Khata transfer application citing a sale deed the owners did not sign'
          }
        ],
        lastCheckedAt: ago({ hours: 3 }),
        propertyTaxStatus: 'Paid for FY 2026-27',
        encumbranceStatus: 'Nil encumbrance (Sub-Registrar, Devanahalli)'
      },
      legal: {
        advocateName: 'Adv. C. R. Venkatesh',
        enrolmentNumber: 'KAR/0000/2004',
        courts: 'Civil courts, Bengaluru Rural district',
        caveat: { court: 'Senior Civil Judge, Devanahalli', lodgedOn: ago({ days: 21 }) },
        renewalRequestedAt: null
      },
      activity: [
        {
          id: 'act-devanahalli-1',
          at: ago({ hours: 3 }),
          category: 'REGISTRY',
          title: 'Khata transfer application found',
          description: 'Application SAMPLE-KT-2026-0412 on the e-Khata cites a sale deed the owners did not sign. Advocate notified to file an objection.',
          severity: 'ALERT'
        },
        {
          id: 'act-devanahalli-2',
          at: ago({ hours: 1, minutes: 45 }),
          category: 'CAMERA',
          title: 'Scheduled snapshot received',
          description: 'Perimeter clear. Battery at 88% and charging.',
          severity: 'INFO'
        }
      ]
    },
    {
      id: 'prop-mohali-122',
      name: 'Mohali Aerocity Sector 122 Plot',
      surveyNumber: 'Plot No. 19, Block C',
      plotSizeDisplay: '500 Sq. Yds (1 Kanal)',
      areaAcres: 0.103,
      marketValuationINR: 34_000_000,
      location: {
        village: 'Kandala',
        mandalTaluk: 'SAS Nagar',
        district: 'Mohali',
        state: 'Punjab',
        cityNear: 'Chandigarh Tricity',
        center: mohaliCenter,
        boundaryPegs: mohaliPegs,
        boundaries: { north: 'Plot No. 18', east: 'Plot No. 20', south: '60 ft sector road', west: 'Green belt' }
      },
      owner: {
        name: 'Harpreet Singh Gill',
        overseasCity: 'Vancouver, BC',
        overseasCountry: 'Canada',
        timeZone: 'America/Vancouver',
        email: 'hs.gill@example.com',
        phone: '+1 (604) 555-0143'
      },
      camera: {
        deviceModel: 'Reolink 4G solar camera',
        carrier: 'Airtel IoT 4G',
        online: true,
        batteryPercentage: 96,
        solarCharging: true,
        signalStrengthDbm: -71,
        poleHeightMeters: 4.8,
        tamperSwitchNormal: true,
        lastHeartbeatAt: ago({ minutes: 1 }),
        heartbeatIntervalSeconds: 60,
        latestSnapshot: { url: FIELD_PHOTO, capturedAt: ago({ hours: 1, minutes: 5 }) },
        baselineSnapshot: { url: FIELD_PHOTO, capturedAt: ago({ days: 7, hours: 1, minutes: 5 }) },
        changeDetected: false,
        changeNotes: 'GMADA demarcation pillars in place. No vehicles or soil heaps.'
      },
      latestInspection: {
        id: 'insp-mohali-latest',
        inspectedAt: ago({ days: 10, hours: 4 }),
        inspectorName: 'Gurinder Singh',
        inspectorId: 'PRD-INSP-312',
        boundaryPegsIntact: true,
        debrisFound: false,
        neighborInquiryConducted: true,
        neighborFeedback: 'Spoke with the owner of the plot opposite. Nothing unusual reported.',
        notes: 'All corner pegs inspected. Sector signage checked.',
        photos: [photoAt(mohaliPegs[3], FIELD_PHOTO, ago({ days: 10, hours: 4 }), 5)],
        nextVisitDue: ahead({ days: 19 }),
        onDemandRequest: null
      },
      revenue: {
        portalName: 'Punjab Jamabandi land records',
        portalUrl: 'https://jamabandi.punjab.gov.in',
        surveyNumber: 'Plot 19 / Khasra 44',
        accountLabel: 'GMADA allotment',
        accountNumber: 'GMADA-AC-122-19',
        recordedOwner: 'Harpreet Singh Gill S/o Jaspal Singh Gill',
        recordStatus: 'Allotment letter and conveyance deed registered',
        flaggedMutations: [],
        lastCheckedAt: ago({ hours: 5 }),
        propertyTaxStatus: 'No dues with GMADA estate office',
        encumbranceStatus: 'Non-encumbrance certificate issued by Sub-Registrar, Mohali'
      },
      legal: {
        advocateName: 'Adv. Baldev S. Sandhu',
        enrolmentNumber: 'P/0000/2001',
        courts: 'Civil courts, SAS Nagar (Mohali)',
        caveat: { court: 'Civil Judge (Senior Division), SAS Nagar', lodgedOn: ago({ days: 79 }) },
        renewalRequestedAt: null
      },
      activity: [
        {
          id: 'act-mohali-1',
          at: ago({ hours: 1, minutes: 5 }),
          category: 'CAMERA',
          title: 'Scheduled snapshot received',
          description: 'Perimeter intact. Battery at 96%.',
          severity: 'INFO'
        },
        {
          id: 'act-mohali-2',
          at: ago({ hours: 5 }),
          category: 'REGISTRY',
          title: 'Jamabandi record checked',
          description: 'No mutations, mortgages or court attachments recorded against Plot 19.',
          severity: 'SUCCESS'
        }
      ]
    }
  ];
}
