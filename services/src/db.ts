import { PropertyRecord } from './types.js';

export const mockProperties: PropertyRecord[] = [
  {
    id: 'prop-shamshabad-412',
    name: 'Shamshabad Aero-Corridor Plot',
    surveyNumber: 'Sy. No. 412/A',
    plotSizeDisplay: '1.25 Acres (6,050 Sq. Yds)',
    areaAcres: 1.25,
    marketValuationINR: 48500000, // ₹4.85 Cr
    location: {
      village: 'Mamidipally',
      mandalTaluk: 'Shamshabad',
      district: 'Ranga Reddy',
      state: 'Telangana',
      cityNear: 'Hyderabad (18 km from RGI Airport)',
      latitude: 17.2403,
      longitude: 78.4294
    },
    owner: {
      name: 'Sundeep Rao',
      overseasCity: 'San Jose, California',
      overseasCountry: 'USA',
      email: 'sundeep.rao@stanfordalumni.org',
      phone: '+1 (408) 555-0192'
    },
    status: 'ALL_CLEAR',
    statusBadgeText: 'Protected • All Invariants Clean',
    cameraPod: {
      deviceModel: 'Hikvision DS-2XS6A25G0 4G Solar PTZ (2K/4MP)',
      hardwareType: 'COTS_SOLAR_4G_PTZ',
      online: true,
      batteryPercentage: 94,
      solarCharging: true,
      cellularCarrier: 'Airtel IoT 4G (Static IP)',
      signalStrengthDbm: -74,
      lastSnapshotTimestamp: 'Today, 04:30 PM IST (32 mins ago)',
      currentSnapshotUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      previousWeekSnapshotUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=70',
      timelapseDifferenceDetected: false,
      timelapseNotes: 'Comparison with Nov 15 snapshot confirms 0% anomalous debris, no vehicles, and all 4 white boundary pegs in position.',
      antiTheftStatus: {
        poleMountElevationMeters: 4.8,
        antiClimbCollarIntact: true,
        tamperSwitchNormal: true,
        cloudHeartbeatSeconds: 45
      }
    },
    latestInspection: {
      id: 'insp-2026-11-19',
      inspectionDate: 'Nov 19, 2026 (3 days ago)',
      inspectorName: 'Ramesh Kumar',
      inspectorId: 'PRD-INSP-104',
      inspectorPhone: '+91 98490 12847',
      boundaryPillarsIntact: true,
      debrisOrDumpingFound: false,
      neighborInquiryConducted: true,
      neighborFeedbackSummary: 'Spoke with adjacent farm caretaker (K. Anjaiah). Confirmed no third-party inquiries or survey disputes.',
      summaryNotes: 'Walked the 4-corner perimeter. Cleared light wild scrub near south-west peg #3. Yellow survey flags repainted for camera calibration.',
      geotaggedPhotoUrls: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
      ],
      nextScheduledDate: 'Dec 18, 2026',
      verifiedBadge: true
    },
    inspectionHistory: [
      {
        id: 'insp-2026-10-21',
        inspectionDate: 'Oct 21, 2026',
        inspectorName: 'Ramesh Kumar',
        inspectorId: 'PRD-INSP-104',
        inspectorPhone: '+91 98490 12847',
        boundaryPillarsIntact: true,
        debrisOrDumpingFound: false,
        neighborInquiryConducted: true,
        neighborFeedbackSummary: 'Routine check. Road construction along Outer Ring Road feeder had slight dust; boundary untouched.',
        summaryNotes: 'All 4 corner boundary stones photographed and matched with Revenue Map 1982.',
        geotaggedPhotoUrls: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        ],
        nextScheduledDate: 'Nov 18, 2026',
        verifiedBadge: true
      }
    ],
    revenueRegistry: {
      portalName: 'Telangana Integrated Land Records (Dharani)',
      surveyNumber: '412/A',
      khataNumber: 'KT-9182',
      pattadarName: 'Sundeep Rao S/o K. V. Rao',
      passbookStatus: 'Digital E-Pattadar Passbook Active (KYC Linked)',
      cleanTitle: true,
      lastCheckedTimestamp: 'Today, 02:15 PM IST (2.5 hrs ago)',
      pendingMutationsCount: 0,
      unauthorizedMutationDetected: false,
      propertyTaxStatus: 'Paid up to FY 2026-27 (Receipt #GHMC-29481)',
      encumbranceCertificateStatus: 'Nil Encumbrance (EC verified for 30-year period from 1996 to 2026)'
    },
    legalRetainer: {
      advocateName: 'Adv. K. V. Subba Rao',
      barCouncilNumber: 'TS/1042/1998',
      jurisdictionCourt: 'Telangana High Court & Rajendranagar Civil Court',
      standingCaveatActive: true,
      caveatExpiryDate: 'Feb 14, 2027 (Under Section 148A CPC)',
      contactNumber: '+91 94401 88392',
      statutoryNoticeStatus: 'NORMAL_WATCH'
    },
    recentActivity: [
      {
        id: 'act-1',
        timestamp: 'Today, 04:30 PM IST',
        category: 'CAMERA',
        title: 'Daily Scheduled 4G Snapshot Synchronized',
        description: 'Captured high-resolution perimeter frame. Battery level 94% on solar float charge.',
        severity: 'INFO'
      },
      {
        id: 'act-2',
        timestamp: 'Today, 02:15 PM IST',
        category: 'REGISTRY',
        title: 'Dharani Land Records Verified',
        description: 'Automated state portal query completed. Khata #KT-9182 verified clean with zero pending transfer applications.',
        severity: 'SUCCESS'
      },
      {
        id: 'act-3',
        timestamp: 'Nov 19, 2026, 11:45 AM IST',
        category: 'INSPECTION',
        title: 'Monthly Physical Field Audit Completed',
        description: 'Field agent Ramesh Kumar verified all 4 corner boundary pillars and conducted neighbor check.',
        severity: 'SUCCESS'
      },
      {
        id: 'act-4',
        timestamp: 'Nov 15, 2026, 06:00 PM IST',
        category: 'CAMERA',
        title: 'Weekly Visual Timelapse Audit Passed',
        description: 'AI perimeter comparison confirmed zero unauthorized material dumping or fence movement.',
        severity: 'SUCCESS'
      }
    ]
  },
  {
    id: 'prop-devanahalli-88',
    name: 'Devanahalli Airport Tech Corridor Plot',
    surveyNumber: 'Sy. No. 88/2B',
    plotSizeDisplay: '2,400 Sq. Ft (60x40 Corner Plot)',
    areaAcres: 0.055,
    marketValuationINR: 21000000, // ₹2.10 Cr
    location: {
      village: 'Shettigere',
      mandalTaluk: 'Devanahalli',
      district: 'Bengaluru Rural',
      state: 'Karnataka',
      cityNear: 'North Bengaluru (12 km from KIA Terminal)',
      latitude: 13.2483,
      longitude: 77.7126
    },
    owner: {
      name: 'Priya & Arvind Natarajan',
      overseasCity: 'London',
      overseasCountry: 'UK',
      email: 'arvind.natarajan@imperial.ac.uk',
      phone: '+44 20 7946 0912'
    },
    status: 'ALL_CLEAR',
    statusBadgeText: 'Protected • E-Khata Clean',
    cameraPod: {
      deviceModel: 'CP Plus Orange+ 4G Solar Smart PTZ (2K)',
      hardwareType: 'COTS_SOLAR_4G_PTZ',
      online: true,
      batteryPercentage: 88,
      solarCharging: true,
      cellularCarrier: 'Jio 4G IoT SIM',
      signalStrengthDbm: -78,
      lastSnapshotTimestamp: 'Today, 03:15 PM IST',
      currentSnapshotUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      previousWeekSnapshotUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=70',
      timelapseDifferenceDetected: false,
      timelapseNotes: 'Layout compound wall and corner demarcations clean. Neighboring plot construction does not encroach on survey boundary.',
      antiTheftStatus: {
        poleMountElevationMeters: 4.6,
        antiClimbCollarIntact: true,
        tamperSwitchNormal: true,
        cloudHeartbeatSeconds: 50
      }
    },
    latestInspection: {
      id: 'insp-2026-11-16',
      inspectionDate: 'Nov 16, 2026 (6 days ago)',
      inspectorName: 'Manjunath Gowda',
      inspectorId: 'PRD-INSP-208',
      inspectorPhone: '+91 99801 34912',
      boundaryPillarsIntact: true,
      debrisOrDumpingFound: false,
      neighborInquiryConducted: true,
      neighborFeedbackSummary: 'Met layout security supervisor. Confirmed no unauthorized visitors entered survey plot #88/2B.',
      summaryNotes: 'Concrete boundary pegs verified intact. Cleared autumn leaves along road frontage.',
      geotaggedPhotoUrls: [
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
      ],
      nextScheduledDate: 'Dec 15, 2026',
      verifiedBadge: true
    },
    inspectionHistory: [],
    revenueRegistry: {
      portalName: 'Karnataka Bhoomi & Kaveri Online Registry',
      surveyNumber: '88/2B',
      khataNumber: 'BBMP/E-Khata-4491',
      pattadarName: 'Arvind Natarajan & Priya Natarajan',
      passbookStatus: 'Form 11B / E-Khata Digital Certificate Active',
      cleanTitle: true,
      lastCheckedTimestamp: 'Today, 01:00 PM IST',
      pendingMutationsCount: 0,
      unauthorizedMutationDetected: false,
      propertyTaxStatus: 'Paid up to FY 2026-27 (SAS Receipt #2026/BLR/8821)',
      encumbranceCertificateStatus: 'Form 15 Clean (Nil Encumbrance recorded in Sub-Registrar Devanahalli)'
    },
    legalRetainer: {
      advocateName: 'Adv. C. R. Venkatesh',
      barCouncilNumber: 'KAR/554/2004',
      jurisdictionCourt: 'Bengaluru City Civil Court & Devanahalli Civil Court',
      standingCaveatActive: true,
      caveatExpiryDate: 'Jan 28, 2027',
      contactNumber: '+91 98450 67123',
      statutoryNoticeStatus: 'NORMAL_WATCH'
    },
    recentActivity: [
      {
        id: 'act-b1',
        timestamp: 'Today, 03:15 PM IST',
        category: 'CAMERA',
        title: 'Daily Camera Snapshot Archived',
        description: 'Perimeter clear. Battery 88%, solar power generating 18.4W in full sunlight.',
        severity: 'INFO'
      },
      {
        id: 'act-b2',
        timestamp: 'Today, 01:00 PM IST',
        category: 'REGISTRY',
        title: 'Karnataka Bhoomi Check Passed',
        description: 'Verified Sy. No. 88/2B against Devanahalli taluk records. No disputes filed.',
        severity: 'SUCCESS'
      }
    ]
  },
  {
    id: 'prop-mohali-122',
    name: 'Mohali Aerocity Sector 122 Plot',
    surveyNumber: 'Plot No. 19, Block C',
    plotSizeDisplay: '500 Sq. Yds (1 Kanal)',
    areaAcres: 0.103,
    marketValuationINR: 34000000, // ₹3.40 Cr
    location: {
      village: 'Kandala',
      mandalTaluk: 'SAS Nagar',
      district: 'Mohali',
      state: 'Punjab',
      cityNear: 'Chandigarh Tri-City Area',
      latitude: 30.6425,
      longitude: 76.7865
    },
    owner: {
      name: 'Harpreet Singh Gill',
      overseasCity: 'Vancouver, BC',
      overseasCountry: 'Canada',
      email: 'hsgill.vancouver@gmail.com',
      phone: '+1 (604) 555-8319'
    },
    status: 'ALL_CLEAR',
    statusBadgeText: 'Protected • GMADA Allotment Clear',
    cameraPod: {
      deviceModel: 'Reolink Argus Eco 4G Solar Edition',
      hardwareType: 'COTS_SOLAR_4G_PTZ',
      online: true,
      batteryPercentage: 96,
      solarCharging: true,
      cellularCarrier: 'Airtel IoT 4G',
      signalStrengthDbm: -71,
      lastSnapshotTimestamp: 'Today, 04:10 PM IST',
      currentSnapshotUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      previousWeekSnapshotUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=70',
      timelapseDifferenceDetected: false,
      timelapseNotes: 'GMADA demarcation pillars in original position. Zero construction vehicles or soil heaps.',
      antiTheftStatus: {
        poleMountElevationMeters: 4.8,
        antiClimbCollarIntact: true,
        tamperSwitchNormal: true,
        cloudHeartbeatSeconds: 40
      }
    },
    latestInspection: {
      id: 'insp-2026-11-12',
      inspectionDate: 'Nov 12, 2026 (10 days ago)',
      inspectorName: 'Gurinder Singh',
      inspectorId: 'PRD-INSP-312',
      inspectorPhone: '+91 98140 77291',
      boundaryPillarsIntact: true,
      debrisOrDumpingFound: false,
      neighborInquiryConducted: true,
      neighborFeedbackSummary: 'Spoke with opposite plot owner (Er. Jagjit Singh). Everything peaceful.',
      summaryNotes: 'All corner pegs inspected. GMADA street signage checked.',
      geotaggedPhotoUrls: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
      ],
      nextScheduledDate: 'Dec 11, 2026',
      verifiedBadge: true
    },
    inspectionHistory: [],
    revenueRegistry: {
      portalName: 'Punjab Jamabandi & GMADA Estate Records',
      surveyNumber: 'Plot 19 / Sy 44',
      khataNumber: 'GMADA-AC-122-19',
      pattadarName: 'Harpreet Singh Gill S/o Jaspal Singh Gill',
      passbookStatus: 'Allotment Letter & Conveyance Deed Registered',
      cleanTitle: true,
      lastCheckedTimestamp: 'Today, 11:30 AM IST',
      pendingMutationsCount: 0,
      unauthorizedMutationDetected: false,
      propertyTaxStatus: 'Paid up to date with GMADA Estate Office',
      encumbranceCertificateStatus: 'Non-Encumbrance Certificate Issued by Sub-Registrar Mohali'
    },
    legalRetainer: {
      advocateName: 'Adv. Baldev S. Sandhu',
      barCouncilNumber: 'PH/2189/2001',
      jurisdictionCourt: 'Punjab & Haryana High Court & Mohali District Court',
      standingCaveatActive: true,
      caveatExpiryDate: 'March 10, 2027',
      contactNumber: '+91 98720 44510',
      statutoryNoticeStatus: 'NORMAL_WATCH'
    },
    recentActivity: [
      {
        id: 'act-m1',
        timestamp: 'Today, 04:10 PM IST',
        category: 'CAMERA',
        title: 'Daily 4G Snapshot Synchronized',
        description: 'Perimeter intact. Solar cell generating at 96% battery float.',
        severity: 'INFO'
      },
      {
        id: 'act-m2',
        timestamp: 'Today, 11:30 AM IST',
        category: 'REGISTRY',
        title: 'Jamabandi Portal Audit Clean',
        description: 'No mutations, mortgages, or court attachments registered against Plot #19.',
        severity: 'SUCCESS'
      }
    ]
  }
];
