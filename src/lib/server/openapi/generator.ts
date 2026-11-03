import type {
	GenerateOpenApiOptions,
	OpenApiOperation,
	OpenApiParameter,
	OpenApiSpec31,
	OpenApiResponse,
	EndpointLike
} from './types';
import { convertToJsonSchema } from './schema';
import { globalApiRegistry } from './registry';
import type { YaxaEndpointConfig } from '../endpoint/types';

/**
 * Standard RFC 7807 Problem Details Schema for OpenAPI Components.
 */
const PROBLEM_DETAILS_SCHEMA = {
	type: 'object',
	properties: {
		type: { type: 'string', format: 'uri', example: 'https://yaxa.dev/errors/validation-failed' },
		title: { type: 'string', example: 'Unprocessable Entity' },
		status: { type: 'integer', example: 422 },
		detail: { type: 'string', example: 'Validation failed for 1 parameter(s).' },
		instance: { type: 'string' },
		invalidParams: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string', example: 'body.email' },
					reason: { type: 'string', example: 'Invalid email address' }
				},
				required: ['name', 'reason']
			}
		}
	},
	required: ['type', 'title', 'status']
};

/**
 * Extracts parameter list from a converted JSON schema.
 */
function extractParametersFromSchema(
	jsonSchema: Record<string, any>,
	location: 'path' | 'query' | 'header'
): OpenApiParameter[] {
	if (!jsonSchema || typeof jsonSchema !== 'object' || !jsonSchema.properties) {
		return [];
	}

	const requiredList = Array.isArray(jsonSchema.required) ? jsonSchema.required : [];
	const parameters: OpenApiParameter[] = [];

	for (const [key, propSchema] of Object.entries<any>(jsonSchema.properties)) {
		parameters.push({
			name: key,
			in: location,
			required: location === 'path' ? true : requiredList.includes(key),
			description: propSchema?.description,
			deprecated: propSchema?.deprecated,
			schema: propSchema
		});
	}

	return parameters;
}

/**
 * Resolves YaxaEndpointConfig from an endpoint function or config object.
 */
function resolveConfig(endpoint: EndpointLike): YaxaEndpointConfig | null {
	if (!endpoint) return null;
	if (typeof endpoint === 'function' && '_yaxaConfig' in endpoint) {
		return (endpoint as any)._yaxaConfig;
	}
	if (typeof endpoint === 'object' && 'handle' in endpoint) {
		return endpoint as YaxaEndpointConfig;
	}
	return null;
}

/**
 * Generates an OpenAPI 3.1.0 document from registered yaxaEndpoints.
 */
