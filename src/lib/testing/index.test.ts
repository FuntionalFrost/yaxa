import { describe, it, expect } from 'vitest';
import { createMockSiteConfig, createMockUser, createTestWrapperProps } from './index';

describe('Yaxa Testing Utilities', () => {
	it('creates valid mock site config with defaults and overrides', () => {
		const config = createMockSiteConfig({ name: 'Custom App' });
		expect(config.name).toBe('Custom App');
		expect(config.url).toBe('https://test.local');
		expect(config.theme?.defaultMode).toBe('system');
	});

	it('creates valid mock user context', () => {
		const user = createMockUser({ role: 'admin', plan: 'enterprise' });
		expect(user.id).toBe('usr_test_123');
		expect(user.role).toBe('admin');
		expect(user.plan).toBe('enterprise');
		expect(user.isSubscribed).toBe(true);
	});

	it('creates test wrapper props bundle', () => {
		const props = createTestWrapperProps({
			config: { name: 'Wrapper Test' },
			user: { email: 'admin@test.com' },
			theme: 'light'
		});

		expect(props.config.name).toBe('Wrapper Test');
		expect(props.user?.email).toBe('admin@test.com');
		expect(props.theme).toBe('light');
	});
});
