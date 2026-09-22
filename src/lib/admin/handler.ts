import {
	getTableColumns,
	getTableName,
	is,
	Table,
	sql,
	eq,
	or,
	like,
	desc,
	asc
} from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import type { AdminColumnInfo, AdminTableData, AdminTableInfo, DrizzleAdminConfig } from './types';

/**
 * Typed view of Drizzle ORM column internals accessed during table introspection.
 * Drizzle does not export these as public types, so we model only the properties
 * we actually read. Narrower than `any` — keeps the handler refactor-safe.
 */
interface DrizzleColumnInternals {
	/** SQL column name (may differ from the schema key) */
	name?: string;
	/** Generic JS data type: 'string' | 'number' | 'boolean' | 'date' | … */
	dataType?: string;
	/** Drizzle dialect-specific column class name, e.g. 'PgText', 'SQLiteInteger' */
	columnType?: string;
	/** Whether this column is the primary key */
	primary?: boolean;
	isPrimaryKey?: boolean;
	/** Whether the column has a NOT NULL constraint */
	notNull?: boolean;
	/** Whether the column has a default value */
	hasDefault?: boolean;
	default?: unknown;
}

/**
 * Extracts table schema map from a Drizzle schema object.
 */
export function introspectTables(
	schema: Record<string, any>
): Map<string, { table: Table; info: AdminTableInfo }> {
	const tableMap = new Map<string, { table: Table; info: AdminTableInfo }>();

	for (const [exportName, value] of Object.entries(schema)) {
		if (
			value &&
			typeof value === 'object' &&
			(is(value, Table) ||
				Symbol.for('drizzle:Name') in value ||
				Symbol.for('drizzle:Columns') in value)
		) {
			try {
				const tableName = getTableName(value as Table);
				const rawColumns = getTableColumns(value as Table);

				const columns: AdminColumnInfo[] = [];
				let primaryKey = 'id';

				for (const [colKey, col] of Object.entries(rawColumns)) {
					const colTyped = col as DrizzleColumnInternals;
					const isPk = Boolean(colTyped.primary || colTyped.isPrimaryKey);
					if (isPk) {
						primaryKey = colTyped.name || colKey;
					}

					columns.push({
						name: colTyped.name || colKey,
						dataType: colTyped.dataType || colTyped.columnType || typeof colTyped,
						primaryKey: isPk,
						notNull: Boolean(colTyped.notNull),
						hasDefault: Boolean(colTyped.hasDefault || colTyped.default !== undefined)
					});
				}

				const info: AdminTableInfo = {
					name: tableName,
					exportName,
					columns,
					primaryKey
				};

				// Index both by real SQL tableName and exportName
				tableMap.set(tableName, { table: value as Table, info });
				tableMap.set(exportName, { table: value as Table, info });
			} catch {
				// Skip non-table exports gracefully
			}
		}
	}

	return tableMap;
}

export class DrizzleAdminService {
	private dbSource: any;
	private schema: Record<string, any>;
	private tableMap: Map<string, { table: Table; info: AdminTableInfo }>;
	private uniqueTableNames: string[];

	private get db(): any {
		return typeof this.dbSource === 'function' ? this.dbSource() : this.dbSource;
	}

	constructor(config: DrizzleAdminConfig) {
		this.dbSource = config.db;
		this.schema = config.schema;
		this.tableMap = introspectTables(this.schema);

		const names = new Set<string>();
		for (const { info } of this.tableMap.values()) {
			names.add(info.name);
		}
		this.uniqueTableNames = Array.from(names);
	}

	public getTableList(): string[] {
		return this.uniqueTableNames;
	}

	public getTableEntry(name: string): { table: Table; info: AdminTableInfo } | undefined {
		return this.tableMap.get(name);
	}

