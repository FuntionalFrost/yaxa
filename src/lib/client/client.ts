import type {
	ApiClient,
	ApiClientConfig,
	ClientRequestOptions,
	ClientResponse,
	ProblemDetails
} from './types';

/**
 * Serializes a query object into a URL search string.
 * Handles arrays, booleans, numbers, and strings while ignoring undefined/null.
 */
export function serializeQueryParams(query?: Record<string, any>): string {
	if (!query || typeof query !== 'object') return '';

	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null) continue;

		if (Array.isArray(value)) {
			for (const item of value) {
				if (item !== undefined && item !== null) {
					searchParams.append(key, String(item));
				}
			}
		} else {
			searchParams.set(key, String(value));
		}
	}

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : '';
}

/**
 * Interpolates dynamic path segments (e.g. `[id]`, `[...slug]`, or `:id`).
 */
export function interpolatePath(path: string, params?: Record<string, any>): string {
	if (!params || typeof params !== 'object') return path;

	let result = path;

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue;
		const encoded = encodeURIComponent(String(value));

		// SvelteKit bracket syntax: [id] and [...rest]
		result = result.replace(new RegExp(`\\[\\.\\.\\.${key}\\]`, 'g'), String(value));
		result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), encoded);

		// Colon syntax: :id
		result = result.replace(new RegExp(`:${key}\\b`, 'g'), encoded);
	}

	return result;
}

/**
 * Core HTTP execution pipeline for apiClient.
 */
async function executeRequest<TData = any>(
	config: ApiClientConfig,
	method: string,
	rawPath: string,
	options?: ClientRequestOptions
): Promise<ClientResponse<TData>> {
	const params = options?.params;
	const interpolated = interpolatePath(rawPath, params);
	const queryString = serializeQueryParams(options?.query);

	const baseUrl = config.baseUrl ? config.baseUrl.replace(/\/+$/, '') : '';
	const cleanPath = interpolated.startsWith('/') ? interpolated : `/${interpolated}`;
	const fullUrl = `${baseUrl}${cleanPath}${queryString}`;

	// Resolve default headers
	let defaultHeaders: Record<string, string> = {};
	if (typeof config.headers === 'function') {
		const resolved = await config.headers();
		defaultHeaders = new Headers(resolved) as any;
	} else if (config.headers) {
		defaultHeaders = new Headers(config.headers) as any;
	}

	const headers = new Headers(defaultHeaders);
	if (options?.headers) {
		const reqHeaders = new Headers(options.headers);
		reqHeaders.forEach((val, key) => headers.set(key, val));
	}

	// Body serialization
	let bodyPayload: BodyInit | undefined;
	if (options?.body !== undefined && options?.body !== null) {
		const rawBody = options.body;
		if (
			typeof rawBody === 'string' ||
			rawBody instanceof FormData ||
			rawBody instanceof Blob ||
			rawBody instanceof URLSearchParams ||
			rawBody instanceof ArrayBuffer
		) {
			bodyPayload = rawBody as BodyInit;
		} else {
			if (!headers.has('content-type')) {
				headers.set('content-type', 'application/json');
			}
			bodyPayload = JSON.stringify(rawBody);
		}
	}

	const fetchFn = options?.fetch || config.fetch || globalThis.fetch;
	const requestInit: RequestInit = {
		method: method.toUpperCase(),
		headers,
		body: bodyPayload,
		signal: options?.signal
	};

	if (config.onRequest) {
		await config.onRequest({ url: fullUrl, options: requestInit });
	}

	let response: Response;
	try {
		response = await fetchFn(fullUrl, requestInit);
	} catch (err: any) {
		const networkProblem: ProblemDetails = {
			type: 'https://yaxa.dev/errors/network-error',
			title: 'Network Request Failed',
			status: 0,
			detail: err?.message || 'Could not connect to server.'
		};

		const fallbackResponse =
			typeof Response.error === 'function'
				? Response.error()
				: new Response(null, { status: 503, statusText: 'Network Error' });

		return {
			data: null,
			error: networkProblem,
			response: fallbackResponse,
			status: 0,
			ok: false
		};
	}

	// Parse response payload
	let parsedData: any = null;
	const contentType = response.headers.get('content-type') || '';

	if (response.status !== 204) {
		if (contentType.includes('application/json') || contentType.includes('problem+json')) {
			try {
				parsedData = await response.json();
			} catch {
				parsedData = null;
			}
		} else {
			try {
				parsedData = await response.text();
			} catch {
				parsedData = null;
			}
		}
	}

	if (response.ok) {
		if (config.onResponse) {
			await config.onResponse({ response, data: parsedData, error: null });
		}
		return {
			data: parsedData as TData,
			error: null,
			response,
			status: response.status,
			ok: true
		};
	}

	// Format RFC 7807 problem details
	let errorProblem: ProblemDetails;
	if (
		parsedData &&
		typeof parsedData === 'object' &&
		(parsedData.title || parsedData.type || parsedData.status)
	) {
		errorProblem = {
			type: parsedData.type || `https://yaxa.dev/errors/http-${response.status}`,
			title: parsedData.title || response.statusText || 'Request Error',
			status: parsedData.status || response.status,
			detail: parsedData.detail,
			instance: parsedData.instance,
			invalidParams: parsedData.invalidParams,
			...parsedData
		};
	} else {
		errorProblem = {
			type: `https://yaxa.dev/errors/http-${response.status}`,
			title: response.statusText || 'HTTP Error',
			status: response.status,
			detail: typeof parsedData === 'string' ? parsedData : undefined
		};
	}

	if (config.onResponse) {
		await config.onResponse({ response, data: null, error: errorProblem });
	}

	return {
		data: null,
		error: errorProblem,
		response,
		status: response.status,
		ok: false
	};
}

