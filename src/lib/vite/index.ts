import type { Plugin, ResolvedConfig } from 'vite';

export interface YaxaPluginOptions {
	/**
	 * Pre-bundle core UI dependencies for fast hot module reloading.
	 * @default true
	 */
	optimizeDeps?: boolean;
	/**
	 * Prevent SSR externalization issues in SvelteKit for runes/component dependencies.
	 * @default true
	 */
	noExternal?: boolean;
	/**
	 * Warn in dev mode if @tailwindcss/vite is not detected in plugins.
	 * @default true
	 */
	checkTailwind?: boolean;
}

/**
 * Yaxa Vite Plugin for SvelteKit.
 * Configures optimal SSR bundling, dependency pre-bundling, and Tailwind v4 validation.
 *
 * Usage in vite.config.ts:
 * ```ts
 * import tailwindcss from '@tailwindcss/vite';
 * import { sveltekit } from '@sveltejs/kit/vite';
 * import { yaxa } from 'yaxa-svelte/vite';
 * import { defineConfig } from 'vite';
 *
 * export default defineConfig({
 *   plugins: [tailwindcss(), sveltekit(), yaxa()]
 * });
 * ```
 */
export function yaxa(options: YaxaPluginOptions = {}): Plugin[] {
	const { optimizeDeps = true, noExternal = true, checkTailwind = true } = options;

	return [
		{
			name: 'vite-plugin-yaxa',
			config() {
				return {
					...(optimizeDeps
						? {
								optimizeDeps: {
									include: [
										'tailwind-variants',
										'bits-ui',
										'svelte-sonner',
										'runed',
										'mode-watcher',
										'clsx',
										'tailwind-merge'
									]
								}
							}
						: {}),
					...(noExternal
						? {
								ssr: {
									noExternal: ['yaxa-svelte', 'bits-ui', 'svelte-sonner', 'mode-watcher', 'runed']
								}
							}
						: {})
				};
			},
			configResolved(config: ResolvedConfig) {
				if (!checkTailwind || config.command !== 'serve') return;
				const hasTailwind = config.plugins.some((p) => p.name.includes('tailwind'));
				if (!hasTailwind) {
					console.warn(
						'\x1b[33m[yaxa]\x1b[0m Tailwind CSS v4 plugin not detected in vite.config.ts. ' +
							'Add `@tailwindcss/vite` to your plugins array for styling to work properly.'
					);
				}
			}
		}
	];
}
