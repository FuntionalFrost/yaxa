import { defineSiteConfig } from '#lib/site/config.js';

export const siteConfig = defineSiteConfig({
	name: 'Yaxa',
	title: 'Yaxa — The Intuitive Svelte UI Library & Solo SaaS Framework',
	description:
		'Nuxt UI v4 equivalent for SvelteKit 2 & 3 and Svelte 5. 50+ accessible components with Tailwind CSS v4, type-safe API pipeline (yaxaEndpoint), OpenAPI 3.1 & Scalar interactive docs, real-time SSE, background job queue, and automated SEO.',
	url: 'https://yaxa.vercel.app',
	email: 'devfrost@protonmail.com',
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
		paymentProcessor: 'none',
		adNetwork: 'ethicalads',
		links: {
			privacy: '/privacy',
			terms: '/terms',
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
			'SvelteKit SaaS',
			'OpenAPI 3.1',
			'Scalar',
			'Type-Safe RPC',
			'Server-Sent Events',
			'SSE',
			'Job Queue',
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
		exclude: ['/api/auth/*', '/api/cron/*', '/api/events', '/api/projects']
	},
	nav: [
		{ label: 'Docs', href: '/docs/intro' },
		{ label: 'Theme Studio', href: '/theme', badge: 'New' },
		{ label: 'Components', href: '/docs/comp-buttons' },
		{ label: 'SEO Suite', href: '/docs/seo-og' },
		{ label: 'SaaS Suite', href: '/saas' },
		{ label: 'API Docs', href: '/api/docs', badge: 'Scalar' }
	],
	socials: {
		github: 'https://github.com/FuntionalFrost/yaxa',
		npm: 'https://www.npmjs.com/package/yaxa-svelte'
	}
});
