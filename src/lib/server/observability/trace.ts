import type { TraceContext } from './types';

const TRACEPARENT_REGEX = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i;

/**
 * Generates random hex string of specified byte length (1 byte = 2 hex chars)
 * using Web Crypto API (compatible with Node, Edge, Cloudflare Workers, Bun).
 */
export function randomHex(bytes: number): string {
	const array = new Uint8Array(bytes);
	if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
		globalThis.crypto.getRandomValues(array);
	} else {
		for (let i = 0; i < bytes; i++) {
			array[i] = Math.floor(Math.random() * 256);
		}
	}
	let hex = '';
	for (let i = 0; i < array.length; i++) {
		hex += array[i].toString(16).padStart(2, '0');
	}
	return hex;
}

/**
 * Parses a W3C traceparent header (`00-<traceId>-<spanId>-<flags>`).
 * Returns null if invalid or all-zero IDs.
 */
export function parseTraceparent(header: string | null | undefined): {
	traceId: string;
	parentSpanId: string;
	traceFlags: string;
} | null {
	if (!header) return null;
	const match = TRACEPARENT_REGEX.exec(header.trim());
	if (!match) return null;

	const traceId = match[1].toLowerCase();
	const parentSpanId = match[2].toLowerCase();
	const traceFlags = match[3].toLowerCase();

	// W3C spec forbids all-zero traceId or spanId
	if (/^0+$/.test(traceId) || /^0+$/.test(parentSpanId)) {
		return null;
	}

	return {
		traceId,
		parentSpanId,
		traceFlags
	};
}

/**
 * Resolves or generates a full W3C TraceContext and correlation requestId.
 */
export function resolveTraceContext(
	incomingTraceparent?: string | null,
	incomingRequestId?: string | null
): TraceContext {
	const parsed = parseTraceparent(incomingTraceparent);
	const traceId = parsed ? parsed.traceId : randomHex(16);
	const parentSpanId = parsed ? parsed.parentSpanId : null;
	const traceFlags = parsed ? parsed.traceFlags : '01';
	const spanId = randomHex(8);

	const sanitizedReqId = incomingRequestId?.trim();
	const requestId =
		sanitizedReqId && sanitizedReqId.length > 0 && sanitizedReqId.length <= 128
			? sanitizedReqId
			: `req_${randomHex(6)}`;

	return {
		requestId,
		traceId,
		spanId,
		parentSpanId,
		traceFlags,
		traceparent: `00-${traceId}-${spanId}-${traceFlags}`
	};
}
