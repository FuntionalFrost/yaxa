import { describe, it, expect } from 'vitest';
import { createRobotsHandler } from './robots';
import { defineSiteConfig } from './config';

const config = defineSiteConfig({
	name: 'Yaxa',
	title: 'Yaxa UI',
	description: 'UI toolkit',
	url: 'https://yaxa.dev'
});

describe('createRobotsHandler', () => {
	it('disallows indexing in non-production environments', async () => {
		const handler = createRobotsHandler({
			config,
			isProduction: false
		});

		const response = (await handler({
			url: new URL('http://localhost:5173/robots.txt')
		} as any)) as Response;

		const body = await response.text();
		expect(response.headers.get('Content-Type')).toContain('text/plain');
		expect(body).toContain('User-agent: *');
		expect(body).toContain('Disallow: /');
		expect(body).toContain('# Non-production environment');
	});

	it('allows indexing and provides sitemap in production', async () => {
		const handler = createRobotsHandler({
			config,
			isProduction: true
		});

		const response = (await handler({
			url: new URL('https://yaxa.dev/robots.txt')
		} as any)) as Response;

		const body = await response.text();
		expect(body).toContain('User-agent: *');
		expect(body).toContain('Allow: /');
		expect(body).toContain('Disallow: /admin/');
		expect(body).toContain('Sitemap: https://yaxa.dev/sitemap.xml');
	});

	it('blocks AI web crawlers when aiCrawlers: disallow', async () => {
		const handler = createRobotsHandler({
			config,
			isProduction: true,
			aiCrawlers: 'disallow'
		});

		const response = (await handler({
			url: new URL('https://yaxa.dev/robots.txt')
		} as any)) as Response;

		const body = await response.text();
		expect(body).toContain('User-agent: GPTBot');
		expect(body).toContain('User-agent: ClaudeBot');
		expect(body).toContain('User-agent: PerplexityBot');
	});
});
