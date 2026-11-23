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
  /** A photo uploaded to Paridhi, served from /api/properties/:id/photos/:photoId. */
  photoId?: string;
  /** SHA-256 of the uploaded file, computed by the server on arrival. */
  sha256?: string;
  /** An external image (sample data only). */
  url?: string;
  /** The boundary peg the inspector photographed (BoundaryPeg.id). */
  pegId: string;
  capturedAt: string;
  /** Where the inspector's phone was when the photo was added. */
  position: GeoPoint;
}

export interface OnDemandInspectionRequest {
  requestedAt: string;
  targetVisitBy: string;
  notes: string;
}

export interface InspectionVisit {
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
}

/** Who inspects the plot, when the next visit is due, and the most recent visit (if any). */
export interface InspectionSchedule {
  inspectorName: string;
  inspectorId: string;
  nextVisitDue: string;
  onDemandRequest: OnDemandInspectionRequest | null;
  latestVisit: InspectionVisit | null;
}

export interface MutationEntry {
  id: string;
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
  /** Null until the first check has been recorded. */
  lastCheckedAt: string | null;
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
  /** Null until a camera is installed; a plot can be protected by inspections alone. */
  camera: CameraPod | null;
  inspection: InspectionSchedule;
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
  kind: 'CAMERA_INCIDENT' | 'INSPECTION_VISIT';
  receivedAt: string;
}

export interface Dossier extends SignedRecord {
  id: string;
  generatedAt: string;
  evidenceCount: number;
  evidenceMerkleRoot: string;
  signingKeyEphemeral: boolean;
}

/** How the web app should sign owners in. The publishable key is public by design. */
export type AuthInfo = { required: false } | { required: true; supabaseUrl: string; publishableKey: string };

export interface HealthResponse {
  status: 'ok';
  demoMode: boolean;
  deviceIngestEnabled: boolean;
  signingKey: { keyId: string; ephemeral: boolean };
  auth: AuthInfo;
}

/* ---------- Staff ---------- */

export type StaffRole = 'ops' | 'inspector' | 'advocate';

export interface StaffMember {
  userId: string;
  email: string;
  role: StaffRole;
  displayName: string;
  /** Inspector ID or advocate enrolment number, shown to owners. */
  staffCode: string;
}

/** Who is using the app. In the open demo the viewer acts as ops. */
export interface Viewer {
  demo: boolean;
  userId: string | null;
  email: string | null;
  staffRole: StaffRole | null;
}

/** A plot as staff see it, with who owns it and who is assigned. */
export interface StaffProperty {
  property: PropertyRecord;
  ownerEmail: string | null;
  inspectorUserId: string | null;
  advocateUserId: string | null;
}

export interface UploadedPhoto {
  photoId: string;
  sha256: string;
  pegId: string;
  capturedAt: string;
  position: GeoPoint;
}
