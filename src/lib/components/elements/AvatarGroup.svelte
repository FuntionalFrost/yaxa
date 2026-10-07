<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '../../utils/cn';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div
	class={cn(
		'inline-flex items-center -space-x-2 *:ring-2 *:ring-white dark:*:ring-neutral-900',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
