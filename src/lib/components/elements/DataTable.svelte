<script module lang="ts">
	export interface Column<T = any> {
		key: keyof T | string;
		label: string;
		sortable?: boolean;
		pinned?: 'left' | 'right';
		resizable?: boolean;
		width?: number;
		minWidth?: number;
		maxWidth?: number;
		class?: string;
	}
</script>

<script lang="ts" generics="T extends Record<string, any>">
	import type { Snippet } from 'svelte';
	import Checkbox from '../forms/Checkbox.svelte';
	import Icon from './Icon.svelte';
	import Skeleton from './Skeleton.svelte';

	interface Props {
		data: T[];
		columns: Column<T>[];
		loading?: boolean;
		selectable?: boolean;
		selected?: T[];
		searchQuery?: string;
		searchKeys?: (keyof T | string)[];
		emptyText?: string;
		class?: string;
		cell?: Snippet<[T, Column<T>]>;
		empty?: Snippet;
	}

	let {
		data = [],
		columns = [],
		loading = false,
		selectable = false,
		selected = $bindable([]),
		searchQuery = '',
		searchKeys = [],
		emptyText = 'No data available',
		class: className = '',
		cell,
		empty
	}: Props = $props();

	let sortKey = $state<string | null>(null);
	let sortOrder = $state<'asc' | 'desc'>('asc');
	let columnWidths = $state<Record<string, number>>({});

	// Initialize defined column widths
	$effect(() => {
		const initial: Record<string, number> = {};
		columns.forEach((c) => {
			if (c.width) initial[String(c.key)] = c.width;
		});
		columnWidths = { ...initial, ...columnWidths };
	});

	function handleSort(key: string) {
		if (sortKey === key) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
		}
	}

	function startColumnResize(columnKey: string, e: MouseEvent | TouchEvent) {
		e.preventDefault();
		e.stopPropagation();

		const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const currentCol = columns.find((c) => String(c.key) === columnKey);
		const currentWidth = columnWidths[columnKey] || 150;
		const minWidth = currentCol?.minWidth || 60;
		const maxWidth = currentCol?.maxWidth || 600;

		function onMove(moveEvent: MouseEvent | TouchEvent) {
			const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
			const delta = clientX - startX;
			const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + delta));
			columnWidths[columnKey] = newWidth;
		}

		function onEnd() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onEnd);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onEnd);
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onEnd);
		window.addEventListener('touchmove', onMove);
		window.addEventListener('touchend', onEnd);
	}

	let filteredData = $derived.by(() => {
		let result = [...data];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
			result = result.filter((item) =>
				keys.some((key) => {
					const val = item[key as keyof T];
					return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
				})
			);
		}

		// Sort
		if (sortKey) {
			result.sort((a, b) => {
				const valA = a[sortKey as keyof T];
				const valB = b[sortKey as keyof T];
				if (valA === valB) return 0;
				if (valA === undefined || valA === null) return 1;
				if (valB === undefined || valB === null) return -1;
				const comparison = valA > valB ? 1 : -1;
				return sortOrder === 'asc' ? comparison : -comparison;
			});
		}

		return result;
	});

	let allSelected = $derived(filteredData.length > 0 && selected.length === filteredData.length);

	function toggleSelectAll(isChecked: boolean) {
		if (isChecked) {
			selected = [...filteredData];
		} else {
			selected = [];
		}
	}

	function toggleSelectRow(item: T, isChecked: boolean) {
		if (isChecked) {
			if (!selected.includes(item)) {
				selected = [...selected, item];
			}
		} else {
			selected = selected.filter((i) => i !== item);
		}
	}

	function getPinClass(pinned?: 'left' | 'right') {
		if (pinned === 'left') {
			return 'sticky left-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs border-r border-neutral-200 dark:border-neutral-800 shadow-xs';
		}
		if (pinned === 'right') {
			return 'sticky right-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs border-l border-neutral-200 dark:border-neutral-800 shadow-xs';
		}
		return '';
	}
</script>

<div
	class="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 {className}"
