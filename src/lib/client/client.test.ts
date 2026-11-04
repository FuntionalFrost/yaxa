import { describe, it, expect, vi } from 'vitest';
import { createApiClient, serializeQueryParams, interpolatePath } from './client';
import type { ProblemDetails } from './types';

describe('serializeQueryParams', () => {
	it('returns empty string for null or empty object', () => {
		expect(serializeQueryParams()).toBe('');
		expect(serializeQueryParams({})).toBe('');
		expect(serializeQueryParams(null as any)).toBe('');
	});

	it('serializes primitives correctly', () => {
		const res = serializeQueryParams({
			page: 1,
			search: 'hello world',
			active: true
		});
		expect(res).toBe('?page=1&search=hello+world&active=true');
	});

	it('ignores undefined and null values', () => {
		const res = serializeQueryParams({
			query: 'test',
			filter: undefined,
			extra: null
		});
		expect(res).toBe('?query=test');
	});

	it('serializes array parameters into multi-keys', () => {
		const res = serializeQueryParams({
			tags: ['svelte', 'tailwind']
		});
		expect(res).toBe('?tags=svelte&tags=tailwind');
	});
});

describe('interpolatePath', () => {
	it('leaves static paths unchanged', () => {
		expect(interpolatePath('/api/projects')).toBe('/api/projects');
	});

	it('interpolates SvelteKit bracket syntax [param]', () => {
		expect(interpolatePath('/api/projects/[id]', { id: 'proj_123' })).toBe(
			'/api/projects/proj_123'
		);
	});

	it('interpolates colon syntax :param', () => {
		expect(
			interpolatePath('/api/orgs/:orgId/users/:userId', { orgId: 'org_1', userId: 'usr_2' })
		).toBe('/api/orgs/org_1/users/usr_2');
	});

	it('interpolates rest parameters [...rest]', () => {
		expect(interpolatePath('/api/docs/[...slug]', { slug: 'getting-started/install' })).toBe(
			'/api/docs/getting-started/install'
		);
	});

	it('url-encodes special characters', () => {
		expect(interpolatePath('/api/search/[query]', { query: 'svelte & kit' })).toBe(
			'/api/search/svelte%20%26%20kit'
		);
	});
});

