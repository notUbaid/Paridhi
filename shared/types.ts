/**
 * Data model shared by the API (services/) and the web client (web/).
 * All timestamps are ISO 8601 strings in UTC; the UI formats them.
 */

export type IndianState =
  | 'Telangana'
  | 'Karnataka'
  | 'Punjab'
  | 'Maharashtra'
  | 'Tamil Nadu'
  | 'Gujarat'
  | 'Delhi-NCR';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundaryPeg {
  /** Short id used in photos and the survey overlay, e.g. "P1". */
  id: string;
  /** Compass corner, e.g. "NE". */
  corner: string;
  position: GeoPoint;
}

export interface PropertyLocation {
  village: string;
  mandalTaluk: string;
  district: string;
  state: IndianState;
  cityNear: string;
  center: GeoPoint;
  /** Surveyed corner pegs, in clockwise order starting from the north-east corner. */
  boundaryPegs: BoundaryPeg[];
  /** What lies beyond each side, as recorded in the title documents. */
  boundaries: { north: string; east: string; south: string; west: string };
}

export interface Owner {
  name: string;
  overseasCity: string;
  overseasCountry: string;
  /** IANA time zone used for the owner's local clock, e.g. "America/Los_Angeles". */
  timeZone: string;
  email: string;
  phone: string;
}

export interface Snapshot {
  url: string;
  capturedAt: string;
}

export interface CameraPod {
  deviceModel: string;
  carrier: string;
  online: boolean;
  batteryPercentage: number;
  solarCharging: boolean;
  signalStrengthDbm: number;
  poleHeightMeters: number;
  tamperSwitchNormal: boolean;
  lastHeartbeatAt: string;
  heartbeatIntervalSeconds: number;
  latestSnapshot: Snapshot;
  baselineSnapshot: Snapshot;
  /** True when the weekly comparison against the baseline flagged a change. */
  changeDetected: boolean;
  changeNotes: string;
}

export interface InspectionPhoto {
  url: string;
  /** The boundary peg the inspector photographed (BoundaryPeg.id). */
  pegId: string;
  capturedAt: string;
  /** Position read from the photo's GPS metadata. */
  position: GeoPoint;
}

export interface OnDemandInspectionRequest {
  requestedAt: string;
  targetVisitBy: string;
  notes: string;
}

export interface FieldInspection {
  id: string;
  inspectedAt: string;
  inspectorName: string;
  inspectorId: string;
  boundaryPegsIntact: boolean;
  debrisFound: boolean;
  neighborInquiryConducted: boolean;
  neighborFeedback: string;
  notes: string;
  photos: InspectionPhoto[];
  nextVisitDue: string;
  onDemandRequest: OnDemandInspectionRequest | null;
}

export interface MutationEntry {
  reference: string;
  filedOn: string;
  description: string;
}

export interface RevenueRecord {
  portalName: string;
  portalUrl: string;
  surveyNumber: string;
  /** The state's own term for the account number: Khata, Khewat, Allotment no., etc. */
  accountLabel: string;
  accountNumber: string;
  recordedOwner: string;
  recordStatus: string;
  /** Mutation applications on the record that the owner did not start. */
  flaggedMutations: MutationEntry[];
  lastCheckedAt: string;
  propertyTaxStatus: string;
  encumbranceStatus: string;
}

export interface Caveat {
  /** Civil court where the caveat under Section 148A CPC was lodged. */
  court: string;
  lodgedOn: string;
}

export interface LegalRetainer {
  advocateName: string;
  enrolmentNumber: string;
  courts: string;
  caveat: Caveat | null;
  renewalRequestedAt: string | null;
}

export type ActivityCategory = 'CAMERA' | 'INSPECTION' | 'REGISTRY' | 'LEGAL' | 'SYSTEM';
export type ActivitySeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export interface ActivityEvent {
  id: string;
  at: string;
  category: ActivityCategory;
  title: string;
  description: string;
  severity: ActivitySeverity;
}

export interface PropertyRecord {
  id: string;
  name: string;
  surveyNumber: string;
  plotSizeDisplay: string;
  areaAcres: number;
  marketValuationINR: number;
  location: PropertyLocation;
  owner: Owner;
  camera: CameraPod;
  latestInspection: FieldInspection;
  revenue: RevenueRecord;
  legal: LegalRetainer;
  activity: ActivityEvent[];
}

/** A signed record produced by the API. `payload` is the exact string that was hashed and signed. */
export interface SignedRecord {
  payload: string;
  sha256: string;
  signature: string;
  keyId: string;
  algorithm: 'Ed25519';
}

export interface EvidenceRecord extends SignedRecord {
  id: string;
  propertyId: string;
  kind: 'CAMERA_INCIDENT';
  receivedAt: string;
}

export interface Dossier extends SignedRecord {
  id: string;
  generatedAt: string;
  evidenceCount: number;
  evidenceMerkleRoot: string;
  signingKeyEphemeral: boolean;
}

export interface HealthResponse {
  status: 'ok';
  demoMode: boolean;
  deviceIngestEnabled: boolean;
  signingKey: { keyId: string; ephemeral: boolean };
}
