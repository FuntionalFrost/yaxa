import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { createMockRequestEvent } from '#lib/testing/index.js';
import {
	yaxaEndpoint,
	createProblemDetails,
	problemResponse,
	isProblemDetails,
	requireAuth,
	requireRole,
	rateLimit,
	composeGuards,
	validateData
} from './index.js';

describe('RFC 7807 Problem Details', () => {
	it('creates structured problem details object with standard defaults', () => {
		const problem = createProblemDetails({
			status: 404,
			detail: 'Project proj_999 does not exist.'
		});

		expect(problem.status).toBe(404);
		expect(problem.title).toBe('Not Found');
		expect(problem.type).toBe('https://httpstatuses.com/404');
		expect(problem.detail).toBe('Project proj_999 does not exist.');
		expect(isProblemDetails(problem)).toBe(true);
	});

	it('returns Response with application/problem+json content-type and custom fields', async () => {
		const response = problemResponse({
			status: 422,
			title: 'Unprocessable Entity',
			detail: 'Validation error',
			invalidParams: [{ name: 'email', reason: 'Must be a valid email' }],
			traceId: 'trace_abc123'
		});

		expect(response.status).toBe(422);
		expect(response.headers.get('content-type')).toContain('application/problem+json');

		const json = await response.json();
		expect(json.status).toBe(422);
		expect(json.invalidParams).toHaveLength(1);
		expect(json.invalidParams[0].name).toBe('email');
		expect(json.traceId).toBe('trace_abc123');
	});
});

describe('Declarative Guards', () => {
	describe('requireAuth', () => {
		it('returns 401 Problem Details when user is unauthenticated', async () => {
			const guard = requireAuth();
			const event = createMockRequestEvent({ locals: { user: null } });

			const result = await guard(event);
			expect(result).toBeInstanceOf(Response);
			if (result instanceof Response) {
				expect(result.status).toBe(401);
				const json = await result.json();
				expect(json.title).toBe('Unauthorized');
			}
		});

		it('throws 303 redirect when redirect option is set', async () => {
			const guard = requireAuth({ redirect: '/login' });
			const event = createMockRequestEvent({
				url: 'http://localhost:5173/dashboard?tab=billing',
				locals: { user: null }
			});

			try {
				await guard(event);
				expect.fail('Expected redirect to be thrown');
			} catch (err: any) {
				expect(err.status).toBe(303);
				expect(err.location).toContain('/login?returnTo=');
				expect(err.location).toContain(encodeURIComponent('/dashboard?tab=billing'));
			}
		});

		it('passes cleanly when user exists in locals', async () => {
			const guard = requireAuth();
			const event = createMockRequestEvent({
				locals: { user: { id: 'usr_1', role: 'admin' } }
			});

			const result = await guard(event);
			expect(result).toBeUndefined();
		});
	});

	describe('requireRole', () => {
		it('returns 401 if user is not logged in', async () => {
			const guard = requireRole(['admin']);
			const event = createMockRequestEvent({ locals: { user: null } });

			const result = (await guard(event)) as Response;
			expect(result.status).toBe(401);
		});

		it('returns 403 Forbidden when user role is not allowed', async () => {
			const guard = requireRole(['admin', 'owner']);
			const event = createMockRequestEvent({
				locals: { user: { id: 'usr_1', role: 'member' } }
			});

			const result = (await guard(event)) as Response;
			expect(result.status).toBe(403);
			const json = await result.json();
			expect(json.title).toBe('Forbidden');
			expect(json.requiredRoles).toEqual(['admin', 'owner']);
		});

		it('passes when user has one of the allowed roles', async () => {
			const guard = requireRole(['admin', 'owner']);
			const event = createMockRequestEvent({
				locals: { user: { id: 'usr_1', role: 'owner' } }
			});

			const result = await guard(event);
			expect(result).toBeUndefined();
		});

		it('passes when member role matches org role in multi-tenant setup', async () => {
			const guard = requireRole(['billing_admin']);
			const event = createMockRequestEvent({
				locals: {
					user: { id: 'usr_1', role: 'member' },
					member: { role: 'billing_admin' }
				}
			});

			const result = await guard(event);
			expect(result).toBeUndefined();
		});
	});

	describe('rateLimit', () => {
		it('allows requests up to points threshold then returns 429', async () => {
			const guard = rateLimit({
				points: 3,
				windowSeconds: 10,
				keyGenerator: () => 'test_client_key'
			});

			const event = createMockRequestEvent();

			// First 3 calls succeed
			expect(await guard(event)).toBeUndefined();
			expect(await guard(event)).toBeUndefined();
			expect(await guard(event)).toBeUndefined();

			// 4th call is rate-limited
			const result = (await guard(event)) as Response;
			expect(result.status).toBe(429);
			expect(result.headers.get('Retry-After')).toBeDefined();
			expect(result.headers.get('X-RateLimit-Remaining')).toBe('0');

			const json = await result.json();
			expect(json.title).toBe('Too Many Requests');
		});
	});

	describe('composeGuards', () => {
		it('executes guards sequentially and halts on first failure', async () => {
			const guard = composeGuards(requireAuth(), requireRole(['admin']));

			// Unauthenticated -> fails on requireAuth with 401
			const eventUnauth = createMockRequestEvent({ locals: { user: null } });
			const res1 = (await guard(eventUnauth)) as Response;
			expect(res1.status).toBe(401);

			// Authenticated but wrong role -> fails on requireRole with 403
			const eventForbidden = createMockRequestEvent({
				locals: { user: { id: 'usr_1', role: 'viewer' } }
			});
			const res2 = (await guard(eventForbidden)) as Response;
			expect(res2.status).toBe(403);

			// Both pass
			const eventOk = createMockRequestEvent({
				locals: { user: { id: 'usr_1', role: 'admin' } }
			});
			const res3 = await guard(eventOk);
			expect(res3).toBeUndefined();
		});
	});
});

