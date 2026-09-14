export interface UseSortableOptions<T> {
	items?: T[];
	onReorder?: (newItems: T[], fromIndex: number, toIndex: number) => void;
}

/**
 * Idiomatic Svelte 5 Class-based Rune for drag-and-drop item and card reordering.
 */
export class Sortable<T> {
	items = $state<T[]>([]);
	draggingIndex = $state<number | null>(null);
	dragOverIndex = $state<number | null>(null);

	isDragging = $derived(this.draggingIndex !== null);

	constructor(
		initialItems: T[] = [],
		public options: UseSortableOptions<T> = {}
	) {
		this.items = [...initialItems];
	}

	handleDragStart(index: number, e: DragEvent) {
		this.draggingIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	handleDragOver(index: number, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		if (this.dragOverIndex !== index) {
			this.dragOverIndex = index;
		}
	}

	handleDrop(targetIndex: number, e: DragEvent) {
		e.preventDefault();
		if (this.draggingIndex === null || this.draggingIndex === targetIndex) {
			this.reset();
			return;
		}

		const fromIndex = this.draggingIndex;
		const toIndex = targetIndex;

		const updated = [...this.items];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);

		this.items = updated;
		if (this.options.onReorder) {
			this.options.onReorder(updated, fromIndex, toIndex);
		}

		this.reset();
	}

	handleDragEnd() {
		this.reset();
	}

	moveItem(fromIndex: number, toIndex: number) {
		if (
			fromIndex < 0 ||
			fromIndex >= this.items.length ||
			toIndex < 0 ||
			toIndex >= this.items.length
		) {
			return;
		}
		const updated = [...this.items];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);
		this.items = updated;
		if (this.options.onReorder) {
			this.options.onReorder(updated, fromIndex, toIndex);
		}
	}

	moveUp(index: number) {
		if (index > 0) this.moveItem(index, index - 1);
	}

	moveDown(index: number) {
		if (index < this.items.length - 1) this.moveItem(index, index + 1);
	}

	reset() {
		this.draggingIndex = null;
		this.dragOverIndex = null;
	}
}

/**
 * Factory function for creating a Sortable Svelte 5 Rune instance.
 */
export function useSortable<T>(initialItems: T[] = [], options: UseSortableOptions<T> = {}) {
	return new Sortable<T>(initialItems, options);
}
