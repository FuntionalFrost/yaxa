<script lang="ts">
	import Button from '../../components/elements/Button.svelte';
	import Badge from '../../components/elements/Badge.svelte';
	import Icon from '../../components/elements/Icon.svelte';
	import Modal from '../../components/overlays/Modal.svelte';
	import Pagination from '../../components/navigation/Pagination.svelte';
	import RecordDrawer from './RecordDrawer.svelte';
	import DevSandbox from './DevSandbox.svelte';
	import type { AdminTableData } from '../types';

	interface Props {
		data: AdminTableData;
		title?: string;
		apiPrefix?: string;
		oncreate?: (data: Record<string, any>) => Promise<void> | void;
		onupdate?: (pk: string | number, data: Record<string, any>) => Promise<void> | void;
		ondelete?: (pk: string | number) => Promise<void> | void;
		onrefresh?: () => Promise<void> | void;
	}

	let {
		data,
		title = 'Yaxa Admin Introspection Suite',
		apiPrefix = '/admin/api',
		oncreate,
		onupdate,
		ondelete,
		onrefresh
	}: Props = $props();

	let activeTab = $state<'tables' | 'sandbox'>('tables');
	let currentTable = $derived(data.currentTable || data.tables[0] || '');
	let searchQuery = $state('');
	let selectedRecord = $state<Record<string, any> | null>(null);
	let isDrawerOpen = $state(false);
	let isCreateModalOpen = $state(false);
	let isCreating = $state(false);
	let newRecordData = $state<Record<string, any>>({});
	let currentPage = $state(1);

	$effect(() => {
		currentPage = data.page || 1;
		searchQuery = data.search || '';
	});

	$effect(() => {
		if (currentPage !== data.page && typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('page', String(currentPage));
			window.location.href = url.toString();
		}
	});

	function inspectRecord(record: Record<string, any>) {
		selectedRecord = record;
		isDrawerOpen = true;
	}

	function switchTable(tableName: string) {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('table', tableName);
			url.searchParams.set('page', '1');
			window.location.href = url.toString();
		}
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('search', searchQuery);
			url.searchParams.set('page', '1');
			window.location.href = url.toString();
		}
	}

	async function handleSaveEditedRecord(updatedData: Record<string, any>) {
		if (onupdate && selectedRecord) {
			await onupdate(selectedRecord[data.primaryKey], updatedData);
			return;
		}

		// Fallback to API endpoint
		const res = await fetch(`${apiPrefix}/record`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				table: currentTable,
				pk: selectedRecord?.[data.primaryKey],
				data: updatedData
			})
		});

		if (res.ok) {
			if (onrefresh) await onrefresh();
			else if (typeof window !== 'undefined') window.location.reload();
		} else {
			const err = await res.json().catch(() => ({}));
			alert(`Update error: ${err.error || 'Failed to save changes'}`);
		}
	}

	async function handleDeleteRecord(pk: string | number) {
		if (ondelete) {
			await ondelete(pk);
			return;
		}

		// Fallback to API endpoint
		const res = await fetch(`${apiPrefix}/record`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				table: currentTable,
				pk
			})
		});

		if (res.ok) {
			if (onrefresh) await onrefresh();
			else if (typeof window !== 'undefined') window.location.reload();
		} else {
			const err = await res.json().catch(() => ({}));
			alert(`Delete error: ${err.error || 'Failed to delete'}`);
		}
	}

	async function handleCreateRecord(e: Event) {
		e.preventDefault();
		isCreating = true;
		try {
			if (oncreate) {
				await oncreate(newRecordData);
				isCreateModalOpen = false;
				newRecordData = {};
				return;
			}

			// Fallback to API endpoint
			const res = await fetch(`${apiPrefix}/record`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					table: currentTable,
					data: newRecordData
				})
			});

			if (res.ok) {
				isCreateModalOpen = false;
				newRecordData = {};
				if (onrefresh) await onrefresh();
				else if (typeof window !== 'undefined') window.location.reload();
			} else {
				const err = await res.json().catch(() => ({}));
				alert(`Create error: ${err.error || 'Failed to create record'}`);
			}
		} finally {
			isCreating = false;
		}
	}
