import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { problemResponse } from '../endpoint/problem';
import { validateData } from '../endpoint/validate';
import type { AnyValidator, InferValidatorOutput } from '../endpoint/types';

export interface VerifyWebhookSignatureOptions {
	/**
	 * Raw request body string (UTF-8) to verify.
	 */
	payload: string;
	/**
	 * Value of the incoming signature header.
	 * Supports:
	 * - Raw hex HMAC-SHA256 (`<hex>`)
	 * - Prefixed hex (`sha256=<hex>` or `v1=<hex>`)
	 * - Timestamped Stripe/Polar format (`t=1700000000,v1=<hex>`)
	 */
	signatureHeader: string | null | undefined;
	/**
	 * Webhook signing secret.
	 */
	secret: string;
	/**
	 * Optional external timestamp header (e.g. Standard Webhooks `webhook-timestamp` in seconds).
	 */
	timestampHeader?: string | null;
	/**
	 * Maximum allowed age of a timestamped webhook in seconds to prevent replay attacks.
	 * Set to `0` to disable timestamp tolerance checks.
	 * @default 300
	 */
	toleranceSeconds?: number;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
	const cleanA = a.trim().toLowerCase();
	const cleanB = b.trim().toLowerCase();
	if (cleanA.length !== cleanB.length || cleanA.length === 0) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < cleanA.length; i++) {
		diff |= cleanA.charCodeAt(i) ^ cleanB.charCodeAt(i);
	}
	return diff === 0;
}

/**
 * Computes HMAC-SHA256 hex digest using standard Web Crypto API (`crypto.subtle`).
 */
export async function computeHmacSha256Hex(secret: string, message: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
	const bytes = new Uint8Array(signatureBuffer);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Verifies an incoming webhook HMAC-SHA256 signature using Web Crypto API.
 * Compatible with Cloudflare Workers, Vercel Edge, Deno, Bun, and Node.js.
 */
export async function verifyWebhookSignature(
	options: VerifyWebhookSignatureOptions
): Promise<{ valid: boolean; reason?: string }> {
	const { payload, signatureHeader, secret, timestampHeader, toleranceSeconds = 300 } = options;

	if (!signatureHeader || !signatureHeader.trim()) {
		return { valid: false, reason: 'Missing webhook signature header.' };
	}

	if (!secret) {
		return { valid: false, reason: 'Missing webhook signing secret.' };
	}

	const header = signatureHeader.trim();

	// Case 1: Stripe / Polar timestamped signature format: `t=1700000000,v1=abcdef...`
	if (header.includes('t=') && header.includes('v1=')) {
		const parts = header.split(',').map((p) => p.trim());
		const tPart = parts.find((p) => p.startsWith('t='));
		const v1Parts = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));

		const timestampStr = tPart?.slice(2);
		const timestampSec = timestampStr ? Number(timestampStr) : NaN;
		if (!timestampStr || Number.isNaN(timestampSec)) {
			return { valid: false, reason: 'Invalid webhook signature timestamp.' };
		}

		if (toleranceSeconds > 0) {
			const nowSec = Math.floor(Date.now() / 1000);
			if (Math.abs(nowSec - timestampSec) > toleranceSeconds) {
				return { valid: false, reason: 'Webhook timestamp outside allowed tolerance window.' };
			}
		}

		const signedPayload = `${timestampStr}.${payload}`;
		const expectedHex = await computeHmacSha256Hex(secret, signedPayload);
		const matched = v1Parts.some((candidate) => timingSafeEqualHex(candidate, expectedHex));

		return matched ? { valid: true } : { valid: false, reason: 'Webhook HMAC signature mismatch.' };
	}

	// Optional external timestamp check if `timestampHeader` is supplied
	if (timestampHeader) {
		const tsSec = Number(timestampHeader);
		if (Number.isNaN(tsSec)) {
			return { valid: false, reason: 'Invalid webhook-timestamp header.' };
		}
		if (toleranceSeconds > 0) {
			const nowSec = Math.floor(Date.now() / 1000);
			if (Math.abs(nowSec - tsSec) > toleranceSeconds) {
				return { valid: false, reason: 'Webhook timestamp outside allowed tolerance window.' };
			}
		}
	}

	// Case 2: Standard `sha256=<hex>`, `v1=<hex>`, or raw `<hex>`
	const candidateHex = header.replace(/^(?:sha256=|v1=)/i, '');
	const messageToSign = timestampHeader ? `${timestampHeader}.${payload}` : payload;
	const expectedHex = await computeHmacSha256Hex(secret, messageToSign);

	if (!timingSafeEqualHex(candidateHex, expectedHex)) {
		return { valid: false, reason: 'Webhook HMAC signature mismatch.' };
	}

	return { valid: true };
}

