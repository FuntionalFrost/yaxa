<script module lang="ts">
	export interface Column<T = any> {
		key: keyof T | string;
		label: string;
		sortable?: boolean;
		pinned?: 'left' | 'right';
		resizable?: boolean;
		hidden?: boolean;
		width?: number;
		minWidth?: number;
		maxWidth?: number;
		class?: string;
	}

	export interface DataTablePaginateEvent {
		page: number;
		pageSize: number;
		sortKey?: string;
		sortOrder: 'asc' | 'desc';
		searchQuery: string;
	}
</script>

<script lang="ts" generics="T extends Record<string, any>">
	import type { Snippet } from 'svelte';
	import Checkbox from '../forms/Checkbox.svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Skeleton from './Skeleton.svelte';
	import Popover from '../overlays/Popover.svelte';

	interface Props {
		data: T[];
		columns: Column<T>[];
		mode?: 'client' | 'server';
		totalRows?: number;
		loading?: boolean;
		selectable?: boolean;
		selected?: T[];
		searchQuery?: string;
		searchKeys?: (keyof T | string)[];
		showSearch?: boolean;
		showExport?: boolean;
		showColumnToggle?: boolean;
		pagination?: boolean;
		pageSize?: number;
		page?: number;
		pageSizeOptions?: number[];
		sortKey?: string | null;
		sortOrder?: 'asc' | 'desc';
		emptyText?: string;
		class?: string;
		onpaginate?: (event: DataTablePaginateEvent) => void;
		onsort?: (event: { sortKey: string; sortOrder: 'asc' | 'desc' }) => void;
		onsearch?: (query: string) => void;
		cell?: Snippet<[T, Column<T>]>;
		empty?: Snippet;
		bulkActions?: Snippet<[{ selected: T[]; clearSelection: () => void }]>;
		toolbar?: Snippet;
	}

	let {
		data = [],
		columns = [],
		mode = 'client',
		totalRows,
		loading = false,
		selectable = false,
		selected = $bindable([]),
		searchQuery = $bindable(''),
		searchKeys = [],
		showSearch = false,
		showExport = false,
		showColumnToggle = false,
		pagination = false,
		pageSize = $bindable(10),
		page = $bindable(1),
		pageSizeOptions = [10, 25, 50, 100],
		sortKey = $bindable<string | null>(null),
		sortOrder = $bindable<'asc' | 'desc'>('asc'),
		emptyText = 'No data available',
		class: className = '',
		onpaginate,
		onsort,
		onsearch,
		cell,
		empty,
		bulkActions,
		toolbar
	}: Props = $props();

	let customWidths = $state<Record<string, number>>({});
	let hiddenKeys = $state<string[]>([]);

	// Visible columns
	let visibleColumns = $derived(
		columns.filter((c) => !c.hidden && !hiddenKeys.includes(String(c.key)))
	);

	let effectiveWidths = $derived.by(() => {
		const widths: Record<string, number> = {};
		columns.forEach((c) => {
			if (c.width) widths[String(c.key)] = c.width;
		});
		return { ...widths, ...customWidths };
	});

	function emitPaginate() {
		onpaginate?.({
			page,
			pageSize,
			sortKey: sortKey || undefined,
			sortOrder,
			searchQuery
		});
	}

	function handleSort(key: string) {
		let newOrder: 'asc' | 'desc' = 'asc';
		if (sortKey === key) {
			newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		}
		sortKey = key;
		sortOrder = newOrder;

		onsort?.({ sortKey: key, sortOrder: newOrder });
		emitPaginate();
	}

	function handleSearchInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		searchQuery = val;
		if (mode === 'server') {
			page = 1;
			onsearch?.(val);
			emitPaginate();
		}
	}

	function handlePageChange(newPage: number) {
		page = newPage;
		emitPaginate();
	}

	function handlePageSizeChange(newSize: number) {
		pageSize = newSize;
		page = 1;
		emitPaginate();
	}

	function startColumnResize(columnKey: string, e: MouseEvent | TouchEvent) {
		e.preventDefault();
		e.stopPropagation();

		const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const currentCol = columns.find((c) => String(c.key) === columnKey);
		const currentWidth = effectiveWidths[columnKey] || 150;
		const minWidth = currentCol?.minWidth || 60;
		const maxWidth = currentCol?.maxWidth || 600;

		function onMove(moveEvent: MouseEvent | TouchEvent) {
			const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
			const delta = clientX - startX;
			const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + delta));
			customWidths[columnKey] = newWidth;
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
		if (mode === 'server') {
			return data;
		}

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

	// Total count: server totalRows or client filtered count
	let effectiveTotalCount = $derived(
		mode === 'server' ? (totalRows ?? data.length) : filteredData.length
	);

	// Pagination calculation
	let totalPages = $derived(Math.max(1, Math.ceil(effectiveTotalCount / pageSize)));

	let paginatedData = $derived.by(() => {
		if (!pagination || mode === 'server') return filteredData;
		const start = (page - 1) * pageSize;
		return filteredData.slice(start, start + pageSize);
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

	function toggleColumnVisibility(colKey: string) {
		if (hiddenKeys.includes(colKey)) {
			hiddenKeys = hiddenKeys.filter((k) => k !== colKey);
		} else {
			hiddenKeys = [...hiddenKeys, colKey];
		}
	}

	function exportCsv(filename = 'export.csv') {
		if (filteredData.length === 0) return;
		const cols = visibleColumns;
		const headers = cols.map((c) => `"${c.label}"`).join(',');
		const rows = filteredData.map((row) =>
			cols
				.map((c) => {
					const val = row[c.key as keyof T];
					return val !== undefined && val !== null ? `"${String(val).replace(/"/g, '""')}"` : '""';
				})
				.join(',')
		);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function exportJson(filename = 'export.json') {
		if (filteredData.length === 0) return;
		const jsonString =
			'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredData, null, 2));
		const link = document.createElement('a');
		link.setAttribute('href', jsonString);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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

<div class="w-full space-y-3 {className}">
	<!-- Optional Header Toolbar -->
	{#if showSearch || showExport || showColumnToggle || toolbar}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				{#if showSearch}
					<div class="relative w-64">
						<Icon
							name="search"
							size="xs"
							class="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
						/>
						<input
							type="text"
							value={searchQuery}
							oninput={handleSearchInput}
							placeholder="Search rows..."
							aria-label="Search rows"
							class="h-9 w-full rounded-lg border border-neutral-200 bg-white pr-3 pl-8 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
						/>
					</div>
				{/if}

				{#if toolbar}
					{@render toolbar()}
				{/if}
			</div>

			<div class="flex items-center gap-2">
				{#if showColumnToggle}
					<Popover>
						{#snippet trigger()}
							<Button variant="outline" size="xs" class="h-9 gap-1.5 text-xs">
								<Icon name="columns-3" size="xs" />
								Columns
							</Button>
						{/snippet}
						<div class="w-48 space-y-2 p-1 text-xs">
							<div class="px-1 text-[10px] font-semibold text-neutral-500 uppercase">
								Toggle Columns
							</div>
							{#each columns as col}
								{@const colKey = String(col.key)}
								{@const isVisible = !hiddenKeys.includes(colKey)}
								<label
									class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
								>
									<Checkbox checked={isVisible} onchange={() => toggleColumnVisibility(colKey)} />
									<span>{col.label}</span>
								</label>
							{/each}
						</div>
					</Popover>
				{/if}

				{#if showExport}
					<Button
						variant="outline"
						size="xs"
						onclick={() => exportCsv()}
						class="h-9 gap-1.5 text-xs"
					>
						<Icon name="download" size="xs" />
						CSV
					</Button>
					<Button
						variant="outline"
						size="xs"
						onclick={() => exportJson()}
						class="h-9 gap-1.5 text-xs"
					>
						<Icon name="download" size="xs" />
						JSON
					</Button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Bulk Actions Bar -->
	{#if selectable && selected.length > 0 && bulkActions}
		<div
			class="flex items-center justify-between rounded-xl border border-primary-500/30 bg-primary-50/50 px-4 py-2.5 dark:bg-primary-950/30"
		>
			<span class="text-xs font-semibold text-primary-900 dark:text-primary-200">
				{selected.length} row{selected.length > 1 ? 's' : ''} selected
			</span>
			<div class="flex items-center gap-2">
				{@render bulkActions({ selected, clearSelection: () => (selected = []) })}
			</div>
		</div>
	{/if}

	<!-- Table Container -->
	<div
		class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
	>
		<div class="w-full overflow-x-auto">
			<table class="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
				<!-- Head -->
				<thead
					class="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-900 uppercase dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
				>
					<tr>
						{#if selectable}
							<th class="w-10 px-4 py-3 {getPinClass('left')}">
								<Checkbox
									checked={allSelected}
									onchange={(checked) => toggleSelectAll(checked)}
									aria-label="Select all"
								/>
							</th>
						{/if}
						{#each visibleColumns as column}
							{@const colKey = String(column.key)}
							{@const isSorted = sortKey === colKey}
							{@const widthStyle = effectiveWidths[colKey]
								? `width: ${effectiveWidths[colKey]}px; min-width: ${effectiveWidths[colKey]}px;`
								: ''}
							<th
								class="group/th relative px-4 py-3 select-none {getPinClass(
									column.pinned
								)} {column.class || ''}"
								style={widthStyle}
							>
								<div class="flex items-center justify-between gap-1.5">
									{#if column.sortable}
										<button
											type="button"
											class="inline-flex items-center gap-1 font-semibold hover:text-neutral-900 dark:hover:text-white"
											onclick={() => handleSort(colKey)}
										>
											<span>{column.label}</span>
											<Icon
												name={isSorted
													? sortOrder === 'asc'
														? 'arrow-up'
														: 'arrow-down'
													: 'chevrons-up-down'}
												size="xs"
												class={isSorted ? 'text-primary-600 dark:text-primary-400' : 'opacity-40'}
											/>
										</button>
									{:else}
										<span>{column.label}</span>
									{/if}

									{#if column.resizable}
										<button
											type="button"
											class="absolute top-0 right-0 h-full w-1.5 cursor-col-resize opacity-0 transition-opacity group-hover/th:opacity-100 hover:bg-primary-500"
											onmousedown={(e) => startColumnResize(colKey, e)}
											ontouchstart={(e) => startColumnResize(colKey, e)}
											aria-label={`Resize column ${column.label}`}
										></button>
									{/if}
								</div>
							</th>
						{/each}
					</tr>
				</thead>

				<!-- Body -->
				<tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
					{#if loading}
						{#each Array.from({ length: pageSize > 0 ? Math.min(pageSize, 5) : 5 }, (_, i) => i) as rowIndex (rowIndex)}
							<tr>
								{#if selectable}
									<td class="px-4 py-3.5"><Skeleton class="h-4 w-4" /></td>
								{/if}
								{#each visibleColumns as column (column.key)}
									<td class="px-4 py-3.5"><Skeleton class="h-4 w-full" /></td>
								{/each}
							</tr>
						{/each}
					{:else if paginatedData.length === 0}
						<tr>
							<td
								colspan={visibleColumns.length + (selectable ? 1 : 0)}
								class="px-4 py-12 text-center text-neutral-400"
							>
								{#if empty}
									{@render empty()}
								{:else}
									<div class="flex flex-col items-center justify-center space-y-2">
										<Icon name="inbox" size="lg" class="opacity-40" />
										<p class="text-sm font-medium">{emptyText}</p>
									</div>
								{/if}
							</td>
						</tr>
					{:else}
						{#each paginatedData as item, idx (idx)}
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
								{#each visibleColumns as column}
									{@const colKey = String(column.key)}
									{@const widthStyle = effectiveWidths[colKey]
										? `width: ${effectiveWidths[colKey]}px; min-width: ${effectiveWidths[colKey]}px;`
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

		<!-- Pagination Footer Bar -->
		{#if pagination && effectiveTotalCount > 0}
			<div
				class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 bg-neutral-50/50 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800/80 dark:bg-neutral-900/40 dark:text-neutral-400"
			>
				<div class="flex items-center gap-2">
					<span>Rows per page:</span>
					<select
						value={pageSize}
						onchange={(e) => handlePageSizeChange(Number((e.target as HTMLSelectElement).value))}
						class="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
					>
						{#each pageSizeOptions as opt}
							<option value={opt}>{opt}</option>
						{/each}
					</select>
					<span class="ml-2">
						Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, effectiveTotalCount)} of {effectiveTotalCount}
					</span>
				</div>

				<div class="flex items-center gap-1">
					<Button
						variant="ghost"
						size="xs"
						onclick={() => handlePageChange(Math.max(1, page - 1))}
						disabled={page <= 1}
						aria-label="Previous page"
					>
						<Icon name="chevron-left" size="xs" />
					</Button>
					<span class="px-2">Page {page} of {totalPages}</span>
					<Button
						variant="ghost"
						size="xs"
						onclick={() => handlePageChange(Math.min(totalPages, page + 1))}
						disabled={page >= totalPages}
						aria-label="Next page"
					>
						<Icon name="chevron-right" size="xs" />
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
