import {
	hashQueryKey,
	getQueryClient,
	type QueryClient,
	type QueryKey,
	type QueryStatus,
	type QueryCacheEntry
} from './query-cache.svelte';
import type { ClientResponse, ProblemDetails } from './types';
import type { SSEResult } from '../composables/useSSE.svelte';

export type QueryFn<TData = any> = () => Promise<ClientResponse<TData> | TData>;

export interface CreateQueryOptions<TData = any, TError = ProblemDetails | Error> {
	/**
	 * Explicit cache key or reactive key getter. If omitted, an auto-derived key is used.
	 */
	key?: QueryKey | (() => QueryKey);
	/**
	 * Whether the query should execute automatically (defaults to true).
	 * Can be a boolean or a reactive boolean getter: `() => !!userId`.
	 */
	enabled?: boolean | (() => boolean);
	/**
	 * Initial data (useful for SSR hydration to avoid loading flashes).
	 */
	initialData?: TData;
	/**
	 * Time in milliseconds before data is considered stale (defaults to 0).
	 */
	staleTimeMs?: number;
	/**
	 * Whether to refetch data when the browser window regains focus (defaults to true).
	 */
	refetchOnWindowFocus?: boolean;
	/**
	 * Whether to refetch data when network reconnects (defaults to true).
	 */
	refetchOnReconnect?: boolean;
	/**
	 * Custom query client instance (defaults to global client).
	 */
	client?: QueryClient;
	/**
	 * Server-Sent Events stream or channel for live real-time cache invalidation.
	 */
	subscribeToSse?:
		| string
		| {
				sse?: SSEResult;
				event?: string;
		  };
	/**
	 * Callback on successful fetch.
	 */
	onSuccess?: (data: TData) => void;
	/**
	 * Callback on error.
	 */
	onError?: (error: TError) => void;
}

export interface CreateQueryResult<TData = any, TError = ProblemDetails | Error> {
	readonly data: TData | null;
	readonly error: TError | null;
	readonly status: QueryStatus;
	readonly isLoading: boolean;
	readonly isFetching: boolean;
	readonly isSuccess: boolean;
	readonly isError: boolean;
	readonly updatedAt: number;
	refetch: () => Promise<TData | null>;
	invalidate: () => Promise<void>;
	setData: (updater: TData | ((prev: TData | null) => TData)) => void;
	optimisticUpdate: (updater: (prev: TData | null) => TData) => void;
	destroy: () => void;
}

/**
 * Checks if a response is a Yaxa ClientResponse.
 */
function isClientResponse<T>(res: unknown): res is ClientResponse<T> {
	return (
		typeof res === 'object' &&
		res !== null &&
		'ok' in res &&
		'status' in res &&
		('data' in res || 'error' in res)
	);
}

/**
 * Normalizes query key evaluation.
 */
function resolveKey(keyOrFn?: QueryKey | (() => QueryKey), fallback?: string): QueryKey {
	if (typeof keyOrFn === 'function') {
		return (keyOrFn as () => QueryKey)();
	}
	if (keyOrFn !== undefined) {
		return keyOrFn;
	}
	return fallback || 'default-query-key';
}

/**
 * Idiomatic Svelte 5 Runes Query Composable.
 * Features automatic dependency tracking, request coalescing, stale-while-revalidate,
 * window focus revalidation, and SSE live invalidation.
 */
