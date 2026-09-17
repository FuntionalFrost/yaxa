<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../elements/Icon.svelte';

	interface Props {
		id?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		name?: string;
		value?: string;
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
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = '',
		onchange,
		children
	}: Props = $props();
</script>

<label
	class="relative flex items-start gap-3 select-none {disabled
		? 'cursor-not-allowed opacity-60'
		: 'cursor-pointer'} {className}"
>
	<div class="flex h-5 items-center">
		<input
			id={id || name}
			type="checkbox"
			bind:checked
			aria-label={ariaLabelAttr || ariaLabel || label}
			onchange={(e) => {
				const isChecked = (e.currentTarget as HTMLInputElement).checked;
				if (onchange) onchange(isChecked);
			}}
			{disabled}
			{name}
			{value}
			class="sr-only"
		/>
		<div
			class="flex h-4.5 w-4.5 items-center justify-center rounded border transition-all duration-150 {checked
				? 'border-primary-600 bg-primary-600 text-white shadow-xs'
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
