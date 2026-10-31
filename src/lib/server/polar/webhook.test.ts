import { describe, it, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import { createPolarWebhookHandler } from './webhook';
import { getPolarClient, createPolarCheckout, createPolarCustomerPortalSession } from './index';
import { createMockPolarClient } from '../../testing/index';

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

	it('authenticates valid Standard Webhook signature and processes payload', async () => {
		const rawKey = '01234567890123456789012345678901';
		const base64Key = Buffer.from(rawKey).toString('base64');
		const webhookSecret = `whsec_${base64Key}`;

		const onSubscriptionCreated = vi.fn();
		const mockDb = {
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					onConflictDoUpdate: vi.fn().mockResolvedValue({})
				})
			})
		};

		const handler = createPolarWebhookHandler({
			webhookSecret,
			db: mockDb as any,
			onSubscriptionCreated
		});

		const body = JSON.stringify({
			type: 'subscription.created',
			data: {
				id: 'sub_test_polar_123',
				user_id: 'usr_abc',
				status: 'active'
			}
		});

		const msgId = 'msg_valid_test_456';
		const timestamp = Math.floor(Date.now() / 1000);
		const signedPayload = `${msgId}.${timestamp}.${body}`;
		const sig = crypto
			.createHmac('sha256', Buffer.from(base64Key, 'base64'))
			.update(signedPayload)
			.digest('base64');

		const response = await handler({
			request: new Request('https://example.com/api/webhooks/polar', {
				method: 'POST',
				headers: {
					'webhook-id': msgId,
					'webhook-timestamp': `${timestamp}`,
					'webhook-signature': `v1,${sig}`
				},
				body
			})
		} as any);

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ received: true });
		expect(onSubscriptionCreated).toHaveBeenCalledOnce();
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

describe('Polar Server SDK Utilities', () => {
	it('initializes Polar client instance via getPolarClient with sandbox / production config', () => {
		const clientSandbox = getPolarClient({ accessToken: 'test_token', environment: 'sandbox' });
		expect(clientSandbox).toBeDefined();
		expect(clientSandbox.checkouts).toBeDefined();
		expect(clientSandbox.customerSessions).toBeDefined();

		const clientLegacyServer = getPolarClient({ accessToken: 'test_token', server: 'production' });
		expect(clientLegacyServer).toBeDefined();
	});

	it('creates Polar checkout session with snake_case parameters', async () => {
		const mockPolar = createMockPolarClient();
		const result = await createPolarCheckout({
			productId: 'prod_pro_tier_123',
			customerEmail: 'dev@test.org',
			metadata: { tenantId: 'tenant_789' },
			polar: mockPolar as any
		});

		expect(result.id).toContain('chk_mock_');
		expect(result.url).toContain('https://polar.sh/checkout/');
		expect(mockPolar.createdCheckouts).toHaveLength(1);
		expect(mockPolar.createdCheckouts[0].products).toEqual(['prod_pro_tier_123']);
		expect(mockPolar.createdCheckouts[0].customer_email).toBe('dev@test.org');
		expect(mockPolar.createdCheckouts[0].metadata).toEqual({ tenantId: 'tenant_789' });
	});

	it('generates Polar customer portal billing session link', async () => {
		const mockPolar = createMockPolarClient();
		const result = await createPolarCustomerPortalSession('cust_user_456', mockPolar as any);

		expect(result.url).toBe('https://polar.sh/portal/mock_cust_user_456');
	});
});
