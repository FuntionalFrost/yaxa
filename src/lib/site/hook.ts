import type { Handle } from '@sveltejs/kit/hooks';
import type { SiteConfig } from './config';
import { createRobotsHandler, type RobotsOptions } from './robots';
import { createSitemapHandler, type SitemapOptions } from './sitemap';
import { createSitemapXslHandler } from './sitemap-xsl';
import { createManifestHandler } from './manifest';
import { createOgImageHandler } from './og';

export interface YaxaHookOptions {
	config: SiteConfig;
	robots?: RobotsOptions;
	sitemap?: SitemapOptions;
}

/**
 * Creates an all-in-one SvelteKit Server Handle Hook that automatically routes
 * /robots.txt, /sitemap.xml, /sitemap.xsl, /site.webmanifest, and /api/og
 * directly from your site.config.ts with zero route files required!
 */
export function createYaxaHook(optionsOrConfig: SiteConfig | YaxaHookOptions): Handle {
	const options: YaxaHookOptions =
		'name' in optionsOrConfig ? { config: optionsOrConfig } : optionsOrConfig;
	const { config } = options;

	const robotsHandler = createRobotsHandler(options.robots || { config });
	const sitemapHandler = createSitemapHandler(options.sitemap || { config });
	const sitemapXslHandler = createSitemapXslHandler({ config });
	const manifestHandler = createManifestHandler({ config });
	const ogHandler = createOgImageHandler({ config });

	return async ({ event, resolve }) => {
		const pathname = event.url.pathname;

		if (pathname === '/robots.txt') {
			return robotsHandler(event as unknown as Parameters<typeof robotsHandler>[0]);
		}
		if (pathname === '/sitemap.xml') {
			return sitemapHandler(event as unknown as Parameters<typeof sitemapHandler>[0]);
		}
		if (pathname === '/sitemap.xsl') {
			return sitemapXslHandler(event as unknown as Parameters<typeof sitemapXslHandler>[0]);
		}
		if (pathname === '/site.webmanifest') {
			return manifestHandler(event as unknown as Parameters<typeof manifestHandler>[0]);
		}
		if (pathname === '/api/og') {
			return ogHandler(event as unknown as Parameters<typeof ogHandler>[0]);
		}

		return resolve(event);
	};
}
