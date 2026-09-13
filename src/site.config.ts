import { defineSiteConfig } from '$lib/site/config';

export const siteConfig = defineSiteConfig({
	name: 'Yaxa',
	title: 'Yaxa — The Intuitive Svelte UI Library',
	description:
		'A comprehensive Svelte 5 UI component library (SvelteKit optional) with 25+ accessible, Tailwind CSS components for building modern web applications.',
	url: 'https://yaxa.vercel.app',
	version: 'v1',
	logo: '/favicon.svg',
	author: {
		name: 'Yaxa Team',
		twitter: '@yaxa_ui',
		github: 'https://github.com/FuntionalFrost/yaxa'
	},
	company: {
		legalName: 'Yaxa Open Source Project',
		address: 'Berlin, Germany',
		country: 'Germany',
		contactEmail: 'contact@yaxa.vercel.app',
		vatNumber: 'DE-394819201',
		registrationCourt: 'Amtsgericht Charlottenburg'
	},
	legal: {
		jurisdiction: 'EU',
		paymentProcessor: 'polar',
		adNetwork: 'ethicalads',
		refundDays: 14,
		governingLaw: 'European Union (Germany)',
		dpoEmail: 'privacy@yaxa.vercel.app',
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
		twitterCard: 'summary_large_image',
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
		twitter: 'https://twitter.com/yaxa_ui'
	}
});
