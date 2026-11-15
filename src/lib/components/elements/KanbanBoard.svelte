<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export const kanbanBoardVariants = tv({
		slots: {
			root: 'flex w-full gap-4 overflow-x-auto pb-2',
			column:
				'flex min-w-[270px] flex-1 flex-col rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-3 transition-colors dark:border-neutral-800/90 dark:bg-neutral-900/50',
			columnHeader: 'mb-3 flex items-center justify-between gap-2 px-1',
			columnTitleWrapper: 'flex items-center gap-2',
			columnDot: 'h-2.5 w-2.5 rounded-full',
			columnTitle:
				'text-xs font-bold tracking-wide text-neutral-800 uppercase dark:text-neutral-200',
			columnCount:
				'inline-flex items-center rounded-full bg-neutral-200/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
			cardList: 'flex min-h-[120px] flex-1 flex-col gap-2.5',
			card: 'group relative cursor-grab rounded-xl border border-neutral-200/90 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-primary-500/40 hover:shadow-sm active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900',
			cardTitle: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100',
			cardDescription: 'mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400',
			cardFooter: 'mt-3 flex items-center justify-between gap-2',
			emptyState:
				'flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-200 py-8 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500'
		}
	});

	export type KanbanBoardVariants = VariantProps<typeof kanbanBoardVariants>;
	export type KanbanBoardSlots = keyof typeof kanbanBoardVariants.slots;

	export interface KanbanItem {
		id: string;
		title: string;
		description?: string;
		badge?: string;
		priority?: 'low' | 'medium' | 'high' | 'urgent';
		assignee?: {
			name: string;
			avatar?: string;
		};
		[key: string]: any;
	}

	export interface KanbanColumn {
		id: string;
		title: string;
		color?: string;
		limit?: number;
		items: KanbanItem[];
	}

	export interface KanbanMoveEvent {
		item: KanbanItem;
		fromColumnId: string;
		toColumnId: string;
		toIndex: number;
	}

	export interface KanbanBoardProps extends HTMLAttributes<HTMLDivElement> {
		/**
		 * Array of columns and their cards (bindable for reactive two-way updates).
		 */
		columns: KanbanColumn[];
		/**
		 * Callback fired when a card is moved between or within columns.
		 */
		onmove?: (event: KanbanMoveEvent) => void;
		/**
		 * Callback fired when a card is clicked.
		 */
		onitemclick?: (item: KanbanItem, columnId: string) => void;
		/**
		 * Custom card renderer snippet.
		 */
		card?: Snippet<[{ item: KanbanItem; columnId: string }]>;
		/**
		 * Custom column header snippet.
		 */
		columnHeader?: Snippet<[{ column: KanbanColumn }]>;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<KanbanBoardSlots, string>>;
	}
</script>

<script lang="ts">
	import { cn } from '../../utils/cn';
	import Badge from './Badge.svelte';

	let {
		columns = $bindable([]),
		onmove,
		onitemclick,
		card,
		columnHeader,
		ui,
		class: className = '',
		...restProps
	}: KanbanBoardProps = $props();

	const slots = $derived(kanbanBoardVariants());

	let draggingItemId = $state<string | null>(null);
	let draggingFromColId = $state<string | null>(null);
	let dragOverColId = $state<string | null>(null);

	const PRIORITY_COLORS: Record<
		NonNullable<KanbanItem['priority']>,
		'neutral' | 'info' | 'warning' | 'error'
	> = {
		low: 'neutral',
		medium: 'info',
		high: 'warning',
		urgent: 'error'
	};

	function moveKanbanCard(
		itemId: string,
		fromColumnId: string,
		toColumnId: string,
		toIndex?: number
	) {
		const fromColIdx = columns.findIndex((c) => c.id === fromColumnId);
		const toColIdx = columns.findIndex((c) => c.id === toColumnId);
		if (fromColIdx === -1 || toColIdx === -1) return;

		const sourceItems = [...columns[fromColIdx].items];
		const itemIdx = sourceItems.findIndex((i) => i.id === itemId);
		if (itemIdx === -1) return;

		const [movedItem] = sourceItems.splice(itemIdx, 1);

		if (fromColIdx === toColIdx) {
			const targetIdx = toIndex !== undefined ? toIndex : sourceItems.length;
			sourceItems.splice(targetIdx, 0, movedItem);
			columns = columns.map((col, idx) =>
				idx === fromColIdx ? { ...col, items: sourceItems } : col
			);
			onmove?.({ item: movedItem, fromColumnId, toColumnId, toIndex: targetIdx });
			return;
		}

		const destItems = [...columns[toColIdx].items];
		const targetIdx = toIndex !== undefined ? toIndex : destItems.length;
		destItems.splice(targetIdx, 0, movedItem);

		columns = columns.map((col, idx) => {
			if (idx === fromColIdx) return { ...col, items: sourceItems };
			if (idx === toColIdx) return { ...col, items: destItems };
			return col;
		});

		onmove?.({ item: movedItem, fromColumnId, toColumnId, toIndex: targetIdx });
	}

	function handleDragStart(e: DragEvent, itemId: string, colId: string) {
		draggingItemId = itemId;
		draggingFromColId = colId;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', JSON.stringify({ itemId, colId }));
		}
	}

	function handleDragOver(e: DragEvent, colId: string) {
		e.preventDefault();
		dragOverColId = colId;
	}

	function handleDrop(e: DragEvent, toColId: string, toIndex?: number) {
		e.preventDefault();
		const itemId = draggingItemId;
		const fromColId = draggingFromColId;
		draggingItemId = null;
		draggingFromColId = null;
		dragOverColId = null;

		if (itemId && fromColId) {
			moveKanbanCard(itemId, fromColId, toColId, toIndex);
		}
	}

	function handleDragEnd() {
		draggingItemId = null;
		draggingFromColId = null;
		dragOverColId = null;
	}
