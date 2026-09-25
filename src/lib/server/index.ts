// Yaxa Server Suite - SvelteKit Server Hooks, Auth, Database, Payments & Email

// Server Hooks & SEO Endpoints
export { createYaxaHook } from '../site/hook';
export type { YaxaHookOptions } from '../site/hook';
export { createRobotsHandler } from '../site/robots';
export type { RobotsOptions } from '../site/robots';
export { createSitemapHandler } from '../site/sitemap';
export type { SitemapRoute, SitemapOptions } from '../site/sitemap';
export { createSitemapXslHandler, generateSitemapXsl } from '../site/sitemap-xsl';
export { createOgImageHandler, generateOgSvg } from '../site/og';
export type { OgImageOptions } from '../site/og';
export { createManifestHandler } from '../site/manifest';

// Database, Drizzle ORM & Server Pagination
export { getDb, schemaPg, schemaSqlite } from './db/index';
export type {
	DbConfig,
	DbDriver,
	SaasUser,
	OrgRole,
	SaasOrganization,
	SaasMember,
	SaasInvitation,
	SaasSubscription,
	SubscriptionStatus,
	PricingTier,
	PricingFeature
} from './db/index';
export { parseDataTableQuery, createDataTableResponse } from './db/pagination';
export type {
	DataTableQueryParams,
	DataTableQueryOptions,
	DataTableResponse
} from './db/pagination';

// Authentication (Better-Auth)
export { createYaxaAuth } from './auth/index';
export type { YaxaAuthConfig, YaxaAuth } from './auth/index';
export { createYaxaAuthHook } from './auth/hook';
export type { YaxaAuthHookOptions } from './auth/hook';

// Polar.sh Payments & Webhooks
export {
	getPolarClient,
	createPolarCheckout,
	createPolarCustomerPortalSession,
	createPolarWebhookHandler
} from './polar/index';
export type { PolarConfig, CreateCheckoutOptions, PolarWebhookOptions } from './polar/index';

// Transactional Emails (Resend)
export { getResendClient, sendMagicLinkEmail, sendWelcomeEmail } from './email/index';
export type {
	ResendEmailConfig,
	SendMagicLinkOptions,
	SendWelcomeEmailOptions
} from './email/index';

// Cloud Storage (AWS S3 & Cloudflare R2)
export { getS3Client, createPresignedUploadUrl, createS3UploadHandler } from './storage/index';
export type {
	S3StorageConfig,
	PresignedUploadOptions,
	PresignedUploadResult,
	S3UploadHandlerOptions
} from './storage/index';
