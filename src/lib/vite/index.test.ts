import { describe, it, expect, vi } from 'vitest';
import { yaxa } from './index';
import type { ResolvedConfig } from 'vite';

describe('yaxa Vite plugin', () => {
	it('returns a plugin array with vite-plugin-yaxa', () => {
		const plugins = yaxa();
		expect(plugins).toHaveLength(1);
		expect(plugins[0].name).toBe('vite-plugin-yaxa');
	});

	it('configures optimizeDeps and ssr.noExternal by default', () => {
		const [plugin] = yaxa();
		const configFn = plugin.config as () => Record<string, any>;
		const config = configFn();

		expect(config.optimizeDeps?.include).toContain('tailwind-variants');
		expect(config.optimizeDeps?.include).toContain('bits-ui');
		expect(config.optimizeDeps?.include).toContain('svelte-sonner');
		expect(config.optimizeDeps?.include).toContain('runed');
		expect(config.optimizeDeps?.include).toContain('mode-watcher');
		expect(config.optimizeDeps?.include).toContain('clsx');
		expect(config.optimizeDeps?.include).toContain('tailwind-merge');

		expect(config.ssr?.noExternal).toContain('yaxa-svelte');
		expect(config.ssr?.noExternal).toContain('bits-ui');
		expect(config.ssr?.noExternal).toContain('runed');
		expect(config.ssr?.noExternal).toContain('mode-watcher');
		expect(config.ssr?.noExternal).toContain('svelte-sonner');
	});

	it('respects optimizeDeps: false', () => {
		const [plugin] = yaxa({ optimizeDeps: false });
		const configFn = plugin.config as () => Record<string, any>;
		const config = configFn();

		expect(config.optimizeDeps).toBeUndefined();
		expect(config.ssr?.noExternal).toBeDefined();
	});

	it('respects noExternal: false', () => {
		const [plugin] = yaxa({ noExternal: false });
		const configFn = plugin.config as () => Record<string, any>;
		const config = configFn();

		expect(config.optimizeDeps?.include).toBeDefined();
		expect(config.ssr).toBeUndefined();
	});

	it('warns in serve mode when tailwind plugin is missing', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const [plugin] = yaxa({ checkTailwind: true });

		const mockConfig = {
			command: 'serve',
			plugins: [{ name: 'vite:css' }, { name: 'vite-plugin-svelte' }]
		} as unknown as ResolvedConfig;

		(plugin.configResolved as (config: ResolvedConfig) => void)(mockConfig);

		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy.mock.calls[0][0]).toContain('Tailwind CSS v4 plugin not detected');

		warnSpy.mockRestore();
	});

	it('does not warn when tailwind plugin is present', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const [plugin] = yaxa({ checkTailwind: true });

		const mockConfig = {
			command: 'serve',
			plugins: [{ name: '@tailwindcss/vite' }]
		} as unknown as ResolvedConfig;

		(plugin.configResolved as (config: ResolvedConfig) => void)(mockConfig);

		expect(warnSpy).not.toHaveBeenCalled();

		warnSpy.mockRestore();
	});
});
