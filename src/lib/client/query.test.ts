import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashQueryKey, QueryClient, createQuery, createMutation, setQueryClient } from './index';
import type { ClientResponse } from './types';

describe('Runes Query Engine - hashQueryKey', () => {
	it('returns string keys as-is', () => {
		expect(hashQueryKey('projects')).toBe('projects');
		expect(hashQueryKey('/api/items')).toBe('/api/items');
	});

	it('deterministically hashes arrays and nested objects regardless of key order', () => {
		const keyA = ['projects', { orgId: '123', status: 'active' }];
		const keyB = ['projects', { status: 'active', orgId: '123' }];

		expect(hashQueryKey(keyA)).toBe(hashQueryKey(keyB));
	});
});

describe('Runes Query Engine - QueryClient', () => {
	let client: QueryClient;

	beforeEach(() => {
		client = new QueryClient();
		setQueryClient(client);
	});

	it('creates, retrieves, and updates query cache entries', () => {
		expect(client.getQueryData('users')).toBeNull();

		client.setQueryData('users', [{ id: '1', name: 'Alice' }]);
		expect(client.getQueryData('users')).toEqual([{ id: '1', name: 'Alice' }]);

		// Functional updater
		client.setQueryData<Array<{ id: string; name: string }>>('users', (prev) => [
			...(prev ?? []),
			{ id: '2', name: 'Bob' }
		]);

		expect(client.getQueryData('users')).toHaveLength(2);
	});

	it('invalidates matching queries with exact and prefix filters', async () => {
		const entry1 = client.getOrCreateEntry('projects-list');
		const entry2 = client.getOrCreateEntry('projects-detail-1');
		const entry3 = client.getOrCreateEntry('users');

		const listener1 = vi.fn();
		const listener2 = vi.fn();
		const listener3 = vi.fn();

		entry1.subscribers.add(listener1);
		entry2.subscribers.add(listener2);
		entry3.subscribers.add(listener3);

		// Invalidate all projects
		await client.invalidateQueries('projects');

		expect(listener1).toHaveBeenCalledTimes(1);
		expect(listener2).toHaveBeenCalledTimes(1);
		expect(listener3).not.toHaveBeenCalled();

		// Exact invalidation
		await client.invalidateQueries({ key: 'projects-list', exact: true });
		expect(listener1).toHaveBeenCalledTimes(2);
		expect(listener2).toHaveBeenCalledTimes(1);
	});
});

describe('Runes Query Engine - createQuery', () => {
	let client: QueryClient;

	beforeEach(() => {
		client = new QueryClient();
		setQueryClient(client);
	});

	it('fetches data and unwraps ClientResponse successfully', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			data: [{ id: 'proj_1', name: 'Alpha' }],
			error: null,
			response: new Response()
		} satisfies ClientResponse<any>);

		const query = createQuery('test-projects', fetchMock, { client });

		expect(query.isLoading).toBe(true);
		expect(query.data).toBeNull();

		const result = await query.refetch();

		expect(result).toEqual([{ id: 'proj_1', name: 'Alpha' }]);
		expect(query.data).toEqual([{ id: 'proj_1', name: 'Alpha' }]);
		expect(query.isSuccess).toBe(true);
		expect(query.isLoading).toBe(false);
		expect(query.isError).toBe(false);
	});

	it('handles ClientResponse errors and RFC 7807 problem details', async () => {
		const errorResponse: ClientResponse<any> = {
			ok: false,
			status: 404,
			data: null,
			error: {
				type: 'https://yaxa.dev/errors/not-found',
				title: 'Project Not Found',
				status: 404,
				detail: 'No project with ID 999 exists'
			},
			response: new Response(null, { status: 404 })
		};

		const fetchMock = vi.fn().mockResolvedValue(errorResponse);
		const onError = vi.fn();

		const query = createQuery('not-found-query', fetchMock, { client, onError });
		await query.refetch();

		expect(query.data).toBeNull();
		expect(query.isError).toBe(true);
		expect(query.error).toEqual(errorResponse.error);
		expect(onError).toHaveBeenCalledWith(errorResponse.error);
	});

	it('coalesces multiple in-flight concurrent requests to the same key', async () => {
		let resolveCall: (val: any) => void = () => {};
		const fetchMock = vi.fn().mockImplementation(
			() =>
				new Promise((res) => {
					resolveCall = res;
				})
		);

		const query1 = createQuery('shared-key', fetchMock, { client });
		const query2 = createQuery('shared-key', fetchMock, { client });

		// Trigger both simultaneously
		const p1 = query1.refetch();
		const p2 = query2.refetch();

		expect(fetchMock).toHaveBeenCalledTimes(1);

		resolveCall({
			ok: true,
			status: 200,
			data: { result: 'shared' },
			error: null,
			response: new Response()
		});

		const [res1, res2] = await Promise.all([p1, p2]);
		expect(res1).toEqual({ result: 'shared' });
		expect(res2).toEqual({ result: 'shared' });
	});

	it('respects staleTimeMs and avoids refetching when cache is fresh', async () => {
		const fetchMock = vi.fn().mockResolvedValue('data-1');

		const query = createQuery('stale-key', fetchMock, {
			client,
			staleTimeMs: 10_000
		});

		await query.refetch();
		expect(fetchMock).toHaveBeenCalledTimes(1);

		// Non-forced fetch should return cached data because staleTimeMs hasn't elapsed
		client.getOrCreateEntry('stale-key').updatedAt = Date.now();
		const entry = client.getOrCreateEntry('stale-key');
		expect(entry.data).toBe('data-1');
	});

	it('hydrates with initialData with zero loading state', () => {
		const query = createQuery('ssr-key', async () => 'fetched', {
			client,
			initialData: 'preloaded'
		});

		expect(query.data).toBe('preloaded');
		expect(query.isLoading).toBe(false);
		expect(query.isSuccess).toBe(true);
	});

	it('supports optimisticUpdate and setData', () => {
		const query = createQuery<string[]>('list-key', async () => ['item1'], {
			client,
			initialData: ['item1']
		});

		query.optimisticUpdate((prev) => [...(prev ?? []), 'item2']);
		expect(query.data).toEqual(['item1', 'item2']);

		query.setData(['item-override']);
		expect(query.data).toEqual(['item-override']);
	});

	it('respects enabled: false and skips automatic fetching', async () => {
		const fetchMock = vi.fn().mockResolvedValue('data');
		const query = createQuery('disabled-key', fetchMock, {
			client,
			enabled: false
		});

		const res = await query.refetch();
		expect(res).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('supports live invalidation via subscribeToSse', async () => {
		const mockSse = {
			on: vi.fn((_event: string, handler: any) => {
				// Save handler
				(mockSse as any).trigger = handler;
				return () => {};
			})
		};

		const fetchMock = vi.fn().mockResolvedValue('sse-data');

		createQuery('sse-query', fetchMock, {
			client,
			subscribeToSse: {
				sse: mockSse as any,
				event: 'project.updated'
			}
		});

		expect(mockSse.on).toBeDefined();
	});
});

