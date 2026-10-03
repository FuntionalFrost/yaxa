<script module lang="ts">
	import { tv, type VariantProps } from '#lib/utils/cn.js';
	import type { Snippet } from 'svelte';

	export const kbdVariants = tv({
		base: 'inline-flex items-center justify-center font-mono font-medium rounded border border-neutral-300 bg-neutral-100 text-neutral-700 shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 select-none',
		variants: {
			size: {
				xs: 'h-4 min-w-[16px] px-1 text-[10px]',
				sm: 'h-5 min-w-[20px] px-1.5 text-xs',
				md: 'h-6 min-w-[24px] px-2 text-xs',
				lg: 'h-7 min-w-[28px] px-2.5 text-sm'
			}
		},
		defaultVariants: {
			size: 'sm'
		}
	});

	export type KbdProps = VariantProps<typeof kbdVariants> & {
		value?: string;
		class?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { value, size = 'sm', class: className = '', children }: KbdProps = $props();
</script>

<kbd class={kbdVariants({ size, class: className })}>
	{#if value}
		{value}
	{:else if children}
		{@render children()}
	{/if}
</kbd>
