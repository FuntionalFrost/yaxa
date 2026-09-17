<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface MenuItem {
		id: string;
		label: string;
		icon?: IconSource;
		shortcut?: string;
		disabled?: boolean;
		separator?: boolean;
		destructive?: boolean;
		onSelect?: () => void;
	}
</script>

<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Icon from '../elements/Icon.svelte';
	import Kbd from '../elements/Kbd.svelte';

	interface Props {
		items: MenuItem[];
		trigger?: Snippet;
		class?: string;
	}

	let { items, trigger, class: className = '' }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="inline-flex">
		{#snippet child({ props })}
			<span {...props} class="inline-flex">
				{#if trigger}
					{@render trigger()}
				{:else}
					<span
						class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
					>
						Options
						<Icon name="chevron-down" size="xs" />
					</span>
				{/if}
			</span>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="animate-in fade-in-0 zoom-in-95 z-50 min-w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 {className}"
			sideOffset={6}
		>
			{#each items as item}
				{#if item.separator}
					<DropdownMenu.Separator class="-mx-1 my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
				{:else}
					<DropdownMenu.Item
						disabled={item.disabled}
						onSelect={item.onSelect}
						class="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-neutral-100 data-highlighted:text-neutral-900 dark:data-highlighted:bg-neutral-800 dark:data-highlighted:text-neutral-100 {item.destructive
							? 'text-rose-600 data-highlighted:bg-rose-50 dark:text-rose-400 dark:data-highlighted:bg-rose-950/50'
							: ''}"
					>
						<div class="flex items-center gap-2">
							{#if item.icon}
								<Icon name={item.icon} size="xs" />
							{/if}
							<span>{item.label}</span>
						</div>

						{#if item.shortcut}
							<Kbd value={item.shortcut} size="xs" />
						{/if}
					</DropdownMenu.Item>
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
