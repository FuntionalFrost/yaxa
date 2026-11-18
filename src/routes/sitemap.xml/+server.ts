import { createSitemapHandler } from '#lib/site/sitemap.js';
import { siteConfig } from '../../site.config';
import { SITEMAP_STATIC_ROUTES } from '../docs/_data/docs-nav';

export const GET = createSitemapHandler({
	config: siteConfig,
	staticRoutes: SITEMAP_STATIC_ROUTES
});
