import { createPolar, type Polar } from '@polar-sh/sdk/2026-10';

export interface PolarConfig {
	accessToken?: string;
	server?: 'sandbox' | 'production';
	environment?: 'sandbox' | 'production';
}

/**
 * Creates and initializes a Polar SDK client instance.
 */
export function getPolarClient(config: PolarConfig = {}): Polar {
	const accessToken =
		config.accessToken ||
		(typeof process !== 'undefined' ? process.env.POLAR_ACCESS_TOKEN : undefined) ||
		'';

	const environment =
		config.environment ||
		config.server ||
		((typeof process !== 'undefined' && process.env.POLAR_ENVIRONMENT === 'production'
			? 'production'
			: 'sandbox') as 'sandbox' | 'production');

	return createPolar({
		accessToken,
		environment
	});
}

export interface CreateCheckoutOptions {
	productId: string;
	customerEmail?: string;
	successUrl?: string;
	metadata?: Record<string, string>;
	polar?: Polar;
}

/**
 * Creates a Polar hosted checkout session for a product/subscription.
 */
export async function createPolarCheckout(
	options: CreateCheckoutOptions
): Promise<{ url: string; id: string }> {
	const polar = options.polar || getPolarClient();

	const successUrl =
		options.successUrl ||
		(typeof process !== 'undefined'
			? `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/dashboard?checkout=success`
			: 'http://localhost:5173/dashboard?checkout=success');

	const result = await polar.checkouts.create({
		products: [options.productId],
		customer_email: options.customerEmail,
		success_url: successUrl,
		metadata: options.metadata
	});

	return {
		url: result.url,
		id: result.id
	};
}

/**
 * Generates a Polar Customer Portal link for managing billing and subscriptions.
 */
export async function createPolarCustomerPortalSession(
	customerId: string,
	polar?: Polar
): Promise<{ url: string }> {
	const client = polar || getPolarClient();
	const session = await client.customerSessions.create({
		customer_id: customerId
	});

	return {
		url: (session as any).customer_portal_url || (session as any).customerPortalUrl || ''
	};
}

export { createPolarWebhookHandler } from './webhook';
export type { PolarWebhookOptions } from './webhook';