	public async getTableData(options: {
		tableName?: string;
		page?: number;
		pageSize?: number;
		search?: string;
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		studioUrl?: string;
	}): Promise<AdminTableData> {
		const targetName = options.tableName || this.uniqueTableNames[0] || '';
		const entry = this.tableMap.get(targetName);

		if (!entry) {
			return {
				tables: this.uniqueTableNames,
				currentTable: targetName,
				records: [],
				columns: [],
				primaryKey: 'id',
				total: 0,
				page: 1,
				pageSize: options.pageSize || 10,
				search: options.search || '',
				studioUrl: options.studioUrl
			};
		}

		const { table, info } = entry;
		const page = Math.max(1, options.page || 1);
		const pageSize = Math.max(1, Math.min(100, options.pageSize || 10));
		const offset = (page - 1) * pageSize;
		const rawColumns = getTableColumns(table);

		let query = this.db.select().from(table);

		// Handle search filter across text columns
		if (options.search && options.search.trim() !== '') {
			const searchTerm = `%${options.search.trim()}%`;
			const textColFilters = [];

			for (const [, col] of Object.entries(rawColumns)) {
				const colTyped = col as DrizzleColumnInternals;
				if (
					colTyped.dataType === 'string' ||
					colTyped.dataType === 'text' ||
					colTyped.columnType?.includes('Text') ||
					colTyped.columnType?.includes('Varchar')
				) {
					try {
						textColFilters.push(like(col, searchTerm));
					} catch {
						// fallback
					}
				}
			}

			if (textColFilters.length > 0) {
				query = query.where(or(...textColFilters));
			}
		}

		// Sorting
		const sortCol =
			options.sortColumn && rawColumns[options.sortColumn]
				? rawColumns[options.sortColumn]
				: rawColumns[info.primaryKey];
		if (sortCol) {
			query = query.orderBy(options.sortDirection === 'asc' ? asc(sortCol) : desc(sortCol));
		}

		// Fetch page records
		let records: Record<string, unknown>[];
		try {
			records = await query.limit(pageSize).offset(offset);
		} catch (err) {
			console.error(`Error querying table ${info.name}:`, err);
			records = [];
		}

		// Fetch total count
		let total: number;
		try {
			const countRes = await this.db.select({ count: sql<number>`count(*)` }).from(table);
			total = Number(countRes[0]?.count ?? 0);
		} catch {
			total = records.length;
		}

		return {
			tables: this.uniqueTableNames,
			currentTable: info.name,
			records,
			columns: info.columns,
			primaryKey: info.primaryKey,
			total,
			page,
			pageSize,
			search: options.search || '',
			studioUrl: options.studioUrl
		};
	}

	public async createRecord(tableName: string, data: Record<string, any>) {
		const entry = this.tableMap.get(tableName);
		if (!entry) throw new Error(`Table ${tableName} not found`);

		const cleanData: Record<string, any> = {};
		for (const col of entry.info.columns) {
			if (data[col.name] !== undefined && data[col.name] !== '') {
				if (col.dataType === 'number' || col.dataType === 'integer') {
					cleanData[col.name] = Number(data[col.name]);
				} else if (col.dataType === 'boolean') {
					cleanData[col.name] = Boolean(data[col.name] === true || data[col.name] === 'true');
				} else if (col.dataType === 'date' || col.name.endsWith('At')) {
					cleanData[col.name] = new Date(data[col.name]);
				} else {
					cleanData[col.name] = data[col.name];
				}
			} else if (col.primaryKey && !data[col.name]) {
				// Auto generate ID if not provided and string primary key
				cleanData[col.name] =
					typeof crypto !== 'undefined' && crypto.randomUUID
						? crypto.randomUUID()
						: `id_${Date.now()}`;
			}
		}

		return (await this.db.insert(entry.table).values(cleanData).returning?.()) ?? cleanData;
	}

	public async updateRecord(
		tableName: string,
		pkValue: string | number,
		data: Record<string, any>
	) {
		const entry = this.tableMap.get(tableName);
		if (!entry) throw new Error(`Table ${tableName} not found`);

		const rawColumns = getTableColumns(entry.table);
		const pkCol = rawColumns[entry.info.primaryKey];
		if (!pkCol) throw new Error(`Primary key column not found for ${tableName}`);

		const cleanData: Record<string, any> = {};
		for (const col of entry.info.columns) {
			if (col.name === entry.info.primaryKey) continue; // do not overwrite PK
			if (data[col.name] !== undefined) {
				if (data[col.name] === null || data[col.name] === '') {
					cleanData[col.name] = null;
				} else if (col.dataType === 'number' || col.dataType === 'integer') {
					cleanData[col.name] = Number(data[col.name]);
				} else if (col.dataType === 'boolean') {
					cleanData[col.name] = Boolean(data[col.name] === true || data[col.name] === 'true');
				} else if (col.dataType === 'date' || col.name.endsWith('At')) {
					cleanData[col.name] = new Date(data[col.name]);
				} else {
					cleanData[col.name] = data[col.name];
				}
			}
		}

		return await this.db.update(entry.table).set(cleanData).where(eq(pkCol, pkValue));
	}

