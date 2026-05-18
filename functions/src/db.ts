import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  const instanceConnectionName = process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME;

  if (!instanceConnectionName) {
    throw new Error('CLOUD_SQL_INSTANCE_CONNECTION_NAME não definida.');
  }

  // Dentro do GCP (produção): usa Unix socket via Cloud SQL Connector
  // Em desenvolvimento local: usa a variável DATABASE_URL com pg padrão
  if (process.env.NODE_ENV === 'development' || process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return pool;
  }

  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName,
    ipType: IpAddressTypes.PUBLIC,
  });

  pool = new Pool({
    ...clientOpts,
    user:     process.env.DB_USER     ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME     ?? 'gestao_demandas',
    max: 5,
  });

  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = await getPool();
  const result = await db.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
