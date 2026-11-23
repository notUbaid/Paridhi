import type {
  ActivityEvent,
  EvidenceRecord,
  PropertyRecord,
  StaffMember,
  StaffProperty,
  StaffRole,
  UploadedPhoto
} from '../../shared/types.js';
import type { Database, Queryable } from './db.js';

export const MAX_ACTIVITY = 50;

/**
 * Which plots a request may touch: all of them (ops staff, devices, the demo), an owner's,
 * or those assigned to one inspector or advocate.
 */
export type Scope =
  | { kind: 'all' }
  | { kind: 'owner'; userId: string }
  | { kind: 'inspector'; userId: string }
  | { kind: 'advocate'; userId: string };

export const ALL: Scope = { kind: 'all' };

export interface Assignments {
  inspectorUserId: string | null;
  advocateUserId: string | null;
}

export interface StoredPhoto extends UploadedPhoto {
  propertyId: string;
  visitId: string | null;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string | null;
  uploadedAt: string;
}

export interface UpdateContext {
  /** Store a signed evidence record in the same transaction as the property change. */
  addEvidence(record: EvidenceRecord): void;
  /** Photos uploaded for this property that are not yet attached to a visit. */
  loadUnattachedPhotos(photoIds: string[]): Promise<StoredPhoto[]>;
  attachPhotos(photoIds: string[], visitId: string): void;
  setAssignments(assignments: Assignments): void;
}

export class UnknownUserError extends Error {}

export interface Store {
  readonly kind: 'memory' | 'postgres';
  listProperties(scope: Scope): Promise<PropertyRecord[]>;
  getProperty(id: string, scope: Scope): Promise<PropertyRecord | undefined>;
  /**
   * Loads a property, lets `change` modify it (including prepending to `activity`), and saves
   * the result atomically. If `change` throws, nothing is saved. Returns undefined if the
   * property does not exist or is outside the scope.
   */
  updateProperty<T>(
    id: string,
    scope: Scope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ): Promise<{ property: PropertyRecord; result: T } | undefined>;
  listEvidence(propertyId: string): Promise<EvidenceRecord[]>;

  listStaffProperties(scope: Scope): Promise<StaffProperty[]>;
  /** Adds a plot for an owner. Fails if the id is taken. */
  createProperty(ownerUserId: string, property: PropertyRecord, assignments: Assignments): Promise<void>;
  findUserIdByEmail(email: string): Promise<string | undefined>;

  getStaffMember(userId: string): Promise<StaffMember | undefined>;
  listStaff(): Promise<StaffMember[]>;
  /** Gives an existing account a staff role. Throws UnknownUserError if no account has that email. */
  upsertStaff(member: Omit<StaffMember, 'userId'>): Promise<StaffMember>;
  removeStaff(userId: string): Promise<boolean>;

  addPhoto(photo: StoredPhoto, data: Buffer): Promise<void>;
  getPhoto(propertyId: string, photoId: string): Promise<{ meta: StoredPhoto; data: Buffer } | undefined>;

  /** Demo only: restore a property from sample data. */
  reset?(id: string): Promise<PropertyRecord | undefined>;
}

/* ---------------------------------------------------------------------------------------- */

interface MemorySeed {
  properties: () => PropertyRecord[];
  staff: StaffMember[];
  assignments: Record<string, Assignments>;
}

/**
 * Demo storage: sample data in memory. It resets on restart and is not shared between
 * serverless instances. There are no real accounts.
 */
export class MemoryStore implements Store {
  readonly kind = 'memory';
  private properties = new Map<string, PropertyRecord>();
  private assignments = new Map<string, Assignments>();
  private evidence = new Map<string, EvidenceRecord[]>();
  private photos = new Map<string, { meta: StoredPhoto; data: Buffer }>();
  private staff: StaffMember[];
  private readonly seed: MemorySeed;

  constructor(seed: MemorySeed) {
    this.seed = seed;
    this.staff = [...seed.staff];
    for (const property of seed.properties()) {
      this.properties.set(property.id, property);
      this.assignments.set(property.id, seed.assignments[property.id] ?? { inspectorUserId: null, advocateUserId: null });
    }
  }

