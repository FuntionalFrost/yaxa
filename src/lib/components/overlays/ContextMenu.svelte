<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ContextMenu } from 'bits-ui';
	import Icon, { type IconSource } from '../elements/Icon.svelte';
	import Kbd from '../elements/Kbd.svelte';

	export interface ContextMenuItem {
		id: string;
		label: string;
		icon?: IconSource;
		shortcut?: string;
		disabled?: boolean;
		destructive?: boolean;
		separator?: boolean;
		onSelect?: () => void;
	}

	interface Props {
		items?: ContextMenuItem[];
		class?: string;
		children: Snippet;
		content?: Snippet;
	}

	let { items = [], class: className = '', children, content }: Props = $props();
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="w-full">
		{@render children()}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content
			class="z-50 min-w-45 rounded-xl border border-neutral-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-md transition-all focus:outline-none dark:border-neutral-800/80 dark:bg-[#18181b]/95 {className}"
			sideOffset={5}
		>
			{#if content}
				{@render content()}
			{:else}
				{#each items as item, i (item.id ?? i)}
					{#if item.separator}
						<ContextMenu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
					{:else}
						<ContextMenu.Item
							disabled={item.disabled}
							onSelect={item.onSelect}
							class="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 transition-colors outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-40 data-highlighted:bg-neutral-100 data-highlighted:text-neutral-900 dark:text-neutral-300 dark:data-highlighted:bg-neutral-800 dark:data-highlighted:text-white {item.destructive
								? 'text-red-600 data-highlighted:bg-red-50 dark:text-red-400 dark:data-highlighted:bg-red-950/40'
								: ''}"
						>
							<div class="flex items-center gap-2">
								{#if item.icon}
									<Icon name={item.icon} size="xs" />
								{/if}
								<span>{item.label}</span>
							</div>
							{#if item.shortcut}
								<Kbd value={item.shortcut} size="xs" class="ml-auto" />
							{/if}
						</ContextMenu.Item>
					{/if}
				{/each}
			{/if}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
