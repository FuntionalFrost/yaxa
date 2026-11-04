import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export type SSEStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

export interface UseSSEOptions {
	/** Whether the SSE connection is active (defaults to true) */
	enabled?: boolean;
	/** Whether to send credentials/cookies with cross-origin requests */
	withCredentials?: boolean;
	/** Enable automatic reconnection on disconnect/error (defaults to true) */
	autoReconnect?: boolean;
	/** Maximum reconnection attempts before stopping (defaults to 10) */
	maxRetries?: number;
	/** Base reconnect delay in ms before exponential backoff (defaults to 1,000ms) */
	baseDelayMs?: number;
	/** Maximum delay between reconnect attempts in ms (defaults to 30,000ms) */
	maxDelayMs?: number;
	/** Callback invoked when the connection opens */
	onOpen?: () => void;
	/** Callback invoked on error */
	onError?: (err: Event) => void;
	/** Callback invoked when any message is received */
	onMessage?: (data: any, event: MessageEvent) => void;
}

export type SSEEventHandler<T = any> = (data: T, event: MessageEvent) => void;

export interface SSEResult {
	readonly status: SSEStatus;
	readonly connected: boolean;
	readonly connecting: boolean;
	readonly data: any;
	readonly lastEvent: string | null;
	readonly error: any;
	on: <T = any>(event: string, handler: SSEEventHandler<T>) => () => void;
	close: () => void;
	reconnect: () => void;
}

/**
 * Idiomatic Svelte 5 Composable Rune for Server-Sent Events (SSE).
 * Provides automatic reconnect with jitter, typed event subscribers, and automatic teardown.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useSSE } from 'yaxa-svelte';
 *
 *   const stream = useSSE('/api/events');
 *
 *   stream.on('order.created', (order) => {
 *     console.log('New order received:', order);
 *   });
 * </script>
 *
 * <p>Status: {stream.connected ? 'Live' : 'Connecting...'}</p>
 * ```
 */
export function useSSE(url: string | (() => string), options: UseSSEOptions = {}): SSEResult {
	const {
		enabled = true,
		withCredentials = false,
		autoReconnect = true,
		maxRetries = 10,
		baseDelayMs = 1000,
		maxDelayMs = 30000,
		onOpen,
		onError,
		onMessage
	} = options;

	let status = $state<SSEStatus>('idle');
	let data = $state<any>(null);
	let lastEvent = $state<string | null>(null);
	let error = $state<any>(null);

	const connected = $derived(status === 'connected');
	const connecting = $derived(status === 'connecting');

	const listeners = new SvelteMap<string, SvelteSet<SSEEventHandler>>();

	let es: EventSource | null = null;
	let reconnectTimer: any = null;
	let retryCount = 0;
	let manualClose = false;

	function parseEventData(raw: string): any {
		try {
			return JSON.parse(raw);
		} catch {
			return raw;
		}
	}

	function dispatchToListeners(eventType: string, parsed: any, rawEvent: MessageEvent) {
		const handlers = listeners.get(eventType);
		if (handlers) {
			for (const handler of handlers) {
				try {
					handler(parsed, rawEvent);
				} catch (err) {
					console.error(`[useSSE Handler Error] Event '${eventType}':`, err);
				}
			}
		}
	}

	function cleanupConnection() {
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
		if (es) {
			es.close();
			es = null;
		}
	}

	function scheduleReconnect(targetUrl: string) {
		if (manualClose || !autoReconnect || retryCount >= maxRetries) {
			status = 'closed';
			return;
		}

		// Exponential backoff with jitter
		const delay = Math.min(
			maxDelayMs,
			baseDelayMs * Math.pow(1.5, retryCount) + Math.random() * 500
		);

		retryCount++;
		status = 'connecting';

		reconnectTimer = setTimeout(() => {
			connect(targetUrl);
		}, delay);
	}

	function connect(targetUrl: string) {
		cleanupConnection();

		if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
			status = 'idle';
			return;
		}

		status = 'connecting';
		manualClose = false;

		try {
			const source = new EventSource(targetUrl, { withCredentials });
			es = source;

			source.onopen = () => {
				status = 'connected';
				retryCount = 0;
				error = null;
				onOpen?.();
			};

			source.onmessage = (event) => {
				const parsed = parseEventData(event.data);
				data = parsed;
				lastEvent = 'message';
				onMessage?.(parsed, event);
				dispatchToListeners('message', parsed, event);
			};

			source.onerror = (err) => {
				status = 'error';
				error = err;
				onError?.(err);
				cleanupConnection();
				scheduleReconnect(targetUrl);
			};

			// Re-attach custom event listeners
			for (const [eventName] of listeners) {
				if (eventName !== 'message') {
					source.addEventListener(eventName, (event: any) => {
						const parsed = parseEventData(event.data);
						data = parsed;
						lastEvent = eventName;
						dispatchToListeners(eventName, parsed, event);
					});
				}
			}
		} catch (err) {
			status = 'error';
			error = err;
			scheduleReconnect(targetUrl);
		}
	}

	function close() {
		manualClose = true;
		status = 'closed';
		cleanupConnection();
	}

	function reconnect() {
		manualClose = false;
		retryCount = 0;
		const targetUrl = typeof url === 'function' ? url() : url;
		connect(targetUrl);
	}

	function on<T = any>(event: string, handler: SSEEventHandler<T>): () => void {
		let handlers = listeners.get(event);
		if (!handlers) {
			handlers = new SvelteSet();
			listeners.set(event, handlers);

			// If EventSource is currently connected, register native listener for named event
			if (es && event !== 'message') {
				es.addEventListener(event, (evt: any) => {
					const parsed = parseEventData(evt.data);
					data = parsed;
					lastEvent = event;
					dispatchToListeners(event, parsed, evt);
				});
			}
		}

		handlers.add(handler);

		return () => {
			handlers?.delete(handler);
			if (handlers?.size === 0) {
				listeners.delete(event);
			}
		};
	}

	// Svelte 5 effect for automated lifecycle management if called inside a component/effect root
	try {
		$effect(() => {
			const targetUrl = typeof url === 'function' ? url() : url;

			if (enabled && targetUrl) {
				connect(targetUrl);
			} else {
				close();
			}

			return () => {
				manualClose = true;
				cleanupConnection();
			};
		});
	} catch {
		// When called outside an effect root (e.g. In unit tests), connect directly
		if (enabled) {
			const targetUrl = typeof url === 'function' ? url() : url;
			if (targetUrl) {
				connect(targetUrl);
			}
		}
	}

	return {
		get status() {
			return status;
		},
		get connected() {
			return connected;
		},
		get connecting() {
			return connecting;
		},
		get data() {
			return data;
		},
		get lastEvent() {
			return lastEvent;
		},
		get error() {
			return error;
		},
		on,
		close,
		reconnect
	};
}
