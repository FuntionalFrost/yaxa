import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { isProblemDetails, problemResponse } from './problem';
import { validateData } from './validate';
import type { YaxaEndpointConfig, YaxaEndpointContext, InferValidatorOutput } from './types';

/**
 * Parses URLSearchParams into a plain key-value object.
 * Duplicate keys are parsed into arrays.
 */
function parseSearchParamsToObject(searchParams: URLSearchParams): Record<string, any> {
	const result: Record<string, any> = {};
	for (const key of searchParams.keys()) {
		const allValues = searchParams.getAll(key);
		if (allValues.length > 1) {
			result[key] = allValues;
		} else if (allValues.length === 1) {
			result[key] = allValues[0];
		}
	}
	return result;
}

/**
 * Safely parses request body based on Content-Type.
 */
async function parseRequestBody(
	request: Request
): Promise<{ ok: true; body: any } | { ok: false; response: Response }> {
	const contentType = request.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		try {
			const text = await request.text();
			if (!text.trim()) {
				return { ok: true, body: undefined };
			}
			return { ok: true, body: JSON.parse(text) };
		} catch {
			return {
				ok: false,
				response: problemResponse({
					status: 400,
					title: 'Bad Request',
					detail: 'Malformed JSON payload in request body.',
					type: 'https://yaxa.dev/errors/malformed-json'
				})
			};
		}
	}

	if (
		contentType.includes('application/x-www-form-urlencoded') ||
		contentType.includes('multipart/form-data')
	) {
		try {
			const formData = await request.formData();
			const formObj: Record<string, any> = {};
			formData.forEach((val, key) => {
				if (key in formObj) {
					if (Array.isArray(formObj[key])) {
						formObj[key].push(val);
					} else {
						formObj[key] = [formObj[key], val];
					}
				} else {
					formObj[key] = val;
				}
			});
			return { ok: true, body: formObj };
		} catch {
			return {
				ok: false,
				response: problemResponse({
					status: 400,
					title: 'Bad Request',
					detail: 'Malformed form-data in request body.'
				})
			};
		}
	}

	// Plain text or other payloads
	try {
		const text = await request.text();
		return { ok: true, body: text ? text : undefined };
	} catch {
		return { ok: true, body: undefined };
	}
}

/**
 * Wraps SvelteKit +server.ts request handlers into an opinionated,
 * declarative, type-safe execution pipeline with Guards, Multi-Engine
 * Validation, and RFC 7807 Problem Details.
 */
export function yaxaEndpoint<
	TBodySchema = any,
	TQuerySchema = any,
	TParamsSchema = any,
	THeadersSchema = any,
	TResult = any
