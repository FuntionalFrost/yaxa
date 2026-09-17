<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const switchVariants = tv({
		base: 'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-neutral-300 dark:data-[state=unchecked]:bg-neutral-700',
		variants: {
			size: {
				sm: 'h-5 w-9',
				md: 'h-6 w-11',
				lg: 'h-7 w-14'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export const thumbVariants = tv({
		base: 'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0',
		variants: {
			size: {
				sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
				md: 'h-5 w-5 data-[state=checked]:translate-x-5',
				lg: 'h-6 w-6 data-[state=checked]:translate-x-7'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export type SwitchProps = VariantProps<typeof switchVariants> & {
		id?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		name?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Switch } from 'bits-ui';

	let {
		id,
		checked = $bindable(false),
		size = 'md',
		label,
		description,
		disabled = false,
		name,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = '',
		children
	}: SwitchProps = $props();
</script>

<label
	class="inline-flex items-start gap-3 select-none {disabled
		? 'cursor-not-allowed opacity-60'
		: 'cursor-pointer'} {className}"
>
	<Switch.Root
		id={id || name}
		bind:checked
		{disabled}
		{name}
		aria-label={ariaLabelAttr || ariaLabel || label}
		class={switchVariants({ size })}
	>
		<Switch.Thumb class={thumbVariants({ size })} />
	</Switch.Root>

	{#if label || description || children}
		<div class="text-sm leading-5">
			{#if label}
				<span class="font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
			{/if}
			{#if children}
				{@render children()}
			{/if}
			{#if description}
				<p class="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
			{/if}
		</div>
	{/if}
</label>
