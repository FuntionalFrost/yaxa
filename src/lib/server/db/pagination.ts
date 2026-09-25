export interface DataTableQueryParams {
	page: number;
	pageSize: number;
	sortKey?: string;
	sortOrder?: 'asc' | 'desc';
	searchQuery?: string;
	limit: number;
	offset: number;
}

export interface DataTableQueryOptions {
	defaultPage?: number;
	defaultPageSize?: number;
	maxPageSize?: number;
	defaultSortKey?: string;
	defaultSortOrder?: 'asc' | 'desc';
}

export interface DataTableResponse<T = any> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

/**
 * Parses URL search parameters for server-side pagination, sorting, and search.
 */
export function parseDataTableQuery(
	url: URL | { searchParams: URLSearchParams },
	options: DataTableQueryOptions = {}
): DataTableQueryParams {
	const params = 'searchParams' in url ? url.searchParams : new URLSearchParams();
	const defaultPage = options.defaultPage ?? 1;
	const defaultPageSize = options.defaultPageSize ?? 10;
	const maxPageSize = options.maxPageSize ?? 100;

	const rawPage = parseInt(params.get('page') || String(defaultPage), 10);
	const rawPageSize = parseInt(
		params.get('pageSize') || params.get('limit') || String(defaultPageSize),
		10
	);

	const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
	const pageSize =
		isNaN(rawPageSize) || rawPageSize < 1 ? defaultPageSize : Math.min(rawPageSize, maxPageSize);

	const sortKey =
		params.get('sort') || params.get('sortKey') || options.defaultSortKey || undefined;
	const rawOrder =
		params.get('order') || params.get('sortOrder') || options.defaultSortOrder || 'asc';
	const sortOrder: 'asc' | 'desc' = rawOrder === 'desc' ? 'desc' : 'asc';
	const searchQuery = params.get('q') || params.get('search') || undefined;

	const limit = pageSize;
	const offset = (page - 1) * pageSize;

	return {
		page,
		pageSize,
		sortKey,
		sortOrder,
		searchQuery: searchQuery?.trim() || undefined,
		limit,
		offset
	};
}

/**
 * Standardizes server-side DataTable response payload.
 */
export function createDataTableResponse<T>(
	data: T[],
	total: number,
	query: { page: number; pageSize: number }
): DataTableResponse<T> {
	return {
		data,
		total,
		page: query.page,
		pageSize: query.pageSize,
		pageCount: Math.max(1, Math.ceil(total / Math.max(1, query.pageSize)))
	};
}
