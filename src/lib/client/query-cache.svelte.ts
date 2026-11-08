import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export type QueryKey = string | readonly unknown[];

/**
 * Deterministically serializes a QueryKey into a cache string.
 */
export function hashQueryKey(key: QueryKey): string {
	if (typeof key === 'string') return key;
	try {
		return JSON.stringify(key, (_, val) => {
			if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
				// Sort object keys deterministically
				return Object.keys(val)
					.sort()
					.reduce<Record<string, unknown>>((acc, k) => {
						acc[k] = (val as Record<string, unknown>)[k];
						return acc;
					}, {});
			}
			return val;
		});
	} catch {
		return String(key);
	}
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryCacheEntry<TData = any, TError = any> {
	readonly key: string;
	data: TData | null;
	error: TError | null;
	status: QueryStatus;
	isFetching: boolean;
	updatedAt: number;
	inFlightPromise: Promise<TData | null> | null;
	subscribers: SvelteSet<() => void>;
	invalidate: () => Promise<void>;
}

export interface InvalidateOptions {
	key?: QueryKey;
	exact?: boolean;
}

/**
 * Runes-native Query Client managing cache entries, request coalescing,
 * and real-time invalidation.
 */
export class QueryClient {
	private entries = new SvelteMap<string, QueryCacheEntry<any, any>>();

	/**
	 * Retrieves or initializes a cache entry for a given key string.
	 */
	getOrCreateEntry<TData = any, TError = any>(
		keyHash: string,
		initialData?: TData
	): QueryCacheEntry<TData, TError> {
		const entry = this.entries.get(keyHash) as QueryCacheEntry<TData, TError> | undefined;

		if (!entry) {
			let data = $state<TData | null>(initialData !== undefined ? initialData : null);
			let error = $state<TError | null>(null);
			let status = $state<QueryStatus>(initialData !== undefined ? 'success' : 'idle');
			let isFetching = $state<boolean>(false);
			let updatedAt = $state<number>(initialData !== undefined ? Date.now() : 0);
			const subscribers = new SvelteSet<() => void>();

			const newEntry: QueryCacheEntry<TData, TError> = {
				key: keyHash,
				get data() {
					return data;
				},
				set data(val: TData | null) {
					data = val;
				},
				get error() {
					return error;
				},
				set error(val: TError | null) {
					error = val;
				},
				get status() {
					return status;
				},
				set status(val: QueryStatus) {
					status = val;
				},
				get isFetching() {
					return isFetching;
				},
				set isFetching(val: boolean) {
					isFetching = val;
				},
				get updatedAt() {
					return updatedAt;
				},
				set updatedAt(val: number) {
					updatedAt = val;
				},
				inFlightPromise: null,
				subscribers,
				invalidate: async () => {
					for (const notify of Array.from(subscribers)) {
						try {
							notify();
						} catch {
							// Ignored
						}
					}
				}
			};

			this.entries.set(keyHash, newEntry as QueryCacheEntry<any, any>);
			return newEntry;
		}

		// If entry exists but has no data and initialData was provided, populate it
		if (entry.data === null && initialData !== undefined && entry.status === 'idle') {
			entry.data = initialData;
			entry.status = 'success';
			entry.updatedAt = Date.now();
		}

		return entry;
	}

	/**
	 * Retrieves current data for a query key from the cache.
	 */
	getQueryData<TData = any>(key: QueryKey): TData | null {
		const hash = hashQueryKey(key);
		const entry = this.entries.get(hash);
		return entry ? (entry.data as TData) : null;
	}

	/**
	 * Manually sets or optimistically updates data for a query key.
	 */
	setQueryData<TData = any>(
		key: QueryKey,
		updater: TData | ((previous: TData | null) => TData)
	): TData {
		const hash = hashQueryKey(key);
		const entry = this.getOrCreateEntry<TData>(hash);
		const nextData =
			typeof updater === 'function'
				? (updater as (prev: TData | null) => TData)(entry.data)
				: updater;

		entry.data = nextData;
		entry.error = null;
		entry.status = 'success';
		entry.updatedAt = Date.now();
		return nextData;
	}

	/**
	 * Invalidates queries matching a key or filter, triggering active subscribers to refetch.
	 */
	async invalidateQueries(filter?: InvalidateOptions | QueryKey): Promise<void> {
		if (!filter) {
			for (const entry of this.entries.values()) {
				await entry.invalidate();
			}
			return;
		}

		const isKey = typeof filter === 'string' || Array.isArray(filter);
		const key = isKey ? filter : (filter as InvalidateOptions).key;
		const exact = isKey ? false : Boolean((filter as InvalidateOptions).exact);

		if (!key) {
			for (const entry of this.entries.values()) {
				await entry.invalidate();
			}
			return;
		}

		const targetHash = hashQueryKey(key);

		for (const [hash, entry] of this.entries.entries()) {
			if (exact) {
				if (hash === targetHash) {
					await entry.invalidate();
				}
			} else {
				if (hash.startsWith(targetHash) || hash === targetHash) {
					await entry.invalidate();
				}
			}
		}
	}

	/**
	 * Clears the cache completely.
	 */
	clear(): void {
		this.entries.clear();
	}
}

/**
 * Global default query client singleton.
 */
let globalClient = new QueryClient();

export function getQueryClient(): QueryClient {
	return globalClient;
}

export function setQueryClient(client: QueryClient): void {
	globalClient = client;
}
