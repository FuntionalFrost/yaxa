import { describe, it, expect } from 'vitest';
import { defineSiteConfig, computeProjectBadge } from './config';

describe('computeProjectBadge', () => {
	it('returns fallback badge when no project is provided', () => {
		expect(computeProjectBadge(undefined)).toBe('Web Application');
	});

	it('respects explicit custom badge', () => {
		expect(computeProjectBadge({ badge: 'Custom Pro SaaS' })).toBe('Custom Pro SaaS');
	});

	it('computes open-source badge with license', () => {
		expect(computeProjectBadge({ type: 'open-source', license: 'MIT' })).toBe('MIT Open Source');
		expect(computeProjectBadge({ type: 'open-source' })).toBe('Open Source');
	});

	it('computes commercial-saas and freemium badges', () => {
		expect(computeProjectBadge({ type: 'commercial-saas' })).toBe('Commercial SaaS');
		expect(computeProjectBadge({ type: 'freemium' })).toBe('Freemium SaaS');
	});
});

describe('defineSiteConfig', () => {
	it('computes primary email and fallback notice', () => {
		const config = defineSiteConfig({
			name: 'Test App',
			title: 'Test App Title',
			description: 'Test Description',
			url: 'https://testapp.com',
			legal: {
				paymentProcessor: 'polar'
			},
			project: {
				type: 'open-source',
				license: 'MIT'
			}
		});

		expect(config.name).toBe('Test App');
		expect(config.email).toBe('contact@testapp.com');
		expect(config.legal?.morNotice).toBe(
			'Payments securely processed by Polar.sh (Merchant of Record)'
		);
		expect(config.project?.badge).toBe('MIT Open Source');
	});
});
