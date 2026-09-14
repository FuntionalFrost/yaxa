import type { Action } from 'svelte/action';

export interface AutosizeOptions {
	/** Maximum height in pixels before scrolling */
	maxHeight?: number;
	/** Minimum height in pixels (defaults to initial height) */
	minHeight?: number;
}

/**
 * Headless Svelte Action to dynamically auto-grow a <textarea> based on its content.
 *
 * Usage:
 * ```svelte
 * <textarea use:autosize={{ maxHeight: 300 }} bind:value={text}></textarea>
 * ```
 */
export const autosize: Action<HTMLTextAreaElement, AutosizeOptions | undefined> = (
	node,
	options = {}
) => {
	let currentOptions = options || {};

	function resize() {
		// Reset height to calculate true scrollHeight
		node.style.height = 'auto';
		const minH = currentOptions.minHeight ?? 0;
		const maxH = currentOptions.maxHeight;

		let targetHeight = Math.max(node.scrollHeight, minH);
		if (maxH && targetHeight > maxH) {
			targetHeight = maxH;
			node.style.overflowY = 'auto';
		} else {
			node.style.overflowY = 'hidden';
		}

		node.style.height = `${targetHeight}px`;
	}

	node.addEventListener('input', resize);

	// Initial resize
	requestAnimationFrame(resize);

	return {
		update(newOptions) {
			currentOptions = newOptions || {};
			resize();
		},
		destroy() {
			node.removeEventListener('input', resize);
		}
	};
};
