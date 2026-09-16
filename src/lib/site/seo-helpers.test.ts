import { describe, it, expect } from 'vitest';
import { definePageSeo } from './seo-helpers';

describe('definePageSeo', () => {
	it('returns the exact SEO configuration object passed to it', () => {
		const seo = definePageSeo({
			title: 'Test Page',
			description: 'A test page description',
			badge: 'Documentation'
		});

		expect(seo).toEqual({
			title: 'Test Page',
			description: 'A test page description',
			badge: 'Documentation'
		});
	});

	it('supports structured OpenGraph configuration', () => {
		const seo = definePageSeo({
			title: 'Analytics',
			ogImage: {
				title: 'Custom OG Title',
				description: 'Custom OG Description',
				badge: 'SaaS',
				theme: 'dark'
			},
			twitterCard: 'summary_large_image'
		});

		expect(seo.ogImage).toEqual({
			title: 'Custom OG Title',
			description: 'Custom OG Description',
			badge: 'SaaS',
			theme: 'dark'
		});
		expect(seo.twitterCard).toBe('summary_large_image');
	});

	it('supports robots directives and schema markup', () => {
		const schema = {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Yaxa'
		};

		const seo = definePageSeo({
			title: 'Secret Page',
			noindex: true,
			nofollow: true,
			schema
		});

		expect(seo.noindex).toBe(true);
		expect(seo.nofollow).toBe(true);
		expect(seo.schema).toBe(schema);
	});
});
