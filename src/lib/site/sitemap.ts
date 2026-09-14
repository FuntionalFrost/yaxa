import type { RequestHandler } from '@sveltejs/kit';
import type { SiteConfig } from './config';

export interface SitemapImage {
	loc: string;
	title?: string;
	caption?: string;
}

export interface SitemapRoute {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	images?: SitemapImage[];
}

export interface SitemapOptions {
	config: SiteConfig;
	/**
	 * Additional static or dynamic routes to include (e.g. /blog/[slug], /products/[id])
	 */
	dynamicRoutes?: () => Promise<SitemapRoute[]> | SitemapRoute[];
	/**
	 * Default routes to include if not providing dynamic list
	 */
	staticRoutes?: (string | SitemapRoute)[];
}

export function createSitemapHandler(optionsOrConfig: SiteConfig | SitemapOptions): RequestHandler {
	const options: SitemapOptions =
		'config' in optionsOrConfig ? optionsOrConfig : { config: optionsOrConfig };
	const { config } = options;

	return async ({ url }) => {
		const baseUrl = (config.url || url.origin).replace(/\/$/, '');

		let routes: SitemapRoute[];

		if (options.staticRoutes && options.staticRoutes.length > 0) {
			routes = options.staticRoutes.map((route) => {
				if (typeof route === 'string') {
					return {
						loc: route,
						changefreq: config.sitemap?.changefreq || 'weekly',
						priority: route === '/' ? 1.0 : config.sitemap?.priority || 0.8,
						lastmod: new Date().toISOString().split('T')[0]
					};
				}
				return {
					changefreq: config.sitemap?.changefreq || 'weekly',
					priority: config.sitemap?.priority || 0.8,
					lastmod: new Date().toISOString().split('T')[0],
					...route
				};
			});
		} else {
			routes = [
				{
					loc: '/',
					changefreq: config.sitemap?.changefreq || 'weekly',
					priority: 1.0,
					lastmod: new Date().toISOString().split('T')[0]
				}
			];
		}

		if (options.dynamicRoutes) {
			const extra = await options.dynamicRoutes();
			routes = [...routes, ...extra];
		}

		// Filter excluded routes & ensure valid paths (strip any accidental #hashes)
		const excludePatterns = config.sitemap?.exclude || ['/api/*'];
		routes = routes
			.map((r) => ({
				...r,
				loc: r.loc.split('#')[0] // Discard any hash anchors per sitemap protocol
			}))
			.filter((r) => r.loc.length > 0)
			.filter((r) => {
				return !excludePatterns.some((pattern) => {
					if (pattern.endsWith('*')) {
						return r.loc.startsWith(pattern.slice(0, -1));
					}
					return r.loc === pattern;
				});
			});

		// Deduplicate routes
		const seen = new Set<string>();
		routes = routes.filter((r) => {
			if (seen.has(r.loc)) return false;
			seen.add(r.loc);
			return true;
		});

		const hasImages = routes.some((r) => r.images && r.images.length > 0);

		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${hasImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>
${routes
	.map((r) => {
		const fullLoc = `${baseUrl}${r.loc.startsWith('/') ? r.loc : `/${r.loc}`}`;
		let entry = `  <url>\n    <loc>${fullLoc}</loc>`;
		if (r.lastmod) entry += `\n    <lastmod>${r.lastmod}</lastmod>`;
		if (r.changefreq) entry += `\n    <changefreq>${r.changefreq}</changefreq>`;
		if (r.priority !== undefined) entry += `\n    <priority>${r.priority.toFixed(1)}</priority>`;
		if (r.images && r.images.length > 0) {
			for (const img of r.images) {
				const imgLoc = img.loc.startsWith('http') ? img.loc : `${baseUrl}${img.loc}`;
				entry += `\n    <image:image>\n      <image:loc>${imgLoc}</image:loc>`;
				if (img.title) entry += `\n      <image:title>${img.title}</image:title>`;
				if (img.caption) entry += `\n      <image:caption>${img.caption}</image:caption>`;
				entry += `\n    </image:image>`;
			}
		}
		entry += `\n  </url>`;
		return entry;
	})
	.join('\n')}
</urlset>`;

		return new Response(xml.trim(), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	};
}
