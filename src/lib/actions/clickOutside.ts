import type { Action } from 'svelte/action';

export interface ClickOutsideOptions {
	/** Callback invoked when a click occurs outside the node */
	handler?: (event: MouseEvent | TouchEvent) => void;
	/** Optional list of elements or selectors to ignore */
	exclude?: (HTMLElement | string)[];
	/** Enabled flag */
	enabled?: boolean;
}

/**
 * Headless Svelte Action to trigger a callback when clicking outside the target element.
 *
 * Usage:
 * ```svelte
 * <div use:clickOutside={() => (isOpen = false)}>...</div>
 * ```
 */
export const clickOutside: Action<
	HTMLElement,
	ClickOutsideOptions | ((event: MouseEvent | TouchEvent) => void) | undefined
> = (node, param) => {
	let options: ClickOutsideOptions = typeof param === 'function' ? { handler: param } : param || {};

	function handleClick(event: MouseEvent | TouchEvent) {
		if (options.enabled === false) return;
		const target = event.target as Node | null;
		if (!target) return;

		// Check if click was inside node
		if (node.contains(target)) return;

		// Check excluded elements
		if (options.exclude) {
			for (const item of options.exclude) {
				if (typeof item === 'string') {
					const el = document.querySelector(item);
					if (el && el.contains(target)) return;
				} else if (item && item.contains(target)) {
					return;
				}
			}
		}

		if (options.handler) {
			options.handler(event);
		}
	}

	document.addEventListener('pointerdown', handleClick, true);

	return {
		update(newParam) {
			options = typeof newParam === 'function' ? { handler: newParam } : newParam || {};
		},
		destroy() {
			document.removeEventListener('pointerdown', handleClick, true);
		}
	};
};
