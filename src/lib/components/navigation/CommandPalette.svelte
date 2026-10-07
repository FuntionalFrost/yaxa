<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface CommandItem {
		id: string;
		label: string;
		description?: string;
		icon?: IconSource;
		group?: string;
		shortcut?: string;
		onSelect?: () => void;
		href?: string;
	}

	export interface CommandPaletteSlots {
		root?: string;
		overlay?: string;
		content?: string;
		input?: string;
		group?: string;
		item?: string;
		shortcut?: string;
		footer?: string;
	}

	export interface CommandPaletteProps {
		open?: boolean;
		items?: CommandItem[];
		placeholder?: string;
		class?: string;
		ui?: CommandPaletteSlots;
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '../elements/Icon.svelte';
	import Kbd from '../elements/Kbd.svelte';
	import { cn } from '../../utils/cn';

	let {
		open = $bindable(false),
		items = [],
		placeholder = 'Type a command or search...',
		class: className = '',
		ui
	}: CommandPaletteProps = $props();

	let query = $state('');
	let selectedIndex = $state(0);

	let filteredItems = $derived.by(() => {
		if (!query.trim()) return items;
		const q = query.toLowerCase();
		return items.filter(
			(item) =>
				item.label.toLowerCase().includes(q) ||
				item.description?.toLowerCase().includes(q) ||
				item.group?.toLowerCase().includes(q)
		);
	});

	let groupedItems = $derived.by(() => {
		const groups: Record<string, CommandItem[]> = {};
		filteredItems.forEach((item) => {
			const groupName = item.group || 'General';
			if (!groups[groupName]) groups[groupName] = [];
			groups[groupName].push(item);
		});
		return groups;
	});

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = !open;
			if (open) query = '';
		}

		if (!open) return;

		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % Math.max(1, filteredItems.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex =
				(selectedIndex - 1 + filteredItems.length) % Math.max(1, filteredItems.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selected = filteredItems[selectedIndex];
			if (selected) {
				executeItem(selected);
			}
		}
	}

	function executeItem(item: CommandItem) {
		open = false;
		if (item.onSelect) item.onSelect();
		if (item.href && browser) {
			window.location.href = item.href;
		}
	}

	$effect(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if open}
	<div
		data-slot="root"
		class={cn(
			'fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] sm:p-6 sm:pt-[20vh]',
			ui?.root
		)}
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			data-slot="overlay"
			class={cn(
				'fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity motion-reduce:transition-none',
				ui?.overlay
			)}
			onclick={() => (open = false)}
			aria-label="Close command palette"
		></button>

		<!-- Dialog Panel -->
		<div
			data-slot="content"
			class={cn(
				'relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl yaxa-surface-elevated transition-all motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900',
				className,
				ui?.content
			)}
		>
			<!-- Search Bar -->
			<div class="flex items-center border-b border-neutral-200 px-4 dark:border-neutral-800">
				<Icon name="search" size="sm" class="mr-3 text-neutral-400" />
				<input
					id="command-palette-input"
					name="commandQuery"
					type="text"
					bind:value={query}
					{placeholder}
					aria-label={placeholder || 'Search commands and pages'}
					data-slot="input"
					class={cn(
						'h-12 w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white',
						ui?.input
					)}
					use:focusOnMount
				/>
				<Kbd value="esc" size="xs" />
			</div>

			<!-- List Items -->
			<div class="max-h-80 overflow-y-auto p-2">
				{#if filteredItems.length === 0}
					<div class="py-10 text-center text-sm text-neutral-500">
						No results found for "{query}".
					</div>
				{:else}
					{#each Object.entries(groupedItems) as [groupName, groupList] (groupName)}
						<div class="mb-2">
							<div
								data-slot="group"
								class={cn(
									'px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500',
									ui?.group
								)}
							>
								{groupName}
							</div>
							{#each groupList as item (item.id)}
								{@const isHighlighted = filteredItems.indexOf(item) === selectedIndex}
								<button
									type="button"
									data-slot="item"
									onclick={() => executeItem(item)}
									class={cn(
										'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
										isHighlighted
											? 'bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
											: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60',
										ui?.item
									)}
								>
									<div class="flex items-center gap-3">
										{#if item.icon}
											<Icon
												name={item.icon}
												size="sm"
												class={isHighlighted
													? 'text-primary-600 dark:text-primary-400'
													: 'text-neutral-400'}
											/>
										{/if}
										<div>
											<div class="font-medium">{item.label}</div>
											{#if item.description}
												<div class="text-sm text-neutral-500 dark:text-neutral-400">
													{item.description}
												</div>
											{/if}
										</div>
									</div>

									{#if item.shortcut}
										<Kbd value={item.shortcut} size="xs" class={ui?.shortcut} />
									{/if}
								</button>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<div
				data-slot="footer"
				class={cn(
					'flex items-center justify-between border-t border-neutral-100 bg-neutral-50/80 px-4 py-2 text-[11px] text-neutral-400 dark:border-neutral-800/80 dark:bg-neutral-900/50',
					ui?.footer
				)}
			>
				<span class="flex items-center gap-1.5">
					<Kbd value="↑↓" size="xs" /> Navigate
				</span>
				<span class="flex items-center gap-1.5">
					<Kbd value="enter" size="xs" /> Select
				</span>
			</div>
		</div>
	</div>
{/if}
