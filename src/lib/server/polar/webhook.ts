import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { eq } from 'drizzle-orm';
import { getDb, schemaPg, schemaSqlite, type AnyDb } from '../db';

export interface PolarWebhookOptions {
	webhookSecret?: string;
	db?: AnyDb;
	driver?: 'neon' | 'turso' | 'sqlite';
	onSubscriptionCreated?: (event: any) => Promise<void> | void;
	onSubscriptionUpdated?: (event: any) => Promise<void> | void;
	onSubscriptionCanceled?: (event: any) => Promise<void> | void;
	onOrderCreated?: (event: any) => Promise<void> | void;
}

/**
 * Creates a SvelteKit RequestHandler for /api/webhooks/polar.
 * Automatically verifies webhook payloads and syncs subscriptions to Drizzle DB.
 */
export function createPolarWebhookHandler(options: PolarWebhookOptions = {}) {
	const secret =
		options.webhookSecret ||
		(typeof process !== 'undefined' ? process.env.POLAR_WEBHOOK_SECRET : undefined);

	const driver =
		options.driver ||
		(typeof process !== 'undefined'
			? (process.env.DATABASE_DRIVER as 'neon' | 'turso' | 'sqlite')
			: undefined) ||
		'neon';

	const db = options.db || getDb({ driver });

	return async (event: RequestEvent) => {
		if (event.request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		let rawBody: string;
		try {
			rawBody = await event.request.text();
		} catch {
			return new Response('Failed to read request body', { status: 400 });
		}

		let payload: any;
		// Cryptographically verify signature if secret provided
		if (secret) {
			try {
				const headersObj: Record<string, string> = {};
				event.request.headers.forEach((val, key) => {
					headersObj[key.toLowerCase()] = val;
				});

				if (headersObj['polar-signature'] && !headersObj['webhook-signature']) {
					headersObj['webhook-signature'] = headersObj['polar-signature'];
				}

				payload = validateEvent(rawBody, headersObj, secret);
			} catch {
				return new Response('Invalid or missing webhook signature', { status: 401 });
			}
		} else {
			try {
				payload = JSON.parse(rawBody);
			} catch {
				return new Response('Invalid JSON payload', { status: 400 });
			}
		}

		const eventType = payload.type;
		const data = payload.data;

		try {
			const isPg = driver === 'neon';
			const subTable = isPg ? schemaPg.subscription : schemaSqlite.subscription;

			switch (eventType) {
				case 'subscription.created': {
					if (data && data.id && data.userId) {
						await (db as any)
							.insert(subTable)
							.values({
								id: data.id,
								userId: data.userId,
								polarId: data.id,
								status: data.status || 'active',
								priceId: data.priceId || null,
								productId: data.productId || null,
								tier: data.product?.name?.toLowerCase() || 'pro',
								interval: data.recurringInterval || 'month',
								currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
								cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
								createdAt: new Date(),
								updatedAt: new Date()
							})
							.onConflictDoUpdate?.({
								target: (subTable as any).id,
								set: {
									status: data.status || 'active',
									updatedAt: new Date()
								}
							});
					}
					if (options.onSubscriptionCreated) await options.onSubscriptionCreated(payload);
					break;
				}

				case 'subscription.updated': {
					if (data && data.id) {
						await (db as any)
							.update(subTable)
							.set({
								status: data.status,
								currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
								cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
								updatedAt: new Date()
							})
							.where(eq((subTable as any).polarId, data.id));
					}
					if (options.onSubscriptionUpdated) await options.onSubscriptionUpdated(payload);
					break;
				}

				case 'subscription.canceled':
				case 'subscription.revoked': {
					if (data && data.id) {
						await (db as any)
							.update(subTable)
							.set({
								status: 'canceled',
								updatedAt: new Date()
							})
							.where(eq((subTable as any).polarId, data.id));
					}
					if (options.onSubscriptionCanceled) await options.onSubscriptionCanceled(payload);
					break;
				}

				case 'order.created': {
					if (options.onOrderCreated) await options.onOrderCreated(payload);
					break;
				}
			}

			return json({ received: true });
		} catch (err: any) {
			console.error('[Polar Webhook Error]', err);
			return new Response('Internal Server Error', { status: 500 });
		}
	};
}
