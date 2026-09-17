<script lang="ts">
	import Slideover from '../../components/overlays/Slideover.svelte';
	import Button from '../../components/elements/Button.svelte';
	import Badge from '../../components/elements/Badge.svelte';
	import Icon from '../../components/elements/Icon.svelte';
	import type { AdminColumnInfo } from '../types';

	interface Props {
		open?: boolean;
		record: Record<string, any> | null;
		columns: AdminColumnInfo[];
		primaryKey: string;
		tableName: string;
		onsave?: (updatedData: Record<string, any>) => Promise<void> | void;
		ondelete?: (pk: string | number) => Promise<void> | void;
	}

	let {
		open = $bindable(false),
		record,
		columns,
		primaryKey,
		tableName,
		onsave,
		ondelete
	}: Props = $props();

	let isSaving = $state(false);
	let isDeleting = $state(false);
	let formData = $state<Record<string, any>>({});
	let viewMode = $state<'form' | 'json'>('form');

	$effect(() => {
		if (record) {
			formData = { ...record };
		}
	});

	async function handleSave() {
		if (!onsave) return;
		isSaving = true;
		try {
			await onsave(formData);
			open = false;
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!ondelete || !record) return;
		const confirmed = window.confirm(
			`Are you sure you want to permanently delete this record (${primaryKey}: ${record[primaryKey]})?`
		);
		if (!confirmed) return;

		isDeleting = true;
		try {
			await ondelete(record[primaryKey]);
			open = false;
		} finally {
			isDeleting = false;
		}
	}
</script>

<Slideover bind:open title={`Inspect Record: ${tableName}`} class="w-full max-w-xl">
	{#if record}
		<div class="flex flex-col gap-5 p-6">
			<!-- Header Summary -->
			<div
				class="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="space-y-0.5">
					<span class="text-xs font-semibold tracking-wider text-neutral-500 uppercase"
						>Primary Key</span
					>
					<div class="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
						{primaryKey}: {record[primaryKey]}
					</div>
				</div>

				<div
					class="flex items-center gap-1.5 rounded-lg bg-neutral-200/60 p-0.5 dark:bg-neutral-800"
				>
					<button
						type="button"
						class="rounded px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'form'
							? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
							: 'text-neutral-500 hover:text-neutral-900'}"
						onclick={() => (viewMode = 'form')}
					>
						Form View
					</button>
					<button
						type="button"
						class="rounded px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'json'
							? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
							: 'text-neutral-500 hover:text-neutral-900'}"
						onclick={() => (viewMode = 'json')}
					>
						Raw JSON
					</button>
				</div>
			</div>

			{#if viewMode === 'json'}
				<div class="relative">
					<pre
						class="max-h-[500px] overflow-x-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-emerald-400">
{JSON.stringify(formData, null, 2)}
					</pre>
				</div>
			{:else}
				<!-- Column Fields Form -->
				<div class="max-h-[520px] space-y-4 overflow-y-auto pr-1">
					{#each columns as col}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label
									for={`field-${col.name}`}
									class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
								>
									{col.name}
								</label>
								<div class="flex items-center gap-1">
									<Badge size="xs" variant="subtle" color="neutral">{col.dataType}</Badge>
									{#if col.primaryKey}
										<Badge size="xs" variant="solid" color="primary">PK</Badge>
									{/if}
									{#if col.notNull}
										<Badge size="xs" variant="outline" color="neutral">Required</Badge>
									{/if}
								</div>
							</div>

							{#if col.dataType === 'boolean'}
								<div class="flex items-center gap-2 pt-1">
									<input
										id={`field-${col.name}`}
										name={col.name}
										type="checkbox"
										class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800"
										checked={Boolean(formData[col.name])}
										onchange={(e) => (formData[col.name] = e.currentTarget.checked)}
									/>
									<span class="text-xs text-neutral-500">
										{formData[col.name] ? 'True' : 'False'}
									</span>
								</div>
							{:else if col.dataType === 'number' || col.dataType === 'integer'}
								<input
									id={`field-${col.name}`}
									name={col.name}
									type="number"
									class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
									disabled={col.primaryKey}
									value={formData[col.name] ?? ''}
									oninput={(e) =>
										(formData[col.name] = e.currentTarget.value
											? Number(e.currentTarget.value)
											: null)}
								/>
							{:else if String(formData[col.name] ?? '').length > 60 || col.name.includes('description') || col.name.includes('body')}
								<textarea
									id={`field-${col.name}`}
									name={col.name}
									rows={3}
									class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-mono text-sm text-xs text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
									disabled={col.primaryKey}
									value={typeof formData[col.name] === 'object'
										? JSON.stringify(formData[col.name])
										: (formData[col.name] ?? '')}
									oninput={(e) => (formData[col.name] = e.currentTarget.value)}></textarea>
							{:else}
								<input
									id={`field-${col.name}`}
									name={col.name}
									type="text"
									class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
									disabled={col.primaryKey}
									value={formData[col.name] !== undefined && formData[col.name] !== null
										? String(formData[col.name])
										: ''}
									oninput={(e) => (formData[col.name] = e.currentTarget.value)}
								/>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Action Footer -->
			<div
				class="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800"
			>
				<Button
					variant="outline"
					color="error"
					size="sm"
					loading={isDeleting}
					onclick={handleDelete}
					class="gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
				>
					<Icon name="cross" class="h-3.5 w-3.5" />
					<span>Delete</span>
				</Button>

				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={() => (open = false)}>Cancel</Button>
					<Button
						variant="solid"
						color="primary"
						size="sm"
						loading={isSaving}
						onclick={handleSave}
						class="gap-1.5"
					>
						<Icon name="check" class="h-3.5 w-3.5" />
						<span>Save Changes</span>
					</Button>
				</div>
			</div>
		</div>
	{/if}
</Slideover>
