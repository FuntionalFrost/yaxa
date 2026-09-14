import { browser } from '$app/environment';
import type { Action } from 'svelte/action';

export interface InfiniteScrollActionOptions {
	/** Threshold in pixels from bottom/top to trigger (default: 100) */
	distance?: number;
	/** Direction to monitor (default: 'bottom') */
	direction?: 'bottom' | 'top';
	/** Disable infinite scroll triggering */
	disabled?: boolean;
	/** Callback invoked when trigger threshold is reached */
	onLoadMore: () => Promise<void> | void;
}

/**
 * Headless Svelte Action to trigger loading callbacks when scrolling near the edges.
 *
 * Usage:
 * ```svelte
 * <div use:infiniteScroll={loadMore}>...</div>
 * <div use:infiniteScroll={{ onLoadMore: loadMore, distance: 200 }}>...</div>
 * ```
 */
export const infiniteScroll: Action<
	HTMLElement,
	InfiniteScrollActionOptions | (() => Promise<void> | void)
> = (node, param) => {
	if (!browser) return;

	let options: InfiniteScrollActionOptions =
		typeof param === 'function' ? { onLoadMore: param } : param;

	let isPending = false;

	async function trigger() {
		if (isPending || options.disabled) return;
		try {
			isPending = true;
			await options.onLoadMore();
		} finally {
			isPending = false;
		}
	}

	const distance = options.distance ?? 100;
	const direction = options.direction ?? 'bottom';

	const sentinel = document.createElement('div');
	sentinel.setAttribute('data-yaxa-sentinel', 'true');
	sentinel.style.height = '1px';
	sentinel.style.width = '100%';
	sentinel.style.pointerEvents = 'none';
	sentinel.style.opacity = '0';

	if (direction === 'bottom') {
		node.appendChild(sentinel);
	} else {
		node.insertBefore(sentinel, node.firstChild);
	}

	const observer = new IntersectionObserver(
		(entries) => {
			const [entry] = entries;
			if (entry.isIntersecting && !isPending && !options.disabled) {
				trigger();
			}
		},
		{
			root: node === document.documentElement || node === document.body ? null : node,
			rootMargin: `${distance}px`
		}
	);

	observer.observe(sentinel);

	return {
		update(newParam) {
			options = typeof newParam === 'function' ? { onLoadMore: newParam } : newParam;
		},
		destroy() {
			observer.disconnect();
			if (sentinel.parentNode) {
				sentinel.parentNode.removeChild(sentinel);
			}
		}
	};
};
