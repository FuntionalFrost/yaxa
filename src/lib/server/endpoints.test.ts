import { describe, it, expect } from 'vitest';
import { createMockRequestEvent, createMockSiteConfig } from '$lib/testing';
import { createOgImageHandler } from '$lib/site/og';
import { createRobotsHandler } from '$lib/site/robots';

describe('Server Route Endpoints Contract Tests', () => {
	const mockConfig = createMockSiteConfig({
		name: 'Yaxa Pro',
		url: 'https://yaxa.dev',
		description: 'The Svelte 5 UI Engine'
	});

	it('generates dynamic SVG OpenGraph image with headers and SVG content', async () => {
		const ogHandler = createOgImageHandler({ config: mockConfig });
		const event = createMockRequestEvent({
			url: 'https://yaxa.dev/api/og?title=Getting+Started&description=Learn+Yaxa+Fast'
		});

		const response = await ogHandler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('image/svg+xml');
		expect(response.headers.get('cache-control')).toContain('public');

		const svgContent = await response.text();
		expect(svgContent).toContain('<svg');
		expect(svgContent).toContain('Getting Started');
		expect(svgContent).toContain('Learn Yaxa Fast');
		expect(svgContent).toContain('Yaxa Pro');
	});

	it('generates compliant robots.txt with disallow rules and sitemap declaration in production', async () => {
		const robotsHandler = createRobotsHandler({
			config: mockConfig,
			isProduction: true
		});
		const event = createMockRequestEvent({
			url: 'https://yaxa.dev/robots.txt'
		});

		const response = await robotsHandler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/plain');

		const robotsContent = await response.text();
		expect(robotsContent).toContain('User-agent: *');
		expect(robotsContent).toContain('Allow: /');
		expect(robotsContent).toContain('Disallow: /admin');
		expect(robotsContent).toContain('Sitemap: https://yaxa.dev/sitemap.xml');
	});

	it('safeguards non-production environments by disabling indexing', async () => {
		const robotsHandler = createRobotsHandler({
			config: mockConfig,
			isProduction: false
		});
		const event = createMockRequestEvent({
			url: 'https://preview.yaxa.dev/robots.txt'
		});

		const response = await robotsHandler(event);
		const robotsContent = await response.text();
		expect(robotsContent).toContain('# Non-production environment: indexing disabled');
		expect(robotsContent).toContain('Disallow: /');
	});

	it('generates valid sitemap XML with routes and changefreq', async () => {
		const { createSitemapHandler } = await import('$lib/site/sitemap');
		const sitemapHandler = createSitemapHandler({
			config: mockConfig,
			staticRoutes: ['/', '/docs', '/saas', '/admin']
		});
		const event = createMockRequestEvent({
			url: 'https://yaxa.dev/sitemap.xml'
		});

		const response = await sitemapHandler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/xml');

		const xmlContent = await response.text();
		expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xmlContent).toContain('<urlset');
		expect(xmlContent).toContain('<loc>https://yaxa.dev/</loc>');
		expect(xmlContent).toContain('<loc>https://yaxa.dev/docs</loc>');
		expect(xmlContent).toContain('<loc>https://yaxa.dev/saas</loc>');
	});

	it('generates styled sitemap XSL stylesheet with branding', async () => {
		const { createSitemapXslHandler } = await import('$lib/site/sitemap-xsl');
		const xslHandler = createSitemapXslHandler({ config: mockConfig });
		const event = createMockRequestEvent({
			url: 'https://yaxa.dev/sitemap.xsl'
		});

		const response = await xslHandler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/xml');

		const xslContent = await response.text();
		expect(xslContent).toContain('<xsl:stylesheet');
		expect(xslContent).toContain('Yaxa Pro Sitemap');
	});
});
