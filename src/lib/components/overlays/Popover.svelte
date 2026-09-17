<script lang="ts">
	import { Popover } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		trigger?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let { open = $bindable(false), trigger, children, class: className = '' }: Props = $props();
</script>

<Popover.Root bind:open>
	{#if trigger}
		<Popover.Trigger class="inline-flex">
			{#snippet child({ props })}
				<span {...props} class="inline-flex">
					{@render trigger()}
				</span>
			{/snippet}
		</Popover.Trigger>
	{/if}

	<Popover.Portal>
		<Popover.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl duration-150 outline-none dark:border-neutral-800 dark:bg-neutral-900 {className}"
			sideOffset={8}
		>
			{#if children}
				{@render children()}
			{/if}
			<Popover.Arrow class="fill-neutral-200 dark:fill-neutral-800" />
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
