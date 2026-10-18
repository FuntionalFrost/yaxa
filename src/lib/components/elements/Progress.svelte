<script module lang="ts">
	import { tv, type VariantProps } from '#lib/utils/cn.js';

	export const progressVariants = tv({
		base: 'relative w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800',
		variants: {
			size: {
				xs: 'h-1',
				sm: 'h-1.5',
				md: 'h-2.5',
				lg: 'h-4'
			},
			color: {
				primary: '[&>div]:bg-primary-600',
				success: '[&>div]:bg-emerald-600',
				warning: '[&>div]:bg-amber-600',
				error: '[&>div]:bg-rose-600'
			}
		},
		defaultVariants: {
			size: 'md',
			color: 'primary'
		}
	});

	export type ProgressProps = VariantProps<typeof progressVariants> & {
		value?: number;
		max?: number;
		class?: string;
	};
</script>

<script lang="ts">
	let {
		value,
		max = 100,
		size = 'md',
		color = 'primary',
		class: className = ''
	}: ProgressProps = $props();

	let percentage = $derived.by(() => {
		if (value === undefined) return undefined;
		return Math.min(100, Math.max(0, (value / max) * 100));
	});
</script>

<div
	class={progressVariants({ size, color, class: className })}
	style="--yaxa-progress: {percentage ?? 0}%;"
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
>
	{#if percentage !== undefined}
		<div
			class="yaxa-progress-bar h-full rounded-full transition-[width] duration-300 ease-in-out"
		></div>
	{:else}
		<div class="h-full w-1/3 animate-pulse rounded-full"></div>
	{/if}
</div>

<style>
	.yaxa-progress-bar {
		width: var(--yaxa-progress, 0%);
		will-change: width;
	}
</style>
