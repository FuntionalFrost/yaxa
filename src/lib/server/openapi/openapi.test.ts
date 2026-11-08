import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { createMockRequestEvent } from '#lib/testing/index.js';
import {
	generateOpenApiSpec,
	createApiDocsHandler,
	createApiRegistry,
	globalApiRegistry,
	convertToJsonSchema
} from './index.js';
import { yaxaEndpoint } from '../endpoint/index.js';
import { requireAuth, requireRole, rateLimit } from '../endpoint/guards.js';

describe('OpenAPI 3.1 Schema Engine', () => {
	it('converts Zod schema into compliant JSON Schema', () => {
		const schema = z.object({
			title: z.string().min(3),
			count: z.number().optional(),
			role: z.enum(['admin', 'member'])
		});

		const jsonSchema = convertToJsonSchema(schema);
		expect(jsonSchema.type).toBe('object');
		expect(jsonSchema.properties.title.type).toBe('string');
		expect(jsonSchema.properties.count.type).toBe('number');
		expect(jsonSchema.required).toContain('title');
		expect(jsonSchema.required).toContain('role');
		expect(jsonSchema.required).not.toContain('count');
	});
});

describe('API Route Registry', () => {
	let registry: ReturnType<typeof createApiRegistry>;

	beforeEach(() => {
		registry = createApiRegistry();
		globalApiRegistry.clear();
	});

	it('normalizes SvelteKit bracket path params to OpenAPI curly braces', () => {
		expect(registry.normalizePath('/api/items/[id]')).toBe('/api/items/{id}');
		expect(registry.normalizePath('/api/orgs/[orgSlug]/users/[userId]')).toBe(
			'/api/orgs/{orgSlug}/users/{userId}'
		);
		expect(registry.normalizePath('/api/files/[...rest]')).toBe('/api/files/{rest}');
	});

	it('registers endpoints and retrieves them in normalized form', () => {
		const getHandler = yaxaEndpoint({ handle: () => [] });
		registry.register('/api/users/[id]', { GET: getHandler });

		const endpoints = registry.getEndpoints();
		expect(endpoints['/api/users/{id}']).toBeDefined();
		expect(endpoints['/api/users/{id}']['GET']).toBe(getHandler);
	});
});

