import type { Action } from 'svelte/action';

export interface SortableItemOptions {
	index: number;
	disabled?: boolean;
	onDragStart?: (index: number, e: DragEvent) => void;
	onDragOver?: (index: number, e: DragEvent) => void;
	onDrop?: (index: number, e: DragEvent) => void;
	onDragEnd?: () => void;
}

/**
 * Headless Svelte Action to make any DOM item draggable and droppable for reordering.
 *
 * Usage:
 * ```svelte
 * <li use:sortableItem={{ index, onDragStart, onDragOver, onDrop, onDragEnd }}>...</li>
 * ```
 */
export const sortableItem: Action<HTMLElement, SortableItemOptions> = (node, options) => {
	let currentOptions = options;

	function setupDraggable() {
		node.draggable = !currentOptions.disabled;
	}

	function handleDragStart(e: DragEvent) {
		if (currentOptions.disabled) return;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(currentOptions.index));
		}
		if (currentOptions.onDragStart) {
			currentOptions.onDragStart(currentOptions.index, e);
		}
	}

	function handleDragOver(e: DragEvent) {
		if (currentOptions.disabled) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		if (currentOptions.onDragOver) {
			currentOptions.onDragOver(currentOptions.index, e);
		}
	}

	function handleDrop(e: DragEvent) {
		if (currentOptions.disabled) return;
		e.preventDefault();
		if (currentOptions.onDrop) {
			currentOptions.onDrop(currentOptions.index, e);
		}
	}

	function handleDragEnd() {
		if (currentOptions.onDragEnd) {
			currentOptions.onDragEnd();
		}
	}

	setupDraggable();

	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragend', handleDragEnd);

	return {
		update(newOptions) {
			currentOptions = newOptions;
			setupDraggable();
		},
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener('dragend', handleDragEnd);
		}
	};
};
