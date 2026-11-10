import type { Handle } from '@sveltejs/kit/hooks';
import type { SiteConfig } from './config';
import { createRobotsHandler, type RobotsOptions } from './robots';
import { createSitemapHandler, type SitemapOptions } from './sitemap';
import { createSitemapXslHandler } from './sitemap-xsl';
import { createManifestHandler } from './manifest';
import { createOgImageHandler } from './og';
import { createLlmsTxtHandler, type LlmsTxtOptions } from './llms';
import { createSkillHandler, type SkillOptions } from './skill';

export interface YaxaHookOptions {
	config: SiteConfig;
	robots?: RobotsOptions;
	sitemap?: SitemapOptions;
	llms?: LlmsTxtOptions;
	skill?: SkillOptions;
}

/**
 * Creates an all-in-one SvelteKit Server Handle Hook that automatically routes
 * /robots.txt, /sitemap.xml, /sitemap.xsl, /site.webmanifest, /api/og, /llms.txt, and /skill.md
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
	const llmsTxtHandler = createLlmsTxtHandler(options.llms || { config });
	const skillHandler = createSkillHandler(options.skill || { config });

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
		if (pathname === '/llms.txt') {
			return llmsTxtHandler(event as unknown as Parameters<typeof llmsTxtHandler>[0]);
		}
		if (pathname === '/skill.md' || pathname === '/.well-known/skill.md') {
			return skillHandler(event as unknown as Parameters<typeof skillHandler>[0]);
		}

		return resolve(event);
	};
}
