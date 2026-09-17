<script lang="ts">
	import Badge from '$lib/components/elements/Badge.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';

	export interface PropItem {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface Props {
		items: PropItem[];
		title?: string;
		description?: string;
	}

	let {
		items,
		title = 'Props & API Reference',
		description = 'Complete TypeScript interface and runtime configuration properties.'
	}: Props = $props();

	let searchQuery = $state('');

	let filteredItems = $derived.by(() => {
		if (!searchQuery.trim()) return items;
		const q = searchQuery.toLowerCase();
		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(q) ||
				item.type.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q) ||
				(item.default && item.default.toLowerCase().includes(q))
		);
	});

	function formatType(typeStr: string) {
		// Split union types by pipe
		const parts = typeStr.split('|').map((p) => p.trim());
		return parts;
	}
</script>

<div class="my-10 space-y-4">
	<!-- Header Bar with Title, Description, Counter Badge & Live Search -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-amber-500 text-white shadow-xs"
				>
					<Icon name="code" class="h-4 w-4" />
				</div>
				<h3
					id="props-and-api-reference"
					class="bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-400"
				>
					{title}
				</h3>
				<span
					class="inline-flex items-center rounded-full border border-primary-200/80 bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:border-primary-800/80 dark:bg-primary-950/60 dark:text-primary-300"
				>
					{items.length} Props
				</span>
			</div>
			{#if description}
				<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
					{description}
				</p>
			{/if}
		</div>

		<!-- Live Search Filter -->
		<div class="relative w-full sm:w-64">
			<div
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"
			>
				<Icon name="search" class="h-3.5 w-3.5" />
			</div>
			<input
				id="props-filter-input"
				name="propsFilter"
				type="text"
				bind:value={searchQuery}
				placeholder="Filter props & types..."
				aria-label="Filter props and types"
				class="w-full rounded-xl border border-neutral-200/90 bg-white py-1.5 pr-3 pl-9 text-xs text-neutral-900 shadow-xs transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary-400"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
					aria-label="Clear prop filter"
				>
					<Icon name="cross" class="h-3 w-3" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Interactive Props Table Container -->
	<div
		class="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80"
	>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr
						class="border-b border-neutral-200/90 bg-linear-to-r from-neutral-50 via-neutral-100/50 to-neutral-50 text-[11px] font-bold tracking-wider text-neutral-600 uppercase dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/70 dark:to-neutral-900 dark:text-neutral-400"
					>
						<th class="py-3 pr-4 pl-5">Property</th>
						<th class="px-4 py-3">Type Definition</th>
						<th class="px-4 py-3">Default</th>
						<th class="py-3 pr-5 pl-4">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
					{#if filteredItems.length === 0}
						<tr>
							<td
								colspan="4"
								class="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400"
							>
								No props match "<span class="font-semibold text-neutral-900 dark:text-white"
									>{searchQuery}</span
								>"
							</td>
						</tr>
					{:else}
						{#each filteredItems as item (item.name)}
							<tr
								class="group transition-all duration-150 hover:bg-linear-to-r hover:from-primary-50/50 hover:via-primary-50/20 hover:to-transparent dark:hover:from-primary-950/30 dark:hover:via-primary-950/10 dark:hover:to-transparent"
							>
								<!-- Prop Name Column -->
								<td class="py-3.5 pr-4 pl-5 align-top">
									<div class="flex items-center gap-2">
										<code
											class="inline-flex items-center rounded-lg border border-primary-200/80 bg-primary-50/90 px-2.5 py-1 font-mono text-[12px] font-bold text-primary-700 shadow-2xs transition-colors group-hover:border-primary-400 group-hover:bg-primary-100 dark:border-primary-900/80 dark:bg-primary-950/80 dark:text-primary-300 dark:group-hover:border-primary-700 dark:group-hover:bg-primary-900/70"
										>
											{item.name}
										</code>
										{#if item.required}
											<Badge color="error" size="xs" variant="solid">Required</Badge>
										{/if}
									</div>
								</td>

								<!-- Type Definition Column (Syntax Colored Pills) -->
								<td class="px-4 py-3.5 align-top">
									<div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
										{#each formatType(item.type) as typePart, idx}
											{#if idx > 0}
												<span class="font-sans font-bold text-neutral-400 dark:text-neutral-600"
													>|</span
												>
											{/if}
											{#if typePart.startsWith("'") || typePart.startsWith('"')}
												<span
													class="inline-flex rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300"
												>
													{typePart}
												</span>
											{:else if typePart === 'boolean'}
												<span
													class="inline-flex rounded-md border border-purple-200/80 bg-purple-50 px-2 py-0.5 font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/60 dark:text-purple-300"
												>
													boolean
												</span>
											{:else if typePart === 'number'}
												<span
													class="inline-flex rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300"
												>
													number
												</span>
											{:else if typePart.includes('Snippet') || typePart.includes('Component')}
												<span
													class="inline-flex rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300"
												>
													{typePart}
												</span>
											{:else}
												<span
													class="inline-flex rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
												>
													{typePart}
												</span>
											{/if}
										{/each}
									</div>
								</td>

								<!-- Default Value Column -->
								<td class="px-4 py-3.5 align-top font-mono text-[11px]">
									{#if item.default && item.default !== "'-'" && item.default !== '-'}
										<span
											class="inline-flex items-center rounded-md border border-neutral-200/80 bg-neutral-50 px-2 py-0.5 font-bold text-neutral-700 shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-300"
										>
											{item.default}
										</span>
									{:else}
										<span class="text-neutral-400 dark:text-neutral-600">—</span>
									{/if}
								</td>

								<!-- Description Column -->
								<td
									class="py-3.5 pr-5 pl-4 align-top font-sans text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
								>
									{item.description}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
