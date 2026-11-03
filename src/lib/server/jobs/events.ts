import type { EventHandler, EventSubscription, IEventBus } from './types';

interface SubscriberRecord {
	id: string;
	handler: EventHandler<any>;
	once?: boolean;
}

/**
 * In-process Domain Event Bus for decoupled asynchronous event notifications.
 */
export class EventBus implements IEventBus {
	private subscribers = new Map<string, SubscriberRecord[]>();
	private counter = 0;

	/**
	 * Subscribes a handler to an event.
	 */
	subscribe<TData = any>(eventName: string, handler: EventHandler<TData>): EventSubscription {
		const id = `sub_${++this.counter}_${Date.now()}`;
		const list = this.subscribers.get(eventName) || [];
		list.push({ id, handler });
		this.subscribers.set(eventName, list);

		return {
			unsubscribe: () => {
				const current = this.subscribers.get(eventName);
				if (current) {
					this.subscribers.set(
						eventName,
						current.filter((item) => item.id !== id)
					);
				}
			}
		};
	}

	/**
	 * Subscribes a handler to an event for exactly one invocation.
	 */
	once<TData = any>(eventName: string, handler: EventHandler<TData>): EventSubscription {
		const id = `sub_once_${++this.counter}_${Date.now()}`;
		const list = this.subscribers.get(eventName) || [];
		list.push({ id, handler, once: true });
		this.subscribers.set(eventName, list);

		return {
			unsubscribe: () => {
				const current = this.subscribers.get(eventName);
				if (current) {
					this.subscribers.set(
						eventName,
						current.filter((item) => item.id !== id)
					);
				}
			}
		};
	}

	/**
	 * Publishes an event to all registered subscribers.
	 * Handlers run asynchronously and errors in one subscriber do not crash others.
	 */
	async publish<TData = any>(eventName: string, data: TData): Promise<void> {
		const current = this.subscribers.get(eventName);
		if (!current || current.length === 0) {
			return;
		}

		// Filter out one-time subscribers
		const toRun = [...current];
		const remaining = current.filter((item) => !item.once);
		this.subscribers.set(eventName, remaining);

		const promises = toRun.map(async (sub) => {
			try {
				await sub.handler(data);
			} catch (err) {
				console.error(`[EventBus] Error in subscriber for event "${eventName}":`, err);
			}
		});

		await Promise.allSettled(promises);
	}

	/**
	 * Clears all registered subscribers. Useful for test isolation.
	 */
	clear(): void {
		this.subscribers.clear();
	}
}

/**
 * Global singleton EventBus instance.
 */
export const eventBus = new EventBus();
