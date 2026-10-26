<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface PaginationProps {
		page?: number;
		total: number;
		pageSize?: number;
		siblingCount?: number;
		prevIcon?: IconSource;
		nextIcon?: IconSource;
		class?: string;
	}
</script>

<script lang="ts">
	import Button from '../elements/Button.svelte';
	import Icon from '../elements/Icon.svelte';

	let {
		page = $bindable(1),
		total,
		pageSize = 10,
		siblingCount = 1,
		prevIcon = 'chevron-left',
		nextIcon = 'chevron-right',
		class: className = ''
	}: PaginationProps = $props();

	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	let paginationRange = $derived.by(() => {
		const range: (number | string)[] = [];
		const totalNumbers = siblingCount * 2 + 3;
		const totalBlocks = totalNumbers + 2;

		if (totalPages <= totalBlocks) {
			for (let i = 1; i <= totalPages; i++) range.push(i);
			return range;
		}

		const leftSiblingIndex = Math.max(page - siblingCount, 1);
		const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

		const shouldShowLeftDots = leftSiblingIndex > 2;
		const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

		if (!shouldShowLeftDots && shouldShowRightDots) {
			const leftItemCount = 3 + 2 * siblingCount;
			for (let i = 1; i <= leftItemCount; i++) range.push(i);
			range.push('...');
			range.push(totalPages);
		} else if (shouldShowLeftDots && !shouldShowRightDots) {
			const rightItemCount = 3 + 2 * siblingCount;
			range.push(1);
			range.push('...');
			for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) range.push(i);
		} else if (shouldShowLeftDots && shouldShowRightDots) {
			range.push(1);
			range.push('...');
			for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) range.push(i);
			range.push('...');
			range.push(totalPages);
		}

		return range;
	});
</script>

<nav aria-label="Pagination" class="flex flex-wrap items-center justify-center gap-1 {className}">
	<!-- Previous -->
	<Button
		variant="outline"
		color="neutral"
		size="sm"
		square
		disabled={page <= 1}
		onclick={() => (page = Math.max(1, page - 1))}
		aria-label="Previous page"
	>
		<Icon name={prevIcon} size="xs" />
	</Button>

	<!-- Page Numbers -->
	{#each paginationRange as p}
		{#if typeof p === 'number'}
			<Button
				variant={page === p ? 'solid' : 'ghost'}
				color={page === p ? 'primary' : 'neutral'}
				size="sm"
				square
				onclick={() => (page = p)}
				aria-label="Page {p}"
				aria-current={page === p ? 'page' : undefined}
			>
				{p}
			</Button>
		{:else}
			<span class="px-2 text-xs text-neutral-400 select-none">...</span>
		{/if}
	{/each}

	<!-- Next -->
	<Button
		variant="outline"
		color="neutral"
		size="sm"
		square
		disabled={page >= totalPages}
		onclick={() => (page = Math.min(totalPages, page + 1))}
		aria-label="Next page"
	>
		<Icon name={nextIcon} size="xs" />
	</Button>
</nav>
