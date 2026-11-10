export interface PageSeoConfig {
	title: string;
	description?: string;
	canonical?: string;
	badge?: string;
	ogImage?:
		| string
		| {
				title?: string;
				description?: string;
				badge?: string;
				theme?: 'dark' | 'light';
		  };
	twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
	keywords?: string[];
	noindex?: boolean;
	nofollow?: boolean;
	schema?: Record<string, unknown> | Record<string, unknown>[];
	[key: string]: unknown;
}

/**
 * Type-safe helper for SvelteKit load() functions to define page-level SEO.
 * When returned inside { seo: definePageSeo(...) }, YaxaApp automatically
 * extracts and binds all meta tags, OpenGraph cards, Twitter cards, and Schema.org data.
 *
 * Example:
 * ```ts
 * export const load = () => {
 *   return {
 *     seo: definePageSeo({
 *       title: 'DataTable Component',
 *       description: 'Interactive sortable table for SvelteKit',
 *       badge: 'Components'
 *     })
 *   };
 * };
 * ```
 */
export function definePageSeo(seo: PageSeoConfig): PageSeoConfig {
	return seo;
}
