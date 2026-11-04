import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatSSEFrame, yaxaSSE } from './sse';
import { MemoryBroadcaster, broadcast } from './broadcaster';
import { requireAuth } from '../endpoint/guards';
import { createMockRequestEvent } from '#lib/testing/index.js';

describe('formatSSEFrame', () => {
	it('formats simple text message without event name', () => {
		const frame = formatSSEFrame({ data: 'hello world' });
		expect(frame).toBe('data: hello world\n\n');
	});

	it('formats JSON object data and custom event name', () => {
		const frame = formatSSEFrame({
			event: 'order.created',
			data: { id: 123, total: 49.99 }
		});
		expect(frame).toContain('event: order.created\n');
		expect(frame).toContain('data: {"id":123,"total":49.99}\n\n');
	});

	it('includes id and retry fields when provided', () => {
		const frame = formatSSEFrame({
			id: 'evt_001',
			event: 'status',
			retry: 5000,
			data: 'ok'
		});
		expect(frame).toContain('id: evt_001\n');
		expect(frame).toContain('event: status\n');
		expect(frame).toContain('retry: 5000\n');
		expect(frame).toContain('data: ok\n\n');
	});

	it('splits multiline strings into multiple data lines per SSE spec', () => {
		const multiline = 'line 1\nline 2\r\nline 3';
		const frame = formatSSEFrame({ data: multiline });
		expect(frame).toBe('data: line 1\ndata: line 2\ndata: line 3\n\n');
	});
});

describe('MemoryBroadcaster Engine', () => {
	let broadcaster: MemoryBroadcaster;

	beforeEach(() => {
		broadcaster = new MemoryBroadcaster();
	});

	afterEach(() => {
		broadcaster.clear();
	});

	it('dispatches published messages only to matching channel subscribers', () => {
		const channel1Handler = vi.fn();
		const channel2Handler = vi.fn();

		broadcaster.subscribe('channel:1', channel1Handler);
		broadcaster.subscribe('channel:2', channel2Handler);

		broadcaster.publish('channel:1', 'ping', { test: true });

		expect(channel1Handler).toHaveBeenCalledTimes(1);
		expect(channel1Handler).toHaveBeenCalledWith({
			channel: 'channel:1',
			event: 'ping',
			payload: { test: true },
			id: undefined
		});
		expect(channel2Handler).not.toHaveBeenCalled();
	});

	it('unsubscribes cleanly using returned cleanup function', () => {
		const handler = vi.fn();
		const unsubscribe = broadcaster.subscribe('room:lobby', handler);

		expect(broadcaster.subscriberCount('room:lobby')).toBe(1);

		broadcaster.publish('room:lobby', 'msg', 'first');
		expect(handler).toHaveBeenCalledTimes(1);

		unsubscribe();
		expect(broadcaster.subscriberCount('room:lobby')).toBe(0);

		broadcaster.publish('room:lobby', 'msg', 'second');
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('isolates subscriber errors without halting other subscribers', () => {
		const failingSubscriber = vi.fn(() => {
			throw new Error('Subscriber crashed');
		});
		const healthySubscriber = vi.fn();

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		broadcaster.subscribe('alerts', failingSubscriber);
		broadcaster.subscribe('alerts', healthySubscriber);

		broadcaster.publish('alerts', 'danger', { level: 'high' });

		expect(failingSubscriber).toHaveBeenCalledTimes(1);
		expect(healthySubscriber).toHaveBeenCalledTimes(1);
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});
});

describe('yaxaSSE Server Handler', () => {
	let broadcaster: MemoryBroadcaster;

	beforeEach(() => {
		broadcaster = new MemoryBroadcaster();
	});

	afterEach(() => {
		broadcaster.clear();
	});

	it('sets standard SSE response headers', async () => {
		const handler = yaxaSSE({ broadcaster, keepAliveIntervalMs: 0 });
		const event = createMockRequestEvent({ url: 'http://localhost:5173/api/events' });

		const response = await handler(event);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');
		expect(response.headers.get('cache-control')).toBe('no-cache, no-transform');
		expect(response.headers.get('connection')).toBe('keep-alive');
		expect(response.headers.get('x-accel-buffering')).toBe('no');
		expect(response.body).toBeInstanceOf(ReadableStream);
	});

	it('evaluates declarative guards and blocks unauthenticated requests with 401 Problem Details', async () => {
		const handler = yaxaSSE({
			guards: [requireAuth()],
			broadcaster
		});

		// Event without authenticated user
		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/events',
			locals: {}
		});

		const response = await handler(event);

		expect(response.status).toBe(401);
		expect(response.headers.get('content-type')).toContain('application/problem+json');
		const body = await response.json();
		expect(body.title).toContain('Unauthorized');
	});

	it('invokes onConnect and delivers messages through client send', async () => {
		let onConnectCalled = false;

		const handler = yaxaSSE({
			broadcaster,
			keepAliveIntervalMs: 0,
			channel: 'dashboard',
			onConnect: ({ send }) => {
				onConnectCalled = true;
				send('welcome', { initialized: true });
			}
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/events',
			locals: { user: { id: 'usr_123', email: 'alex@example.com' } }
		});

		const response = await handler(event);
		expect(response.status).toBe(200);

		const reader = response.body!.getReader();
		const decoder = new TextDecoder();

		const { value } = await reader.read();
		const text = decoder.decode(value);

		expect(onConnectCalled).toBe(true);
		expect(text).toContain('event: welcome\n');
		expect(text).toContain('data: {"initialized":true}\n\n');

		await reader.cancel();
	});

	it('receives events published via broadcast() helper', async () => {
		const handler = yaxaSSE({
			broadcaster,
			keepAliveIntervalMs: 0,
			channel: 'tenant:acme'
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/events'
		});

		const response = await handler(event);
		const reader = response.body!.getReader();
		const decoder = new TextDecoder();

		// Broadcast an event on the channel
		await broadcast('tenant:acme', 'kpi.updated', { value: 99.4 }, undefined, broadcaster);

		const { value } = await reader.read();
		const text = decoder.decode(value);

		expect(text).toContain('event: kpi.updated\n');
		expect(text).toContain('data: {"value":99.4}\n\n');

		await reader.cancel();
	});

	it('resolves dynamic channel from RequestEvent', async () => {
		const handler = yaxaSSE({
			broadcaster,
			keepAliveIntervalMs: 0,
			channel: (evt) => `user:${(evt.locals as any).user.id}`
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/events',
			locals: { user: { id: 'usr_abc' } }
		});

		const response = await handler(event);
		const reader = response.body!.getReader();
		const decoder = new TextDecoder();

		// Broadcast to matching dynamic channel
		await broadcast('user:usr_abc', 'notification', { msg: 'Test' }, undefined, broadcaster);

		const { value } = await reader.read();
		const text = decoder.decode(value);

		expect(text).toContain('event: notification\n');
		expect(text).toContain('data: {"msg":"Test"}\n\n');

		await reader.cancel();
	});

	it('invokes onDisconnect when stream is cancelled or client aborts', async () => {
		let disconnected = false;
		const abortController = new AbortController();

		const handler = yaxaSSE({
			broadcaster,
			keepAliveIntervalMs: 0,
			channel: 'session',
			onDisconnect: () => {
				disconnected = true;
			}
		});

		const event = createMockRequestEvent({
			url: 'http://localhost:5173/api/events',
			signal: abortController.signal
		});

		const response = await handler(event);
		expect(response.status).toBe(200);

		// Trigger stream cancel
		const reader = response.body!.getReader();
		await reader.cancel();

		expect(disconnected).toBe(true);
	});
});
