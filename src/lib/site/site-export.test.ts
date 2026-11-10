import { describe, it, expect, vi } from 'vitest';
import {
	defineSiteConfig,
	DEFAULT_SITE_CONFIG,
	createRobotsHandler,
	createSitemapHandler,
	createSitemapXslHandler,
	generateSitemapXsl,
	createManifestHandler,
	createOgImageHandler,
	generateOgSvg,
	generateWebSiteSchema,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generateFaqSchema,
	generateProductSchema,
	createLlmsTxtHandler,
	generateLlmsTxt,
	createSkillHandler,
	generateSkillMd,
	definePageSeo,
	createYaxaHook,
	useSeo,
	Seo,
	Favicons
} from './index.js';

describe('yaxa-svelte/seo Subpath Exports', () => {
	const config = defineSiteConfig({
		name: 'Acme Static Site',
		title: 'Acme — Built for Speed',
		description: 'A pure static SvelteKit site using @sveltejs/adapter-static',
		url: 'https://acme.example.com',
		theme: {
			primaryColor: '#6366f1'
		}
	});

	it('exports all expected SEO functions, components, and generators', () => {
		expect(typeof defineSiteConfig).toBe('function');
		expect(typeof createRobotsHandler).toBe('function');
		expect(typeof createSitemapHandler).toBe('function');
		expect(typeof createSitemapXslHandler).toBe('function');
		expect(typeof generateSitemapXsl).toBe('function');
		expect(typeof createManifestHandler).toBe('function');
		expect(typeof createOgImageHandler).toBe('function');
		expect(typeof generateOgSvg).toBe('function');
		expect(typeof generateWebSiteSchema).toBe('function');
		expect(typeof generateOrganizationSchema).toBe('function');
		expect(typeof generateSoftwareApplicationSchema).toBe('function');
		expect(typeof generateFaqSchema).toBe('function');
		expect(typeof generateProductSchema).toBe('function');
		expect(typeof createLlmsTxtHandler).toBe('function');
		expect(typeof generateLlmsTxt).toBe('function');
		expect(typeof createSkillHandler).toBe('function');
		expect(typeof generateSkillMd).toBe('function');
		expect(typeof definePageSeo).toBe('function');
		expect(typeof createYaxaHook).toBe('function');
		expect(typeof useSeo).toBe('function');
		expect(Seo).toBeDefined();
		expect(Favicons).toBeDefined();
		expect(DEFAULT_SITE_CONFIG).toBeDefined();
	});

	it('generates static XML sitemap with XSL stylesheet reference', async () => {
		const handler = createSitemapHandler({
			config,
			staticRoutes: ['/', '/docs', '/about']
		});

		const response = (await handler({
			url: new URL('https://acme.example.com/sitemap.xml')
		} as any)) as Response;

		expect(response.headers.get('Content-Type')).toContain('application/xml');
		const body = await response.text();
		expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(body).toContain('xml-stylesheet type="text/xsl" href="/sitemap.xsl"');
		expect(body).toContain('<loc>https://acme.example.com/</loc>');
		expect(body).toContain('<loc>https://acme.example.com/docs</loc>');
		expect(body).toContain('<loc>https://acme.example.com/about</loc>');
	});

	it('generates human-readable sitemap XSL stylesheet with themed styling', async () => {
		const xsl = generateSitemapXsl(config);
		expect(xsl).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xsl).toContain('<xsl:stylesheet');
		expect(xsl).toContain('Acme Static Site');
		expect(xsl).toContain('#6366f1');
	});

	it('generates robots.txt with sitemap reference and preview protection', async () => {
		const handler = createRobotsHandler({
			config,
			isProduction: true
		});

		const response = (await handler({
			url: new URL('https://acme.example.com/robots.txt')
		} as any)) as Response;

		expect(response.headers.get('Content-Type')).toContain('text/plain');
		const body = await response.text();
		expect(body).toContain('User-agent: *');
		expect(body).toContain('Sitemap: https://acme.example.com/sitemap.xml');
	});

	it('generates dynamic SVG OpenGraph card in pure static/serverless execution', async () => {
		const svg = generateOgSvg({
			title: 'Pure Static Documentation',
			description: 'Blazing fast SSG with zero server overhead',
			siteName: 'Acme Static Site'
		});

		expect(svg).toContain('<svg');
		expect(svg).toContain('Pure Static Documentation');
		expect(svg).toContain('Blazing fast SSG with zero server overhead');
		expect(svg).toContain('Acme Static Site');
	});

	it('generates Schema.org JSON-LD structured data', () => {
		const schema = generateWebSiteSchema(config);
		expect(schema['@context']).toBe('https://schema.org');
		expect(schema['@type']).toBe('WebSite');
		expect(schema.name).toBe('Acme Static Site');
		expect(schema.url).toBe('https://acme.example.com');
	});

	it('generates valid Schema.org FAQPage rich snippet JSON-LD', () => {
		const faq = generateFaqSchema([
			{ question: 'What is Yaxa?', answer: 'The intuitive UI and SaaS library for Svelte 5.' },
			{ question: 'Is it free?', answer: 'Yes, it is MIT licensed open-source software.' }
		]);

		expect(faq['@context']).toBe('https://schema.org');
		expect(faq['@type']).toBe('FAQPage');
		expect(faq.mainEntity).toHaveLength(2);
		expect(faq.mainEntity[0].name).toBe('What is Yaxa?');
		expect(faq.mainEntity[0].acceptedAnswer.text).toBe(
			'The intuitive UI and SaaS library for Svelte 5.'
		);
	});

	it('generates valid Schema.org Product and Offer JSON-LD', () => {
		const product = generateProductSchema(config, {
			name: 'Pro Subscription',
			description: 'Full-stack SaaS toolkit access',
			price: 29,
			currency: 'USD',
			inStock: true
		});

		expect(product['@context']).toBe('https://schema.org');
		expect(product['@type']).toBe('Product');
		expect(product.name).toBe('Pro Subscription');
		expect(product.offers['@type']).toBe('Offer');
		expect(product.offers.price).toBe('29');
		expect(product.offers.priceCurrency).toBe('USD');
		expect(product.offers.availability).toBe('https://schema.org/InStock');
	});

	it('generates llms.txt standard markdown manifest for AI search engines', async () => {
		const text = generateLlmsTxt({
			config,
			sections: [
				{
					title: 'Documentation',
					description: 'Core concepts and guides',
					links: [{ title: 'Overview', url: '/docs/intro', description: 'Getting started guide' }]
				}
			]
		});

		expect(text).toContain('# Acme — Built for Speed');
		expect(text).toContain('> A pure static SvelteKit site using @sveltejs/adapter-static');
		expect(text).toContain('## Documentation');
		expect(text).toContain(
			'- [Overview](https://acme.example.com/docs/intro): Getting started guide'
		);
	});

	it('generates agent skill markdown and serves via createSkillHandler', async () => {
		const skillMd = generateSkillMd({
			config,
			actions: [
				{
					name: 'searchDocs',
					description: 'Search static documentation articles',
					endpoint: '/api/docs/search'
				}
			],
			customRules: ['Always prefer Tailwind v4 utility tokens over arbitrary hex codes.']
		});

		expect(skillMd).toContain('# Acme — Built for Speed Agent Skill');
		expect(skillMd).toContain('Svelte 5 & SvelteKit Strict Rules');
		expect(skillMd).toContain('Yaxa UI & Tailwind v4 Reference');
		expect(skillMd).toContain('`searchDocs`');
		expect(skillMd).toContain('/api/docs/search');
		expect(skillMd).toContain('Always prefer Tailwind v4 utility tokens');

		const handler = createSkillHandler({ config });
		const res = (await handler({} as any)) as Response;
		expect(res.headers.get('Content-Type')).toContain('text/markdown');
		expect(await res.text()).toContain('Svelte 5 & SvelteKit Strict Rules');
	});

	it('all-in-one createYaxaHook routes all SEO endpoints without route files', async () => {
		const hook = createYaxaHook(config);
		const resolve = vi.fn().mockResolvedValue(new Response('next-handler'));

		// Test /robots.txt
		const robotsEvent = {
			url: new URL('https://acme.example.com/robots.txt')
		};
		const robotsRes = await hook({ event: robotsEvent as any, resolve });
		expect(await robotsRes.text()).toContain('User-agent: *');

		// Test /sitemap.xml
		const sitemapEvent = {
			url: new URL('https://acme.example.com/sitemap.xml')
		};
		const sitemapRes = await hook({ event: sitemapEvent as any, resolve });
		expect(await sitemapRes.text()).toContain('<urlset');

		// Test /llms.txt
		const llmsEvent = {
			url: new URL('https://acme.example.com/llms.txt')
		};
		const llmsRes = await hook({ event: llmsEvent as any, resolve });
		expect(await llmsRes.text()).toContain('# Acme — Built for Speed');

		// Test /skill.md
		const skillEvent = {
			url: new URL('https://acme.example.com/skill.md')
		};
		const skillRes = await hook({ event: skillEvent as any, resolve });
		expect(await skillRes.text()).toContain('Svelte 5 & SvelteKit Strict Rules');

		// Test non-SEO route falls through to resolve
		const pageEvent = {
			url: new URL('https://acme.example.com/some-page')
		};
		const pageRes = await hook({ event: pageEvent as any, resolve });
		expect(await pageRes.text()).toBe('next-handler');
		expect(resolve).toHaveBeenCalled();
	});
});