  private inScope(id: string, scope: Scope): boolean {
    if (!this.properties.has(id)) return false;
    const assigned = this.assignments.get(id);
    switch (scope.kind) {
      case 'inspector':
        return assigned?.inspectorUserId === scope.userId;
      case 'advocate':
        return assigned?.advocateUserId === scope.userId;
      default:
        // The demo has no owner accounts, so an owner sees every sample plot.
        return true;
    }
  }

  async listProperties(scope: Scope): Promise<PropertyRecord[]> {
    return [...this.properties.values()].filter((p) => this.inScope(p.id, scope));
  }

  async getProperty(id: string, scope: Scope): Promise<PropertyRecord | undefined> {
    return this.inScope(id, scope) ? this.properties.get(id) : undefined;
  }

  async updateProperty<T>(
    id: string,
    scope: Scope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ) {
    if (!this.inScope(id, scope)) return undefined;
    // Work on copies so a failed change leaves everything untouched.
    const draft = structuredClone(this.properties.get(id)!);
    const pendingEvidence: EvidenceRecord[] = [];
    const pendingAttachments: { ids: string[]; visitId: string }[] = [];
    let pendingAssignments: Assignments | null = null;

    const result = await change(draft, {
      addEvidence: (record) => pendingEvidence.push(record),
      loadUnattachedPhotos: async (photoIds) =>
        photoIds
          .map((photoId) => this.photos.get(photoId)?.meta)
          .filter((meta): meta is StoredPhoto => !!meta && meta.propertyId === id && meta.visitId === null),
      attachPhotos: (ids, visitId) => pendingAttachments.push({ ids, visitId }),
      setAssignments: (next) => {
        pendingAssignments = next;
      }
    });

    draft.activity = draft.activity.slice(0, MAX_ACTIVITY);
    this.properties.set(id, draft);
    for (const record of pendingEvidence) {
      this.evidence.set(id, [...(this.evidence.get(id) ?? []), record]);
    }
    for (const { ids, visitId } of pendingAttachments) {
      for (const photoId of ids) {
        const photo = this.photos.get(photoId);
        if (photo) photo.meta = { ...photo.meta, visitId };
      }
    }
    if (pendingAssignments) this.assignments.set(id, pendingAssignments);
    return { property: draft, result };
  }

  async listEvidence(propertyId: string): Promise<EvidenceRecord[]> {
    return this.evidence.get(propertyId) ?? [];
  }

  async listStaffProperties(scope: Scope): Promise<StaffProperty[]> {
    return (await this.listProperties(scope)).map((property) => ({
      property,
      ownerEmail: property.owner.email,
      ...(this.assignments.get(property.id) ?? { inspectorUserId: null, advocateUserId: null })
    }));
  }

  async createProperty(_ownerUserId: string, property: PropertyRecord, assignments: Assignments): Promise<void> {
    if (this.properties.has(property.id)) throw new Error(`Property ${property.id} already exists`);
    this.properties.set(property.id, property);
    this.assignments.set(property.id, assignments);
  }

  async findUserIdByEmail(email: string): Promise<string | undefined> {
    // The demo has no accounts; any email stands for a sample owner.
    return `demo-owner:${email.toLowerCase()}`;
  }

  async getStaffMember(userId: string): Promise<StaffMember | undefined> {
    return this.staff.find((s) => s.userId === userId);
  }

  async listStaff(): Promise<StaffMember[]> {
    return [...this.staff];
  }

  async upsertStaff(): Promise<StaffMember> {
    throw new Error('Team changes are not available in the demo');
  }

  async removeStaff(): Promise<boolean> {
    throw new Error('Team changes are not available in the demo');
  }

  async addPhoto(photo: StoredPhoto, data: Buffer): Promise<void> {
    this.photos.set(photo.photoId, { meta: photo, data });
  }

  async getPhoto(propertyId: string, photoId: string) {
    const photo = this.photos.get(photoId);
    return photo && photo.meta.propertyId === propertyId ? photo : undefined;
  }

  async reset(id: string): Promise<PropertyRecord | undefined> {
    const fresh = this.seed.properties().find((p) => p.id === id);
    if (!fresh || !this.properties.has(id)) return undefined;
    this.properties.set(id, fresh);
    this.assignments.set(id, this.seed.assignments[id] ?? { inspectorUserId: null, advocateUserId: null });
    this.evidence.delete(id);
    return fresh;
  }
}