describe('Multi-Engine Validation Engine', () => {
	it('validates with Zod schema and extracts parsed data', async () => {
		const schema = z.object({
			email: z.string().email(),
			age: z.number().min(18)
		});

		const valid = await validateData(schema, { email: 'test@example.com', age: 25 });
		expect(valid.success).toBe(true);
		if (valid.success) {
			expect(valid.data.email).toBe('test@example.com');
			expect(valid.data.age).toBe(25);
		}

		const invalid = await validateData(schema, { email: 'bad-email', age: 16 }, 'body');
		expect(invalid.success).toBe(false);
		if (!invalid.success) {
			expect(invalid.invalidParams.length).toBeGreaterThanOrEqual(2);
			expect(invalid.invalidParams[0].name).toContain('body.');
		}
	});

	it('validates with Standard Schema v1 (~standard)', async () => {
		// Mock Standard Schema specification
		const mockStandardSchema = {
			'~standard': {
				version: 1,
				vendor: 'custom',
				validate: (val: any) => {
					if (typeof val === 'string' && val.length > 3) {
						return { value: val.toUpperCase() };
					}
					return {
						issues: [{ path: ['name'], message: 'Name must exceed 3 characters' }]
					};
				}
			}
		};

		const ok = await validateData(mockStandardSchema, 'alice');
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.data).toBe('ALICE');

		const bad = await validateData(mockStandardSchema, 'al', 'body');
		expect(bad.success).toBe(false);
		if (!bad.success) {
			expect(bad.invalidParams[0].name).toBe('body.name');
			expect(bad.invalidParams[0].reason).toContain('exceed 3 characters');
		}
	});

	it('validates with custom function validator', async () => {
		const validator = (val: any) => {
			if (!val || val.length === 0) {
				return { success: false, error: 'Cannot be empty' };
			}
			return { success: true, data: val };
		};

		const ok = await validateData(validator, 'hello');
		expect(ok.success).toBe(true);

		const bad = await validateData(validator, '');
		expect(bad.success).toBe(false);
	});
});

