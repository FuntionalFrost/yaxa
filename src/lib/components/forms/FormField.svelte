<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getFormContext, setFormFieldContext } from './form-context';

	interface Props {
		id?: string;
		name?: string;
		label?: string;
		description?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		showTainted?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		id,
		name,
		label,
		description,
		error,
		hint,
		required = false,
		showTainted = false,
		class: className = '',
		children
	}: Props = $props();

	const formContext = getFormContext();

	// Auto-generate stable ids
	const generatedId = $derived(id || (name ? `yaxa-field-${name}` : undefined));
	const descriptionId = $derived(description && generatedId ? `${generatedId}-desc` : undefined);
	const errorId = $derived(generatedId ? `${generatedId}-err` : undefined);

	// Context lookups
	let contextError = $derived(
		name && formContext?.getFieldError ? formContext.getFieldError(name) : undefined
	);
	let effectiveError = $derived(error ?? contextError);

	let contextConstraint = $derived(
		name && formContext?.getFieldConstraint ? formContext.getFieldConstraint(name) : undefined
	);
	let effectiveRequired = $derived(required || Boolean(contextConstraint?.required));

	let isTainted = $derived(
		name && formContext?.isFieldTainted ? formContext.isFieldTainted(name) : false
	);

	let fieldStatus = $derived<'default' | 'error' | 'success'>(effectiveError ? 'error' : 'default');

	setFormFieldContext({
		get id() {
			return generatedId;
		},
		get name() {
			return name;
		},
		get required() {
			return effectiveRequired;
		},
		get error() {
			return effectiveError;
		},
		get status() {
			return fieldStatus;
		},
		get descriptionId() {
			return descriptionId;
		},
		get errorId() {
			return errorId;
		}
	});
</script>

<div class="space-y-1.5 {className}">
	{#if label || hint || (showTainted && isTainted)}
		<div class="flex items-center justify-between">
			{#if label}
				<label
					for={generatedId}
					class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
				>
					{label}
					{#if effectiveRequired}
						<span class="ml-0.5 text-rose-500">*</span>
					{/if}
				</label>
			{/if}

			<div class="flex items-center gap-2">
				{#if showTainted && isTainted}
					<span
						class="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
					>
						modified
					</span>
				{/if}
				{#if hint}
					<span class="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>
				{/if}
			</div>
		</div>
	{/if}

	{#if description}
		<p id={descriptionId} class="text-xs text-neutral-500 dark:text-neutral-400">
			{description}
		</p>
	{/if}

	{#if children}
		{@render children()}
	{/if}

	{#if effectiveError}
		<p id={errorId} class="text-xs font-medium text-rose-600 dark:text-rose-400">
			{effectiveError}
		</p>
	{/if}
</div>