describe('generateOpenApiSpec Engine', () => {
	const ItemParamsSchema = z.object({
		id: z.string()
	});

	const ItemQuerySchema = z.object({
		filter: z.string().optional(),
		limit: z.number().optional()
	});

	const CreateItemBodySchema = z.object({
		name: z.string().min(2),
		price: z.number().positive()
	});

	it('generates complete OpenAPI 3.1 document with parameters, body and tags', () => {
		const registry = createApiRegistry();

		const getEndpoint = yaxaEndpoint({
			summary: 'Get Item By ID',
			description: 'Retrieves an item record by its unique ID',
			tags: ['Items'],
			schema: {
				params: ItemParamsSchema,
				query: ItemQuerySchema
			},
			handle: ({ params }) => ({ id: params.id })
		});

		const postEndpoint = yaxaEndpoint({
			summary: 'Create Item',
			tags: ['Items'],
			schema: {
				body: CreateItemBodySchema
			},
			handle: ({ body }) => body
		});

		registry.register('/api/items/[id]', { GET: getEndpoint });
		registry.register('/api/items', { POST: postEndpoint });

		const spec = generateOpenApiSpec({
			title: 'Inventory API',
			version: '2.0.0',
			description: 'Test Inventory System',
			registry
		});

		expect(spec.openapi).toBe('3.1.0');
		expect(spec.info.title).toBe('Inventory API');
		expect(spec.info.version).toBe('2.0.0');

		// Verify GET /api/items/{id}
		const getOp = spec.paths['/api/items/{id}']['get'];
		expect(getOp.summary).toBe('Get Item By ID');
		expect(getOp.tags).toEqual(['Items']);
		expect(getOp.parameters).toHaveLength(3); // id (path), filter (query), limit (query)

		const idParam = getOp.parameters?.find((p) => p.name === 'id');
		expect(idParam?.in).toBe('path');
		expect(idParam?.required).toBe(true);

		// Verify POST /api/items
		const postOp = spec.paths['/api/items']['post'];
		expect(postOp.summary).toBe('Create Item');
		expect(postOp.requestBody).toBeDefined();
		expect(postOp.requestBody?.content['application/json'].schema?.type).toBe('object');
		expect(postOp.responses['201']).toBeDefined();
		expect(postOp.responses['422']).toBeDefined(); // Schema validation failed
	});

	it('deduces security schemes and RFC 7807 responses from guards automatically', () => {
		const registry = createApiRegistry();

		const secureEndpoint = yaxaEndpoint({
			guards: [
				requireAuth(),
				requireRole(['admin', 'billing_manager']),
				rateLimit({ points: 15, windowSeconds: 60 })
			],
			schema: {
				body: CreateItemBodySchema
			},
			handle: () => ({ ok: true })
		});

		registry.register('/api/secure-action', { POST: secureEndpoint });

		const spec = generateOpenApiSpec({ registry });
		const op = spec.paths['/api/secure-action']['post'];

		// Security schemes attached
		expect(spec.components?.securitySchemes?.BearerAuth).toBeDefined();
		expect(spec.components?.securitySchemes?.CookieAuth).toBeDefined();
		expect(op.security).toBeDefined();

		// Guard error responses generated
		expect(op.responses['401']).toBeDefined();
		expect(op.responses['403']).toBeDefined();
		expect(op.responses['403'].description).toContain('admin, billing_manager');
		expect(op.responses['422']).toBeDefined();
		expect(op.responses['429']).toBeDefined();
		expect(op.responses['429'].headers?.['Retry-After']).toBeDefined();
		expect(op.responses['500']).toBeDefined();

		// Components schema ProblemDetails registered
		expect(spec.components?.schemas?.ProblemDetails).toBeDefined();
	});

	it('supports self-registration via yaxaEndpoint path and method metadata', () => {
		globalApiRegistry.clear();

		yaxaEndpoint({
			path: '/api/v1/auto-registered',
			method: 'GET',
			summary: 'Auto Registered Route',
			handle: () => 'ok'
		});

		const spec = generateOpenApiSpec();
		expect(spec.paths['/api/v1/auto-registered']?.['get']?.summary).toBe('Auto Registered Route');
	});
});

describe('createApiDocsHandler Endpoint', () => {
	it('serves OpenAPI 3.1 JSON when format=json query parameter is present', async () => {
		const handler = createApiDocsHandler({
			title: 'Store API',
			version: '1.2.3'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs?format=json'
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');

		const json = await response.json();
		expect(json.openapi).toBe('3.1.0');
		expect(json.info.title).toBe('Store API');
		expect(json.info.version).toBe('1.2.3');
	});

	it('serves OpenAPI 3.1 JSON when Accept header requests application/json', async () => {
		const handler = createApiDocsHandler();

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs',
			headers: { accept: 'application/json' }
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
	});

	it('renders Scalar HTML documentation by default', async () => {
		const handler = createApiDocsHandler({
			title: 'Scalar Docs Test',
			theme: 'scalar'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs'
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');

		const html = await response.text();
		expect(html).toContain('<title>Scalar Docs Test</title>');
		expect(html).toContain('@scalar/api-reference');
		expect(html).toContain('id="api-reference"');
	});

	it('renders Swagger UI HTML when theme is swagger', async () => {
		const handler = createApiDocsHandler({
			title: 'Swagger Docs Test',
			theme: 'swagger'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs'
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');

		const html = await response.text();
		expect(html).toContain('<title>Swagger Docs Test</title>');
		expect(html).toContain('swagger-ui-dist');
		expect(html).toContain('SwaggerUIBundle');
	});

	it('falls back to scalar HTML when an unrecognized theme query is passed', async () => {
		const handler = createApiDocsHandler({
			title: 'Fallback Docs Test',
			theme: 'scalar'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs?theme=unknown'
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');

		const html = await response.text();
		expect(html).toContain('<title>Fallback Docs Test</title>');
		expect(html).toContain('@scalar/api-reference');
	});

	it('allows overriding theme dynamically via ?theme query parameter', async () => {
		const handler = createApiDocsHandler({
			title: 'Dynamic Theme Test',
			theme: 'scalar'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs?theme=swagger'
		});

		const response = await handler(event);
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain('swagger-ui-dist');
	});
});