export function generateOpenApiSpec(options: GenerateOpenApiOptions = {}): OpenApiSpec31 {
	const title = options.title || 'Yaxa SvelteKit API';
	const version = options.version || '1.0.0';
	const description = options.description || 'Auto-generated OpenAPI 3.1 contract via yaxa-svelte.';

	const registry = options.registry || globalApiRegistry;
	const registeredEndpoints = registry.getEndpoints();

	// Merge manual options.endpoints if provided
	const mergedEndpoints: Record<string, Record<string, EndpointLike>> = {
		...registeredEndpoints
	};

	if (options.endpoints) {
		for (const [rawPath, methods] of Object.entries(options.endpoints)) {
			const normalizedPath = registry.normalizePath(rawPath);
			if (!mergedEndpoints[normalizedPath]) {
				mergedEndpoints[normalizedPath] = {};
			}
			for (const [method, handler] of Object.entries(methods)) {
				mergedEndpoints[normalizedPath][method.toUpperCase()] = handler;
			}
		}
	}

	const paths: Record<string, Record<string, OpenApiOperation>> = {};
	const securitySchemes: Record<string, any> = {};
	let usesSecurity = false;

	for (const [path, methods] of Object.entries(mergedEndpoints)) {
		paths[path] = {};

		for (const [method, endpoint] of Object.entries(methods)) {
			const config = resolveConfig(endpoint);
			const methodLower = method.toLowerCase();

			if (!config) {
				// Fallback for raw RequestHandler
				paths[path][methodLower] = {
					summary: `${method.toUpperCase()} ${path}`,
					responses: {
						'200': { description: 'Successful response' }
					}
				};
				continue;
			}

			const parameters: OpenApiParameter[] = [];

			// 1. Path Params
			if (config.schema?.params) {
				const paramsSchema = convertToJsonSchema(config.schema.params);
				parameters.push(...extractParametersFromSchema(paramsSchema, 'path'));
			} else {
				// Detect {param} placeholders in path and add basic string parameters
				const pathParamMatches = path.match(/\{(\w+)\}/g);
				if (pathParamMatches) {
					for (const match of pathParamMatches) {
						const paramName = match.slice(1, -1);
						parameters.push({
							name: paramName,
							in: 'path',
							required: true,
							schema: { type: 'string' }
						});
					}
				}
			}

			// 2. Query Params
			if (config.schema?.query) {
				const querySchema = convertToJsonSchema(config.schema.query);
				parameters.push(...extractParametersFromSchema(querySchema, 'query'));
			}

			// 3. Header Params
			if (config.schema?.headers) {
				const headersSchema = convertToJsonSchema(config.schema.headers);
				parameters.push(...extractParametersFromSchema(headersSchema, 'header'));
			}

			// 4. Request Body
			let requestBody: any = undefined;
			if (config.schema?.body && method !== 'GET' && method !== 'HEAD') {
				const bodySchema = convertToJsonSchema(config.schema.body);
				requestBody = {
					required: true,
					content: {
						'application/json': {
							schema: bodySchema
						}
					}
				};
			}

			// 5. Responses
			const responses: Record<string, OpenApiResponse> = {};
			const successStatus = config.status
				? String(config.status)
				: method === 'POST'
					? '201'
					: '200';

			if (config.responses) {
				for (const [statusCode, resp] of Object.entries(config.responses)) {
					responses[String(statusCode)] = {
						description: resp.description,
						content: resp.schema
							? {
									'application/json': {
										schema: convertToJsonSchema(resp.schema)
									}
								}
							: undefined
					};
				}
			}

			if (!responses[successStatus]) {
				responses[successStatus] = {
					description:
						successStatus === '201'
							? 'Created'
							: successStatus === '204'
								? 'No Content'
								: 'Successful Operation',
					content:
						successStatus !== '204'
							? {
									'application/json': {
										schema: { type: 'object' }
									}
								}
							: undefined
				};
			}

			// 6. Guard Reflection (Security & Error Status Codes)
			let hasAuthGuard = false;
			let hasRoleGuard = false;
			let roleGuardRoles: string[] = [];
			let hasRateLimitGuard = false;
			let rateLimitRetryAfter = 60;

			if (config.guards && config.guards.length > 0) {
				for (const guard of config.guards) {
					const meta = (guard as any)._yaxaGuard;
					if (meta) {
						if (meta.type === 'auth') {
							hasAuthGuard = true;
						} else if (meta.type === 'role') {
							hasRoleGuard = true;
							if (meta.roles) roleGuardRoles = meta.roles;
						} else if (meta.type === 'rateLimit') {
							hasRateLimitGuard = true;
							if (meta.options?.windowSeconds) {
								rateLimitRetryAfter = meta.options.windowSeconds;
							}
						}
					}
				}
			}

			const operationSecurity: Array<Record<string, string[]>> = [];

			if (hasAuthGuard || hasRoleGuard) {
				usesSecurity = true;
				securitySchemes['BearerAuth'] = {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Standard Bearer Token Header (`Authorization: Bearer <token>`)'
				};
				securitySchemes['CookieAuth'] = {
					type: 'apiKey',
					in: 'cookie',
					name: 'better-auth.session_token',
					description: 'Session cookie via Better-Auth'
				};

				operationSecurity.push({ BearerAuth: [] }, { CookieAuth: [] });

				responses['401'] = {
					description: 'Unauthorized (RFC 7807 Problem Details)',
					content: {
						'application/problem+json': {
							schema: { $ref: '#/components/schemas/ProblemDetails' }
						}
					}
				};
			}

			if (hasRoleGuard) {
				responses['403'] = {
					description: `Forbidden — Insufficient role permissions. Requires: [${roleGuardRoles.join(', ')}]`,
					content: {
						'application/problem+json': {
							schema: { $ref: '#/components/schemas/ProblemDetails' }
						}
					}
				};
			}

			// 7. Schema Validation Error (422)
			if (
				config.schema &&
				(config.schema.body || config.schema.query || config.schema.params || config.schema.headers)
			) {
				responses['422'] = {
					description: 'Unprocessable Entity — Schema validation failed (RFC 7807)',
					content: {
						'application/problem+json': {
							schema: { $ref: '#/components/schemas/ProblemDetails' }
						}
					}
				};
			}

			// 8. Rate Limit Error (429)
			if (hasRateLimitGuard) {
				responses['429'] = {
					description: 'Too Many Requests — Rate limit exceeded (RFC 7807)',
					headers: {
						'Retry-After': {
							description: 'Seconds to wait before retrying',
							schema: { type: 'integer', example: rateLimitRetryAfter }
						}
					},
					content: {
						'application/problem+json': {
							schema: { $ref: '#/components/schemas/ProblemDetails' }
						}
					}
				};
			}

			// 9. Standard 500 Sanitized Error
			responses['500'] = {
				description: 'Internal Server Error — Sanitized exception (RFC 7807)',
				content: {
					'application/problem+json': {
						schema: { $ref: '#/components/schemas/ProblemDetails' }
					}
				}
			};

			const operation: OpenApiOperation = {
				summary: config.summary || `${method.toUpperCase()} ${path}`,
				description: config.description,
				operationId:
					config.operationId ||
					`${methodLower}_${path.replace(/[/{}]+/g, '_').replace(/^_+|_+$/g, '')}`,
				tags: config.tags || (path.split('/')[2] ? [path.split('/')[2]] : ['Default']),
				deprecated: config.deprecated,
				parameters: parameters.length > 0 ? parameters : undefined,
				requestBody,
				responses,
				security: operationSecurity.length > 0 ? operationSecurity : undefined
			};

			paths[path][methodLower] = operation;
		}
	}

	return {
		openapi: '3.1.0',
		info: {
			title,
			version,
			description
		},
		servers: options.servers || [{ url: '/', description: 'Current Environment' }],
		paths,
		components: {
			schemas: {
				ProblemDetails: PROBLEM_DETAILS_SCHEMA
			},
			securitySchemes: usesSecurity ? securitySchemes : undefined
		}
	};
}
