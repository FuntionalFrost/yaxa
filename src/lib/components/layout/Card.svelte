<script module lang="ts">
	import { tv, type VariantProps } from '../../utils/cn.js';
	import type { Snippet } from 'svelte';

	export const cardVariants = tv({
		base: 'rounded-xl transition-all duration-200 overflow-hidden',
		variants: {
			variant: {
				outline:
					'border border-neutral-200 bg-white/80 backdrop-blur-xs shadow-xs dark:border-neutral-800 dark:bg-neutral-900/80',
				solid: 'bg-white shadow-md dark:bg-neutral-900',
				soft: 'bg-neutral-50 dark:bg-neutral-900/50',
				subtle:
					'border border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-900/40'
			},
			hover: {
				true: 'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-0.5'
			},
			padding: {
				none: '',
				sm: 'p-4',
				md: 'p-6',
				lg: 'p-8'
			}
		},
		defaultVariants: {
			variant: 'outline',
			hover: false,
			padding: 'md'
		}
	});

	export type CardProps = VariantProps<typeof cardVariants> & {
		id?: string;
		class?: string;
		headerClass?: string;
		bodyClass?: string;
		footerClass?: string;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		id,
		variant = 'outline',
		hover = false,
		padding = 'md',
		class: className = '',
		headerClass = '',
		bodyClass = '',
		footerClass = '',
		header,
		footer,
		children
	}: CardProps = $props();
</script>

<div {id} class={cardVariants({ variant, hover, class: className })}>
	{#if header}
		<div class="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 {headerClass}">
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div
			class="{padding === 'none'
				? ''
				: padding === 'sm'
					? 'p-4'
					: padding === 'lg'
						? 'p-8'
						: 'p-6'} {bodyClass}"
		>
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div
			class="border-t border-neutral-200 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50 {footerClass}"
		>
			{@render footer()}
		</div>
	{/if}
</div>
