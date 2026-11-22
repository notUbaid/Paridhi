export type PropertyStatus = 'ALL_CLEAR' | 'ATTENTION_NEEDED' | 'ACTION_REQUIRED';

export interface GeoLocation {
  village: string;
  mandalTaluk: string;
  district: string;
  state: 'Telangana' | 'Karnataka' | 'Punjab' | 'Maharashtra' | 'Tamil Nadu' | 'Gujarat' | 'Delhi-NCR';
  cityNear: string;
  latitude: number;
  longitude: number;
}

export interface CameraPodInfo {
  deviceModel: string;
  hardwareType: 'COTS_SOLAR_4G_PTZ' | 'INDUSTRIAL_POLE_POD';
  online: boolean;
  batteryPercentage: number;
  solarCharging: boolean;
  cellularCarrier: string;
  signalStrengthDbm: number;
  lastSnapshotTimestamp: string;
  currentSnapshotUrl: string;
  previousWeekSnapshotUrl: string;
  timelapseDifferenceDetected: boolean;
  timelapseNotes: string;
  antiTheftStatus: {
    poleMountElevationMeters: number;
    antiClimbCollarIntact: boolean;
    tamperSwitchNormal: boolean;
    cloudHeartbeatSeconds: number;
  };
}

export interface FieldInspectionReport {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorId: string;
  inspectorPhone: string;
  boundaryPillarsIntact: boolean;
  debrisOrDumpingFound: boolean;
  neighborInquiryConducted: boolean;
  neighborFeedbackSummary: string;
  summaryNotes: string;
  geotaggedPhotoUrls: string[];
  nextScheduledDate: string;
  verifiedBadge: boolean;
}

export interface RevenueRegistryWatch {
  portalName: string;
  surveyNumber: string;
  khataNumber: string;
  pattadarName: string;
  passbookStatus: string;
  cleanTitle: boolean;
  lastCheckedTimestamp: string;
  pendingMutationsCount: number;
  unauthorizedMutationDetected: boolean;
  mutationAlertDetails?: string;
  propertyTaxStatus: string;
  encumbranceCertificateStatus: string;
}

export interface LegalRetainerInfo {
  advocateName: string;
  barCouncilNumber: string;
  jurisdictionCourt: string;
  standingCaveatActive: boolean;
  caveatExpiryDate?: string;
  contactNumber: string;
  statutoryNoticeStatus: 'NORMAL_WATCH' | 'CAVEAT_LODGED' | 'INJUNCTION_READY';
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  category: 'CAMERA' | 'INSPECTION' | 'REGISTRY' | 'LEGAL' | 'SYSTEM';
  title: string;
  description: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface PropertyRecord {
  id: string;
  name: string;
  surveyNumber: string;
  plotSizeDisplay: string;
  areaAcres: number;
  marketValuationINR: number;
  location: GeoLocation;
  owner: {
    name: string;
    overseasCity: string;
    overseasCountry: string;
    email: string;
    phone: string;
  };
  status: PropertyStatus;
  statusBadgeText: string;
  cameraPod: CameraPodInfo;
  latestInspection: FieldInspectionReport;
  inspectionHistory: FieldInspectionReport[];
  revenueRegistry: RevenueRegistryWatch;
  legalRetainer: LegalRetainerInfo;
  recentActivity: ActivityEvent[];
}