>(
	config: YaxaEndpointConfig<TBodySchema, TQuerySchema, TParamsSchema, THeadersSchema, TResult>
): RequestHandler & { _yaxaConfig: typeof config } {
	const handler: RequestHandler = async (event: RequestEvent) => {
		const { request, url, locals, params } = event;

		// 1. Execute Declarative Guards in Series
		if (config.guards && config.guards.length > 0) {
			for (const guard of config.guards) {
				const result = await guard(event);

				if (result instanceof Response) {
					return result;
				}

				if (isProblemDetails(result)) {
					return problemResponse(result);
				}

				if (result === false) {
					return problemResponse({
						status: 403,
						title: 'Forbidden',
						detail: 'Access denied by endpoint guard.'
					});
				}
			}
		}

		// 2. Parse Raw Inputs
		const rawParams = params || {};
		const rawQuery = parseSearchParamsToObject(url.searchParams);
		const rawHeaders: Record<string, string> = {};
		request.headers.forEach((val, key) => {
			rawHeaders[key.toLowerCase()] = val;
		});

		let rawBody: any;
		if (request.method !== 'GET' && request.method !== 'HEAD') {
			const parsed = await parseRequestBody(request);
			if (!parsed.ok) {
				return parsed.response;
			}
			rawBody = parsed.body;
		}

		// 3. Multi-Engine Schema Validation (Standard Schema, Zod, etc.)
		const allInvalidParams: Array<{ name: string; reason: string }> = [];
		let validatedBody: any = rawBody;
		let validatedQuery: any = rawQuery;
		let validatedParams: any = rawParams;
		let validatedHeaders: any = rawHeaders;

		if (config.schema) {
			if (config.schema.params) {
				const res = await validateData(config.schema.params, rawParams, 'params');
				if (res.success) validatedParams = res.data;
				else allInvalidParams.push(...res.invalidParams);
			}

			if (config.schema.query) {
				const res = await validateData(config.schema.query, rawQuery, 'query');
				if (res.success) validatedQuery = res.data;
				else allInvalidParams.push(...res.invalidParams);
			}

			if (config.schema.headers) {
				const res = await validateData(config.schema.headers, rawHeaders, 'headers');
				if (res.success) validatedHeaders = res.data;
				else allInvalidParams.push(...res.invalidParams);
			}

			if (config.schema.body && request.method !== 'GET' && request.method !== 'HEAD') {
				const res = await validateData(config.schema.body, rawBody, 'body');
				if (res.success) validatedBody = res.data;
				else allInvalidParams.push(...res.invalidParams);
			}
		}

		if (allInvalidParams.length > 0) {
			return problemResponse({
				status: 422,
				title: 'Unprocessable Entity',
				detail: `Validation failed for ${allInvalidParams.length} parameter(s).`,
				type: 'https://yaxa.dev/errors/validation-failed',
				invalidParams: allInvalidParams
			});
		}

		// 4. Construct Rich Endpoint Context
		const context: YaxaEndpointContext<
			InferValidatorOutput<TBodySchema>,
			InferValidatorOutput<TQuerySchema>,
			InferValidatorOutput<TParamsSchema>,
			InferValidatorOutput<THeadersSchema>
		> = {
			event,
			request,
			url,
			locals,
			body: validatedBody as InferValidatorOutput<TBodySchema>,
			query: validatedQuery as InferValidatorOutput<TQuerySchema>,
			params: validatedParams as InferValidatorOutput<TParamsSchema>,
			headers: validatedHeaders as InferValidatorOutput<THeadersSchema>,
			user: (locals as any)?.user || null,
			session: (locals as any)?.session || null,
			orgId: (locals as any)?.orgId || null
		};

		// 5. Execute Handler wrapped in Interceptors & Error Boundary
		const runHandler = async (): Promise<Response> => {
			const defaultStatus = config.status || 200;

			let result: any;
			try {
				result = await config.handle(context);
			} catch (err: any) {
				// Allow SvelteKit redirects and HTTP errors to bubble up
				if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
					throw err;
				}

				if (err instanceof Response) {
					return err;
				}

				console.error('[Yaxa Endpoint Error]', err);

				return problemResponse({
					status: 500,
					title: 'Internal Server Error',
					detail: 'An unexpected internal error occurred.',
					type: 'https://yaxa.dev/errors/internal-server-error'
				});
			}

			// 6. Response Auto-Serialization
			if (result instanceof Response) {
				return result;
			}

			if (result === undefined || result === null) {
				return new Response(null, { status: 204 });
			}

			if (typeof result === 'string') {
				return new Response(result, {
					status: defaultStatus,
					headers: { 'content-type': 'text/plain; charset=utf-8' }
				});
			}

			return Response.json(result, { status: defaultStatus });
		};

		// 7. Apply Interceptors (if any)
		if (config.interceptors && config.interceptors.length > 0) {
			const pipeline = config.interceptors.reduceRight<() => Promise<Response>>(
				(next, interceptor) => () => interceptor(context, next),
				runHandler
			);
			return pipeline();
		}

		return runHandler();
	};

	// Attach configuration metadata for runtime reflection and OpenAPI generation (Milestone 3)
	(handler as any)._yaxaConfig = config;

	return handler as RequestHandler & { _yaxaConfig: typeof config };
}

export * from './types';
export * from './problem';
export * from './guards';
export * from './validate';
