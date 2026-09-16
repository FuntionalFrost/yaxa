<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { IconSource } from './Icon.svelte';

	export const emptyStateVariants = tv({
		base: 'flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-white dark:bg-neutral-900/50',
		variants: {
			size: {
				sm: 'py-6 px-4 gap-2',
				md: 'py-10 px-6 gap-3',
				lg: 'py-16 px-8 gap-4'
			},
			bordered: {
				true: 'border border-dashed border-neutral-300 dark:border-neutral-800',
				false: 'border-0'
			}
		},
		defaultVariants: {
			size: 'md',
			bordered: true
		}
	});

	export type EmptyStateProps = VariantProps<typeof emptyStateVariants> & {
		title?: string;
		description?: string;
		icon?: IconSource;
		actions?: Snippet;
		children?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		title,
		description,
		icon = 'sparkles',
		size = 'md',
		bordered = true,
		actions,
		children,
		class: className = ''
	}: EmptyStateProps = $props();
</script>

<div class={emptyStateVariants({ size, bordered, class: className })}>
	{#if icon}
		<div
			class="flex items-center justify-center rounded-2xl bg-neutral-100 p-4 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 {size ===
			'sm'
				? 'h-10 w-10 p-2'
				: size === 'lg'
					? 'h-16 w-16 p-5'
					: 'h-12 w-12 p-3'}"
		>
			<Icon name={icon} size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} />
		</div>
	{/if}

	{#if title}
		<h3
			class="font-bold text-neutral-900 dark:text-white {size === 'sm'
				? 'text-sm'
				: size === 'lg'
					? 'text-xl'
					: 'text-base'}"
		>
			{title}
		</h3>
	{/if}

	{#if description}
		<p
			class="max-w-md text-neutral-500 dark:text-neutral-400 {size === 'sm'
				? 'text-xs'
				: size === 'lg'
					? 'text-base'
					: 'text-sm'}"
		>
			{description}
		</p>
	{/if}

	{#if children}
		<div class="mt-1">
			{@render children()}
		</div>
	{/if}

	{#if actions}
		<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
			{@render actions()}
		</div>
	{/if}
</div>