export interface CreateWebhookHandlerOptions<TSchema extends AnyValidator | undefined = undefined> {
	/**
	 * Webhook signing secret, or a callback returning the secret dynamically.
	 */
	secret: string | ((event: RequestEvent) => string | Promise<string>);
	/**
	 * Name of the HTTP header containing the HMAC signature.
	 * @default 'x-webhook-signature'
	 */
	signatureHeader?: string;
	/**
	 * Optional HTTP header containing a UNIX timestamp in seconds.
	 */
	timestampHeader?: string;
	/**
	 * Maximum allowed age in seconds for timestamped webhooks.
	 * @default 300
	 */
	toleranceSeconds?: number;
	/**
	 * Optional Standard Schema / Zod / Valibot schema to validate the parsed JSON payload.
	 */
	schema?: TSchema;
	/**
	 * Webhook event handler invoked after cryptographic verification and schema validation.
	 */
	handler: (context: {
		event: RequestEvent;
		payload: TSchema extends undefined ? any : InferValidatorOutput<TSchema>;
		rawBody: string;
	}) => Promise<unknown> | unknown;
}

/**
 * Zero-dependency SvelteKit `RequestHandler` builder for incoming webhooks
 * (GitHub, Stripe, Polar, Resend, Linear, custom HMAC-SHA256).
 */
export function createWebhookHandler<TSchema extends AnyValidator | undefined = undefined>(
	options: CreateWebhookHandlerOptions<TSchema>
): RequestHandler {
	const sigHeaderName = options.signatureHeader ?? 'x-webhook-signature';

	return async (event: RequestEvent) => {
		const rawBody = await event.request.text();
		const signatureHeader = event.request.headers.get(sigHeaderName);
		const timestampHeader = options.timestampHeader
			? event.request.headers.get(options.timestampHeader)
			: null;

		const secret =
			typeof options.secret === 'function' ? await options.secret(event) : options.secret;

		const verification = await verifyWebhookSignature({
			payload: rawBody,
			signatureHeader,
			secret,
			timestampHeader,
			toleranceSeconds: options.toleranceSeconds
		});

		if (!verification.valid) {
			return problemResponse({
				status: 401,
				title: 'Unauthorized Webhook',
				detail: verification.reason || 'Webhook signature verification failed.',
				type: 'https://yaxa.dev/errors/webhook-signature-invalid'
			});
		}

		let parsedPayload: any;
		try {
			parsedPayload = rawBody ? JSON.parse(rawBody) : {};
		} catch {
			return problemResponse({
				status: 400,
				title: 'Bad Request',
				detail: 'Webhook body is not valid JSON.',
				type: 'https://yaxa.dev/errors/invalid-json'
			});
		}

		if (options.schema) {
			const validation = await validateData(options.schema, parsedPayload, 'body');
			if (!validation.success) {
				return problemResponse({
					status: 422,
					title: 'Unprocessable Entity',
					detail: 'Webhook payload failed schema validation.',
					type: 'https://yaxa.dev/errors/validation-failed',
					invalidParams: validation.invalidParams
				});
			}
			parsedPayload = validation.data;
		}

		const result = await options.handler({
			event,
			payload: parsedPayload,
			rawBody
		});

		if (result instanceof Response) {
			return result;
		}

		return Response.json(result ?? { received: true }, { status: 200 });
	};
}