	public async deleteRecord(tableName: string, pkValue: string | number) {
		const entry = this.tableMap.get(tableName);
		if (!entry) throw new Error(`Table ${tableName} not found`);

		const rawColumns = getTableColumns(entry.table);
		const pkCol = rawColumns[entry.info.primaryKey];
		if (!pkCol) throw new Error(`Primary key column not found for ${tableName}`);

		return await this.db.delete(entry.table).where(eq(pkCol, pkValue));
	}
}

/**
 * Approach B: Helper to create standard SvelteKit `load` and `actions` for custom admin routes.
 *
 * Example:
 * ```ts
 * // src/routes/admin/+page.server.ts
 * import { db } from '$lib/server/db';
 * import * as schema from '$lib/server/db/schema-pg';
 * import { createDrizzleAdmin } from 'yaxa-svelte/admin';
 *
 * export const { load, actions } = createDrizzleAdmin({ db, schema });
 * ```
 */
export function createDrizzleAdmin(config: DrizzleAdminConfig) {
	const service = new DrizzleAdminService(config);

	const load = async (event: RequestEvent) => {
		if (config.requireAuth) {
			const isAuthed = await config.requireAuth(event);
			if (!isAuthed) {
				return { status: 401, error: 'Unauthorized' };
			}
		}

		const url = event.url;
		const tableName = url.searchParams.get('table') || service.getTableList()[0] || '';
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const search = url.searchParams.get('search') || '';

		const adminData = await service.getTableData({
			tableName,
			page,
			search,
			studioUrl: config.studioUrl || 'https://local.drizzle.studio'
		});

		return { adminData };
	};

	const actions = {
		create: async (event: RequestEvent) => {
			if (config.requireAuth) {
				const isAuthed = await config.requireAuth(event);
				if (!isAuthed) return { success: false, error: 'Unauthorized' };
			}

			const formData = await event.request.formData();
			const table = formData.get('_table') as string;
			const data: Record<string, any> = {};

			for (const [key, val] of formData.entries()) {
				if (!key.startsWith('_')) {
					data[key] = val;
				}
			}

			try {
				await service.createRecord(table, data);
				return { success: true };
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Create failed';
				return { success: false, error: message };
			}
		},

		update: async (event: RequestEvent) => {
			if (config.requireAuth) {
				const isAuthed = await config.requireAuth(event);
				if (!isAuthed) return { success: false, error: 'Unauthorized' };
			}

			const formData = await event.request.formData();
			const table = formData.get('_table') as string;
			const pk = formData.get('_pk') as string;
			const data: Record<string, any> = {};

			for (const [key, val] of formData.entries()) {
				if (!key.startsWith('_')) {
					data[key] = val;
				}
			}

			try {
				await service.updateRecord(table, pk, data);
				return { success: true };
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Update failed';
				return { success: false, error: message };
			}
		},

		delete: async (event: RequestEvent) => {
			if (config.requireAuth) {
				const isAuthed = await config.requireAuth(event);
				if (!isAuthed) return { success: false, error: 'Unauthorized' };
			}

			const formData = await event.request.formData();
			const table = formData.get('_table') as string;
			const pk = formData.get('_pk') as string;

			try {
				await service.deleteRecord(table, pk);
				return { success: true };
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Delete failed';
				return { success: false, error: message };
			}
		}
	};

	return {
		service,
		load,
		actions,
		getTableData: service.getTableData.bind(service),
		createRecord: service.createRecord.bind(service),
		updateRecord: service.updateRecord.bind(service),
		deleteRecord: service.deleteRecord.bind(service),
		getTables: service.getTableList.bind(service)
	};
}
