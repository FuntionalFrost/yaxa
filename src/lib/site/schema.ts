import type { SiteConfig } from './config';

export type SchemaType =
	| 'WebSite'
	| 'Organization'
	| 'Person'
	| 'SoftwareApplication'
	| 'SoftwareSourceCode'
	| 'WebPage'
	| 'Article'
	| 'Product'
	| 'BreadcrumbList'
	| 'FAQPage';

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export interface ArticleSchemaData {
	title: string;
	description: string;
	url: string;
	datePublished: string;
	dateModified?: string;
	image?: string;
	authorName?: string;
}

export function generateWebSiteSchema(config: SiteConfig) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: config.name,
		url: config.url,
		description: config.description,
		license: config.project?.licenseUrl || config.project?.license || undefined,
		isAccessibleForFree: config.project?.isAccessibleForFree,
		...(config.author
			? {
					author: {
						'@type': 'Person',
						name: config.author.name,
						url: config.author.url,
						email: config.author.email || config.email
					}
				}
			: {})
	};
}

export function generatePersonSchema(config: SiteConfig) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: config.author?.name || config.company?.legalName || config.name,
		url: config.author?.url || config.url,
		email: config.email || config.author?.email,
		sameAs: [
			config.author?.twitter ? `https://twitter.com/${config.author.twitter}` : undefined,
			config.author?.github ? `https://github.com/${config.author.github}` : undefined,
			config.socials?.github,
			config.socials?.twitter,
			config.socials?.bluesky
		].filter(Boolean)
	};
}

export function generateSoftwareApplicationSchema(config: SiteConfig) {
	const offers =
		config.project?.pricingModel === 'paid' || config.project?.pricingModel === 'freemium'
			? {
					'@type': 'Offer',
					price: config.project?.pricingModel === 'freemium' ? '0' : undefined,
					priceCurrency: 'USD'
				}
			: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
				};

	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: config.name,
		headline: config.title,
		description: config.description,
		url: config.url,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Any',
		license: config.project?.licenseUrl || config.project?.license,
		isAccessibleForFree: config.project?.isAccessibleForFree ?? true,
		offers,
		author: config.author
			? {
					'@type': 'Person',
					name: config.author.name,
					url: config.author.url
				}
			: undefined
	};
}

export function generateSoftwareSourceCodeSchema(config: SiteConfig) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name: config.name,
		description: config.description,
		programmingLanguage: 'Svelte',
		runtimePlatform: 'SvelteKit 2',
		codeRepository: config.project?.repositoryUrl || config.socials?.github || undefined,
		license: config.project?.licenseUrl || config.project?.license || 'MIT',
		author: config.author
			? {
					'@type': 'Person',
					name: config.author.name,
					url: config.author.url
				}
			: undefined
	};
}

export function generateOrganizationSchema(config: SiteConfig) {
	const privacyUrl = config.legal?.links?.privacy
		? config.legal.links.privacy.startsWith('http')
			? config.legal.links.privacy
			: `${config.url}${config.legal.links.privacy}`
		: undefined;

	const termsUrl = config.legal?.links?.terms
		? config.legal.links.terms.startsWith('http')
			? config.legal.links.terms
			: `${config.url}${config.legal.links.terms}`
		: undefined;

	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: config.name,
		legalName: config.company?.legalName || undefined,
		url: config.url,
		logo: config.logo ? `${config.url}${config.logo}` : undefined,
		email: config.email || config.company?.contactEmail || undefined,
		address: config.company?.address
			? {
					'@type': 'PostalAddress',
					streetAddress: config.company.address,
					addressCountry: config.company.country || undefined
				}
			: undefined,
		vatID: config.company?.vatNumber || undefined,
		taxID: config.company?.registrationNumber || undefined,
		publishingPrinciples: privacyUrl,
		termsOfService: termsUrl,
		sameAs: [
			config.socials?.github,
			config.socials?.twitter,
			config.socials?.discord,
			config.socials?.bluesky,
			config.socials?.youtube
		].filter(Boolean)
	};
}

export function generateArticleSchema(config: SiteConfig, article: ArticleSchemaData) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.description,
		url: article.url,
		datePublished: article.datePublished,
		dateModified: article.dateModified || article.datePublished,
		image: article.image,
		author: {
			'@type': 'Person',
			name: article.authorName || config.author?.name || config.name
		},
		publisher: {
			'@type': 'Organization',
			name: config.name,
			logo: config.logo ? { '@type': 'ImageObject', url: `${config.url}${config.logo}` } : undefined
		}
	};
}

export function generateBreadcrumbSchema(config: SiteConfig, items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${config.url}${item.url}`
		}))
	};
}
