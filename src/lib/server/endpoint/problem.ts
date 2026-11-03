import type { ProblemDetails } from './types';

/**
 * Standard HTTP error status code to human-readable RFC 7807 titles.
 */
const STATUS_TITLES: Record<number, string> = {
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	409: 'Conflict',
	422: 'Unprocessable Entity',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout'
};

export interface CreateProblemOptions {
	status: number;
	title?: string;
	detail?: string;
	type?: string;
	instance?: string;
	invalidParams?: Array<{ name: string; reason: string }>;
	headers?: HeadersInit;
	[key: string]: unknown;
}

/**
 * Creates an RFC 7807 Problem Details object.
 */
export function createProblemDetails(options: CreateProblemOptions): ProblemDetails {
	const status = options.status || 500;
	const title = options.title || STATUS_TITLES[status] || 'Internal Error';
	const type = options.type || `https://httpstatuses.com/${status}`;

	const problem: ProblemDetails = {
		type,
		title,
		status
	};

	for (const [key, value] of Object.entries(options)) {
		if (key !== 'headers' && key !== 'status' && key !== 'title' && key !== 'type') {
			problem[key] = value;
		}
	}

	return problem;
}

/**
 * Creates a standard SvelteKit Response formatted with application/problem+json.
 */
export function problemResponse(options: CreateProblemOptions): Response {
	const status = options.status || 500;
	const problem = createProblemDetails(options);

	const customHeaders = new Headers(options.headers || {});
	if (!customHeaders.has('content-type')) {
		customHeaders.set('content-type', 'application/problem+json; charset=utf-8');
	}

	return new Response(JSON.stringify(problem), {
		status,
		headers: customHeaders
	});
}

/**
 * Type-guard checking if an object conforms to ProblemDetails.
 */
export function isProblemDetails(value: unknown): value is ProblemDetails {
	return (
		typeof value === 'object' &&
		value !== null &&
		'status' in value &&
		typeof (value as any).status === 'number' &&
		'title' in value &&
		'type' in value
	);
}
