import { browser } from '$app/env';

export interface ShortcutItem {
	handler: (e: KeyboardEvent) => void;
	disabled?: boolean;
}

export type ShortcutConfig = (e: KeyboardEvent) => void | ShortcutItem;

/**
 * Global keyboard shortcut listener matching Nuxt UI's defineShortcuts.
 * Example: useShortcuts({ 'meta_k': () => openSearch(), 'escape': () => closeModal() })
 */
export function useShortcuts(
	shortcuts: Record<string, ((e: KeyboardEvent) => void) | ShortcutItem>
): () => void {
	if (!browser) return () => {};

	function handleKeyDown(e: KeyboardEvent) {
		if (e.defaultPrevented) return;
		const target = e.target as HTMLElement | null;
		const isInput =
			target &&
			(target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable);

		for (const [keyCombo, config] of Object.entries(shortcuts)) {
			const handler = typeof config === 'function' ? config : config.handler;
			const disabled = typeof config === 'object' ? config.disabled : false;
			if (disabled) continue;

			const parts = keyCombo.toLowerCase().split(/[\s_+]/);
			const mainKey = parts[parts.length - 1];
			const requiresMeta =
				parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
			const requiresCtrl = parts.includes('ctrl') || parts.includes('control');
			const requiresShift = parts.includes('shift');
			const requiresAlt = parts.includes('alt');

			const metaMatch = requiresMeta ? e.metaKey || e.ctrlKey : true;
			const ctrlMatch = requiresCtrl ? e.ctrlKey : true;
			const shiftMatch = requiresShift ? e.shiftKey : true;
			const altMatch = requiresAlt ? e.altKey : true;
			const keyMatch =
				e.key.toLowerCase() === mainKey ||
				e.code.toLowerCase() === `key${mainKey}` ||
				(mainKey === 'k' && e.key.toLowerCase() === 'k');

			if (metaMatch && ctrlMatch && shiftMatch && altMatch && keyMatch) {
				if (isInput && !requiresMeta && !requiresCtrl) {
					continue;
				}
				e.preventDefault();
				handler(e);
				break;
			}
		}
	}

	window.addEventListener('keydown', handleKeyDown);
	return () => {
		window.removeEventListener('keydown', handleKeyDown);
	};
}
