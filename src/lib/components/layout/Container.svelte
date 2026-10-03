<script module lang="ts">
	import { tv, type VariantProps } from '../../utils/cn.js';
	import type { Snippet } from 'svelte';

	export const containerVariants = tv({
		base: 'mx-auto px-4 sm:px-6 lg:px-8 w-full',
		variants: {
			size: {
				sm: 'max-w-3xl',
				md: 'max-w-5xl',
				lg: 'max-w-7xl',
				xl: 'max-w-(--breakpoint-xl)',
				'2xl': 'max-w-(--breakpoint-2xl)',
				full: 'max-w-full'
			}
		},
		defaultVariants: {
			size: 'lg'
		}
	});

	export type ContainerProps = VariantProps<typeof containerVariants> & {
		class?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { size = 'lg', class: className = '', children }: ContainerProps = $props();
</script>

<div class={containerVariants({ size, class: className })}>
	{#if children}
		{@render children()}
	{/if}
</div>
