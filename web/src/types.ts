export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface CadastralPolygon {
  surveyNumber: string;
  khasraKhata: string;
  village: string;
  mandalTaluk: string;
  district: string;
  state: 'Telangana' | 'Karnataka' | 'Punjab' | 'Maharashtra' | 'Uttar Pradesh' | 'Gujarat';
  coordinates: GeoCoordinate[];
  areaAcres: number;
  marketValuationINR: number;
}

export interface SentinelTelemetry {
  nodeId: string;
  timestamp: string;
  solarWatts: number;
  batteryPercentage: number;
  batteryVoltage: number;
  batteryHealth: 'EXCELLENT' | 'GOOD' | 'DEGRADED';
  lteSignalDbm: number;
  lteCarrier: string;
  radarActive: boolean;
  opticalTamperScore: number;
  imuTiltAngleDeg: number;
  systemStatus: 'ONLINE_ACTIVE' | 'QUIESCENT_STANDBY' | 'DETERRENCE_ACTIVE' | 'OFFLINE';
}

export interface IncidentDetection {
  id: string;
  propertyId: string;
  nodeId: string;
  timestamp: string;
  severity: SeverityLevel;
  threatType:
    | 'TRIPWIRE_BREACH'
    | 'MATERIAL_DUMPING'
    | 'EARTHMOVER_ACTIVITY'
    | 'SQUATTER_STRUCTURE'
    | 'BOUNDARY_TAMPER'
    | 'RF_JAMMING_ATTEMPT';
  confidenceScore: number;
  description: string;
  coordinates: GeoCoordinate;
  evacuationWarningDispatched: boolean;
  sirenTriggered: boolean;
  videoClipUrl: string;
  thermalSnapshotUrl?: string;
  sha256Hash: string;
  hardwareSignature: string;
  merkleRoot?: string;
}

export interface MutationAlert {
  id: string;
  propertyId: string;
  surveyNumber: string;
  portalSource: string;
  applicationId: string;
  applicantName: string;
  claimedType: string;
  filingDate: string;
  objectionWindowDaysRemaining: number;
  status: 'ACTIVE_NOTICE' | 'CAVEAT_SUBMITTED' | 'RESOLVED_CLEAN';
  threatLevel: SeverityLevel;
  caveatDraftUrl?: string;
}

export interface GroundMarshalUnit {
  id: string;
  callsign: string;
  leadResponder: string;
  rankMilitaryEx: string;
  psaraLicenseNumber: string;
  currentLocation: GeoCoordinate;
  etaMinutes: number;
  status: 'STATION_STANDBY' | 'EN_ROUTE' | 'ON_SITE_ESCORT' | 'POLICE_LIAISON_ACTIVE';
  bodycamStreamUrl: string;
  contactNumber: string;
  incidentAssignedId?: string;
}

export interface PropertyRecord {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerOverseasCity: string;
  cadastre: CadastralPolygon;
  sentinelNode: SentinelTelemetry;
  activeIncidents: IncidentDetection[];
  registryRadar: {
    lastChecked: string;
    cleanTitle: boolean;
    activeCaveatsCount: number;
    pendingMutations: MutationAlert[];
  };
  groundResponseTeam: GroundMarshalUnit;
}

export interface MerkleProof {
  leafHash: string;
  auditPath: { position: 'left' | 'right'; hash: string }[];
  root: string;
}

export interface BSA2023Certificate {
  certificateId: string;
  propertyId: string;
  surveyNumber: string;
  incidentId: string;
  issuedAt: string;
  custodianName: string;
  custodianDesignation: string;
  statutoryAct: 'Bharatiya Sakshya Adhiniyam, 2023 - Section 63(4)';
  deviceSerialNumber: string;
  gnssNavicFix: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    atomicTimestamp: string;
  };
  sha256PayloadHash: string;
  ed25519HardwareSignature: string;
  rfc3161TimestampToken: string;
  merkleRoot: string;
  merkleProof: MerkleProof;
  courtFilingFormatMarkdown: string;
}