/**
 * Creates a route-level proxy that exposes HTTP method callers (`get`, `post`, etc.).
 */
function createRouteProxy(config: ApiClientConfig, path: string) {
	const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

	const routeHandler: Record<string, any> = {};

	for (const method of methods) {
		routeHandler[method] = (options?: ClientRequestOptions) =>
			executeRequest(config, method, path, options);
	}

	// Allows calling the route proxy directly as a function to interpolate params:
	// e.g. api['/api/projects/[id]']({ id: '123' }).get()
	const callableProxy = Object.assign((params: Record<string, any>) => {
		const interpolated = interpolatePath(path, params);
		return createRouteProxy(config, interpolated);
	}, routeHandler);

	return callableProxy;
}

/**
 * Creates an end-to-end type-safe API client for yaxaEndpoint routes.
 *
 * @example
 * ```ts
 * import { createApiClient } from 'yaxa-svelte';
 * import type { AppApi } from '$lib/api';
 *
 * const api = createApiClient<AppApi>();
 *
 * // Strong autocompletion and type-safety
 * const { data, error } = await api['/api/projects'].post({
 *   body: { name: 'Apollo SaaS' }
 * });
 * ```
 */
export function createApiClient<TRoutes = Record<string, any>>(
	config: ApiClientConfig = {}
): ApiClient<TRoutes> {
	const rootTarget: Record<string, any> = {
		get: (path: string, options?: ClientRequestOptions) =>
			executeRequest(config, 'get', path, options),
		post: (path: string, options?: ClientRequestOptions) =>
			executeRequest(config, 'post', path, options),
		put: (path: string, options?: ClientRequestOptions) =>
			executeRequest(config, 'put', path, options),
		delete: (path: string, options?: ClientRequestOptions) =>
			executeRequest(config, 'delete', path, options),
		patch: (path: string, options?: ClientRequestOptions) =>
			executeRequest(config, 'patch', path, options)
	};

	return new Proxy(rootTarget, {
		get(target, prop, receiver) {
			if (typeof prop === 'string') {
				if (prop in target) {
					return Reflect.get(target, prop, receiver);
				}
				// Route path access, e.g. api['/api/projects']
				return createRouteProxy(config, prop);
			}
			return Reflect.get(target, prop, receiver);
		}
	}) as ApiClient<TRoutes>;
}
