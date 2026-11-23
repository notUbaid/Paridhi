import type { EvidenceRecord, PropertyRecord } from '../../shared/types.js';

/**
 * In-memory storage. Data lives only as long as the process: it resets on
 * restart and is not shared between serverless instances. Replace this class
 * with a database-backed one before handling real customers.
 */
export class PropertyStore {
  private properties = new Map<string, PropertyRecord>();
  private evidence = new Map<string, EvidenceRecord[]>();
  private readonly seed: () => PropertyRecord[];

  constructor(seed: () => PropertyRecord[]) {
    this.seed = seed;
    for (const property of seed()) {
      this.properties.set(property.id, property);
    }
  }

  list(): PropertyRecord[] {
    return [...this.properties.values()];
  }

  get(id: string): PropertyRecord | undefined {
    return this.properties.get(id);
  }

  listEvidence(propertyId: string): EvidenceRecord[] {
    return this.evidence.get(propertyId) ?? [];
  }

  addEvidence(record: EvidenceRecord): void {
    this.evidence.set(record.propertyId, [...this.listEvidence(record.propertyId), record]);
  }

  /** Restore one property (and drop its evidence) from fresh seed data. */
  reset(id: string): PropertyRecord | undefined {
    const fresh = this.seed().find((p) => p.id === id);
    if (!fresh || !this.properties.has(id)) return undefined;
    this.properties.set(id, fresh);
    this.evidence.delete(id);
    return fresh;
  }
}
