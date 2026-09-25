<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	interface Props {
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
		onchange?: (checked: boolean) => void;
		children?: Snippet;
	}

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
		onchange,
		children
	}: Props = $props();

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
	class="relative flex items-start gap-3 select-none {disabled
		? 'cursor-not-allowed opacity-60'
		: 'cursor-pointer'} {className}"
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
			class="sr-only"
		/>
		<div
			class="flex h-4.5 w-4.5 items-center justify-center rounded border transition-all duration-150 {checked
				? effectiveStatus === 'error'
					? 'border-rose-600 bg-rose-600 text-white shadow-xs'
					: effectiveStatus === 'success'
						? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
						: 'border-primary-600 bg-primary-600 text-white shadow-xs'
				: effectiveStatus === 'error'
					? 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30'
					: 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900'}"
		>
			{#if checked}
				<Icon name="check" size="xs" />
			{/if}
		</div>
	</div>

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
