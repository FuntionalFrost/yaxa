<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	export const textareaVariants = tv({
		base: 'w-full rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
		variants: {
			size: {
				sm: 'text-sm p-2.5',
				md: 'text-base p-3',
				lg: 'text-base p-4'
			},
			status: {
				default:
					'border-neutral-300 dark:border-neutral-700 focus:border-primary-500 focus:ring-primary-500/20',
				error:
					'border-rose-500 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-rose-500/20',
				success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
			},
			resize: {
				none: 'resize-none',
				vertical: 'resize-y',
				horizontal: 'resize-x',
				both: 'resize'
			}
		},
		defaultVariants: {
			size: 'md',
			status: 'default',
			resize: 'vertical'
		}
	});

	export type TextareaProps = Omit<HTMLTextareaAttributes, 'size'> &
		VariantProps<typeof textareaVariants> & {
			value?: string;
			rows?: number;
			maxlength?: number;
			maxHeight?: number;
			showCount?: boolean;
			autosize?: boolean;
			class?: string;
		};
</script>

<script lang="ts">
	import { autosize as autosizeAction } from '$lib/actions/autosize';

	let {
		value = $bindable(''),
		rows = 4,
		maxlength,
		maxHeight,
		showCount = false,
		autosize = false,
		size = 'md',
		status = 'default',
		resize = 'vertical',
		class: className = '',
		...restProps
	}: TextareaProps = $props();

	let charCount = $derived(value ? value.length : 0);
</script>

<div class="relative w-full">
	{#if autosize}
		<textarea
			bind:value
			rows={1}
			{maxlength}
			use:autosizeAction={{ maxHeight }}
			class={textareaVariants({
				size,
				status,
				resize: 'none',
				class: className
			})}
			{...restProps}></textarea>
	{:else}
		<textarea
			bind:value
			{rows}
			{maxlength}
			class={textareaVariants({
				size,
				status,
				resize,
				class: className
			})}
			{...restProps}></textarea>
	{/if}

	{#if showCount && maxlength}
		<div class="mt-1 flex justify-end text-sm text-neutral-500 dark:text-neutral-400">
			{charCount} / {maxlength}
		</div>
	{/if}
</div>
