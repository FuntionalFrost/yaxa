<script module lang="ts">
	import { tv, cn, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const switchVariants = tv({
		base: 'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--yaxa-bg)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-neutral-300 dark:data-[state=unchecked]:bg-neutral-700',
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
		base: 'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 motion-reduce:transition-none data-[state=unchecked]:translate-x-0',
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

	export interface SwitchSlots {
		root?: string;
		track?: string;
		thumb?: string;
		label?: string;
		description?: string;
	}

	export type SwitchProps = VariantProps<typeof switchVariants> & {
		id?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		name?: string;
		status?: 'default' | 'error' | 'success';
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
		ui?: SwitchSlots;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Switch } from 'bits-ui';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		checked = $bindable(false),
		size = 'md',
		label,
		description,
		disabled = false,
		name,
		status = 'default',
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = '',
		ui,
		children
	}: SwitchProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || label || fieldCtx?.name || 'Switch'
	);
</script>

<label
	for={effectiveId}
	data-slot="root"
	class={cn(
		'inline-flex items-start gap-3 select-none',
		disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
		className,
		ui?.root
	)}
>
	<Switch.Root
		id={effectiveId}
		bind:checked
		{disabled}
		name={effectiveName}
		aria-label={effectiveAriaLabel}
		aria-invalid={ariaInvalid || undefined}
		aria-describedby={ariaDescribedBy}
		data-slot="track"
		class={cn(switchVariants({ size }), ui?.track)}
	>
		<Switch.Thumb data-slot="thumb" class={cn(thumbVariants({ size }), ui?.thumb)} />
	</Switch.Root>

	{#if label || description || children}
		<div class="text-sm leading-5">
			{#if label}
				<span
					data-slot="label"
					class={cn('font-medium text-neutral-800 dark:text-neutral-200', ui?.label)}
				>
					{label}
				</span>
			{/if}
			{#if children}
				{@render children()}
			{/if}
			{#if description}
				<p
					data-slot="description"
					class={cn('text-sm text-neutral-500 dark:text-neutral-400', ui?.description)}
				>
					{description}
				</p>
			{/if}
		</div>
	{/if}
</label>
