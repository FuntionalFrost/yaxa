<script lang="ts">
	import { page } from '$app/state';
	import { ALL_DOC_ITEMS } from '../_data/docs-nav';
	import Icon from '$lib/components/elements/Icon.svelte';

	let currentPath = $derived(page.url.pathname);
	let currentIndex = $derived(ALL_DOC_ITEMS.findIndex((item) => item.href === currentPath));

	let prevItem = $derived(currentIndex > 0 ? ALL_DOC_ITEMS[currentIndex - 1] : null);
	let nextItem = $derived(
		currentIndex >= 0 && currentIndex < ALL_DOC_ITEMS.length - 1
			? ALL_DOC_ITEMS[currentIndex + 1]
			: null
	);
</script>

{#if prevItem || nextItem}
	<div
		class="mt-12 grid grid-cols-1 gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800"
	>
		<!-- Previous Page Card -->
		{#if prevItem}
			<a
				href={prevItem.href}
				class="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary-500/50 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-primary-400/50"
			>
				<span
					class="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500"
				>
					<Icon
						name="chevron-left"
						class="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
					/>
					Previous
				</span>
				<span
					class="mt-2 text-sm font-semibold text-zinc-900 group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400"
				>
					{prevItem.label}
				</span>
			</a>
		{:else}
			<div></div>
		{/if}

		<!-- Next Page Card -->
		{#if nextItem}
			<a
				href={nextItem.href}
				class="group flex flex-col items-end justify-between rounded-xl border border-zinc-200 bg-white p-4 text-right transition-all hover:border-primary-500/50 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-primary-400/50"
			>
				<span
					class="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500"
				>
					Next
					<Icon
						name="chevron-right"
						class="h-3 w-3 transition-transform group-hover:translate-x-0.5"
					/>
				</span>
				<span
					class="mt-2 text-sm font-semibold text-zinc-900 group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400"
				>
					{nextItem.label}
				</span>
			</a>
		{/if}
	</div>
{/if}
