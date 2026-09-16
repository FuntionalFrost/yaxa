<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const virtualListVariants = tv({
		base: 'relative w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
		variants: {
			bordered: {
				true: 'border border-neutral-200 dark:border-neutral-800',
				false: 'border-0'
			}
		},
		defaultVariants: {
			bordered: true
		}
	});

	export type VirtualListProps<T> = VariantProps<typeof virtualListVariants> & {
		items: T[];
		itemHeight?: number;
		height?: number | string;
		overscan?: number;
		emptyText?: string;
		item?: Snippet<[T, number]>;
		empty?: Snippet;
		class?: string;
	};
</script>

<script lang="ts" generics="T">
	let {
		items = [],
		itemHeight = 48,
		height = 400,
		overscan = 4,
		emptyText = 'No items found',
		item,
		empty,
		bordered = true,
		class: className = ''
	}: VirtualListProps<T> = $props();

	let scrollTop = $state(0);
	let measuredHeight = $state<number | null>(null);

	const viewportHeight = $derived(measuredHeight ?? (typeof height === 'number' ? height : 400));

	const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);

	const totalHeight = $derived(items.length * itemHeight);

	const startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));

	const visibleCount = $derived(Math.ceil(viewportHeight / itemHeight) + 2 * overscan);

	const endIndex = $derived(Math.min(items.length, startIndex + visibleCount));

	const visibleItems = $derived(
		items.slice(startIndex, endIndex).map((data, i) => ({
			data,
			index: startIndex + i,
			top: (startIndex + i) * itemHeight
		}))
	);

	function onScroll(e: Event) {
		const target = e.currentTarget as HTMLElement;
		scrollTop = target.scrollTop;
		if (target.clientHeight > 0) {
			measuredHeight = target.clientHeight;
		}
	}
</script>

<div
	class={virtualListVariants({ bordered, class: className })}
	style="height: {heightStyle};"
	onscroll={onScroll}
	role="feed"
	aria-busy={false}
>
	{#if items.length === 0}
		<div
			class="flex h-full min-h-32 items-center justify-center p-6 text-sm text-neutral-500 dark:text-neutral-400"
		>
			{#if empty}
				{@render empty()}
			{:else}
				<p>{emptyText}</p>
			{/if}
		</div>
	{:else}
		<!-- Total virtual space height holder -->
		<div class="relative w-full" style="height: {totalHeight}px;">
			{#each visibleItems as { data, index, top } (index)}
				<div class="absolute right-0 left-0 w-full" style="top: {top}px; height: {itemHeight}px;">
					{#if item}
						{@render item(data, index)}
					{:else}
						<div
							class="flex h-full items-center border-b border-neutral-100 px-4 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
						>
							{String(data)}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
