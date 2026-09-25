import { SvelteURL } from 'svelte/reactivity';

export interface UseDataTableOptions<T = any> {
	initialPage?: number;
	initialPageSize?: number;
	initialSortKey?: string;
	initialSortOrder?: 'asc' | 'desc';
	initialSearch?: string;
	initialSelected?: T[];
	syncUrl?: boolean;
	debounceMs?: number;
	onchange?: (params: {
		page: number;
		pageSize: number;
		sortKey?: string;
		sortOrder: 'asc' | 'desc';
		search: string;
	}) => void;
}

/**
 * Creates a reactive Svelte 5 Rune composable for managing DataTable state with optional URL synchronization.
 */
export function useDataTable<T = any>(options: UseDataTableOptions<T> = {}) {
	let page = $state(options.initialPage ?? 1);
	let pageSize = $state(options.initialPageSize ?? 10);
	let sortKey = $state<string | undefined>(options.initialSortKey);
	let sortOrder = $state<'asc' | 'desc'>(options.initialSortOrder ?? 'asc');
	let search = $state(options.initialSearch ?? '');
	let selected = $state<T[]>(options.initialSelected ?? []);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function syncToUrl() {
		if (!options.syncUrl || typeof window === 'undefined') return;

		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new SvelteURL(window.location.href);
			if (page > 1) url.searchParams.set('page', String(page));
			else url.searchParams.delete('page');

			if (pageSize !== (options.initialPageSize ?? 10)) {
				url.searchParams.set('pageSize', String(pageSize));
			} else {
				url.searchParams.delete('pageSize');
			}

			if (sortKey) {
				url.searchParams.set('sort', sortKey);
				url.searchParams.set('order', sortOrder);
			} else {
				url.searchParams.delete('sort');
				url.searchParams.delete('order');
			}

			if (search.trim()) {
				url.searchParams.set('q', search.trim());
			} else {
				url.searchParams.delete('q');
			}

			window.history.replaceState({}, '', url.toString());
			options.onchange?.({
				page,
				pageSize,
				sortKey,
				sortOrder,
				search
			});
		}, options.debounceMs ?? 150);
	}

	function setPage(p: number) {
		page = Math.max(1, p);
		syncToUrl();
	}

	function setPageSize(s: number) {
		pageSize = s;
		page = 1;
		syncToUrl();
	}

	function setSort(key: string) {
		if (sortKey === key) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortOrder = 'asc';
		}
		syncToUrl();
	}

	function setSearch(q: string) {
		search = q;
		page = 1;
		syncToUrl();
	}

	function reset() {
		page = options.initialPage ?? 1;
		pageSize = options.initialPageSize ?? 10;
		sortKey = options.initialSortKey;
		sortOrder = options.initialSortOrder ?? 'asc';
		search = options.initialSearch ?? '';
		selected = options.initialSelected ?? [];
		syncToUrl();
	}

	return {
		get page() {
			return page;
		},
		set page(val) {
			setPage(val);
		},
		get pageSize() {
			return pageSize;
		},
		set pageSize(val) {
			setPageSize(val);
		},
		get sortKey() {
			return sortKey;
		},
		set sortKey(val) {
			sortKey = val;
		},
		get sortOrder() {
			return sortOrder;
		},
		set sortOrder(val) {
			sortOrder = val;
		},
		get search() {
			return search;
		},
		set search(val) {
			setSearch(val);
		},
		get selected() {
			return selected;
		},
		set selected(val) {
			selected = val;
		},
		setPage,
		setPageSize,
		setSort,
		setSearch,
		reset
	};
}

export type DataTableStore = ReturnType<typeof useDataTable>;
