import type { PropertyRecord } from './types.js';

export const initialMockProperties: PropertyRecord[] = [
  {
    id: 'PRD-PROP-500081-01',
    name: 'Shamshabad Aero-Corridor Parcel',
    ownerName: 'Arjun Sundaram',
    ownerEmail: 'arjun.sundaram@stanfordalumni.org',
    ownerOverseasCity: 'San Jose, CA (Silicon Valley)',
    cadastre: {
      surveyNumber: '124/2A',
      khasraKhata: 'Khata #418',
      village: 'Shamshabad Rural',
      mandalTaluk: 'Shamshabad',
      district: 'Rangareddy',
      state: 'Telangana',
      areaAcres: 2.4,
      marketValuationINR: 84000000,
      coordinates: [
        { latitude: 17.2403, longitude: 78.4294 },
        { latitude: 17.2421, longitude: 78.4312 },
        { latitude: 17.2415, longitude: 78.4335 },
        { latitude: 17.2398, longitude: 78.4318 }
      ]
    },
    sentinelNode: {
      nodeId: 'PRD-NODE-HYD-0418',
      timestamp: new Date().toISOString(),
      solarWatts: 22.8,
      batteryPercentage: 96,
      batteryVoltage: 13.2,
      batteryHealth: 'EXCELLENT',
      lteSignalDbm: -74,
      lteCarrier: 'Airtel 4G eSIM (Primary) / Jio (Failover)',
      radarActive: true,
      opticalTamperScore: 0.02,
      imuTiltAngleDeg: 0.4,
      systemStatus: 'ONLINE_ACTIVE'
    },
    activeIncidents: [
      {
        id: 'INC-HYD-9812-B',
        propertyId: 'PRD-PROP-500081-01',
        nodeId: 'PRD-NODE-HYD-0418',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        severity: 'CRITICAL',
        threatType: 'MATERIAL_DUMPING',
        confidenceScore: 0.98,
        description: 'Commercial tipper truck dumped approx 400 red clay bricks and sand pile at North-East boundary peg',
        coordinates: { latitude: 17.2418, longitude: 78.4315 },
        evacuationWarningDispatched: true,
        sirenTriggered: false,
        videoClipUrl: '/api/evidence/INC-HYD-9812-B/stream.mp4',
        thermalSnapshotUrl: '/api/evidence/INC-HYD-9812-B/thermal.jpg',
        sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        hardwareSignature: 'e2b4f910a51c4a0081bce09ff12aa08129038411d9f048bbce82910fae1208ab'
      }
    ],
    registryRadar: {
      lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      cleanTitle: true,
      activeCaveatsCount: 0,
      pendingMutations: []
    },
    groundResponseTeam: {
      id: 'MARSHAL-HYD-04',
      callsign: 'Guardian Alpha-4',
      leadResponder: 'Ex-Subedar Major Rajesh Nair',
      rankMilitaryEx: 'Indian Army (Corps of Signals)',
      psaraLicenseNumber: 'PSARA/TG/HYD/2022/9914',
      currentLocation: { latitude: 17.251, longitude: 78.418 },
      etaMinutes: 14,
      status: 'STATION_STANDBY',
      bodycamStreamUrl: 'https://stream.paridhi.defense/live/marshal-hyd-04',
      contactNumber: '+91 98490 XXXXX'
    }
  },
  {
    id: 'PRD-PROP-562110-02',
    name: 'Devanahalli Airport Tech-Parcel',
    ownerName: 'Priya & Vikram Venkatesh',
    ownerEmail: 'vikram.venkatesh@alum.mit.edu',
    ownerOverseasCity: 'Seattle, WA (USA)',
    cadastre: {
      surveyNumber: '88/1B',
      khasraKhata: 'Hissa #3, Khata 109',
      village: 'Binnamangala',
      mandalTaluk: 'Devanahalli',
      district: 'Bengaluru Rural',
      state: 'Karnataka',
      areaAcres: 1.15,
      marketValuationINR: 62000000,
      coordinates: [
        { latitude: 13.2482, longitude: 77.7124 },
        { latitude: 13.2495, longitude: 77.7141 },
        { latitude: 13.2488, longitude: 77.7156 },
        { latitude: 13.2475, longitude: 77.7138 }
      ]
    },
    sentinelNode: {
      nodeId: 'PRD-NODE-BLR-0881',
      timestamp: new Date().toISOString(),
      solarWatts: 20.4,
      batteryPercentage: 93,
      batteryVoltage: 13.1,
      batteryHealth: 'EXCELLENT',
      lteSignalDbm: -78,
      lteCarrier: 'Jio 4G / Airtel',
      radarActive: true,
      opticalTamperScore: 0.01,
      imuTiltAngleDeg: 0.2,
      systemStatus: 'ONLINE_ACTIVE'
    },
    activeIncidents: [
      {
        id: 'INC-BLR-4410-T',
        propertyId: 'PRD-PROP-562110-02',
        nodeId: 'PRD-NODE-BLR-0881',
        timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
        severity: 'HIGH',
        threatType: 'TRIPWIRE_BREACH',
        confidenceScore: 0.94,
        description: 'Two individuals with measuring tape and marking chalk crossed Cadastral Boundary Line #4',
        coordinates: { latitude: 13.2487, longitude: 77.7145 },
        evacuationWarningDispatched: true,
        sirenTriggered: false,
        videoClipUrl: '/api/evidence/INC-BLR-4410-T/stream.mp4',
        thermalSnapshotUrl: '/api/evidence/INC-BLR-4410-T/thermal.jpg',
        sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        hardwareSignature: 'b819f01020aa9911928014561028374920194857201984710293847102938471'
      }
    ],
    registryRadar: {
      lastChecked: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      cleanTitle: false,
      activeCaveatsCount: 1,
      pendingMutations: [
        {
          id: 'MUT-KA-2026-904',
          propertyId: 'PRD-PROP-562110-02',
          surveyNumber: '88/1B',
          portalSource: 'Bhoomi RTC (Karnataka Revenue Department)',
          applicationId: 'BHOOMI-MR-2026-44182',
          applicantName: 'M. Muniswamy & Associates',
          claimedType: 'Claim of Unregistered Agreement of Sale & Mutation',
          filingDate: '2026-11-16',
          objectionWindowDaysRemaining: 18,
          status: 'ACTIVE_NOTICE',
          threatLevel: 'CRITICAL',
          caveatDraftUrl: '/api/properties/PRD-PROP-562110-02/caveat/MUT-KA-2026-904'
        }
      ]
    },
    groundResponseTeam: {
      id: 'MARSHAL-BLR-02',
      callsign: 'Cavalry Unit 2',
      leadResponder: 'Ex-Captain Shantharam Rao',
      rankMilitaryEx: 'Indian Army (Maratha Light Infantry)',
      psaraLicenseNumber: 'PSARA/KA/BLR/2021/4108',
      currentLocation: { latitude: 13.239, longitude: 77.701 },
      etaMinutes: 19,
      status: 'STATION_STANDBY',
      bodycamStreamUrl: 'https://stream.paridhi.defense/live/marshal-blr-02',
      contactNumber: '+91 94480 XXXXX'
    }
  },
  {
    id: 'PRD-PROP-160055-03',
    name: 'Mohali Aerocity Heritage Orchard',
    ownerName: 'Gurpreet Singh Dhillon',
    ownerEmail: 'g.dhillon@barclays.co.uk',
    ownerOverseasCity: 'London, UK',
    cadastre: {
      surveyNumber: '312//14/2',
      khasraKhata: 'Khewat #89, Khatoni #142',
      village: 'Bakarpur',
      mandalTaluk: 'SAS Nagar Mohali',
      district: 'Mohali',
      state: 'Punjab',
      areaAcres: 4.5,
      marketValuationINR: 115000000,
      coordinates: [
        { latitude: 30.6412, longitude: 76.7824 },
        { latitude: 30.6435, longitude: 76.7845 },
        { latitude: 30.6428, longitude: 76.7878 },
        { latitude: 30.6402, longitude: 76.7852 }
      ]
    },
    sentinelNode: {
      nodeId: 'PRD-NODE-PB-3121',
      timestamp: new Date().toISOString(),
      solarWatts: 24.1,
      batteryPercentage: 98,
      batteryVoltage: 13.3,
      batteryHealth: 'EXCELLENT',
      lteSignalDbm: -71,
      lteCarrier: 'Airtel 4G eSIM (Primary)',
      radarActive: true,
      opticalTamperScore: 0.01,
      imuTiltAngleDeg: 0.1,
      systemStatus: 'ONLINE_ACTIVE'
    },
    activeIncidents: [],
    registryRadar: {
      lastChecked: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      cleanTitle: true,
      activeCaveatsCount: 0,
      pendingMutations: []
    },
    groundResponseTeam: {
      id: 'MARSHAL-PB-01',
      callsign: 'Sher-E-Punjab Response 1',
      leadResponder: 'Ex-Honorary Captain Balwinder Singh',
      rankMilitaryEx: 'Indian Army (Sikh Regiment)',
      psaraLicenseNumber: 'PSARA/PB/MHL/2020/1187',
      currentLocation: { latitude: 30.635, longitude: 76.772 },
      etaMinutes: 12,
      status: 'STATION_STANDBY',
      bodycamStreamUrl: 'https://stream.paridhi.defense/live/marshal-pb-01',
      contactNumber: '+91 98150 XXXXX'
    }
  }
];
