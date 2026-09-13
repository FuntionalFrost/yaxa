import type { SiteConfig } from './config';

export type SchemaType =
	'WebSite' | 'Organization' | 'WebPage' | 'Article' | 'Product' | 'BreadcrumbList' | 'FAQPage';

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
		...(config.author
			? {
					author: {
						'@type': 'Person',
						name: config.author.name,
						url: config.author.url
					}
				}
			: {})
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
		email: config.company?.contactEmail || undefined,
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
