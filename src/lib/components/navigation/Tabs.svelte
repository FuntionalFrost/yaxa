<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface TabItem {
		value: string;
		label: string;
		icon?: IconSource;
		disabled?: boolean;
		badge?: string;
	}

	export interface TabsSlots {
		root?: string;
		list?: string;
		tab?: string;
		indicator?: string;
		panel?: string;
		badge?: string;
	}

	export interface TabsProps {
		items: TabItem[];
		value?: string;
		variant?: 'pill' | 'underline' | 'segmented';
		class?: string;
		ui?: TabsSlots;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../elements/Icon.svelte';
	import { cn } from '../../utils/cn';

	let {
		items,
		value = $bindable(items[0]?.value || ''),
		variant = 'segmented',
		class: className = '',
		ui,
		children
	}: TabsProps = $props();

	let listElement = $state<HTMLElement | null>(null);
	let indicatorLeft = $state(0);
	let indicatorWidth = $state(0);
	let isMounted = $state(false);

	function updateIndicator() {
		if (!listElement || variant !== 'segmented') return;
		const activeBtn = listElement.querySelector<HTMLElement>('button[data-active="true"]');
		if (activeBtn) {
			const listRect = listElement.getBoundingClientRect();
			const btnRect = activeBtn.getBoundingClientRect();
			indicatorLeft = btnRect.left - listRect.left;
			indicatorWidth = btnRect.width;
			isMounted = true;
		}
	}

	$effect(() => {
		if (value && variant === 'segmented') {
			queueMicrotask(() => updateIndicator());
		}
	});

	$effect(() => {
		if (listElement && variant === 'segmented') {
			const ro = new ResizeObserver(() => updateIndicator());
			ro.observe(listElement);
			return () => ro.disconnect();
		}
	});
</script>

<div data-slot="root" class={cn('w-full', className, ui?.root)}>
	<div
		bind:this={listElement}
		data-slot="list"
		class={cn(
			'relative flex',
			variant === 'segmented' &&
				'rounded-xl border border-neutral-200/60 bg-neutral-100 p-1 dark:border-neutral-800/60 dark:bg-neutral-900',
			variant === 'underline' && 'gap-6 border-b border-neutral-200 dark:border-neutral-800',
			variant === 'pill' && 'gap-2',
			ui?.list
		)}
		role="tablist"
	>
		{#if variant === 'segmented' && isMounted}
			<div
				data-slot="indicator"
				class={cn(
					'pointer-events-none absolute top-1 bottom-1 rounded-lg bg-white shadow-xs yaxa-surface-elevated transition-all duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-800',
					ui?.indicator
				)}
				style="left: {indicatorLeft}px; width: {indicatorWidth}px;"
				aria-hidden="true"
			></div>
		{/if}

		{#each items as tab (tab.value)}
			{@const isSelected = value === tab.value}
			<button
				type="button"
				role="tab"
				data-slot="tab"
				data-active={isSelected ? 'true' : undefined}
				aria-selected={isSelected}
				disabled={tab.disabled}
				onclick={() => (value = tab.value)}
				class={cn(
					'relative z-10 inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 select-none focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:outline-none motion-reduce:transition-none',
					tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
					variant === 'segmented' && [
						'rounded-lg px-3 py-1.5',
						isSelected
							? isMounted
								? 'text-neutral-900 dark:text-white'
								: 'bg-white text-neutral-900 shadow-xs yaxa-surface-elevated dark:bg-neutral-800 dark:text-white'
							: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
					],
					variant === 'underline' && [
						'-mb-px border-b-2 pt-1 pb-3',
						isSelected
							? 'border-primary-600 font-semibold text-primary-600 dark:text-primary-400'
							: 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
					],
					variant === 'pill' && [
						'rounded-lg px-3 py-1.5',
						isSelected
							? 'bg-primary-600 text-white shadow-xs'
							: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
					],
					ui?.tab
				)}
			>
				{#if tab.icon}
					<Icon name={tab.icon} size="xs" />
				{/if}
				<span>{tab.label}</span>
				{#if tab.badge}
					<span
						data-slot="badge"
						class={cn(
							'rounded px-1.5 py-0.5 text-[10px] font-semibold',
							isSelected
								? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
								: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
							ui?.badge
						)}
					>
						{tab.badge}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if children}
		<div data-slot="panel" class={cn('mt-4', ui?.panel)}>
			{@render children()}
		</div>
	{/if}
</div>
