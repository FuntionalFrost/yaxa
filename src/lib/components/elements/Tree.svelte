<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from './Icon.svelte';

	export interface TreeNode {
		id: string;
		label: string;
		icon?: IconSource;
		children?: TreeNode[];
		disabled?: boolean;
		data?: Record<string, unknown>;
	}

	export const treeVariants = tv({
		base: 'w-full select-none font-sans text-xs',
		variants: {
			size: {
				sm: 'text-xs',
				md: 'text-sm'
			}
		},
		defaultVariants: {
			size: 'sm'
		}
	});

	export type TreeProps = VariantProps<typeof treeVariants> & {
		items?: TreeNode[];
		selectedId?: string;
		expandedIds?: string[];
		onselect?: (node: TreeNode) => void;
		ontoggle?: (node: TreeNode, expanded: boolean) => void;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		items = [],
		selectedId = $bindable(''),
		expandedIds = $bindable([]),
		size = 'sm',
		onselect,
		ontoggle,
		class: className = ''
	}: TreeProps = $props();

	function isExpanded(id: string): boolean {
		return expandedIds.includes(id);
	}

	function isSelected(id: string): boolean {
		return selectedId === id;
	}

	function toggleNode(node: TreeNode, e?: MouseEvent) {
		e?.stopPropagation();
		if (node.disabled || !node.children || node.children.length === 0) return;

		const currentlyExpanded = isExpanded(node.id);
		if (currentlyExpanded) {
			expandedIds = expandedIds.filter((id) => id !== node.id);
		} else {
			expandedIds = [...expandedIds, node.id];
		}
		ontoggle?.(node, !currentlyExpanded);
	}

	function selectNode(node: TreeNode, e?: MouseEvent) {
		e?.stopPropagation();
		if (node.disabled) return;
		selectedId = node.id;
		onselect?.(node);
		if (node.children && node.children.length > 0) {
			toggleNode(node, e);
		}
	}
</script>

{#snippet renderTree(nodes: TreeNode[], depth: number)}
	<ul
		role={depth === 0 ? 'tree' : 'group'}
		class="space-y-0.5 {depth > 0
			? 'ml-4 border-l border-neutral-200 pl-2 dark:border-neutral-800'
			: ''}"
	>
		{#each nodes as node (node.id)}
			{@const hasChildren = Boolean(node.children && node.children.length > 0)}
			{@const expanded = isExpanded(node.id)}
			{@const selected = isSelected(node.id)}

			<li
				role="treeitem"
				aria-expanded={hasChildren ? expanded : undefined}
				aria-selected={selected}
				class="relative"
			>
				<button
					type="button"
					disabled={node.disabled}
					onclick={(e) => selectNode(node, e)}
					class="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors {selected
						? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
						: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'} {node.disabled
						? 'cursor-not-allowed opacity-40'
						: 'cursor-pointer'}"
				>
					<!-- Expand / Collapse chevron for parents -->
					{#if hasChildren}
						<span
							role="button"
							tabindex="-1"
							onclick={(e) => toggleNode(node, e)}
							onkeydown={(e) => e.key === 'Enter' && toggleNode(node)}
							class="flex h-4 w-4 shrink-0 items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
						>
							<Icon
								name="chevron-right"
								size="xs"
								class="transition-transform duration-150 {expanded ? 'rotate-90' : ''}"
							/>
						</span>
					{:else}
						<span class="w-4 shrink-0"></span>
					{/if}

					<!-- Node Icon -->
					{#if node.icon}
						<Icon name={node.icon} size="xs" class="shrink-0 text-neutral-400" />
					{:else if hasChildren}
						<Icon name="folder" size="xs" class="shrink-0 text-amber-500 dark:text-amber-400" />
					{:else}
						<Icon name="document" size="xs" class="shrink-0 text-neutral-400" />
					{/if}

					<!-- Node Label -->
					<span class="truncate">{node.label}</span>
				</button>

				<!-- Nested Children -->
				{#if hasChildren && expanded}
					<div class="mt-0.5">
						{@render renderTree(node.children!, depth + 1)}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class={treeVariants({ size, class: className })}>
	{#if items.length > 0}
		{@render renderTree(items, 0)}
	{:else}
		<div class="py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
			No tree items available.
		</div>
	{/if}
</div>
