<script module lang="ts">
	import { tv, cn, type VariantProps } from '../../utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { IconSource } from '../elements/Icon.svelte';

	export const inputVariants = tv({
		base: 'w-full rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:border-primary-500 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-950 motion-reduce:transition-none',
		variants: {
			size: {
				xs: 'text-xs py-1 px-2',
				sm: 'text-sm py-1.5 px-3',
				md: 'text-base py-2 px-3.5',
				lg: 'text-base py-2.5 px-4',
				xl: 'text-lg py-3 px-4.5'
			},
			status: {
				default: 'border-neutral-300 dark:border-neutral-700 focus:border-primary-500',
				error:
					'border-rose-500 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus-visible:ring-rose-500/30',
				success: 'border-emerald-500 focus:border-emerald-500 focus-visible:ring-emerald-500/30'
			}
		},
		defaultVariants: {
			size: 'md',
			status: 'default'
		}
	});

	export interface InputSlots {
		root?: string;
		base?: string;
		leading?: string;
		trailing?: string;
		clear?: string;
	}

	export type InputProps = Omit<HTMLInputAttributes, 'size'> &
		VariantProps<typeof inputVariants> & {
			value?: string | number;
			icon?: IconSource;
			trailingIcon?: IconSource;
			loading?: boolean;
			clearable?: boolean;
			prefix?: string;
			suffix?: string;
			class?: string;
			ui?: InputSlots;
			leading?: Snippet;
			trailing?: Snippet;
		};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Spinner from '../elements/Spinner.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		name,
		value = $bindable(''),
		type = 'text',
		size = 'md',
		status = 'default',
		icon,
		trailingIcon,
		loading = false,
		clearable = false,
		prefix,
		suffix,
		disabled = false,
		class: className = '',
		ui,
		leading,
		trailing,
		...restProps
	}: InputProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);

	let paddingLeftClass = $derived.by(() => {
		if (icon || leading) {
			return size === 'xs' || size === 'sm' ? 'pl-8' : 'pl-10';
		}
		if (prefix) return 'pl-12';
		return '';
	});

	let paddingRightClass = $derived.by(() => {
		if (trailingIcon || trailing || loading || (clearable && value)) {
			return size === 'xs' || size === 'sm' ? 'pr-8' : 'pr-10';
		}
		if (suffix) return 'pr-12';
		return '';
	});
</script>

<div data-slot="root" class={cn('relative flex w-full items-center', ui?.root)}>
	{#if leading}
		<div
			data-slot="leading"
			class={cn(
				'pointer-events-none absolute left-3 flex items-center text-neutral-400',
				ui?.leading
			)}
		>
			{@render leading()}
		</div>
	{:else if icon}
		<div
			data-slot="leading"
			class={cn(
				'pointer-events-none absolute left-3 flex items-center text-neutral-400',
				ui?.leading
			)}
		>
			<Icon name={icon} size={size === 'xs' ? 'xs' : 'sm'} />
		</div>
	{:else if prefix}
		<span
			data-slot="leading"
			class={cn(
				'pointer-events-none absolute left-3 text-sm font-medium text-neutral-500',
				ui?.leading
			)}
		>
			{prefix}
		</span>
	{/if}

	<input
		id={effectiveId}
		name={effectiveName}
		{type}
		bind:value
		{disabled}
		aria-invalid={ariaInvalid || undefined}
		aria-describedby={ariaDescribedBy}
		data-slot="base"
		class={cn(
			inputVariants({
				size,
				status: effectiveStatus
			}),
			paddingLeftClass,
			paddingRightClass,
			className,
			ui?.base
		)}
		{...restProps}
	/>

	{#if loading}
		<div
			data-slot="trailing"
			class={cn('absolute right-3 flex items-center text-neutral-400', ui?.trailing)}
		>
			<Spinner size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />
		</div>
	{:else if clearable && value && !disabled}
		<button
			type="button"
			data-slot="clear"
			onclick={() => (value = '')}
			class={cn(
				'absolute right-3 flex items-center rounded-sm text-neutral-400 hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:outline-none dark:hover:text-neutral-200',
				ui?.clear
			)}
			tabindex={-1}
			aria-label="Clear input"
		>
			<Icon name="cross" size="xs" />
		</button>
	{:else if trailing}
		<div
			data-slot="trailing"
			class={cn(
				'pointer-events-none absolute right-3 flex items-center text-neutral-400',
				ui?.trailing
			)}
		>
			{@render trailing()}
		</div>
	{:else if trailingIcon}
		<div
			data-slot="trailing"
			class={cn(
				'pointer-events-none absolute right-3 flex items-center text-neutral-400',
				ui?.trailing
			)}
		>
			<Icon name={trailingIcon} size={size === 'xs' ? 'xs' : 'sm'} />
		</div>
	{:else if suffix}
		<span
			data-slot="trailing"
			class={cn(
				'pointer-events-none absolute right-3 text-sm font-medium text-neutral-500',
				ui?.trailing
			)}
		>
			{suffix}
		</span>
	{/if}
</div>
