<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export interface FAQItem {
		id: string | number;
		question: string;
		answer: string;
		category?: string;
	}

	export const faqVariants = tv({
		base: 'w-full py-12 max-w-3xl mx-auto'
	});

	export type FAQProps = VariantProps<typeof faqVariants> & {
		title?: string;
		description?: string;
		badge?: string;
		items?: FAQItem[];
		categories?: string[];
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import { smoothSlide } from '../../motion/transitions';

	let {
		title = 'Frequently Asked Questions',
		description = 'Everything you need to know about licensing, deployment, and tech stack.',
		badge = 'FAQ',
		items = [],
		categories = [],
		class: className = ''
	}: FAQProps = $props();

	let selectedCategory = $state('all');
	let openIds = $state<Array<string | number>>([]);

	let availableCategories = $derived(
		categories.length > 0
			? ['all', ...categories]
			: ['all', ...new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))]
	);

	let filteredItems = $derived(
		selectedCategory === 'all' ? items : items.filter((item) => item.category === selectedCategory)
	);

	function toggleItem(id: string | number) {
		if (openIds.includes(id)) {
			openIds = openIds.filter((i) => i !== id);
		} else {
			openIds = [...openIds, id];
		}
	}
</script>

<section class={faqVariants({ class: className })}>
	{#if title || description || badge}
		<div class="mb-10 space-y-3 text-center">
			{#if badge}
				<div class="inline-flex">
					<Badge variant="subtle" color="primary" size="sm">
						{badge}
					</Badge>
				</div>
			{/if}

			{#if title}
				<h2
					class="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
				>
					{title}
				</h2>
			{/if}

			{#if description}
				<p class="mx-auto max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
					{description}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Category Filter Tabs -->
	{#if availableCategories.length > 2}
		<div class="mb-8 flex flex-wrap items-center justify-center gap-2">
			{#each availableCategories as cat}
				<button
					type="button"
					onclick={() => (selectedCategory = cat)}
					class="rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors {selectedCategory ===
					cat
						? 'bg-primary-600 text-white shadow-xs'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
				>
					{cat}
				</button>
			{/each}
		</div>
	{/if}

	<!-- FAQ Accordion List -->
	<div
		class="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40"
	>
		{#each filteredItems as item (item.id)}
			{@const isOpen = openIds.includes(item.id)}

			<div class="overflow-hidden">
				<button
					type="button"
					onclick={() => toggleItem(item.id)}
					aria-expanded={isOpen}
					class="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-800/40"
				>
					<span>{item.question}</span>
					<Icon
						name="chevron-down"
						size="sm"
						class="ml-4 shrink-0 text-neutral-400 transition-transform duration-250 ease-out {isOpen
							? 'rotate-180 text-primary-600 dark:text-primary-400'
							: ''}"
					/>
				</button>

				{#if isOpen}
					<div
						transition:smoothSlide={{ duration: 220 }}
						class="border-t border-neutral-100/60 px-5 pt-3 pb-5 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800/60 dark:text-neutral-400"
					>
						{item.answer}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
