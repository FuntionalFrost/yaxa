import { describe, it, expect } from 'vitest';
import { YaxaState, useYaxa, useSiteConfig, useAuthUser } from './context';
import { DEFAULT_SITE_CONFIG } from './config';

describe('YaxaState & Svelte 5 Context', () => {
	it('creates a default state instance with standard config and null user', () => {
		const state = new YaxaState();
		expect(state.config).toEqual(DEFAULT_SITE_CONFIG);
		expect(state.user).toBeNull();
	});

	it('creates state with customized config and user getters', () => {
		const customConfig = { ...DEFAULT_SITE_CONFIG, name: 'CustomApp' };
		const customUser = { id: 'usr_1', name: 'Alice', email: 'alice@example.com' };

		const state = new YaxaState(
			() => customConfig,
			() => customUser
		);
		expect(state.config.name).toBe('CustomApp');
		expect(state.user?.name).toBe('Alice');
	});

	it('falls back to default state when useYaxa is called outside a provider tree', () => {
		const fallback = useYaxa();
		expect(fallback).toBeInstanceOf(YaxaState);
		expect(fallback.config.name).toBe(DEFAULT_SITE_CONFIG.name);
		expect(fallback.user).toBeNull();
	});

	it('useSiteConfig and useAuthUser return current properties', () => {
		const config = useSiteConfig();
		const user = useAuthUser();

		expect(config.name).toBe(DEFAULT_SITE_CONFIG.name);
		expect(user).toBeNull();
	});
});
