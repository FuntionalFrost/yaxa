import { describe, it, expect } from 'vitest';
import { sendMagicLinkEmail, sendWelcomeEmail } from './index';

describe('Server Email Dispatcher', () => {
	it('dispatches magic link email in dev mock mode without errors', async () => {
		const result = await sendMagicLinkEmail({
			to: 'alex@example.com',
			url: 'https://yaxa.dev/auth/verify?token=xyz123',
			appName: 'Yaxa Test App'
		});

		expect(result).toBeDefined();
		expect(result.data?.id).toContain('mock-');
		expect(result.error).toBeNull();
	});

	it('dispatches welcome onboarding email in dev mock mode without errors', async () => {
		const result = await sendWelcomeEmail({
			to: 'elena@example.com',
			name: 'Elena Rostova',
			appName: 'Yaxa SaaS',
			dashboardUrl: 'https://yaxa.dev/dashboard'
		});

		expect(result).toBeDefined();
		expect(result.data?.id).toContain('mock-');
		expect(result.error).toBeNull();
	});
});
