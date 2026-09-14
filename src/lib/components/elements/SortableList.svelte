<script module lang="ts">
	export interface SortableListProps<T = any> {
		items: T[];
		key?: keyof T | ((item: T, index: number) => string | number);
		disabled?: boolean;
		class?: string;
		onreorder?: (newItems: T[], fromIndex: number, toIndex: number) => void;
	}
</script>

<script lang="ts" generics="T extends Record<string, any> | string | number">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { useSortable } from '$lib/composables/useSortable.svelte';

	interface Props extends SortableListProps<T> {
		children?: Snippet<
			[T, number, { isDragging: boolean; moveUp: () => void; moveDown: () => void }]
		>;
		handleSnippet?: Snippet;
	}

	let {
		items = $bindable([]),
		key,
		disabled = false,
		class: className = '',
		children,
		handleSnippet,
		onreorder
	}: Props = $props();

	const sortable = useSortable<T>(items, {
		onReorder: (newItems, from, to) => {
			items = newItems;
			if (onreorder) onreorder(newItems, from, to);
		}
	});

	$effect(() => {
		sortable.items = items;
	});

	function getItemKey(item: T, index: number): string | number {
		if (typeof key === 'function') return key(item, index);
		if (typeof key === 'string' && typeof item === 'object' && item !== null) {
			const val = (item as Record<string, any>)[key];
			return typeof val === 'string' || typeof val === 'number' ? val : index;
		}
		if (typeof item === 'object' && item !== null && 'id' in item) {
			const idVal = (item as Record<string, any>).id;
			return typeof idVal === 'string' || typeof idVal === 'number' ? idVal : index;
		}
		return index;
	}
</script>

{#snippet defaultHandle()}
	<button
		type="button"
		class="flex cursor-grab items-center justify-center text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:text-neutral-500 dark:hover:text-neutral-300"
		aria-label="Drag to reorder"
	>
		<Icon name="bars-2" class="h-4 w-4" />
	</button>
{/snippet}

{#snippet defaultItem(item: any)}
	<span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">
		{typeof item === 'object' && item !== null && 'label' in item
			? (item as any).label
			: String(item)}
	</span>
{/snippet}

<div role="list" class="w-full space-y-2 {className}">
	{#each sortable.items as item, index (getItemKey(item, index))}
		{@const isItemDragging = sortable.draggingIndex === index}
		{@const isItemDragOver = sortable.dragOverIndex === index && sortable.draggingIndex !== index}
		{@const controls = {
			isDragging: isItemDragging,
			moveUp: () => {
				sortable.moveUp(index);
				items = sortable.items;
			},
			moveDown: () => {
				sortable.moveDown(index);
				items = sortable.items;
			}
		}}

		<div
			role="listitem"
			aria-roledescription="sortable item"
			draggable={!disabled}
			ondragstart={(e) => sortable.handleDragStart(index, e)}
			ondragover={(e) => sortable.handleDragOver(index, e)}
			ondrop={(e) => {
				sortable.handleDrop(index, e);
				items = sortable.items;
			}}
			ondragend={() => sortable.handleDragEnd()}
			class="group relative flex items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-xs transition-all select-none dark:bg-neutral-900 {isItemDragging
				? 'scale-[0.98] border-primary-400 bg-primary-50/20 opacity-40 dark:border-primary-600'
				: isItemDragOver
					? 'translate-y-0.5 border-primary-500 ring-2 ring-primary-500/20'
					: 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700'}"
		>
			<div class="flex flex-1 items-center gap-3">
				<!-- Drag Grip Handle -->
				{@render (handleSnippet ?? defaultHandle)()}

				<!-- Content -->
				<div class="flex-1">
					{@render (children ?? defaultItem)(item, index, controls)}
				</div>
			</div>

			<!-- Reorder Arrow Buttons for Keyboard / Touch Users -->
			<div
				class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex"
			>
				<button
					type="button"
					disabled={index === 0}
					onclick={() => {
						sortable.moveUp(index);
						items = sortable.items;
					}}
					class="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					aria-label="Move item up"
				>
					<Icon name="chevron-up" class="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					disabled={index === sortable.items.length - 1}
					onclick={() => {
						sortable.moveDown(index);
						items = sortable.items;
					}}
					class="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					aria-label="Move item down"
				>
					<Icon name="chevron-down" class="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	{/each}
</div>
