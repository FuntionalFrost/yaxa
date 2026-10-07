<script module lang="ts">
	export interface CheckboxSlots {
		root?: string;
		box?: string;
		label?: string;
		description?: string;
	}

	export interface CheckboxProps {
		id?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		name?: string;
		value?: string;
		status?: 'default' | 'error' | 'success';
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
		ui?: CheckboxSlots;
		onchange?: (checked: boolean) => void;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';
	import { cn } from '../../utils/cn';

	let {
		id,
		checked = $bindable(false),
		label,
		description,
		disabled = false,
		name,
		value,
		status = 'default',
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = '',
		ui,
		onchange,
		children
	}: CheckboxProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || label || fieldCtx?.name || 'Checkbox'
	);
</script>

<label
	for={effectiveId}
	data-slot="root"
	class={cn(
		'relative flex items-start gap-3 select-none',
		disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
		className,
		ui?.root
	)}
>
	<div class="flex h-5 items-center">
		<input
			id={effectiveId}
			type="checkbox"
			bind:checked
			aria-label={effectiveAriaLabel}
			aria-invalid={ariaInvalid || undefined}
			aria-describedby={ariaDescribedBy}
			onchange={(e) => {
				const isChecked = (e.currentTarget as HTMLInputElement).checked;
				if (onchange) onchange(isChecked);
			}}
			{disabled}
			name={effectiveName}
			{value}
			class="peer sr-only"
		/>
		<div
			data-slot="box"
			class={cn(
				'flex h-4.5 w-4.5 items-center justify-center rounded border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--yaxa-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--yaxa-bg)] peer-focus-visible:outline-none motion-reduce:transition-none',
				checked
					? effectiveStatus === 'error'
						? 'border-rose-600 bg-rose-600 text-white shadow-xs'
						: effectiveStatus === 'success'
							? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
							: 'border-primary-600 bg-primary-600 text-white shadow-xs'
					: effectiveStatus === 'error'
						? 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30'
						: 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900',
				ui?.box
			)}
		>
			{#if checked}
				<Icon name="check" size="xs" />
			{/if}
		</div>
	</div>

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
