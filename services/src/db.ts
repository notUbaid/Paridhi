import pg from 'pg';

export interface QueryResult<T> {
  rows: T[];
}

/** Anything that can run a parameterised query: a pool, a pooled client, or a test database. */
export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface Database extends Queryable {
  /** Runs `fn` in a transaction, committing if it resolves and rolling back if it throws. */
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

function sslFor(host: string): pg.PoolConfig['ssl'] {
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');
  // Supabase serves its own CA. Without DATABASE_CA_CERT the connection is encrypted
  // but the certificate chain is not verified.
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
}

/** Postgres pool for a connection string such as Supabase's pooler URL. */
export function createPgDatabase(connectionString: string): Database {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  const pool = new pg.Pool({
    connectionString: url.toString(),
    ssl: sslFor(url.hostname),
    max: Number(process.env.DATABASE_POOL_SIZE) || 5,
    idleTimeoutMillis: 10_000
  });

  return {
    query: <T>(sql: string, params?: unknown[]) => pool.query(sql, params) as unknown as Promise<QueryResult<T>>,
    async transaction<T>(fn: (tx: Queryable) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query('begin');
        const tx: Queryable = {
          query: <R>(sql: string, params?: unknown[]) =>
            client.query(sql, params) as unknown as Promise<QueryResult<R>>
        };
        const result = await fn(tx);
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback').catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end()
  };
}