export function createQuery<TData = any, TError = ProblemDetails | Error>(
	keyOrFn: QueryKey | (() => QueryKey) | QueryFn<TData>,
	fnOrOptions?: QueryFn<TData> | CreateQueryOptions<TData, TError>,
	maybeOptions?: CreateQueryOptions<TData, TError>
): CreateQueryResult<TData, TError> {
	let keyConfig: QueryKey | (() => QueryKey) | undefined;
	let queryFn: QueryFn<TData>;
	let options: CreateQueryOptions<TData, TError>;

	if (typeof keyOrFn === 'function' && fnOrOptions && typeof fnOrOptions === 'function') {
		// createQuery(keyFn, queryFn, options)
		keyConfig = keyOrFn as () => QueryKey;
		queryFn = fnOrOptions as QueryFn<TData>;
		options = maybeOptions || {};
	} else if (typeof keyOrFn === 'function' && (!fnOrOptions || typeof fnOrOptions === 'object')) {
		// createQuery(queryFn, options)
		queryFn = keyOrFn as QueryFn<TData>;
		options = (fnOrOptions as CreateQueryOptions<TData, TError>) || {};
		keyConfig = options.key;
	} else {
		// createQuery(key, queryFn, options)
		keyConfig = keyOrFn as QueryKey;
		queryFn = fnOrOptions as QueryFn<TData>;
		options = maybeOptions || {};
	}

	const client = options.client || getQueryClient();
	const staleTimeMs = options.staleTimeMs ?? 0;
	const refetchOnWindowFocus = options.refetchOnWindowFocus ?? true;
	const refetchOnReconnect = options.refetchOnReconnect ?? true;

	const fallbackKey = queryFn.toString();
	const initialKey = resolveKey(keyConfig, fallbackKey);
	const initialHash = hashQueryKey(initialKey);

	// Pre-seed entry immediately on creation with initialData if provided
	client.getOrCreateEntry<TData, TError>(initialHash, options.initialData);

	function getCurrentKey(): QueryKey {
		return resolveKey(keyConfig, fallbackKey);
	}

	function getCurrentHash(): string {
		return hashQueryKey(getCurrentKey());
	}

	function getIsEnabled(): boolean {
		return typeof options.enabled === 'function'
			? options.enabled()
			: options.enabled !== undefined
				? options.enabled
				: true;
	}

	function getEntry(): QueryCacheEntry<TData, TError> {
		return client.getOrCreateEntry<TData, TError>(getCurrentHash(), options.initialData);
	}

	async function executeFetch(force = false): Promise<TData | null> {
		if (!getIsEnabled()) return null;

		const targetEntry = getEntry();

		// 1. Check Stale Time if not forced
		if (!force && targetEntry.updatedAt > 0) {
			const age = Date.now() - targetEntry.updatedAt;
			if (age < staleTimeMs && targetEntry.data !== null) {
				return targetEntry.data;
			}
		}

		// 2. Request Coalescing: Reuse in-flight Promise if already running
		if (targetEntry.inFlightPromise) {
			return targetEntry.inFlightPromise;
		}

		targetEntry.isFetching = true;
		if (targetEntry.status === 'idle') {
			targetEntry.status = 'loading';
		}

		const promise = (async () => {
			try {
				const result = await queryFn();

				let finalData: TData;
				if (isClientResponse<TData>(result)) {
					if (!result.ok) {
						throw result.error;
					}
					finalData = result.data;
				} else {
					finalData = result as TData;
				}

				targetEntry.data = finalData;
				targetEntry.error = null;
				targetEntry.status = 'success';
				targetEntry.updatedAt = Date.now();

				options.onSuccess?.(finalData);
				return finalData;
			} catch (err: any) {
				targetEntry.error = err as TError;
				targetEntry.status = 'error';
				options.onError?.(err as TError);
				return null;
			} finally {
				targetEntry.isFetching = false;
				targetEntry.inFlightPromise = null;
			}
		})();

		targetEntry.inFlightPromise = promise;
		return promise;
	}

	// Subscriber notification callback
	const subscriber = () => {
		executeFetch(true);
	};

	const initialEntry = getEntry();
	initialEntry.subscribers.add(subscriber);

	// Initial execution if enabled and not already hydrated/fresh
	if (getIsEnabled() && initialEntry.status === 'idle') {
		executeFetch(false);
	}

	// Window listeners
	let cleanupWindowListeners: (() => void) | undefined;
	if (typeof window !== 'undefined') {
		const onFocus = () => {
			if (refetchOnWindowFocus && getIsEnabled()) {
				executeFetch(false);
			}
		};

		const onOnline = () => {
			if (refetchOnReconnect && getIsEnabled()) {
				executeFetch(true);
			}
		};

		window.addEventListener('focus', onFocus);
		window.addEventListener('online', onOnline);

		cleanupWindowListeners = () => {
			window.removeEventListener('focus', onFocus);
			window.removeEventListener('online', onOnline);
		};
	}

	// SSE Live-Invalidation Bridge
	let cleanupSse: (() => void) | undefined;
	if (options.subscribeToSse && typeof options.subscribeToSse === 'object') {
		const sseOption = options.subscribeToSse;
		if (sseOption.sse && sseOption.event) {
			cleanupSse = sseOption.sse.on(sseOption.event, () => {
				executeFetch(true);
			});
		}
	}

	function destroy() {
		const currentEntry = getEntry();
		currentEntry.subscribers.delete(subscriber);
		cleanupWindowListeners?.();
		cleanupSse?.();
	}

	return {
		get data() {
			return getEntry().data;
		},
		get error() {
			return getEntry().error;
		},
		get status() {
			return getEntry().status;
		},
		get isLoading() {
			const e = getEntry();
			return e.status === 'loading' && e.data === null;
		},
		get isFetching() {
			return getEntry().isFetching;
		},
		get isSuccess() {
			return getEntry().status === 'success';
		},
		get isError() {
			return getEntry().status === 'error';
		},
		get updatedAt() {
			return getEntry().updatedAt;
		},
		refetch: () => executeFetch(true),
		invalidate: async () => {
			await getEntry().invalidate();
		},
		setData: (updater) => {
			client.setQueryData(getCurrentKey(), updater);
		},
		optimisticUpdate: (updater) => {
			client.setQueryData(getCurrentKey(), updater);
		},
		destroy
	};
}