</script>

<div
	class="min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-50"
>
	<!-- Top Navigation Bar -->
	<header
		class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white shadow-xs"
			>
				Y
			</div>
			<div class="flex items-center gap-2">
				<h1 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
				<Badge color="primary" variant="subtle" size="xs">Drizzle Introspect</Badge>
			</div>
		</div>

		<!-- Nav Tabs & Actions -->
		<div class="flex items-center gap-3">
			<div class="flex items-center rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
				<button
					type="button"
					class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors {activeTab ===
					'tables'
						? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'}"
					onclick={() => (activeTab = 'tables')}
				>
					<Icon name="search" class="h-3 w-3" />
					<span>Database Tables</span>
				</button>

				<button
					type="button"
					class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors {activeTab ===
					'sandbox'
						? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'}"
					onclick={() => (activeTab = 'sandbox')}
				>
					<Icon name="sparkles" class="h-3 w-3" />
					<span>Dev Sandbox</span>
				</button>
			</div>

			{#if data.studioUrl}
				<a
					href={data.studioUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
				>
					<Icon name="external-link" class="h-3.5 w-3.5" />
					<span>Drizzle Studio</span>
				</a>
			{/if}
		</div>
	</header>

	<!-- Main Workspace -->
	<main class="mx-auto max-w-7xl p-6">
		{#if activeTab === 'sandbox'}
			<div class="space-y-6">
				<div class="space-y-1">
					<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
						Developer Sandbox & Introspection
					</h2>
					<p class="text-xs text-neutral-500">
						Live testing suite for transactional email templates and S3/R2 direct uploads.
					</p>
				</div>
				<DevSandbox {apiPrefix} />
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-12">
				<!-- Left Sidebar: Tables List -->
				<aside class="space-y-4 md:col-span-3">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-neutral-400 uppercase"
							>Schemas & Models</span
						>
						<Badge size="xs" variant="outline" color="neutral">{data.tables.length} Tables</Badge>
					</div>

					<div class="space-y-1">
						{#each data.tables as table}
							{@const isActive = table === currentTable}
							<button
								type="button"
								class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors {isActive
									? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
									: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100'}"
								onclick={() => switchTable(table)}
							>
								<div class="flex items-center gap-2 truncate">
									<Icon name="copy" class="h-3.5 w-3.5 shrink-0 opacity-60" />
									<span class="truncate">{table}</span>
								</div>
								{#if isActive}
									<span class="h-1.5 w-1.5 rounded-full bg-primary-600"></span>
								{/if}
							</button>
						{/each}
					</div>
				</aside>

				<!-- Right Workspace: Table Data View -->
				<section class="space-y-4 md:col-span-9">
					<!-- Table Toolbar -->
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex items-center gap-3">
							<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
								{currentTable}
							</h2>
							<Badge size="xs" variant="subtle" color="neutral">{data.total} rows</Badge>
						</div>

						<div class="flex items-center gap-2">
							<form onsubmit={handleSearch} class="relative">
								<input
									id="admin-search-input"
									name="adminSearch"
									type="search"
									placeholder="Search records..."
									aria-label="Search records"
									bind:value={searchQuery}
									class="w-48 rounded-lg border border-neutral-300 bg-white py-1.5 pr-3 pl-8 text-xs text-neutral-900 placeholder-neutral-400 transition-all focus:w-60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
								/>
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-neutral-400"
								>
									<Icon name="search" class="h-3.5 w-3.5" />
								</div>
							</form>

							<Button
								variant="solid"
								color="primary"
								size="sm"
								class="gap-1 text-xs"
								onclick={() => (isCreateModalOpen = true)}
							>
								<Icon name="sparkles" class="h-3.5 w-3.5" />
								<span>New Record</span>
							</Button>
						</div>
					</div>

					<!-- Table Records Container -->
					<div
						class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950"
					>
						<div class="overflow-x-auto">
							<table class="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
								<thead
									class="border-b border-neutral-200 bg-neutral-50/80 font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400"
								>
									<tr>
										{#each data.columns as col}
											<th class="px-4 py-3 whitespace-nowrap">
												<div class="flex items-center gap-1.5">
													<span>{col.name}</span>
													{#if col.primaryKey}
														<Badge size="xs" variant="solid" color="primary">PK</Badge>
													{/if}
												</div>
											</th>
										{/each}
										<th class="px-4 py-3 text-right">Actions</th>
									</tr>
								</thead>

								<tbody class="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
									{#if data.records.length === 0}
										<tr>
											<td
												colspan={data.columns.length + 1}
												class="p-12 text-center text-xs text-neutral-500"
											>
												No records found in table <strong>{currentTable}</strong>.
											</td>
										</tr>
									{:else}
										{#each data.records as row}
											<tr
												class="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
												onclick={() => inspectRecord(row)}
											>
												{#each data.columns as col}
													<td class="max-w-[240px] truncate px-4 py-3 font-mono">
														{row[col.name] !== undefined && row[col.name] !== null
															? String(row[col.name])
															: '—'}
													</td>
												{/each}
												<td class="px-4 py-3 text-right" onclick={(e) => e.stopPropagation()}>
													<button
														type="button"
														class="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
														onclick={() => inspectRecord(row)}
														aria-label="Inspect row"
													>
														<Icon name="chevron-right" class="h-3.5 w-3.5" />
													</button>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>

						<!-- Pagination Footer -->
						{#if data.total > data.pageSize}
							<div
								class="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800"
							>
								<span class="text-xs text-neutral-500">
									Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
										data.page * data.pageSize,
										data.total
									)} of {data.total} records
								</span>

								<Pagination bind:page={currentPage} total={data.total} pageSize={data.pageSize} />
							</div>
						{/if}
					</div>
				</section>
			</div>
		{/if}
	</main>

	<!-- Slideover Inspector Drawer -->
	<RecordDrawer
		bind:open={isDrawerOpen}
		record={selectedRecord}
		columns={data.columns}
		primaryKey={data.primaryKey}
		tableName={currentTable}
		onsave={handleSaveEditedRecord}
		ondelete={handleDeleteRecord}
	/>

	<!-- Create Record Modal -->
	<Modal bind:open={isCreateModalOpen} title={`Create New Record in ${currentTable}`}>
		<form onsubmit={handleCreateRecord} class="space-y-4 p-4 text-xs">
			<div class="max-h-[420px] space-y-3 overflow-y-auto pr-1">
				{#each data.columns as col}
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<label
								for={`create-${col.name}`}
								class="font-medium text-neutral-700 dark:text-neutral-300"
							>
								{col.name}
							</label>
							<span class="text-2xs font-mono text-neutral-400">{col.dataType}</span>
						</div>

						{#if col.dataType === 'boolean'}
							<input
								id={`create-${col.name}`}
								name={col.name}
								type="checkbox"
								class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
								checked={Boolean(newRecordData[col.name])}
								onchange={(e) => (newRecordData[col.name] = e.currentTarget.checked)}
							/>
						{:else if col.dataType === 'number' || col.dataType === 'integer'}
							<input
								id={`create-${col.name}`}
								name={col.name}
								type="number"
								placeholder={col.primaryKey ? '(Auto-generated if empty)' : ''}
								class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
								oninput={(e) =>
									(newRecordData[col.name] = e.currentTarget.value
										? Number(e.currentTarget.value)
										: null)}
							/>
						{:else}
							<input
								id={`create-${col.name}`}
								name={col.name}
								type="text"
								placeholder={col.primaryKey ? '(Auto-generated UUID if empty)' : ''}
								class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
								oninput={(e) => (newRecordData[col.name] = e.currentTarget.value)}
							/>
						{/if}
					</div>
				{/each}
			</div>

			<div class="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
				<Button variant="outline" size="sm" onclick={() => (isCreateModalOpen = false)}>
					Cancel
				</Button>
				<Button variant="solid" color="primary" size="sm" loading={isCreating} type="submit">
					Insert Record
				</Button>
			</div>
		</form>
	</Modal>
</div>