describe('createApiClient', () => {
	it('performs successful GET request and returns data', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify([{ id: '1', name: 'Project 1' }]), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const api = createApiClient({ fetch: mockFetch });

		const { data, error, status, ok } = await api['/api/projects'].get({
			query: { limit: 10 }
		});

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/projects?limit=10',
			expect.objectContaining({
				method: 'GET'
			})
		);
		expect(ok).toBe(true);
		expect(status).toBe(200);
		expect(error).toBeNull();
		expect(data).toEqual([{ id: '1', name: 'Project 1' }]);
	});

	it('performs POST request with JSON body serialization', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ id: 'proj_new', name: 'New Team' }), {
				status: 201,
				headers: { 'content-type': 'application/json' }
			})
		);

		const api = createApiClient({ baseUrl: 'https://api.yaxa.dev', fetch: mockFetch });

		const result = await api['/api/projects'].post({
			body: { name: 'New Team' }
		});

		expect(mockFetch).toHaveBeenCalledWith(
			'https://api.yaxa.dev/api/projects',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ name: 'New Team' })
			})
		);
		expect(result.ok).toBe(true);
		expect(result.status).toBe(201);
		expect(result.data).toEqual({ id: 'proj_new', name: 'New Team' });
	});

	it('interpolates path parameters via options or callable route', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ id: '42' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const api = createApiClient({ fetch: mockFetch });

		// Pattern 1: via params option
		await api['/api/projects/[id]'].get({
			params: { id: '42' }
		});
		expect(mockFetch).toHaveBeenLastCalledWith(
			'/api/projects/42',
			expect.objectContaining({ method: 'GET' })
		);

		// Pattern 2: callable route
		await api['/api/projects/[id]']({ id: '99' }).get();
		expect(mockFetch).toHaveBeenLastCalledWith(
			'/api/projects/99',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('handles 204 No Content successfully with null data', async () => {
		const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

		const api = createApiClient({ fetch: mockFetch });
		const result = await api['/api/projects/[id]'].delete({ params: { id: '1' } });

		expect(result.ok).toBe(true);
		expect(result.status).toBe(204);
		expect(result.data).toBeNull();
		expect(result.error).toBeNull();
	});

	it('parses and discriminates RFC 7807 problem details on error', async () => {
		const problem: ProblemDetails = {
			type: 'https://yaxa.dev/errors/validation-failed',
			title: 'Validation Failed',
			status: 422,
			detail: 'Field "name" is required',
			invalidParams: [{ name: 'name', reason: 'Required' }]
		};

		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(problem), {
				status: 422,
				headers: { 'content-type': 'application/problem+json' }
			})
		);

		const api = createApiClient({ fetch: mockFetch });
		const { data, error, ok, status } = await api['/api/projects'].post({
			body: {}
		});

		expect(ok).toBe(false);
		expect(status).toBe(422);
		expect(data).toBeNull();
		expect(error).toBeDefined();
		expect(error?.title).toBe('Validation Failed');
		expect(error?.invalidParams?.[0].name).toBe('name');
	});

	it('generates fallback RFC 7807 ProblemDetails for generic 500 error', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response('Internal Server Crash', {
				status: 500,
				statusText: 'Internal Error',
				headers: { 'content-type': 'text/plain' }
			})
		);

		const api = createApiClient({ fetch: mockFetch });
		const result = await api['/api/broken'].get();

		expect(result.ok).toBe(false);
		expect(result.status).toBe(500);
		expect(result.error?.status).toBe(500);
		expect(result.error?.title).toBe('Internal Error');
		expect(result.error?.detail).toBe('Internal Server Crash');
	});

	it('gracefully handles network failures with status 0 RFC 7807 problem', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

		const api = createApiClient({ fetch: mockFetch });
		const result = await api['/api/offline'].get();

		expect(result.ok).toBe(false);
		expect(result.status).toBe(0);
		expect(result.error?.type).toBe('https://yaxa.dev/errors/network-error');
		expect(result.error?.detail).toBe('Failed to fetch');
	});

	it('executes onRequest and onResponse interceptor lifecycle hooks', async () => {
		const onRequest = vi.fn();
		const onResponse = vi.fn();

		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const api = createApiClient({
			fetch: mockFetch,
			onRequest,
			onResponse
		});

		await api['/api/hooked'].get();

		expect(onRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/hooked' }));
		expect(onResponse).toHaveBeenCalledWith(expect.objectContaining({ error: null }));
	});

	it('supports top-level direct methods: api.get, api.post, etc.', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ping: 'pong' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const api = createApiClient({ fetch: mockFetch });
		const res = await api.get('/api/health');

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/health',
			expect.objectContaining({ method: 'GET' })
		);
		expect(res.data).toEqual({ ping: 'pong' });
	});

	it('integrates with yaxaEndpoint route types seamlessly', async () => {
		const mockFetch = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
			const body = JSON.parse(init.body as string);
			return new Response(JSON.stringify({ id: 'proj_abc', name: body.name, count: 1 }), {
				status: 201,
				headers: { 'content-type': 'application/json' }
			});
		});

		type AppRoutes = {
			'/api/projects': {
				POST: (opts: {
					body: { name: string };
				}) => Promise<{ id: string; name: string; count: number }>;
			};
		};

		const api = createApiClient<AppRoutes>({ fetch: mockFetch });
		const { data, ok, status } = await api['/api/projects'].post({
			body: { name: 'Apollo SaaS' }
		});

		expect(ok).toBe(true);
		expect(status).toBe(201);
		expect(data?.name).toBe('Apollo SaaS');
		expect(data?.id).toBe('proj_abc');
	});
});
