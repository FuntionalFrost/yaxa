<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from '../elements/Icon.svelte';

	export interface SelectOption {
		value: string;
		label: string;
		icon?: IconSource;
		disabled?: boolean;
	}

	export const selectVariants = tv({
		base: 'w-full rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
		variants: {
			size: {
				sm: 'text-sm py-1.5 pl-3 pr-8',
				md: 'text-base py-2 pl-3.5 pr-10',
				lg: 'text-base py-2.5 pl-4 pr-10'
			},
			status: {
				default:
					'border-neutral-300 dark:border-neutral-700 focus:border-primary-500 focus:ring-primary-500/20',
				error:
					'border-rose-500 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-rose-500/20',
				success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
			}
		},
		defaultVariants: {
			size: 'md',
			status: 'default'
		}
	});

	export type SelectProps = VariantProps<typeof selectVariants> & {
		id?: string;
		value?: string;
		options?: SelectOption[];
		placeholder?: string;
		icon?: IconSource;
		disabled?: boolean;
		name?: string;
		label?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
		[key: string]: any;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		value = $bindable(''),
		options = [],
		placeholder = 'Select an option...',
		icon,
		disabled = false,
		name,
		label,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		size = 'md',
		status = 'default',
		class: className = '',
		...restProps
	}: SelectProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);

	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || label || fieldCtx?.name || 'Select'
	);
</script>

<div class="relative w-full">
	{#if icon}
		<div
			class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"
		>
			<Icon name={icon} size={size === 'sm' ? 'xs' : 'sm'} />
		</div>
	{/if}

	<select
		id={effectiveId}
		name={effectiveName}
		bind:value
		{disabled}
		aria-label={effectiveAriaLabel}
		aria-invalid={ariaInvalid || undefined}
		aria-describedby={ariaDescribedBy}
		class={selectVariants({
			size,
			status: effectiveStatus,
			class: `${icon ? 'pl-9' : ''} ${className}`
		})}
		{...restProps}
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>{placeholder}</option>
		{/if}
		{#each options as opt}
			<option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
		{/each}
	</select>

	<div
		class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400"
	>
		<Icon name="chevron-down" size={size === 'sm' ? 'xs' : 'sm'} />
	</div>
</div>
