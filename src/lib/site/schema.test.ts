import { describe, it, expect } from 'vitest';
import {
	generateWebSiteSchema,
	generatePersonSchema,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generateSoftwareSourceCodeSchema,
	generateArticleSchema,
	generateBreadcrumbSchema
} from './schema';
import { defineSiteConfig } from './config';

const testConfig = defineSiteConfig({
	name: 'Yaxa App',
	title: 'Yaxa App Title',
	description: 'Test application description',
	url: 'https://yaxa.test',
	author: {
		name: 'John Doe',
		url: 'https://johndoe.me',
		twitter: 'johndoe',
		github: 'johndoe'
	},
	company: {
		legalName: 'Yaxa Technologies Inc',
		contactEmail: 'support@yaxa.test',
		country: 'US'
	},
	project: {
		license: 'MIT',
		licenseUrl: 'https://yaxa.test/license',
		type: 'open-source',
		pricingModel: 'free',
		repositoryUrl: 'https://github.com/yaxa/app',
		isAccessibleForFree: true
	}
});

describe('SEO Schema Generators', () => {
	it('generates valid WebSite schema', () => {
		const schema = generateWebSiteSchema(testConfig);
		expect(schema['@context']).toBe('https://schema.org');
		expect(schema['@type']).toBe('WebSite');
		expect(schema.name).toBe('Yaxa App');
		expect(schema.url).toBe('https://yaxa.test');
		expect(schema.license).toBe('https://yaxa.test/license');
		expect(schema.isAccessibleForFree).toBe(true);
		expect(schema.author?.name).toBe('John Doe');
	});

	it('generates valid Person schema', () => {
		const schema = generatePersonSchema(testConfig);
		expect(schema['@type']).toBe('Person');
		expect(schema.name).toBe('John Doe');
		expect(schema.sameAs).toContain('https://twitter.com/johndoe');
		expect(schema.sameAs).toContain('https://github.com/johndoe');
	});

	it('generates valid Organization schema', () => {
		const schema = generateOrganizationSchema(testConfig);
		expect(schema['@type']).toBe('Organization');
		expect(schema.name).toBe('Yaxa App');
		expect(schema.legalName).toBe('Yaxa Technologies Inc');
		expect(schema.email).toBe('support@yaxa.test');
	});

	it('generates valid SoftwareApplication schema', () => {
		const schema = generateSoftwareApplicationSchema(testConfig);
		expect(schema['@type']).toBe('SoftwareApplication');
		expect(schema.applicationCategory).toBe('DeveloperApplication');
		expect(schema.offers?.price).toBe('0');
	});

	it('generates valid SoftwareSourceCode schema', () => {
		const schema = generateSoftwareSourceCodeSchema(testConfig);
		expect(schema['@type']).toBe('SoftwareSourceCode');
		expect(schema.codeRepository).toBe('https://github.com/yaxa/app');
		expect(schema.programmingLanguage).toBe('Svelte');
	});

	it('generates valid Article schema', () => {
		const schema = generateArticleSchema(testConfig, {
			title: 'Building with Svelte 5',
			description: 'Guide to runes in Svelte 5',
			url: 'https://yaxa.test/blog/svelte-5',
			datePublished: '2026-01-01T00:00:00Z',
			authorName: 'John Doe'
		});
		expect(schema['@type']).toBe('Article');
		expect(schema.headline).toBe('Building with Svelte 5');
		expect(schema.author?.name).toBe('John Doe');
		expect(schema.publisher?.name).toBe('Yaxa App');
	});

	it('generates valid BreadcrumbList schema', () => {
		const schema = generateBreadcrumbSchema(testConfig, [
			{ name: 'Home', url: '/' },
			{ name: 'Docs', url: '/docs' },
			{ name: 'Components', url: '/docs/components' }
		]);
		expect(schema['@type']).toBe('BreadcrumbList');
		expect(schema.itemListElement).toHaveLength(3);
		expect(schema.itemListElement[0]).toEqual({
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: 'https://yaxa.test/'
		});
		expect(schema.itemListElement[2].position).toBe(3);
	});
});
