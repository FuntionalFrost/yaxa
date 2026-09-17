<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		trigger?: Snippet;
		content?: Snippet;
		children?: Snippet;
	}

	let { text, side = 'top', trigger, content, children }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class="inline-flex">
			{#if trigger}
				{@render trigger()}
			{:else if children}
				{@render children()}
			{/if}
		</Tooltip.Trigger>

		<Tooltip.Portal>
			<Tooltip.Content
				{side}
				sideOffset={6}
				class="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 overflow-hidden rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
			>
				{#if content}
					{@render content()}
				{:else if text}
					{text}
				{/if}
				<Tooltip.Arrow class="fill-neutral-900 dark:fill-neutral-100" />
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