</script>

<div
	data-slot="root"
	role="region"
	aria-label="Kanban Board"
	class={cn(slots.root({ class: ui?.root }), className)}
	{...restProps}
>
	{#each columns as col, colIdx (col.id)}
		{@const isOverLimit = Boolean(col.limit && col.items.length > col.limit)}
		<div
			data-slot="column"
			data-column-id={col.id}
			role="group"
			aria-label={col.title}
			ondragover={(e) => handleDragOver(e, col.id)}
			ondrop={(e) => handleDrop(e, col.id)}
			class={cn(
				slots.column({ class: ui?.column }),
				dragOverColId === col.id &&
					'bg-primary-50/20 ring-2 ring-primary-500/50 dark:bg-primary-950/20'
			)}
		>
			<!-- Column Header -->
			<div data-slot="columnHeader" class={slots.columnHeader({ class: ui?.columnHeader })}>
				{#if columnHeader}
					{@render columnHeader({ column: col })}
				{:else}
					<div
						data-slot="columnTitleWrapper"
						class={slots.columnTitleWrapper({ class: ui?.columnTitleWrapper })}
					>
						<span
							data-slot="columnDot"
							class={slots.columnDot({ class: ui?.columnDot })}
							style="background-color: {col.color || 'var(--color-primary-500, #ff3e00)'}"
						></span>
						<h4 data-slot="columnTitle" class={slots.columnTitle({ class: ui?.columnTitle })}>
							{col.title}
						</h4>
					</div>
					<span
						data-slot="columnCount"
						class={cn(
							slots.columnCount({ class: ui?.columnCount }),
							isOverLimit && 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
						)}
					>
						{col.items.length}{col.limit ? `/${col.limit}` : ''}
					</span>
				{/if}
			</div>

			<!-- Cards Container -->
			<div data-slot="cardList" class={slots.cardList({ class: ui?.cardList })}>
				{#if col.items.length === 0}
					<div data-slot="emptyState" class={slots.emptyState({ class: ui?.emptyState })}>
						Drop cards here
					</div>
				{:else}
					{#each col.items as item, itemIdx (item.id)}
						<div
							data-slot="card"
							data-card-id={item.id}
							draggable="true"
							role="button"
							tabindex="0"
							ondragstart={(e) => handleDragStart(e, item.id, col.id)}
							ondragend={handleDragEnd}
							ondrop={(e) => {
								e.stopPropagation();
								handleDrop(e, col.id, itemIdx);
							}}
							onclick={() => onitemclick?.(item, col.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onitemclick?.(item, col.id);
								}
							}}
							class={cn(
								slots.card({ class: ui?.card }),
								draggingItemId === item.id && 'scale-[0.98] opacity-40'
							)}
						>
							{#if card}
								{@render card({ item, columnId: col.id })}
							{:else}
								<div class="flex items-start justify-between gap-2">
									<div data-slot="cardTitle" class={slots.cardTitle({ class: ui?.cardTitle })}>
										{item.title}
									</div>
									<!-- Accessible Keyboard / Quick Move Controls -->
									<div
										class="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
									>
										{#if colIdx > 0}
											<button
												type="button"
												aria-label="Move {item.title} to {columns[colIdx - 1].title}"
												title="Move to {columns[colIdx - 1].title}"
												onclick={(e) => {
													e.stopPropagation();
													moveKanbanCard(item.id, col.id, columns[colIdx - 1].id);
												}}
												class="rounded p-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
											>
												←
											</button>
										{/if}
										{#if colIdx < columns.length - 1}
											<button
												type="button"
												aria-label="Move {item.title} to {columns[colIdx + 1].title}"
												title="Move to {columns[colIdx + 1].title}"
												onclick={(e) => {
													e.stopPropagation();
													moveKanbanCard(item.id, col.id, columns[colIdx + 1].id);
												}}
												class="rounded p-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
											>
												→
											</button>
										{/if}
									</div>
								</div>

								{#if item.description}
									<p
										data-slot="cardDescription"
										class={slots.cardDescription({ class: ui?.cardDescription })}
									>
										{item.description}
									</p>
								{/if}

								{#if item.badge || item.priority || item.assignee}
									<div data-slot="cardFooter" class={slots.cardFooter({ class: ui?.cardFooter })}>
										<div class="flex flex-wrap items-center gap-1.5">
											{#if item.badge}
												<Badge size="xs" variant="subtle" color="primary">{item.badge}</Badge>
											{/if}
											{#if item.priority}
												<Badge size="xs" variant="soft" color={PRIORITY_COLORS[item.priority]}>
													{item.priority}
												</Badge>
											{/if}
										</div>
										{#if item.assignee}
											<span
												class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
												title={item.assignee.name}
											>
												{item.assignee.name
													.split(' ')
													.map((n) => n[0])
													.join('')
													.slice(0, 2)
													.toUpperCase()}
											</span>
										{/if}
									</div>
								{/if}
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>