/* ---------------------------------------------------------------------------------------- */

interface PropertyRow {
  id: string;
  record: Omit<PropertyRecord, 'id' | 'activity'>;
}

interface StaffPropertyRow extends PropertyRow {
  owner_email: string | null;
  inspector_user_id: string | null;
  advocate_user_id: string | null;
}

interface ActivityRow {
  id: string;
  property_id: string;
  at: Date | string;
  category: ActivityEvent['category'];
  severity: ActivityEvent['severity'];
  title: string;
  description: string;
}

interface EvidenceRow {
  id: string;
  property_id: string;
  kind: EvidenceRecord['kind'];
  received_at: Date | string;
  payload: string;
  sha256: string;
  signature: string;
  key_id: string;
  algorithm: 'Ed25519';
}

interface StaffRow {
  user_id: string;
  email: string;
  role: StaffRole;
  display_name: string;
  staff_code: string;
}

interface PhotoRow {
  id: string;
  property_id: string;
  visit_id: string | null;
  peg_id: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  captured_at: Date | string;
  lat: number;
  lng: number;
  uploaded_by: string | null;
  uploaded_at: Date | string;
  bytes?: Uint8Array;
}

const iso = (value: Date | string) => new Date(value).toISOString();

function documentOf(property: PropertyRecord): string {
  const { id: _id, activity: _activity, ...record } = property;
  return JSON.stringify(record);
}

/** SQL condition (on alias `p`) limiting rows to a scope, using parameter `$index`. */
function scopeFilter(scope: Scope, index: number): { sql: string; params: unknown[] } {
  switch (scope.kind) {
    case 'all':
      return { sql: 'true', params: [] };
    case 'owner':
      return { sql: `p.owner_id = $${index}::uuid`, params: [scope.userId] };
    case 'inspector':
      return { sql: `p.inspector_user_id = $${index}::uuid`, params: [scope.userId] };
    case 'advocate':
      return { sql: `p.advocate_user_id = $${index}::uuid`, params: [scope.userId] };
  }
}

const toStaff = (row: StaffRow): StaffMember => ({
  userId: row.user_id,
  email: row.email,
  role: row.role,
  displayName: row.display_name,
  staffCode: row.staff_code
});

const toPhoto = (row: PhotoRow): StoredPhoto => ({
  photoId: row.id,
  propertyId: row.property_id,
  visitId: row.visit_id,
  pegId: row.peg_id,
  contentType: row.content_type,
  sizeBytes: row.size_bytes,
  sha256: row.sha256,
  capturedAt: iso(row.captured_at),
  position: { lat: row.lat, lng: row.lng },
  uploadedBy: row.uploaded_by,
  uploadedAt: iso(row.uploaded_at)
});

const ACTIVITY_INSERT = `insert into public.activity_events (id, property_id, at, category, severity, title, description)
  values ($1, $2, $3, $4, $5, $6, $7)`;

const PHOTO_COLUMNS = `id, property_id, visit_id, peg_id, content_type, size_bytes, sha256, captured_at, lat, lng, uploaded_by, uploaded_at`;

/** Postgres storage (schema in supabase/migrations). Every query is limited to the caller's scope. */
export class PostgresStore implements Store {
  readonly kind = 'postgres';
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async listProperties(scope: Scope): Promise<PropertyRecord[]> {
    return (await this.listStaffProperties(scope)).map((row) => row.property);
  }

  async getProperty(id: string, scope: Scope): Promise<PropertyRecord | undefined> {
    const filter = scopeFilter(scope, 2);
    const { rows } = await this.db.query<PropertyRow>(
      `select p.id, p.record from public.properties p where p.id = $1 and ${filter.sql}`,
      [id, ...filter.params]
    );
    if (rows.length === 0) return undefined;
    const activity = await this.loadActivity(this.db, [id]);
    return { ...rows[0].record, id, activity: activity.get(id) ?? [] };
  }

