// Yaxa SEO & Site Metadata Subpath (yaxa-svelte/seo)
// Pure, zero-dependency SEO engine compatible with @sveltejs/adapter-static

// Svelte SEO Components
export { default as Seo } from '../components/seo/Seo.svelte';
export { default as Favicons } from '../components/seo/Favicons.svelte';

// Reactive Svelte 5 Runes Composable
export { useSeo } from './useSeo.svelte.js';

// Configuration & Types
export { defineSiteConfig, computeProjectBadge, DEFAULT_SITE_CONFIG } from './config.js';
export type {
	SiteConfig,
	ProjectLicense,
	ProjectType,
	PricingModel,
	ProjectConfig,
	AuthorConfig,
	NavItem,
	CompanyConfig,
	LegalConfig,
	LegalLinksConfig
} from './config.js';

// Turnkey Server & Static Request Handlers
export { createRobotsHandler } from './robots.js';
export type { RobotsOptions } from './robots.js';

export { createSitemapHandler } from './sitemap.js';
export type { SitemapRoute, SitemapImage, SitemapOptions } from './sitemap.js';

export { createSitemapXslHandler, generateSitemapXsl } from './sitemap-xsl.js';

export { createManifestHandler } from './manifest.js';
export type { ManifestOptions } from './manifest.js';

export { createOgImageHandler, generateOgSvg } from './og.js';
export type { OgImageOptions } from './og.js';

export { createLlmsTxtHandler, generateLlmsTxt } from './llms.js';
export type { LlmsTxtOptions, LlmsSection, LlmsLink } from './llms.js';

export { createSkillHandler, generateSkillMd } from './skill.js';
export type { SkillOptions, SkillAction } from './skill.js';

// Schema.org Structured Data (JSON-LD)
export {
	generateWebSiteSchema,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generateSoftwareSourceCodeSchema,
	generatePersonSchema,
	generateArticleSchema,
	generateBreadcrumbSchema,
	generateFaqSchema,
	generateProductSchema
} from './schema.js';
export type {
	SchemaType,
	BreadcrumbItem,
	ArticleSchemaData,
	FaqItem,
	ProductSchemaData
} from './schema.js';

// Page-Level SEO Helpers
export { definePageSeo } from './seo-helpers.js';
export type { PageSeoConfig } from './seo-helpers.js';

// SvelteKit Server Hook (All-in-one SEO routing)
export { createYaxaHook } from './hook.js';
export type { YaxaHookOptions } from './hook.js';

// Reactive Site Context Runes (Safe for SSR and CSR)
export { YaxaState, initYaxaState, useYaxa, useSiteConfig, useAuthUser } from './context.js';
export type { AuthUserContext } from './context.js';
