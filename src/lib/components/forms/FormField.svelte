<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		label?: string;
		description?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		name?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		id,
		label,
		description,
		error,
		hint,
		required = false,
		name,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class="space-y-1.5 {className}">
	{#if label || hint}
		<div class="flex items-center justify-between">
			{#if label}
				<label
					for={id || name}
					class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
				>
					{label}
					{#if required}
						<span class="ml-0.5 text-rose-500">*</span>
					{/if}
				</label>
			{/if}

			{#if hint}
				<span class="text-sm text-neutral-500 dark:text-neutral-400">{hint}</span>
			{/if}
		</div>
	{/if}

	{#if description}
		<p class="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
	{/if}

	{#if children}
		{@render children()}
	{/if}

	{#if error}
		<p class="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
	{/if}
</div>
