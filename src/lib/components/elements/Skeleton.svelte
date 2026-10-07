<script module lang="ts">
	import { tv, cn, type VariantProps } from '$lib/utils/cn';

	export const skeletonVariants = tv({
		base: 'relative overflow-hidden bg-neutral-200 select-none motion-reduce:animate-none dark:bg-neutral-800',
		variants: {
			variant: {
				pulse: 'animate-pulse',
				shimmer:
					'before:absolute before:inset-0 before:-translate-x-full before:animate-[yaxa-shimmer-slide_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent motion-reduce:before:animate-none dark:before:via-white/20',
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

	export type SkeletonRecipe = 'card' | 'user' | 'table-row' | 'metric';

	export type SkeletonProps = VariantProps<typeof skeletonVariants> & {
		recipe?: SkeletonRecipe;
		lines?: number;
		width?: string;
		height?: string;
		class?: string;
	};
</script>

<script lang="ts">
	let {
		recipe,
		variant = 'pulse',
		shape = 'rectangle',
		lines = 1,
		width,
		height,
		class: className = ''
	}: SkeletonProps = $props();

	const lineWidths = ['w-full', 'w-[88%]', 'w-[75%]', 'w-[92%]', 'w-[60%]'];
</script>

{#if recipe === 'card'}
	<div
		class={cn(
			'space-y-4 rounded-xl border border-neutral-200/80 p-5 dark:border-neutral-800/80',
			className
		)}
		aria-hidden="true"
	>
		<div class="flex items-center gap-3">
			<div
				class={skeletonVariants({ variant, shape: 'circle', class: 'h-10 w-10 shrink-0' })}
			></div>
			<div class="flex-1 space-y-1.5">
				<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3.5 w-1/3' })}></div>
				<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-2.5 w-1/4' })}></div>
			</div>
		</div>
		<div class="space-y-2 pt-2">
			<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3 w-full' })}></div>
			<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3 w-5/6' })}></div>
			<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3 w-2/3' })}></div>
		</div>
	</div>
{:else if recipe === 'user'}
	<div class={cn('flex items-center gap-3', className)} aria-hidden="true">
		<div class={skeletonVariants({ variant, shape: 'circle', class: 'h-9 w-9 shrink-0' })}></div>
		<div class="flex-1 space-y-1.5">
			<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3.5 w-32' })}></div>
			<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-2.5 w-24' })}></div>
		</div>
	</div>
{:else if recipe === 'metric'}
	<div
		class={cn(
			'space-y-2 rounded-xl border border-neutral-200/80 p-4 dark:border-neutral-800/80',
			className
		)}
		aria-hidden="true"
	>
		<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3 w-24' })}></div>
		<div
			class={skeletonVariants({
				variant,
				shape: 'rectangle',
				class: 'h-8 w-36 rounded-md'
			})}
		></div>
		<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-2.5 w-20' })}></div>
	</div>
{:else if recipe === 'table-row'}
	<div
		class={cn(
			'flex items-center gap-4 border-b border-neutral-200/60 py-3 dark:border-neutral-800/60',
			className
		)}
		aria-hidden="true"
	>
		<div
			class={skeletonVariants({
				variant,
				shape: 'rectangle',
				class: 'h-4 w-4 rounded'
			})}
		></div>
		<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3.5 w-1/4' })}></div>
		<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3.5 w-1/3' })}></div>
		<div class={skeletonVariants({ variant, shape: 'text', class: 'my-0 h-3.5 w-1/5' })}></div>
		<div class={skeletonVariants({ variant, shape: 'pill', class: 'h-5 w-16' })}></div>
	</div>
{:else if lines > 1}
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
