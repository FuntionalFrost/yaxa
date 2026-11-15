// Yaxa Server Suite - 100% Peer-Dependency-Free SvelteKit Server Hooks, Endpoints, OpenAPI, SSE, Jobs & Observability
// Optional SDK integrations live in dedicated subpaths: yaxa-svelte/auth, yaxa-svelte/db, yaxa-svelte/polar, yaxa-svelte/email, yaxa-svelte/storage

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
export { createLlmsTxtHandler, generateLlmsTxt } from '../site/llms';
export type { LlmsTxtOptions, LlmsSection, LlmsLink } from '../site/llms';
export { createSkillHandler, generateSkillMd } from '../site/skill';
export type { SkillOptions, SkillAction } from '../site/skill';

// Server DataTable Pagination & Pure SaaS Domain Types
export { parseDataTableQuery, createDataTableResponse } from './db/pagination';
export type {
	DataTableQueryParams,
	DataTableQueryOptions,
	DataTableResponse
} from './db/pagination';
export type {
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
} from './db/types';

// Zero-Dependency Auth Route Protection Hook (for createYaxaAuth factory, import from 'yaxa-svelte/auth')
export { createYaxaAuthHook } from './auth/hook';
export type { YaxaAuthHookOptions } from './auth/hook';

// Endpoint Pipeline, Guards & RFC 7807 Validation (Milestone 1)
export {
	yaxaEndpoint,
	createProblemDetails,
	problemResponse,
	isProblemDetails,
	requireAuth,
	requireRole,
	rateLimit,
	csrfGuard,
	composeGuards,
	validateData
} from './endpoint/index';
export type {
	YaxaEndpointConfig,
	YaxaEndpointContext,
	YaxaEndpointSchemaConfig,
	YaxaInterceptor,
	Guard,
	GuardResult,
	ProblemDetails,
	CreateProblemOptions,
	RequireAuthOptions,
	RequireRoleOptions,
	RateLimitOptions,
	CsrfGuardOptions,
	AnyValidator,
	InferValidatorOutput,
	ValidationOutcome,
	ValidationSuccess,
	ValidationFailure
} from './endpoint/index';

// Auto-Generated OpenAPI 3.1 & Interactive Docs (Milestone 3)
export {
	generateOpenApiSpec,
	createApiDocsHandler,
	createApiRegistry,
	globalApiRegistry,
	convertToJsonSchema
} from './openapi/index';
export type {
	OpenApiSpec31,
	OpenApiOperation,
	OpenApiParameter,
	OpenApiRequestBody,
	OpenApiResponse,
	GenerateOpenApiOptions,
	ApiDocsOptions,
	ApiDocsTheme,
	EndpointLike,
	EndpointMap
} from './openapi/index';

// Embedded Background Workflows, Job Queue & Domain Events (Milestone 6)
export {
	enqueueJob,
	defineWorker,
	createJobRunner,
	eventBus,
	EventBus,
	parseJobDelay
} from './jobs/index';
export type {
	JobRecord,
	JobDelay,
	EnqueueJobOptions,
	WorkerContext,
	WorkerHandler,
	WorkerDefinition,
	JobRunnerOptions,
	JobBatchResult,
	JobRunner,
	EventHandler,
	EventSubscription,
	IEventBus
} from './jobs/index';

// Adapter-Agnostic Real-Time Abstractions & Server-Sent Events (Milestone 5)
export {
	yaxaSSE,
	formatSSEFrame,
	broadcast,
	createBroadcaster,
	globalBroadcaster,
	MemoryBroadcaster
} from './realtime/index';
export type {
	SSEMessage,
	SSEClientContext,
	YaxaSSEOptions,
	BroadcastMessage,
	BroadcastSubscriber,
	Broadcaster
} from './realtime/index';

// AI Streaming & Real-Time Reasoning Engine
export { createAiStreamHandler } from './ai/index';
export type {
	AiStreamChunk,
	AiStreamContext,
	AiStreamHandlerFn,
	CreateAiStreamHandlerOptions
} from './ai/index';

// Zero-Dependency Observability, W3C Distributed Tracing & Server-Timing (Milestone 4)
export {
	parseTraceparent,
	resolveTraceContext,
	randomHex,
	createServerTiming,
	createRequestLogger
} from './observability/index';
export type {
	LogLevel,
	LogEntry,
	YaxaLoggerOptions,
	YaxaLogger,
	TraceContext,
	TimingMetric,
	ServerTimingTracker
} from './observability/index';

// Zero-Dependency HTTP Security Headers & HMAC Webhook Verifier
export {
	buildSecurityHeaders,
	createSecurityHeadersHook,
	computeHmacSha256Hex,
	verifyWebhookSignature,
	createWebhookHandler
} from './security/index';
export type {
	SecurityHeadersOptions,
	VerifyWebhookSignatureOptions,
	CreateWebhookHandlerOptions
} from './security/index';
