import { defineSiteConfig, type SiteConfig } from '../site/config';
import type { AuthUserContext } from '../site/context';
import type { ThemeMode } from '../theme/theme.svelte';

export interface YaxaTestOptions {
	config?: Partial<SiteConfig>;
	user?: Partial<AuthUserContext> | null;
	theme?: ThemeMode;
}

/**
 * Creates a fully valid mocked SiteConfig for unit and integration testing.
 */
export function createMockSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
	return defineSiteConfig({
		name: overrides.name || 'Test App',
		title: overrides.title || 'Test App Title',
		description: overrides.description || 'Test App Description',
		url: overrides.url || 'https://test.local',
		email: overrides.email || 'test@local.dev',
		...overrides
	});
}

/**
 * Creates a mocked authenticated user context for unit tests.
 */
export function createMockUser(overrides: Partial<AuthUserContext> = {}): AuthUserContext {
	return {
		id: overrides.id || 'usr_test_123',
		name: overrides.name || 'Test User',
		email: overrides.email || 'testuser@local.dev',
		role: overrides.role || 'user',
		plan: overrides.plan || 'pro',
		isSubscribed: overrides.isSubscribed ?? true,
		...overrides
	};
}

/**
 * Prepares default mock contexts and props for testing Yaxa-wrapped components.
 */
export function createTestWrapperProps(options: YaxaTestOptions = {}) {
	const config = createMockSiteConfig(options.config);
	const user = options.user ? createMockUser(options.user) : null;
	const theme = options.theme || 'dark';

	return {
		config,
		user,
		theme
	};
}
