import type { RequestEvent } from '@sveltejs/kit';

export interface AdminColumnInfo {
	name: string;
	dataType: string;
	primaryKey: boolean;
	notNull: boolean;
	hasDefault: boolean;
}

export interface AdminTableInfo {
	name: string;
	exportName: string;
	columns: AdminColumnInfo[];
	primaryKey: string;
}

export interface AdminTableData {
	tables: string[];
	currentTable: string;
	records: Record<string, unknown>[];
	columns: AdminColumnInfo[];
	primaryKey: string;
	total: number;
	page: number;
	pageSize: number;
	search: string;
	studioUrl?: string;
}

export interface DrizzleAdminConfig {
	/** Drizzle database client instance */
	db: any;
	/** Drizzle schema object (e.g. import * as schema from './schema') */
	schema: Record<string, any>;
	/** Optional URL for Drizzle Studio button (default: 'https://local.drizzle.studio') */
	studioUrl?: string;
	/** Optional authorization check */
	requireAuth?: (event: RequestEvent) => Promise<boolean> | boolean;
}

export interface YaxaAdminHookOptions extends DrizzleAdminConfig {
	/** Path prefix for admin routes (default: '/admin') */
	path?: string;
	/** Custom page title (default: 'Yaxa Admin') */
	title?: string;
}
