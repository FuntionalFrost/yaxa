import { describe, it, expect, vi } from 'vitest';
import { createPolarWebhookHandler } from './webhook';

describe('createPolarWebhookHandler', () => {
	it('rejects non-POST requests with 405 Method Not Allowed', async () => {
		const handler = createPolarWebhookHandler();
		const response = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'GET'
			})
		} as any);

		expect(response.status).toBe(405);
		expect(await response.text()).toBe('Method Not Allowed');
	});

	it('rejects invalid JSON payloads with 400 when unauthenticated', async () => {
		const handler = createPolarWebhookHandler();
		const response = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				body: 'not-json-content'
			})
		} as any);

		expect(response.status).toBe(400);
		expect(await response.text()).toBe('Invalid JSON payload');
	});

	it('rejects requests with missing or forged signature when secret is configured', async () => {
		const handler = createPolarWebhookHandler({
			webhookSecret: 'whsec_test_secret_key_12345'
		});

		// 1. Missing signature
		const resMissing = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				body: JSON.stringify({ type: 'subscription.created', data: {} })
			})
		} as any);
		expect(resMissing.status).toBe(401);
		expect(await resMissing.text()).toBe('Invalid or missing webhook signature');

		// 2. Forged/invalid signature
		const resForged = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				headers: {
					'webhook-id': 'msg_123',
					'webhook-timestamp': `${Math.floor(Date.now() / 1000)}`,
					'webhook-signature': 'v1,forged_invalid_signature'
				},
				body: JSON.stringify({ type: 'subscription.created', data: {} })
			})
		} as any);
		expect(resForged.status).toBe(401);
		expect(await resForged.text()).toBe('Invalid or missing webhook signature');
	});

	it('invokes onOrderCreated callback and responds with received: true', async () => {
		const onOrderCreated = vi.fn();
		const handler = createPolarWebhookHandler({
			onOrderCreated
		});

		const payload = {
			type: 'order.created',
			data: { id: 'order_123', amount: 4900 }
		};

		const response = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				body: JSON.stringify(payload)
			})
		} as any);

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ received: true });
		expect(onOrderCreated).toHaveBeenCalledWith(payload);
	});

	it('sanitizes internal errors and returns 500 without leaking exception messages', async () => {
		const handler = createPolarWebhookHandler({
			onSubscriptionCreated: () => {
				throw new Error('Sensitive DB connection string exposed: postgres://user:pass@host/db');
			}
		});

		const response = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				body: JSON.stringify({ type: 'subscription.created', data: {} })
			})
		} as any);

		expect(response.status).toBe(500);
		const text = await response.text();
		expect(text).toBe('Internal Server Error');
		expect(text).not.toContain('postgres://');
	});
});
