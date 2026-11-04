import type { RequestEvent } from '@sveltejs/kit';
import type { Guard } from '../endpoint/types';

/**
 * Structured Server-Sent Event message payload.
 */
export interface SSEMessage<T = unknown> {
	/** Optional unique event ID for client Last-Event-ID tracking */
	id?: string;
	/** Optional named event type (defaults to 'message') */
	event?: string;
	/** Payload data to transmit. Objects/arrays are JSON-encoded automatically */
	data: T;
	/** Optional reconnection delay in milliseconds suggested to the client */
	retry?: number;
}

/**
 * Context provided to onConnect and event callbacks.
 */
export interface SSEClientContext {
	/** Unique connection ID */
	connectionId: string;
	/** Active channel name */
	channel: string;
	/** The incoming SvelteKit RequestEvent */
	event: RequestEvent;
	/** Resolved user from guards/locals */
	user?: any;
	/** Active organization ID from guards/locals */
	orgId?: string | null;
	/** Send an SSE message directly to this client */
	send: <T = unknown>(eventOrMessage: string | SSEMessage<T>, data?: T) => boolean;
	/** Explicitly close this SSE connection */
	close: () => void;
}

/**
 * Configuration options for yaxaSSE endpoint handler.
 */
export interface YaxaSSEOptions {
	/** Summary for OpenAPI documentation */
	summary?: string;

	/** Description for OpenAPI documentation */
	description?: string;

	/**
	 * Declarative guards executed before establishing the SSE connection.
	 * If a guard fails, an RFC 7807 Problem Details response (e.g. 401, 403, 429) is returned.
	 */
	guards?: Guard[];

	/**
	 * Channel name to subscribe this client to. Can be a static string or a dynamic function
	 * of the incoming RequestEvent (e.g. `(event) => \`org:\${event.locals.orgId}\``).
	 * Defaults to `'default'`.
	 */
	channel?: string | ((event: RequestEvent) => string | Promise<string>);

	/**
	 * Keep-alive ping interval in milliseconds to prevent reverse proxies, firewalls,
	 * and serverless platforms (e.g. Vercel) from terminating idle connections.
	 * Set to 0 to disable. Defaults to 15,000ms (15s).
	 */
	keepAliveIntervalMs?: number;

	/**
	 * Custom comment or payload for keep-alive pings.
	 * Defaults to `: ping\n\n`.
	 */
	keepAliveComment?: string;

	/**
	 * Hook called immediately after connection establishment and headers transmission.
	 */
	onConnect?: (ctx: SSEClientContext) => void | Promise<void>;

	/**
	 * Hook called when the client disconnects or the request is aborted.
	 */
	onDisconnect?: (ctx: Omit<SSEClientContext, 'send' | 'close'>) => void | Promise<void>;

	/**
	 * Custom broadcaster instance. If omitted, uses the global broadcaster singleton.
	 */
	broadcaster?: Broadcaster;
}

/**
 * Broadcast message contract.
 */
export interface BroadcastMessage<T = unknown> {
	channel: string;
	event: string;
	payload: T;
	id?: string;
}

/**
 * Broadcaster subscription callback.
 */
export type BroadcastSubscriber<T = unknown> = (msg: BroadcastMessage<T>) => void;

/**
 * Broadcaster adapter interface.
 * Can be implemented by MemoryBroadcaster, RedisBroadcaster, ValkeyBroadcaster, etc.
 */
export interface Broadcaster {
	/**
	 * Publish an event to all subscribers listening on the specified channel.
	 */
	publish: <T = unknown>(
		channel: string,
		event: string,
		payload: T,
		id?: string
	) => Promise<void> | void;

	/**
	 * Subscribe to events on a specific channel. Returns an unsubscribe function.
	 */
	subscribe: <T = unknown>(channel: string, subscriber: BroadcastSubscriber<T>) => () => void;

	/**
	 * Unsubscribe a callback from a channel.
	 */
	unsubscribe: <T = unknown>(channel: string, subscriber: BroadcastSubscriber<T>) => void;

	/**
	 * Returns current number of active subscribers on a channel (optional).
	 */
	subscriberCount?: (channel: string) => number;

	/**
	 * Remove all subscribers across all channels.
	 */
	clear?: () => void;
}
