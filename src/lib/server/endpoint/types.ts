import type { RequestEvent } from '@sveltejs/kit';
import type { YaxaLogger, YaxaLoggerOptions, ServerTimingTracker } from '../observability/types';

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
 * Generic guard return value.
 * - Return `Response` or `ProblemDetails`: Immediately stops pipeline and sends HTTP response.
 * - Return `void` or `undefined` or `true`: Guard passed; continues to next step.
 */
export type GuardResult = Response | ProblemDetails | void | undefined | boolean;

/**
 * Guard function signature.
 */
export type Guard = (event: RequestEvent) => Promise<GuardResult> | GuardResult;

/**
 * Standard Schema or validator representation.
 * Supports:
 * 1. Standard Schema v1 (`~standard` property, e.g. Zod v3.24+, Zod v4, Valibot, ArkType)
 * 2. `.safeParse()` (Zod, Yup, etc.)
 * 3. Functional validator: `(data: unknown) => { success: boolean; data?: T; error?: any }`
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
 * Infer output type from a validator.
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

export interface YaxaEndpointSchemaConfig<
	TBody = any,
	TQuery = any,
	TParams = any,
	THeaders = any
> {
	body?: TBody;
	query?: TQuery;
	params?: TParams;
	headers?: THeaders;
}

/**
 * Rich context passed to business handler in yaxaEndpoint.
 */
export interface YaxaEndpointContext<TBody = any, TQuery = any, TParams = any, THeaders = any> {
	event: RequestEvent;
	request: Request;
	url: URL;
	locals: App.Locals;
	body: TBody;
	query: TQuery;
	params: TParams;
	headers: THeaders;
	user: any;
	session: any;
	orgId: string | null;
	/**
	 * Request correlation ID (from incoming `x-request-id` or auto-generated `req_...`).
	 */
	requestId: string;
	/**
	 * W3C Distributed Trace ID (32-hex characters).
	 */
	traceId: string;
	/**
	 * Request-scoped structured logger pre-bound with traceId, requestId, userId, and orgId.
	 */
	logger: YaxaLogger;
	/**
	 * Request-scoped Server-Timing metric tracker (`timing.start()`, `timing.measure()`).
	 */
	timing: ServerTimingTracker;
}

/**
 * Interceptor function wrapping handler execution.
 */
export type YaxaInterceptor = (
	context: YaxaEndpointContext,
	next: () => Promise<Response>
) => Promise<Response>;

/**
 * Endpoint configuration passed to yaxaEndpoint().
 */
export interface YaxaEndpointConfig<
	TBodySchema = any,
	TQuerySchema = any,
	TParamsSchema = any,
	THeadersSchema = any,
	TResult = any
> {
	/**
	 * Sequence of declarative guards executed before handler body.
	 * (e.g. requireAuth(), requireRole(['admin']), rateLimit({ points: 10 }))
	 */
	guards?: Guard[];

	/**
	 * Schemas for input payload validation (body, query string, path params, headers).
	 */
	schema?: YaxaEndpointSchemaConfig<TBodySchema, TQuerySchema, TParamsSchema, THeadersSchema>;

	/**
	 * Optional status code to return for successful non-Response return values.
	 * Defaults to 200 (or 201 for POST when returning created object if desired).
	 */
	status?: number;

	/**
	 * Optional response interceptors (e.g. audit logging, timing headers).
	 */
	interceptors?: YaxaInterceptor[];

	/**
	 * Optional structured logger configuration for this endpoint.
	 */
	loggerOptions?: YaxaLoggerOptions;

	/**
	 * OpenAPI metadata annotations (used by Milestone 3 auto-docs).
	 */
	summary?: string;
	description?: string;
	tags?: string[];
	deprecated?: boolean;
	operationId?: string;
	path?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
	responses?: Record<number, { description: string; schema?: any }>;

	/**
	 * Core business logic handler.
	 */
	handle: (
		context: YaxaEndpointContext<
			InferValidatorOutput<TBodySchema>,
			InferValidatorOutput<TQuerySchema>,
			InferValidatorOutput<TParamsSchema>,
			InferValidatorOutput<THeadersSchema>
		>
	) => Promise<TResult> | TResult;
}
