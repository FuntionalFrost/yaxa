import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSSE } from './useSSE.svelte';

class MockEventSource {
	url: string;
	withCredentials?: boolean;
	onopen: (() => void) | null = null;
	onmessage: ((evt: any) => void) | null = null;
	onerror: ((err: any) => void) | null = null;
	listeners = new Map<string, Set<(evt: any) => void>>();
	readyState = 0;

	static instances: MockEventSource[] = [];

	constructor(url: string, init?: any) {
		this.url = url;
		this.withCredentials = init?.withCredentials;
		MockEventSource.instances.push(this);
	}

	addEventListener(type: string, handler: (evt: any) => void) {
		let handlers = this.listeners.get(type);
		if (!handlers) {
			handlers = new Set();
			this.listeners.set(type, handlers);
		}
		handlers.add(handler);
	}

	removeEventListener(type: string, handler: (evt: any) => void) {
		this.listeners.get(type)?.delete(handler);
	}

	close() {
		this.readyState = 2;
	}

	simulateOpen() {
		this.readyState = 1;
		this.onopen?.();
	}

	simulateMessage(data: any, type = 'message') {
		const rawData = typeof data === 'object' ? JSON.stringify(data) : String(data);
		const evt = { data: rawData, type } as MessageEvent;
		if (type === 'message') {
			this.onmessage?.(evt);
		}
		const handlers = this.listeners.get(type);
		if (handlers) {
			for (const handler of handlers) {
				handler(evt);
			}
		}
	}

	simulateError(err = new Event('error')) {
		this.onerror?.(err);
	}
}

describe('useSSE Composable Rune', () => {
	beforeEach(() => {
		MockEventSource.instances = [];
		vi.stubGlobal('EventSource', MockEventSource);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('initializes with connecting or connected state when EventSource exists', () => {
		const sse = useSSE('/api/events', { enabled: true });
		expect(sse.status).toBe('connecting');
		expect(sse.connecting).toBe(true);
		expect(sse.connected).toBe(false);

		expect(MockEventSource.instances.length).toBe(1);
		const instance = MockEventSource.instances[0];
		expect(instance.url).toBe('/api/events');

		instance.simulateOpen();
		expect(sse.status).toBe('connected');
		expect(sse.connected).toBe(true);
		expect(sse.connecting).toBe(false);
	});

	it('handles message events and parses JSON data reactively', () => {
		const onMessage = vi.fn();
		const sse = useSSE('/api/events', { onMessage });

		const instance = MockEventSource.instances[0];
		instance.simulateOpen();

		instance.simulateMessage({ user: 'Alice', score: 100 });

		expect(sse.data).toEqual({ user: 'Alice', score: 100 });
		expect(sse.lastEvent).toBe('message');
		expect(onMessage).toHaveBeenCalledWith({ user: 'Alice', score: 100 }, expect.any(Object));
	});

	it('subscribes to custom named events via .on(eventName, handler)', () => {
		const sse = useSSE('/api/events');
		const instance = MockEventSource.instances[0];
		instance.simulateOpen();

		const orderHandler = vi.fn();
		const unsubscribe = sse.on('order.paid', orderHandler);

		instance.simulateMessage({ orderId: 'ord_99', total: 29.5 }, 'order.paid');

		expect(orderHandler).toHaveBeenCalledTimes(1);
		expect(orderHandler).toHaveBeenCalledWith(
			{ orderId: 'ord_99', total: 29.5 },
			expect.any(Object)
		);
		expect(sse.lastEvent).toBe('order.paid');

		// Test unsubscribe
		unsubscribe();
		instance.simulateMessage({ orderId: 'ord_100', total: 10 }, 'order.paid');
		expect(orderHandler).toHaveBeenCalledTimes(1);
	});

	it('closes the connection cleanly on .close()', () => {
		const sse = useSSE('/api/events');
		const instance = MockEventSource.instances[0];
		instance.simulateOpen();

		sse.close();

		expect(sse.status).toBe('closed');
		expect(sse.connected).toBe(false);
		expect(instance.readyState).toBe(2);
	});

	it('reconnects when .reconnect() is invoked', () => {
		const sse = useSSE('/api/events');
		expect(MockEventSource.instances.length).toBe(1);

		sse.close();
		expect(sse.status).toBe('closed');

		sse.reconnect();
		expect(MockEventSource.instances.length).toBe(2);
		expect(sse.status).toBe('connecting');
	});

	it('stays idle when enabled is false', () => {
		const sse = useSSE('/api/events', { enabled: false });
		expect(sse.status).toBe('idle');
		expect(MockEventSource.instances.length).toBe(0);
	});
});
