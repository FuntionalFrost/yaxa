import { useYaxa } from './context.js';
import type { PageSeoConfig } from './seo-helpers.js';

/**
 * Reactive Svelte 5 composable for page-level SEO metadata.
 * Equivalent to Nuxt SEO's useSeoMeta().
 *
 * Can be called with a static config or a reactive getter function.
 * Automatically synchronizes with <Seo /> via Svelte context.
 *
 * Example:
 * ```svelte
 * <script lang="ts">
 *   import { useSeo } from 'yaxa-svelte/seo';
 *
 *   let product = $state({ title: 'Pro Plan', price: 49 });
 *
 *   useSeo(() => ({
 *     title: product.title,
 *     description: `Subscribe for $${product.price}/mo`
 *   }));
 * </script>
 * ```
 */
export function useSeo(getterOrConfig: PageSeoConfig | (() => PageSeoConfig)): void {
	const yaxa = useYaxa();

	// Immediate evaluation for SSR and initial render
	const initial = typeof getterOrConfig === 'function' ? getterOrConfig() : getterOrConfig;
	yaxa.setPageSeo(initial);

	try {
		$effect(() => {
			const current = typeof getterOrConfig === 'function' ? getterOrConfig() : getterOrConfig;
			yaxa.setPageSeo(current);

			return () => {
				yaxa.setPageSeo(null);
			};
		});
	} catch {
		// Outside active effect root (e.g. non-browser testing or direct execution)
	}
}