>
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
			<!-- Table Header -->
			<thead
				class="border-b border-neutral-200 bg-neutral-50/80 text-sm font-semibold tracking-wider text-neutral-600 uppercase dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400"
			>
				<tr>
					{#if selectable}
						<th class="w-10 px-4 py-3 {getPinClass('left')}">
							<Checkbox
								checked={allSelected}
								onchange={toggleSelectAll}
								aria-label="Select all rows"
							/>
						</th>
					{/if}
					{#each columns as column}
						{@const colKey = String(column.key)}
						{@const widthStyle = columnWidths[colKey]
							? `width: ${columnWidths[colKey]}px; min-width: ${columnWidths[colKey]}px;`
							: ''}
						<th
							class="relative px-4 py-3 {getPinClass(column.pinned)} {column.class || ''}"
							style={widthStyle}
						>
							<div class="flex items-center justify-between gap-2">
								{#if column.sortable}
									<button
										type="button"
										onclick={() => handleSort(colKey)}
										class="group inline-flex items-center gap-1 font-semibold tracking-wider uppercase transition hover:text-neutral-900 dark:hover:text-white"
									>
										<span>{column.label}</span>
										<span
											class="text-neutral-400 transition-colors group-hover:text-primary-500 {sortKey ===
											colKey
												? 'text-primary-500'
												: ''}"
										>
											{#if sortKey === colKey}
												<Icon
													name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
													size="xs"
												/>
											{:else}
												<Icon name="chevron-down" size="xs" class="opacity-40" />
											{/if}
										</span>
									</button>
								{:else}
									<span>{column.label}</span>
								{/if}

								{#if column.pinned}
									<span
										class="rounded bg-primary-100 px-1 text-[9px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
									>
										Pinned
									</span>
								{/if}
							</div>

							<!-- Column Resizing Handle -->
							{#if column.resizable !== false}
								<button
									type="button"
									onmousedown={(e) => startColumnResize(colKey, e)}
									ontouchstart={(e) => startColumnResize(colKey, e)}
									class="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize transition-colors hover:bg-primary-500 active:bg-primary-600"
									aria-label="Resize column {column.label}"
								></button>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>

			<!-- Table Body -->
			<tbody class="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
				{#if loading}
					{#each Array(5)}
						<tr>
							{#if selectable}
								<td class="px-4 py-3.5">
									<Skeleton class="h-4 w-4 rounded" />
								</td>
							{/if}
							{#each columns}
								<td class="px-4 py-3.5">
									<Skeleton class="h-4 w-24 rounded" />
								</td>
							{/each}
						</tr>
					{/each}
				{:else if filteredData.length === 0}
					<tr>
						<td
							colspan={columns.length + (selectable ? 1 : 0)}
							class="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400"
						>
							{#if empty}
								{@render empty()}
							{:else}
								<div class="flex flex-col items-center justify-center gap-2">
									<Icon name="search" size="md" class="text-neutral-400" />
									<p>{emptyText}</p>
								</div>
							{/if}
						</td>
					</tr>
				{:else}
					{#each filteredData as item}
						{@const isSelected = selected.includes(item)}
						<tr
							class="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50 {isSelected
								? 'bg-primary-50/40 dark:bg-primary-950/20'
								: ''}"
						>
							{#if selectable}
								<td class="w-10 px-4 py-3.5 {getPinClass('left')}">
									<Checkbox
										checked={isSelected}
										onchange={(checked) => toggleSelectRow(item, checked)}
										aria-label="Select row"
									/>
								</td>
							{/if}
							{#each columns as column}
								{@const colKey = String(column.key)}
								{@const widthStyle = columnWidths[colKey]
									? `width: ${columnWidths[colKey]}px; min-width: ${columnWidths[colKey]}px;`
									: ''}
								<td
									class="px-4 py-3.5 {getPinClass(column.pinned)} {column.class || ''}"
									style={widthStyle}
								>
									{#if cell}
										{@render cell(item, column)}
									{:else}
										{item[column.key as keyof T] ?? '—'}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
