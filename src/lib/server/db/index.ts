import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { neon } from '@neondatabase/serverless';
import { createClient } from '@libsql/client';
import * as schemaPg from './schema-pg';
import * as schemaSqlite from './schema-sqlite';
import type { DbDriver } from './types';

export * from './types';
export { schemaPg, schemaSqlite };

export interface DbConfig {
	driver?: DbDriver;
	url?: string;
	authToken?: string;
}

export type AnyDb =
	| ReturnType<typeof drizzleNeon<typeof schemaPg>>
	| ReturnType<typeof drizzleLibsql<typeof schemaSqlite>>;

let cachedDb: AnyDb | null = null;

/**
 * Creates or retrieves a Drizzle database client instance.
 * Supports switching between Neon (PostgreSQL) and Turso (LibSQL/SQLite).
 */
export function getDb(config?: DbConfig): AnyDb {
	if (cachedDb && !config) {
		return cachedDb;
	}

	const driver =
		config?.driver ||
		(typeof process !== 'undefined' ? (process.env.DATABASE_DRIVER as DbDriver) : undefined) ||
		'neon';

	const url =
		config?.url ||
		(typeof process !== 'undefined'
			? process.env.DATABASE_URL ||
				'postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/yaxa_saas?sslmode=require'
			: 'postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/yaxa_saas?sslmode=require');

	const authToken =
		config?.authToken ||
		(typeof process !== 'undefined' ? process.env.DATABASE_AUTH_TOKEN : undefined);

	if (driver === 'turso' || driver === 'sqlite') {
		const client = createClient({
			url,
			authToken
		});
		const db = drizzleLibsql(client, { schema: schemaSqlite });
		if (!config) cachedDb = db;
		return db;
	}

	// Default to Neon Serverless Postgres
	try {
		const sql = neon(url);
		const db = drizzleNeon(sql, { schema: schemaPg });
		if (!config) cachedDb = db;
		return db;
	} catch {
		// Fallback for build/analysis time
		const sql = neon(
			'postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/yaxa_saas?sslmode=require'
		);
		const db = drizzleNeon(sql, { schema: schemaPg });
		if (!config) cachedDb = db;
		return db;
	}
}
