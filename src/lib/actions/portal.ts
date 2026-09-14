import type { Action } from 'svelte/action';

export interface PortalOptions {
	/** Target container element or CSS selector. Defaults to `document.body` */
	target?: HTMLElement | string;
	/** Whether the portal is enabled */
	enabled?: boolean;
}

/**
 * Headless Svelte Action to teleport an element into another DOM container (e.g. `document.body`).
 *
 * Usage:
 * ```svelte
 * <div use:portal>...</div>
 * <div use:portal="#modal-root">...</div>
 * ```
 */
export const portal: Action<HTMLElement, HTMLElement | string | PortalOptions | undefined> = (
	node,
	param
) => {
	let targetEl: HTMLElement | null = null;
	const placeholder = document.createComment('portal-placeholder');

	function resolveTarget(p?: HTMLElement | string | PortalOptions): HTMLElement | null {
		if (!p) return document.body;
		if (typeof p === 'string') return document.querySelector(p);
		if (p instanceof HTMLElement) return p;
		if (typeof p === 'object') {
			if (p.enabled === false) return null;
			if (typeof p.target === 'string') return document.querySelector(p.target);
			if (p.target instanceof HTMLElement) return p.target;
			return document.body;
		}
		return document.body;
	}

	function mount(target: HTMLElement | null) {
		if (!target) {
			// Restore to placeholder if disabled
			if (placeholder.parentNode && node.parentNode !== placeholder.parentNode) {
				placeholder.parentNode.insertBefore(node, placeholder);
			}
			return;
		}

		if (node.parentNode && node.parentNode !== target) {
			node.parentNode.insertBefore(placeholder, node);
			target.appendChild(node);
		} else if (!node.parentNode) {
			target.appendChild(node);
		}
	}

	targetEl = resolveTarget(param);
	mount(targetEl);

	return {
		update(newParam) {
			targetEl = resolveTarget(newParam);
			mount(targetEl);
		},
		destroy() {
			if (placeholder.parentNode) {
				placeholder.parentNode.removeChild(placeholder);
			}
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	};
};
