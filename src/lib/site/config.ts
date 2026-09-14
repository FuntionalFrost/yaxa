export interface AuthorConfig {
	name: string;
	url?: string;
	avatar?: string;
	email?: string;
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

export type ProjectLicense =
	| 'MIT'
	| 'AGPLv3'
	| 'GPL-3.0'
	| 'Apache-2.0'
	| 'BSD-3-Clause'
	| 'MPL-2.0'
	| 'Source-Available'
	| 'Proprietary'
	| 'Custom'
	| (string & {});

export type ProjectType =
	'open-source' | 'source-available' | 'commercial-saas' | 'freemium' | 'public-good' | 'personal';

export type PricingModel = 'free' | 'freemium' | 'paid' | 'open-source' | 'donation';

export interface ProjectConfig {
	/** Project license (e.g. 'MIT', 'AGPLv3', 'Proprietary', 'Source-Available') */
	license?: ProjectLicense;
	/** Custom license URL if applicable */
	licenseUrl?: string;
	/** Project category/type: 'open-source' | 'source-available' | 'commercial-saas' | 'freemium' | 'public-good' | 'personal' */
	type?: ProjectType;
	/** Pricing model: 'free' | 'freemium' | 'paid' | 'open-source' | 'donation' */
	pricingModel?: PricingModel;
	/** GitHub / GitLab repository URL */
	repositoryUrl?: string;
	/** Whether the project/software is completely free to use (for Schema.org isAccessibleForFree) */
	isAccessibleForFree?: boolean;
	/** Custom badge text for OpenGraph cards & headers (e.g. 'MIT Open Source', 'Commercial SaaS') */
	badge?: string;
}

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	url: string;
	/** Primary contact & support email (Solo devs can set this single email instead of company config) */
	email?: string;
	version?: string;
	defaultLocale?: string;
	logo?: string;
	author?: AuthorConfig;
	/** Optional company info. Solo developers can omit this and use top-level email */
	company?: Partial<CompanyConfig>;
	/** Software licensing & open-source / commercial nature */
	project?: ProjectConfig;
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

export function computeProjectBadge(project?: ProjectConfig): string {
	if (!project) return 'Web Application';
	if (project.badge) return project.badge;

	const type = project.type;
	const license = project.license;

	if (type === 'open-source') {
		return license ? `${license} Open Source` : 'Open Source';
	}
	if (type === 'source-available') {
		return license ? `${license} Source Available` : 'Source Available';
	}
	if (type === 'commercial-saas') {
		return 'Commercial SaaS';
	}
	if (type === 'freemium') {
		return 'Freemium SaaS';
	}
	if (type === 'public-good' || project.pricingModel === 'free') {
		return 'Free & Open';
	}
	return license || 'Software';
}

export function defineSiteConfig(config: SiteConfig): SiteConfig {
	const primaryEmail =
		config.email ||
		config.company?.contactEmail ||
		config.author?.email ||
		`contact@${config.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`;

	const defaultMorNotice =
		config.legal?.paymentProcessor === 'polar'
			? 'Payments securely processed by Polar.sh (Merchant of Record)'
			: config.legal?.paymentProcessor === 'lemonsqueezy'
				? 'Payments securely processed by Lemon Squeezy (Merchant of Record)'
				: config.legal?.paymentProcessor === 'stripe'
					? 'Payments securely processed by Stripe'
					: undefined;

	const projectBadge = computeProjectBadge(config.project);

	const resolvedCompany: CompanyConfig = {
		legalName: config.company?.legalName || config.author?.name || config.name,
		contactEmail: primaryEmail,
		address: config.company?.address,
		country: config.company?.country,
		vatNumber: config.company?.vatNumber,
		registrationNumber: config.company?.registrationNumber,
		registrationCourt: config.company?.registrationCourt,
		representative: config.company?.representative || config.author?.name
	};

	const resolvedProject: ProjectConfig = {
		license: config.project?.license || 'MIT',
		type: config.project?.type || 'open-source',
		pricingModel: config.project?.pricingModel || 'free',
		badge: projectBadge,
		isAccessibleForFree:
			config.project?.isAccessibleForFree ??
			(config.project?.type === 'open-source' || config.project?.pricingModel === 'free'),
		repositoryUrl: config.project?.repositoryUrl || config.socials?.github,
		...config.project
	};

	return {
		defaultLocale: 'en',
		email: primaryEmail,
		theme: {
			defaultMode: 'system',
			...config.theme
		},
		company: resolvedCompany,
		project: resolvedProject,
		legal: {
			refundDays: 14,
			paymentProcessor: 'polar',
			morNotice: defaultMorNotice,
			dpoEmail: config.legal?.dpoEmail || primaryEmail,
			...config.legal,
			links: {
				privacy: '/privacy',
				terms: '/terms',
				refunds: '/refunds',
				impressum: '/impressum',
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
	email: 'support@yaxa.vercel.app',
	logo: '/favicon.svg',
	project: {
		license: 'MIT',
		type: 'open-source',
		pricingModel: 'open-source',
		repositoryUrl: 'https://github.com/FuntionalFrost/yaxa'
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
