import type { ActivityEvent, EvidenceRecord, PropertyRecord } from '../../shared/types.js';
import type { Database, Queryable } from './db.js';

export const MAX_ACTIVITY = 50;

/**
 * `ownerId` scopes every read and write to one owner's plots. `null` means unscoped,
 * used by the demo (which has no accounts) and by authenticated camera devices.
 */
export type OwnerScope = string | null;

export interface UpdateContext {
  /** Store a signed evidence record in the same transaction as the property change. */
  addEvidence(record: EvidenceRecord): void;
}

export interface Store {
  readonly kind: 'memory' | 'postgres';
  listProperties(ownerId: OwnerScope): Promise<PropertyRecord[]>;
  getProperty(id: string, ownerId: OwnerScope): Promise<PropertyRecord | undefined>;
  /**
   * Loads a property, lets `change` modify it (including prepending to `activity`), and saves
   * the result atomically. If `change` throws, nothing is saved. Returns undefined if the
   * property does not exist or is outside the owner's scope.
   */
  updateProperty<T>(
    id: string,
    ownerId: OwnerScope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ): Promise<{ property: PropertyRecord; result: T } | undefined>;
  listEvidence(propertyId: string): Promise<EvidenceRecord[]>;
  /** Demo only: restore a property from sample data. */
  reset?(id: string): Promise<PropertyRecord | undefined>;
}

/**
 * Demo storage: sample data in memory. It resets on restart and is not shared between
 * serverless instances. There are no accounts, so owner scope is ignored.
 */
export class MemoryStore implements Store {
  readonly kind = 'memory';
  private properties = new Map<string, PropertyRecord>();
  private evidence = new Map<string, EvidenceRecord[]>();
  private readonly seed: () => PropertyRecord[];

  constructor(seed: () => PropertyRecord[]) {
    this.seed = seed;
    for (const property of seed()) this.properties.set(property.id, property);
  }

  async listProperties(): Promise<PropertyRecord[]> {
    return [...this.properties.values()];
  }

  async getProperty(id: string): Promise<PropertyRecord | undefined> {
    return this.properties.get(id);
  }

  async updateProperty<T>(
    id: string,
    _ownerId: OwnerScope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ) {
    const current = this.properties.get(id);
    if (!current) return undefined;
    // Work on a copy so a failed change leaves the stored property untouched.
    const draft = structuredClone(current);
    const pendingEvidence: EvidenceRecord[] = [];
    const result = await change(draft, { addEvidence: (record) => pendingEvidence.push(record) });
    draft.activity = draft.activity.slice(0, MAX_ACTIVITY);
    this.properties.set(id, draft);
    for (const record of pendingEvidence) {
      this.evidence.set(id, [...(this.evidence.get(id) ?? []), record]);
    }
    return { property: draft, result };
  }

  async listEvidence(propertyId: string): Promise<EvidenceRecord[]> {
    return this.evidence.get(propertyId) ?? [];
  }

  async reset(id: string): Promise<PropertyRecord | undefined> {
    const fresh = this.seed().find((p) => p.id === id);
    if (!fresh || !this.properties.has(id)) return undefined;
    this.properties.set(id, fresh);
    this.evidence.delete(id);
    return fresh;
  }
}

interface PropertyRow {
  id: string;
  record: Omit<PropertyRecord, 'id' | 'activity'>;
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

const iso = (value: Date | string) => new Date(value).toISOString();

function documentOf(property: PropertyRecord): string {
  const { id: _id, activity: _activity, ...record } = property;
  return JSON.stringify(record);
}

/** Postgres storage (schema in supabase/migrations). Every query is scoped to the owner. */
export class PostgresStore implements Store {
  readonly kind = 'postgres';
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async listProperties(ownerId: OwnerScope): Promise<PropertyRecord[]> {
    const { rows } = await this.db.query<PropertyRow>(
      `select id, record from public.properties
        where ($1::uuid is null or owner_id = $1::uuid)
        order by created_at, id`,
      [ownerId]
    );
    const activity = await this.loadActivity(this.db, rows.map((r) => r.id));
    return rows.map((row) => ({ ...row.record, id: row.id, activity: activity.get(row.id) ?? [] }));
  }

  async getProperty(id: string, ownerId: OwnerScope): Promise<PropertyRecord | undefined> {
    const { rows } = await this.db.query<PropertyRow>(
      `select id, record from public.properties
        where id = $1 and ($2::uuid is null or owner_id = $2::uuid)`,
      [id, ownerId]
    );
    if (rows.length === 0) return undefined;
    const activity = await this.loadActivity(this.db, [id]);
    return { ...rows[0].record, id, activity: activity.get(id) ?? [] };
  }

  async updateProperty<T>(
    id: string,
    ownerId: OwnerScope,
    change: (property: PropertyRecord, ctx: UpdateContext) => T | Promise<T>
  ) {
    return this.db.transaction(async (tx) => {
      const { rows } = await tx.query<PropertyRow>(
        `select id, record from public.properties
          where id = $1 and ($2::uuid is null or owner_id = $2::uuid)
          for update`,
        [id, ownerId]
      );
      if (rows.length === 0) return undefined;

      const activity = (await this.loadActivity(tx, [id])).get(id) ?? [];
      const knownIds = new Set(activity.map((a) => a.id));
      const property: PropertyRecord = { ...rows[0].record, id, activity };
      const pendingEvidence: EvidenceRecord[] = [];

      const result = await change(property, { addEvidence: (record) => pendingEvidence.push(record) });

      await tx.query(`update public.properties set record = $2::jsonb, updated_at = now() where id = $1`, [
        id,
        documentOf(property)
      ]);
      for (const event of property.activity.filter((a) => !knownIds.has(a.id))) {
        await tx.query(
          `insert into public.activity_events (id, property_id, at, category, severity, title, description)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [event.id, id, event.at, event.category, event.severity, event.title, event.description]
        );
      }
      for (const record of pendingEvidence) {
        await tx.query(
          `insert into public.evidence_records
             (id, property_id, kind, received_at, payload, sha256, signature, key_id, algorithm)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            record.id,
            id,
            record.kind,
            record.receivedAt,
            record.payload,
            record.sha256,
            record.signature,
            record.keyId,
            record.algorithm
          ]
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

  /** Adds a property for an owner, with its activity log. Used by the seed script and tests. */
  async insertProperty(ownerId: string, property: PropertyRecord): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.query(`insert into public.properties (id, owner_id, record) values ($1, $2::uuid, $3::jsonb)`, [
        property.id,
        ownerId,
        documentOf(property)
      ]);
      for (const event of property.activity) {
        await tx.query(
          `insert into public.activity_events (id, property_id, at, category, severity, title, description)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [event.id, property.id, event.at, event.category, event.severity, event.title, event.description]
        );
      }
    });
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
