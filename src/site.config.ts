import { defineSiteConfig } from '$lib/site/config';

export const siteConfig = defineSiteConfig({
	name: 'Yaxa',
	title: 'Yaxa — The Intuitive Svelte UI Library',
	description:
		'A comprehensive Svelte 5 UI component library with 25+ accessible, Tailwind CSS components and automated SEO for building modern web applications.',
	url: 'https://yaxa.vercel.app',
	email: 'devfrost@protonmail.com',
	version: 'v1',
	logo: '/favicon.svg',
	project: {
		license: 'MIT',
		type: 'open-source',
		pricingModel: 'open-source',
		repositoryUrl: 'https://github.com/FuntionalFrost/yaxa'
	},
	author: {
		name: 'Yaxa Team',
		github: 'https://github.com/FuntionalFrost/yaxa'
	},
	legal: {
		jurisdiction: 'EU',
		paymentProcessor: 'polar',
		adNetwork: 'ethicalads',
		refundDays: 14,
		links: {
			privacy: '/privacy',
			terms: '/terms',
			refunds: '/refunds',
			impressum: '/impressum'
		}
	},
	theme: {
		primaryColor: '#ff3e00',
		neutralColor: '#71717a',
		defaultMode: 'dark'
	},
	seo: {
		titleTemplate: '%s · Yaxa',
		defaultOgImage: '/api/og',
		keywords: [
			'Svelte',
			'SvelteKit',
			'Svelte 5',
			'Nuxt UI',
			'Tailwind CSS v4',
			'UI Components',
			'SEO',
			'OpenGraph',
			'Sitemap',
			'Robots.txt'
		],
		robots: {
			index: true,
			follow: true
		}
	},
	sitemap: {
		changefreq: 'weekly',
		priority: 0.8,
		exclude: ['/api/*']
	},
	nav: [
		{ label: 'Docs', href: '/docs/intro' },
		{ label: 'Components', href: '/docs/comp-buttons' },
		{ label: 'SEO Suite', href: '/docs/seo-og' },
		{ label: 'Releases', href: 'https://github.com/FuntionalFrost/yaxa/releases' }
	],
	socials: {
		github: 'https://github.com/FuntionalFrost/yaxa',
		npm: 'https://www.npmjs.com/package/yaxa-svelte'
	}
});