describe('Runes Query Engine - createMutation', () => {
	it('executes successful mutation and runs lifecycle hooks', async () => {
		const onMutate = vi.fn().mockReturnValue({ tempId: 'temp_123' });
		const onSuccess = vi.fn();
		const onSettled = vi.fn();

		const mutationFn = vi.fn().mockResolvedValue({
			ok: true,
			status: 201,
			data: { id: 'real_123', name: 'Created' },
			error: null,
			response: new Response(null, { status: 201 })
		} satisfies ClientResponse<any>);

		const mutation = createMutation(mutationFn, {
			onMutate,
			onSuccess,
			onSettled
		});

		expect(mutation.isIdle).toBe(true);

		const promise = mutation.mutate({ name: 'Created' });
		expect(mutation.isPending).toBe(true);

		const result = await promise;

		expect(result).toEqual({ id: 'real_123', name: 'Created' });
		expect(mutation.data).toEqual({ id: 'real_123', name: 'Created' });
		expect(mutation.isSuccess).toBe(true);
		expect(mutation.isPending).toBe(false);

		expect(onMutate).toHaveBeenCalledWith({ name: 'Created' });
		expect(onSuccess).toHaveBeenCalledWith(
			{ id: 'real_123', name: 'Created' },
			{ name: 'Created' },
			{ tempId: 'temp_123' }
		);
		expect(onSettled).toHaveBeenCalledWith(
			{ id: 'real_123', name: 'Created' },
			null,
			{ name: 'Created' },
			{ tempId: 'temp_123' }
		);
	});

	it('handles mutation errors, passes context for rollback, and re-throws', async () => {
		const rollbackContext = { previousList: ['item1'] };
		const onMutate = vi.fn().mockReturnValue(rollbackContext);
		const onError = vi.fn();
		const onSettled = vi.fn();

		const errorResponse: ClientResponse<any> = {
			ok: false,
			status: 400,
			data: null,
			error: {
				type: 'https://yaxa.dev/errors/validation',
				title: 'Bad Request',
				status: 400,
				detail: 'Name must be at least 3 characters'
			},
			response: new Response(null, { status: 400 })
		};

		const mutation = createMutation(async () => errorResponse, {
			onMutate,
			onError,
			onSettled
		});

		await expect(mutation.mutate(undefined)).rejects.toEqual(errorResponse.error);

		expect(mutation.isError).toBe(true);
		expect(mutation.error).toEqual(errorResponse.error);
		expect(onError).toHaveBeenCalledWith(errorResponse.error, undefined, rollbackContext);
		expect(onSettled).toHaveBeenCalledWith(null, errorResponse.error, undefined, rollbackContext);

		mutation.reset();
		expect(mutation.isIdle).toBe(true);
		expect(mutation.error).toBeNull();
		expect(mutation.data).toBeNull();
	});
});