  async updateProperty<T>(
    id: string,
    scope: Scope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ) {
    return this.db.transaction(async (tx) => {
      const filter = scopeFilter(scope, 2);
      const { rows } = await tx.query<PropertyRow>(
        `select p.id, p.record from public.properties p where p.id = $1 and ${filter.sql} for update`,
        [id, ...filter.params]
      );
      if (rows.length === 0) return undefined;

      const activity = (await this.loadActivity(tx, [id])).get(id) ?? [];
      const knownIds = new Set(activity.map((a) => a.id));
      const property: PropertyRecord = { ...rows[0].record, id, activity };
      const pendingEvidence: EvidenceRecord[] = [];
      const pendingAttachments: { ids: string[]; visitId: string }[] = [];
      let pendingAssignments: Assignments | null = null;

      const result = await change(property, {
        addEvidence: (record) => pendingEvidence.push(record),
        loadUnattachedPhotos: async (photoIds) => {
          if (photoIds.length === 0) return [];
          const { rows: photoRows } = await tx.query<PhotoRow>(
            `select ${PHOTO_COLUMNS} from public.photos
              where property_id = $1 and visit_id is null and id = any($2::text[])
              for update`,
            [id, photoIds]
          );
          return photoRows.map(toPhoto);
        },
        attachPhotos: (ids, visitId) => pendingAttachments.push({ ids, visitId }),
        setAssignments: (next) => {
          pendingAssignments = next;
        }
      });

      await tx.query(`update public.properties set record = $2::jsonb, updated_at = now() where id = $1`, [
        id,
        documentOf(property)
      ]);
      for (const event of property.activity.filter((a) => !knownIds.has(a.id))) {
        await tx.query(ACTIVITY_INSERT, [event.id, id, event.at, event.category, event.severity, event.title, event.description]);
      }
      for (const record of pendingEvidence) {
        await tx.query(
          `insert into public.evidence_records
             (id, property_id, kind, received_at, payload, sha256, signature, key_id, algorithm)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [record.id, id, record.kind, record.receivedAt, record.payload, record.sha256, record.signature, record.keyId, record.algorithm]
        );
      }
      for (const { ids, visitId } of pendingAttachments) {
        await tx.query(
          `update public.photos set visit_id = $3 where property_id = $1 and visit_id is null and id = any($2::text[])`,
          [id, ids, visitId]
        );
      }
      if (pendingAssignments) {
        const { inspectorUserId, advocateUserId } = pendingAssignments as Assignments;
        await tx.query(
          `update public.properties set inspector_user_id = $2::uuid, advocate_user_id = $3::uuid where id = $1`,
          [id, inspectorUserId, advocateUserId]
        );
      }

      property.activity = property.activity.slice(0, MAX_ACTIVITY);
      return { property, result };
    });
  }

  async listEvidence(propertyId: string): Promise<EvidenceRecord[]> {
    const { rows } = await this.db.query<EvidenceRow>(
      `select * from public.evidence_records where property_id = $1 order by received_at, id`,
      [propertyId]
    );
    return rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      kind: row.kind,
      receivedAt: iso(row.received_at),
      payload: row.payload,
      sha256: row.sha256,
      signature: row.signature,
      keyId: row.key_id,
      algorithm: row.algorithm
    }));
  }

  async listStaffProperties(scope: Scope): Promise<StaffProperty[]> {
    const filter = scopeFilter(scope, 1);
    const { rows } = await this.db.query<StaffPropertyRow>(
      `select p.id, p.record, p.inspector_user_id, p.advocate_user_id, u.email as owner_email
         from public.properties p
         left join auth.users u on u.id = p.owner_id
        where ${filter.sql}
        order by p.created_at, p.id`,
      filter.params
    );
    const activity = await this.loadActivity(this.db, rows.map((r) => r.id));
    return rows.map((row) => ({
      property: { ...row.record, id: row.id, activity: activity.get(row.id) ?? [] },
      ownerEmail: row.owner_email,
      inspectorUserId: row.inspector_user_id,
      advocateUserId: row.advocate_user_id
    }));
  }

  async createProperty(ownerUserId: string, property: PropertyRecord, assignments: Assignments): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.query(
        `insert into public.properties (id, owner_id, record, inspector_user_id, advocate_user_id)
         values ($1, $2::uuid, $3::jsonb, $4::uuid, $5::uuid)`,
        [property.id, ownerUserId, documentOf(property), assignments.inspectorUserId, assignments.advocateUserId]
      );
      for (const event of property.activity) {
        await tx.query(ACTIVITY_INSERT, [
          event.id,
          property.id,
          event.at,
          event.category,
          event.severity,
          event.title,
          event.description
        ]);
      }
    });
  }

  /** Adds a plot with no staff assigned. Used by the seed script and tests. */
  async insertProperty(ownerUserId: string, property: PropertyRecord): Promise<void> {
    await this.createProperty(ownerUserId, property, { inspectorUserId: null, advocateUserId: null });
  }

  async findUserIdByEmail(email: string): Promise<string | undefined> {
    const { rows } = await this.db.query<{ id: string }>(`select id from auth.users where lower(email) = lower($1)`, [email]);
    return rows[0]?.id;
  }

  async getStaffMember(userId: string): Promise<StaffMember | undefined> {
    const { rows } = await this.db.query<StaffRow>(
      `select s.user_id, u.email, s.role, s.display_name, s.staff_code
         from public.staff_members s join auth.users u on u.id = s.user_id
        where s.user_id = $1::uuid`,
      [userId]
    );
    return rows[0] ? toStaff(rows[0]) : undefined;
  }

  async listStaff(): Promise<StaffMember[]> {
    const { rows } = await this.db.query<StaffRow>(
      `select s.user_id, u.email, s.role, s.display_name, s.staff_code
         from public.staff_members s join auth.users u on u.id = s.user_id
        order by s.role, s.display_name`
    );
    return rows.map(toStaff);
  }

  async upsertStaff(member: Omit<StaffMember, 'userId'>): Promise<StaffMember> {
    const userId = await this.findUserIdByEmail(member.email);
    if (!userId) throw new UnknownUserError(`No account with email ${member.email}`);
    await this.db.query(
      `insert into public.staff_members (user_id, role, display_name, staff_code)
       values ($1::uuid, $2, $3, $4)
       on conflict (user_id) do update set role = excluded.role, display_name = excluded.display_name, staff_code = excluded.staff_code`,
      [userId, member.role, member.displayName, member.staffCode]
    );
    return (await this.getStaffMember(userId))!;
  }

  async removeStaff(userId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ user_id: string }>(
      `delete from public.staff_members where user_id = $1::uuid returning user_id`,
      [userId]
    );
    return rows.length > 0;
  }

  async addPhoto(photo: StoredPhoto, data: Buffer): Promise<void> {
    await this.db.query(
      `insert into public.photos
         (id, property_id, visit_id, peg_id, content_type, bytes, size_bytes, sha256, captured_at, lat, lng, uploaded_by, uploaded_at)
       values ($1, $2, null, $3, $4, $5, $6, $7, $8, $9, $10, $11::uuid, $12)`,
      [
        photo.photoId,
        photo.propertyId,
        photo.pegId,
        photo.contentType,
        data,
        photo.sizeBytes,
        photo.sha256,
        photo.capturedAt,
        photo.position.lat,
        photo.position.lng,
        photo.uploadedBy,
        photo.uploadedAt
      ]
    );
  }

  async getPhoto(propertyId: string, photoId: string) {
    const { rows } = await this.db.query<PhotoRow>(
      `select ${PHOTO_COLUMNS}, bytes from public.photos where property_id = $1 and id = $2`,
      [propertyId, photoId]
    );
    if (rows.length === 0 || !rows[0].bytes) return undefined;
    return { meta: toPhoto(rows[0]), data: Buffer.from(rows[0].bytes) };
  }

  private async loadActivity(q: Queryable, propertyIds: string[]): Promise<Map<string, ActivityEvent[]>> {
    const byProperty = new Map<string, ActivityEvent[]>();
    if (propertyIds.length === 0) return byProperty;
    const { rows } = await q.query<ActivityRow>(
      `select id, property_id, at, category, severity, title, description
         from (
           select a.*, row_number() over (partition by property_id order by at desc, id desc) as position
             from public.activity_events a
            where property_id = any($1::text[])
         ) ranked
        where position <= ${MAX_ACTIVITY}
        order by property_id, at desc, id desc`,
      [propertyIds]
    );
    for (const row of rows) {
      const list = byProperty.get(row.property_id) ?? [];
      list.push({
        id: row.id,
        at: iso(row.at),
        category: row.category,
        severity: row.severity,
        title: row.title,
        description: row.description
      });
      byProperty.set(row.property_id, list);
    }
    return byProperty;
  }
}
