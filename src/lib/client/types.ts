/**
 * Standard RFC 7807 Problem Details representation.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
	type: string;
	title: string;
	status: number;
	detail?: string;
	instance?: string;
	invalidParams?: Array<{ name: string; reason: string }>;
	[key: string]: unknown;
}

/**
 * Standard Schema or validator representation.
 */
export type AnyValidator<T = any> =
	| {
			'~standard': {
				validate: (
					value: unknown
				) =>
					| Promise<{ value?: T; issues?: ReadonlyArray<any> }>
					| { value?: T; issues?: ReadonlyArray<any> };
			};
	  }
	| { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: any } }
	| { parse: (value: unknown) => T }
	| ((value: unknown) => { success: boolean; data?: T; error?: any });

/**
 * Infer output type from a schema validator.
 */
export type InferValidatorOutput<V> = V extends {
	'~standard': { validate: (...args: any[]) => Promise<{ value?: infer T }> | { value?: infer T } };
}
	? T
	: V extends {
				safeParse: (
					...args: any[]
				) => { success: true; data: infer T } | { success: false; error: any };
		  }
		? T
		: V extends { parse: (...args: any[]) => infer T }
			? T
			: V extends (value: unknown) => { success: true; data: infer T }
				? T
				: any;

/**
 * Infer request payload and response types from a yaxaEndpoint handler or config.
 */
export type InferEndpoint<T> = T extends {
	_yaxaConfig: {
		schema?: {
			body?: infer B;
			query?: infer Q;
			params?: infer P;
			headers?: infer H;
		};
		handle: (...args: any[]) => infer R;
	};
}
	? {
			body: [B] extends [never] ? undefined : InferValidatorOutput<B>;
			query: [Q] extends [never] ? undefined : InferValidatorOutput<Q>;
			params: [P] extends [never] ? undefined : InferValidatorOutput<P>;
			headers: [H] extends [never] ? undefined : InferValidatorOutput<H>;
			response: Awaited<R> extends Response ? unknown : Awaited<R>;
		}
	: T extends (...args: any[]) => Promise<infer R> | infer R
		? {
				body: any;
				query: any;
				params: any;
				headers: any;
				response: Awaited<R> extends Response ? unknown : Awaited<R>;
			}
		: {
				body: any;
				query: any;
				params: any;
				headers: any;
				response: any;
			};

/**
 * Strong discriminated union result returned by apiClient calls.
 */
export type ClientResponse<TData> =
	| {
			data: TData;
			error: null;
			response: Response;
			status: number;
			ok: true;
	  }
	| {
			data: null;
			error: ProblemDetails;
			response: Response;
			status: number;
			ok: false;
	  };

/**
 * Client request options passed to an endpoint method.
 */
export interface ClientRequestOptions<
	TBody = unknown,
	TQuery = Record<string, any>,
	TParams = Record<string, any>
> {
	body?: TBody;
	query?: TQuery;
	params?: TParams;
	headers?: HeadersInit;
	signal?: AbortSignal;
	fetch?: typeof fetch;
}

/**
 * Helper to determine if an option object is required based on schema properties.
 */
export type RequiredKeys<T> = {
	[K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K;
}[keyof T];

export type ClientMethodFn<TEndpoint> = TEndpoint extends never
	? (options?: ClientRequestOptions) => Promise<ClientResponse<any>>
	: InferEndpoint<TEndpoint> extends infer Inferred
		? Inferred extends { body: infer B; query: infer Q; params: infer P; response: infer R }
			? (options?: {
					body?: B;
					query?: Q;
					params?: P;
					headers?: HeadersInit;
					signal?: AbortSignal;
					fetch?: typeof fetch;
				}) => Promise<ClientResponse<R>>
			: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;

/**
 * HTTP methods supported by a route definition.
 */
export type RouteMethods<TRoute> = {
	get: TRoute extends { GET: infer H }
		? ClientMethodFn<H>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;
	post: TRoute extends { POST: infer H }
		? ClientMethodFn<H>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;
	put: TRoute extends { PUT: infer H }
		? ClientMethodFn<H>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;
	delete: TRoute extends { DELETE: infer H }
		? ClientMethodFn<H>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;
	patch: TRoute extends { PATCH: infer H }
		? ClientMethodFn<H>
		: (options?: ClientRequestOptions) => Promise<ClientResponse<any>>;
};

/**
 * Callable route proxy supporting path parameter interpolation.
 * e.g. api['/api/projects/[id]']({ id: '123' }).get()
 */
export type RouteProxy<TRoute> = RouteMethods<TRoute> & {
	(params: Record<string, any>): RouteMethods<TRoute>;
};

/**
 * Global configuration options for creating an API client.
 */
export interface ApiClientConfig {
	/**
	 * Base URL prefix for all requests (e.g. 'https://api.example.com' or '').
	 * Defaults to empty string (relative to current origin).
	 */
	baseUrl?: string;

	/**
	 * Custom fetch implementation (e.g. SvelteKit's event.fetch in load functions).
	 * Defaults to globalThis.fetch.
	 */
	fetch?: typeof fetch;

	/**
	 * Default headers to attach to every request.
	 */
	headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);

	/**
	 * Interceptor hook called before every request.
	 */
	onRequest?: (context: { url: string; options: RequestInit }) => void | Promise<void>;

	/**
	 * Interceptor hook called on every response.
	 */
	onResponse?: (context: {
		response: Response;
		data: any;
		error: ProblemDetails | null;
	}) => void | Promise<void>;
}

/**
 * Dynamic Proxy type mapping paths to methods.
 */
export type ApiClient<TRoutes = Record<string, any>> = {
	[K in keyof TRoutes]: RouteProxy<TRoutes[K]>;
} & {
	[path: string]: RouteProxy<any>;
} & {
	get: <TData = any>(
		path: string,
		options?: ClientRequestOptions
	) => Promise<ClientResponse<TData>>;
	post: <TData = any>(
		path: string,
		options?: ClientRequestOptions
	) => Promise<ClientResponse<TData>>;
	put: <TData = any>(
		path: string,
		options?: ClientRequestOptions
	) => Promise<ClientResponse<TData>>;
	delete: <TData = any>(
		path: string,
		options?: ClientRequestOptions
	) => Promise<ClientResponse<TData>>;
	patch: <TData = any>(
		path: string,
		options?: ClientRequestOptions
	) => Promise<ClientResponse<TData>>;
};
