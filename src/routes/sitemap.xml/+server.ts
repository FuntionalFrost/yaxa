import { createSitemapHandler } from '$lib/site/sitemap';
import { siteConfig } from '../../site.config';
import { ALL_DOC_ITEMS } from '../docs/_data/docs-nav';

const docRoutes = ALL_DOC_ITEMS.map((item) => ({
	loc: item.href,
	priority: 0.9,
	changefreq: 'weekly' as const
}));

export const GET = createSitemapHandler({
	config: siteConfig,
	staticRoutes: [
		{ loc: '/', priority: 1.0, changefreq: 'daily' as const },
		{ loc: '/docs/intro', priority: 0.95, changefreq: 'weekly' as const },
		{ loc: '/theme', priority: 0.9, changefreq: 'weekly' as const },
		{ loc: '/saas', priority: 0.8, changefreq: 'monthly' as const },
		{ loc: '/terms', priority: 0.5, changefreq: 'yearly' as const },
		{ loc: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
		{ loc: '/refunds', priority: 0.5, changefreq: 'yearly' as const },
		{ loc: '/impressum', priority: 0.5, changefreq: 'yearly' as const },
		...docRoutes
	]
});
