import type { Broadcaster, BroadcastMessage, BroadcastSubscriber } from './types';

/**
 * In-memory channel broadcaster suitable for single-node deployments and local development.
 * Supports zero external dependencies with complete error isolation across subscribers.
 */
export class MemoryBroadcaster implements Broadcaster {
	private channels = new Map<string, Set<BroadcastSubscriber<any>>>();

	publish<T = unknown>(channel: string, event: string, payload: T, id?: string): void {
		const subscribers = this.channels.get(channel);
		if (!subscribers || subscribers.size === 0) {
			return;
		}

		const message: BroadcastMessage<T> = {
			channel,
			event,
			payload,
			id
		};

		// Isolate subscriber errors so one failure does not halt remaining subscribers
		for (const subscriber of subscribers) {
			try {
				subscriber(message);
			} catch (err) {
				console.error(`[Yaxa Broadcaster Error] Channel '${channel}', Event '${event}':`, err);
			}
		}
	}

	subscribe<T = unknown>(channel: string, subscriber: BroadcastSubscriber<T>): () => void {
		let subscribers = this.channels.get(channel);
		if (!subscribers) {
			subscribers = new Set();
			this.channels.set(channel, subscribers);
		}

		subscribers.add(subscriber);

		return () => {
			this.unsubscribe(channel, subscriber);
		};
	}

	unsubscribe<T = unknown>(channel: string, subscriber: BroadcastSubscriber<T>): void {
		const subscribers = this.channels.get(channel);
		if (subscribers) {
			subscribers.delete(subscriber);
			if (subscribers.size === 0) {
				this.channels.delete(channel);
			}
		}
	}

	subscriberCount(channel: string): number {
		return this.channels.get(channel)?.size ?? 0;
	}

	clear(): void {
		this.channels.clear();
	}
}

/**
 * Global default broadcaster instance.
 */
export const globalBroadcaster: Broadcaster = new MemoryBroadcaster();

/**
 * Creates a broadcaster instance or wraps a custom adapter.
 */
export function createBroadcaster(customAdapter?: Broadcaster): Broadcaster {
	return customAdapter || new MemoryBroadcaster();
}

/**
 * Broadcast an event to all connected clients on a channel.
 * Callable from any endpoint, server action, webhook, or background worker.
 *
 * @example
 * ```ts
 * await broadcast(`org:${orgId}`, 'invoice.paid', { id: 'inv_123', total: 4900 });
 * ```
 */
export async function broadcast<T = unknown>(
	channel: string,
	event: string,
	payload: T,
	id?: string,
	broadcasterInstance: Broadcaster = globalBroadcaster
): Promise<void> {
	await broadcasterInstance.publish(channel, event, payload, id);
}
