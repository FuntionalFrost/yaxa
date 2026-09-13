export interface AuthorConfig {
	name: string;
	url?: string;
	avatar?: string;
	twitter?: string;
	github?: string;
}

export interface NavItem {
	label: string;
	href: string;
	icon?: string;
	external?: boolean;
	badge?: string;
}

export interface CompanyConfig {
	legalName: string;
	address?: string;
	country?: string;
	contactEmail: string;
	vatNumber?: string;
	registrationNumber?: string;
	registrationCourt?: string;
	representative?: string;
}

export interface LegalLinksConfig {
	privacy?: string;
	terms?: string;
	refunds?: string;
	impressum?: string;
}

export interface LegalConfig {
	jurisdiction?: string;
	paymentProcessor?: 'polar' | 'stripe' | 'lemonsqueezy' | 'custom' | 'none';
	adNetwork?: 'ethicalads' | 'custom' | 'none';
	analytics?: 'none' | 'plausible' | 'fathom' | 'custom';
	refundDays?: number;
	governingLaw?: string;
	dpoEmail?: string;
	morNotice?: string;
	links?: LegalLinksConfig;
}

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	url: string;
	version?: string;
	defaultLocale?: string;
	logo?: string;
	author?: AuthorConfig;
	company?: CompanyConfig;
	legal?: LegalConfig;
	theme?: {
		primaryColor?: string;
		neutralColor?: string;
		defaultMode?: 'light' | 'dark' | 'system';
	};
	seo?: {
		titleTemplate?: string;
		defaultOgImage?: string;
		twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
		keywords?: string[];
		robots?: {
			index?: boolean;
			follow?: boolean;
			noarchive?: boolean;
			nosnippet?: boolean;
		};
	};
	sitemap?: {
		changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
		priority?: number;
		exclude?: string[];
	};
	robots?: {
		rules?: Array<{
			userAgent: string;
			allow?: string[];
			disallow?: string[];
		}>;
	};
	nav?: NavItem[];
	socials?: {
		github?: string;
		twitter?: string;
		discord?: string;
		bluesky?: string;
		youtube?: string;
	};
}

export function defineSiteConfig(config: SiteConfig): SiteConfig {
	const defaultMorNotice =
		config.legal?.paymentProcessor === 'polar'
			? 'Payments securely processed by Polar.sh (Merchant of Record)'
			: config.legal?.paymentProcessor === 'lemonsqueezy'
				? 'Payments securely processed by Lemon Squeezy (Merchant of Record)'
				: config.legal?.paymentProcessor === 'stripe'
					? 'Payments securely processed by Stripe'
					: undefined;

	return {
		defaultLocale: 'en',
		theme: {
			defaultMode: 'system',
			...config.theme
		},
		legal: {
			refundDays: 14,
			paymentProcessor: 'polar',
			morNotice: defaultMorNotice,
			...config.legal,
			links: {
				privacy: '/privacy',
				terms: '/terms',
				refunds: '/refunds',
				...config.legal?.links
			}
		},
		seo: {
			titleTemplate: '%s · ' + config.name,
			defaultOgImage: '/api/og',
			twitterCard: 'summary_large_image',
			robots: {
				index: true,
				follow: true
			},
			...config.seo
		},
		sitemap: {
			changefreq: 'weekly',
			priority: 0.8,
			exclude: ['/api/*'],
			...config.sitemap
		},
		...config
	};
}

export const DEFAULT_SITE_CONFIG: SiteConfig = defineSiteConfig({
	name: 'Yaxa',
	title: 'Yaxa — Intuitive Svelte UI Library',
	description: 'A comprehensive Svelte 5 UI component and SEO library with Tailwind CSS v4.',
	url: 'https://yaxa.vercel.app',
	logo: '/favicon.svg',
	company: {
		legalName: 'Yaxa Open Source',
		contactEmail: 'support@yaxa.vercel.app'
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
		twitterCard: 'summary_large_image'
	},
	nav: [
		{ label: 'Docs', href: '/docs' },
		{ label: 'Components', href: '/docs/comp-buttons' },
		{ label: 'SEO Suite', href: '/docs/seo-og' }
	]
});
