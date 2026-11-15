import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { csrfGuard } from '../endpoint/guards';
import {
	buildSecurityHeaders,
	createSecurityHeadersHook,
	computeHmacSha256Hex,
	verifyWebhookSignature,
	createWebhookHandler
} from './index';

describe('Server Security & Webhooks (yaxa-svelte/server)', () => {
	describe('csrfGuard', () => {
		it('allows safe GET requests without origin header', async () => {
			const guard = csrfGuard();
			const event: any = {
				request: new Request('https://app.yaxa.dev/api/projects', { method: 'GET' }),
				url: new URL('https://app.yaxa.dev/api/projects')
			};
			const res = await guard(event);
			expect(res).toBeUndefined();
		});

		it('blocks POST requests with mismatched Origin header and returns 403 RFC 7807', async () => {
			const guard = csrfGuard();
			const event: any = {
				request: new Request('https://app.yaxa.dev/api/projects', {
					method: 'POST',
					headers: { origin: 'https://evil.example.com' }
				}),
				url: new URL('https://app.yaxa.dev/api/projects')
			};
			const res = (await guard(event)) as Response;
			expect(res).toBeInstanceOf(Response);
			expect(res.status).toBe(403);
			const body = await res.json();
			expect(body.type).toBe('https://yaxa.dev/errors/csrf-origin-mismatch');
		});

		it('allows POST requests from same origin and verifies optional double-submit token', async () => {
			const guard = csrfGuard({ requireToken: true });
			const validEvent: any = {
				request: new Request('https://app.yaxa.dev/api/projects', {
					method: 'POST',
					headers: {
						origin: 'https://app.yaxa.dev',
						'x-csrf-token': 'tok_12345'
					}
				}),
				url: new URL('https://app.yaxa.dev/api/projects'),
				cookies: {
					get: (name: string) => (name === 'yaxa_csrf' ? 'tok_12345' : undefined)
				}
			};
			expect(await guard(validEvent)).toBeUndefined();

			const invalidTokenEvent: any = {
				...validEvent,
				cookies: {
					get: () => 'tok_wrong'
				}
			};
			const blocked = (await guard(invalidTokenEvent)) as Response;
			expect(blocked.status).toBe(403);
		});
	});

	describe('buildSecurityHeaders & createSecurityHeadersHook', () => {
		it('computes default security headers and structured CSP directives', () => {
			const headers = buildSecurityHeaders({
				frameOptions: 'DENY',
				contentSecurityPolicy: {
					'default-src': ["'self'"],
					'img-src': ["'self'", 'data:', 'https:']
				}
			});
			expect(headers['x-frame-options']).toBe('DENY');
			expect(headers['x-content-type-options']).toBe('nosniff');
			expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
			expect(headers['content-security-policy']).toBe(
				"default-src 'self'; img-src 'self' data: https:"
			);
		});

		it('attaches headers on SvelteKit handle hook resolution without overwriting existing headers', async () => {
			const hook = createSecurityHeadersHook({ frameOptions: 'DENY' });
			const response = await hook({
				event: {} as any,
				resolve: async () =>
					new Response('ok', {
						status: 200,
						headers: { 'x-frame-options': 'SAMEORIGIN' }
					})
			});
			// Preserves explicit route header
			expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
			// Attaches missing security headers
			expect(response.headers.get('x-content-type-options')).toBe('nosniff');
			expect(response.headers.get('strict-transport-security')).toContain('max-age=63072000');
		});
	});

	describe('verifyWebhookSignature & createWebhookHandler', () => {
		const secret = 'whsec_test_secret_key_123';
		const rawPayload = JSON.stringify({ event: 'subscription.created', plan: 'pro' });

		it('verifies sha256=<hex> and Stripe/Polar t=...,v1=... HMAC signatures', async () => {
			const hex = await computeHmacSha256Hex(secret, rawPayload);
			const res1 = await verifyWebhookSignature({
				payload: rawPayload,
				signatureHeader: `sha256=${hex}`,
				secret
			});
			expect(res1.valid).toBe(true);

			// Timestamped format
			const nowSec = Math.floor(Date.now() / 1000);
			const tsHex = await computeHmacSha256Hex(secret, `${nowSec}.${rawPayload}`);
			const res2 = await verifyWebhookSignature({
				payload: rawPayload,
				signatureHeader: `t=${nowSec},v1=${tsHex}`,
				secret,
				toleranceSeconds: 300
			});
			expect(res2.valid).toBe(true);

			// Expired timestamp rejected
			const oldSec = nowSec - 1000;
			const oldHex = await computeHmacSha256Hex(secret, `${oldSec}.${rawPayload}`);
			const res3 = await verifyWebhookSignature({
				payload: rawPayload,
				signatureHeader: `t=${oldSec},v1=${oldHex}`,
				secret,
				toleranceSeconds: 300
			});
			expect(res3.valid).toBe(false);
			expect(res3.reason).toContain('tolerance');
		});

		it('createWebhookHandler validates HMAC signature and Zod schema', async () => {
			const schema = z.object({
				event: z.string(),
				plan: z.enum(['free', 'pro'])
			});

			const handler = createWebhookHandler({
				secret,
				schema,
				handler: ({ payload }) => ({ handled: payload.event, tier: payload.plan })
			});

			const validSig = await computeHmacSha256Hex(secret, rawPayload);
			const goodReq = new Request('https://app.yaxa.dev/api/webhooks', {
				method: 'POST',
				headers: { 'x-webhook-signature': `sha256=${validSig}` },
				body: rawPayload
			});

			const goodRes = await handler({ request: goodReq } as any);
			expect(goodRes.status).toBe(200);
			expect(await goodRes.json()).toEqual({
				handled: 'subscription.created',
				tier: 'pro'
			});

			// Tampered signature returns 401
			const badReq = new Request('https://app.yaxa.dev/api/webhooks', {
				method: 'POST',
				headers: { 'x-webhook-signature': 'sha256=deadbeef' },
				body: rawPayload
			});
			const badRes = await handler({ request: badReq } as any);
			expect(badRes.status).toBe(401);
		});
	});
});