describe('yaxaEndpoint Higher-Order Pipeline', () => {
	const ItemSchema = z.object({
		title: z.string().min(2),
		price: z.number().positive()
	});

	const QuerySchema = z.object({
		search: z.string().optional()
	});

	it('enforces guards before executing handler', async () => {
		const endpoint = yaxaEndpoint({
			guards: [requireAuth()],
			handle: () => ({ success: true })
		});

		const eventUnauth = createMockRequestEvent({ locals: { user: null } });
		const response = await endpoint(eventUnauth);
		expect(response.status).toBe(401);
		const json = await response.json();
		expect(json.title).toBe('Unauthorized');
	});

	it('returns 422 Problem Details on invalid request body', async () => {
		const endpoint = yaxaEndpoint({
			schema: { body: ItemSchema },
			handle: ({ body }) => body
		});

		const event = createMockRequestEvent({
			method: 'POST',
			body: { title: 'a', price: -5 }
		});

		const response = await endpoint(event);
		expect(response.status).toBe(422);
		expect(response.headers.get('content-type')).toContain('application/problem+json');

		const json = await response.json();
		expect(json.status).toBe(422);
		expect(json.title).toBe('Unprocessable Entity');
		expect(json.invalidParams.length).toBeGreaterThanOrEqual(2);
	});

	it('handles malformed JSON body gracefully with 400 Bad Request', async () => {
		const endpoint = yaxaEndpoint({
			handle: ({ body }) => body
		});

		const event = createMockRequestEvent({
			method: 'POST',
			body: '{ broken json: ',
			headers: { 'content-type': 'application/json' }
		});

		const response = await endpoint(event);
		expect(response.status).toBe(400);
		const json = await response.json();
		expect(json.title).toBe('Bad Request');
	});

	it('executes handler and auto-serializes JSON with typed body, query, and params', async () => {
		const endpoint = yaxaEndpoint({
			status: 201,
			schema: {
				body: ItemSchema,
				query: QuerySchema
			},
			handle: ({ body, query, params, user }) => {
				return {
					created: true,
					item: body,
					q: query.search,
					id: params.id,
					userId: user?.id
				};
			}
		});

		const event = createMockRequestEvent({
			method: 'POST',
			url: 'http://localhost:5173/api/items/item_42?search=svelte',
			params: { id: 'item_42' },
			body: { title: 'Keyboard', price: 99 },
			locals: { user: { id: 'usr_77', role: 'admin' } }
		});

		const response = await endpoint(event);
		expect(response.status).toBe(201);
		expect(response.headers.get('content-type')).toContain('application/json');

		const json = await response.json();
		expect(json.created).toBe(true);
		expect(json.item.title).toBe('Keyboard');
		expect(json.item.price).toBe(99);
		expect(json.q).toBe('svelte');
		expect(json.id).toBe('item_42');
		expect(json.userId).toBe('usr_77');
	});

	it('supports string returns as text/plain and null/void as 204 No Content', async () => {
		const stringEndpoint = yaxaEndpoint({
			handle: () => 'PONG'
		});
		const res1 = await stringEndpoint(createMockRequestEvent());
		expect(res1.status).toBe(200);
		expect(await res1.text()).toBe('PONG');
		expect(res1.headers.get('content-type')).toContain('text/plain');

		const voidEndpoint = yaxaEndpoint({
			handle: () => undefined
		});
		const res2 = await voidEndpoint(createMockRequestEvent());
		expect(res2.status).toBe(204);
	});

	it('passes through custom Response instances without modification', async () => {
		const customEndpoint = yaxaEndpoint({
			handle: () =>
				new Response('Custom CSV Content', {
					status: 200,
					headers: { 'content-type': 'text/csv' }
				})
		});

		const response = await customEndpoint(createMockRequestEvent());
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/csv');
		expect(await response.text()).toBe('Custom CSV Content');
	});

	it('supports interceptors for request timing and header enrichment', async () => {
		const endpoint = yaxaEndpoint({
			interceptors: [
				async (_ctx, next) => {
					const res = await next();
					res.headers.set('x-yaxa-intercepted', 'true');
					return res;
				}
			],
			handle: () => ({ ok: true })
		});

		const response = await endpoint(createMockRequestEvent());
		expect(response.headers.get('x-yaxa-intercepted')).toBe('true');
	});

	it('sanitizes unexpected internal 500 errors without leaking stack traces or sensitive strings', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const failingEndpoint = yaxaEndpoint({
			handle: () => {
				throw new Error('Database password leak: secret123456');
			}
		});

		const response = await failingEndpoint(createMockRequestEvent());
		expect(response.status).toBe(500);
		expect(response.headers.get('content-type')).toContain('application/problem+json');

		const json = await response.json();
		expect(json.title).toBe('Internal Server Error');
		expect(json.detail).not.toContain('secret123456');

		errorSpy.mockRestore();
	});

	it('attaches _yaxaConfig metadata for runtime reflection and OpenAPI discovery', () => {
		const config = {
			summary: 'Create Project',
			description: 'Creates a new user project',
			tags: ['Projects'],
			handle: () => ({})
		};

		const endpoint = yaxaEndpoint(config);
		expect(endpoint._yaxaConfig).toBeDefined();
		expect(endpoint._yaxaConfig.summary).toBe('Create Project');
		expect(endpoint._yaxaConfig.tags).toEqual(['Projects']);
	});
});
