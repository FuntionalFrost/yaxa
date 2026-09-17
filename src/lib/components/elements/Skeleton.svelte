<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export const skeletonVariants = tv({
		base: 'relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 select-none',
		variants: {
			variant: {
				pulse: 'animate-pulse',
				shimmer:
					'before:absolute before:inset-0 before:-translate-x-full before:animate-[yaxa-shimmer-slide_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/20',
				none: ''
			},
			shape: {
				rectangle: 'rounded-lg',
				circle: 'rounded-full aspect-square',
				pill: 'rounded-full',
				text: 'rounded h-4 my-1'
			}
		},
		defaultVariants: {
			variant: 'pulse',
			shape: 'rectangle'
		}
	});

	export type SkeletonProps = VariantProps<typeof skeletonVariants> & {
		lines?: number;
		width?: string;
		height?: string;
		class?: string;
	};
</script>

<script lang="ts">
	let {
		variant = 'pulse',
		shape = 'rectangle',
		lines = 1,
		width,
		height,
		class: className = ''
	}: SkeletonProps = $props();

	const lineWidths = ['w-full', 'w-[88%]', 'w-[75%]', 'w-[92%]', 'w-[60%]'];
</script>

{#if lines > 1}
	<div class="space-y-2 {className}" aria-hidden="true">
		{#each { length: lines }, i}
			{@const widthClass = lineWidths[i % lineWidths.length]}
			<div
				class="{skeletonVariants({ variant, shape: 'text' })} {widthClass}"
				style={height ? `height: ${height};` : undefined}
			></div>
		{/each}
	</div>
{:else}
	<div
		class={skeletonVariants({ variant, shape, class: className })}
		style="{width ? `width: ${width};` : ''} {height ? `height: ${height};` : ''}"
		aria-hidden="true"
	></div>
{/if}
