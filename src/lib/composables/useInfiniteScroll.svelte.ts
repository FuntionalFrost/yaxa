import { infiniteScroll as infiniteScrollAction } from '$lib/actions/infiniteScroll';
import type { Action } from 'svelte/action';

export interface UseInfiniteScrollOptions {
	/** Threshold in pixels from the bottom/top to trigger load (default: 100) */
	distance?: number;
	/** Direction to monitor (default: 'bottom') */
	direction?: 'bottom' | 'top';
	/** Disable infinite scroll triggering */
	disabled?: boolean;
}

/**
 * Idiomatic Svelte 5 Class-based Rune for infinite scrolling on feeds, tables, and lists.
 */
export class InfiniteScroll {
	isLoading = $state(false);

	constructor(
		public onLoadMore: () => Promise<void> | void,
		public options: UseInfiniteScrollOptions = {}
	) {}

	async trigger() {
		if (this.isLoading || this.options.disabled) return;
		try {
			this.isLoading = true;
			await this.onLoadMore();
		} finally {
			this.isLoading = false;
		}
	}

	get action(): Action<HTMLElement, (() => Promise<void> | void) | undefined> {
		return (node, handler) => {
			const fn = handler || (() => this.trigger());
			const res = infiniteScrollAction(node, {
				onLoadMore: fn,
				distance: this.options.distance,
				direction: this.options.direction,
				disabled: this.options.disabled
			});

			return {
				update(newHandler) {
					if (res && res.update) {
						res.update(newHandler || fn);
					}
				},
				destroy() {
					if (res && res.destroy) {
						res.destroy();
					}
				}
			};
		};
	}
}

/**
 * Factory helper for useInfiniteScroll.
 */
export function useInfiniteScroll(
	onLoadMore: () => Promise<void> | void,
	options: UseInfiniteScrollOptions = {}
) {
	const instance = new InfiniteScroll(onLoadMore, options);

	return {
		get isLoading() {
			return instance.isLoading;
		},
		infiniteScroll: instance.action,
		trigger: () => instance.trigger(),
		instance
	};
}
