<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export const actionBarVariants = tv({
		slots: {
			root: 'yaxa-surface-elevated fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-neutral-900/95',
			countBadge:
				'inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-primary-600 px-2 text-xs font-bold text-white shadow-xs dark:bg-primary-500',
			label: 'text-xs font-semibold whitespace-nowrap text-neutral-800 dark:text-neutral-200',
			divider: 'h-5 w-px bg-neutral-200 dark:bg-neutral-800',
			actions: 'flex flex-wrap items-center gap-2',
			clearButton:
				'ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
		},
		variants: {
			position: {
				bottom: {
					root: 'bottom-6'
				},
				top: {
					root: 'top-6'
				}
			}
		},
		defaultVariants: {
			position: 'bottom'
		}
	});

	export type ActionBarVariants = VariantProps<typeof actionBarVariants>;
	export type ActionBarSlots = keyof typeof actionBarVariants.slots;

	export interface ActionBarProps extends HTMLAttributes<HTMLDivElement> {
		/**
		 * Controls visibility of the floating action bar.
		 * @default false
		 */
		open?: boolean;
		/**
		 * Number of selected items (when > 0, automatically opens unless `open` is explicitly false).
		 */
		count?: number;
		/**
		 * Label displayed next to the selection count badge.
		 * @default 'selected'
		 */
		label?: string;
		/**
		 * Text for the clear selection button.
		 * @default 'Clear'
		 */
		clearLabel?: string;
		/**
		 * Callback fired when the user clicks Clear or presses `Escape`.
		 */
		onclear?: () => void;
		/**
		 * Dismiss via `Escape` key.
		 * @default true
		 */
		closeOnEscape?: boolean;
		/**
		 * Screen placement.
		 * @default 'bottom'
		 */
		position?: ActionBarVariants['position'];
		/**
		 * Action buttons snippet rendered inside the bar.
		 */
		children?: Snippet;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<ActionBarSlots, string>>;
	}
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cn } from '../../utils/cn';
	import Kbd from '../elements/Kbd.svelte';

	let {
		open,
		count = 0,
		label = 'selected',
		clearLabel = 'Clear',
		onclear,
		closeOnEscape = true,
		position = 'bottom',
		children,
		ui,
		class: className = '',
		...restProps
	}: ActionBarProps = $props();

	const isVisible = $derived(open !== undefined ? open : count > 0);
	const slots = $derived(actionBarVariants({ position }));

	function handleKeydown(e: KeyboardEvent) {
		if (isVisible && closeOnEscape && e.key === 'Escape' && onclear) {
			e.preventDefault();
			onclear();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
	<div
		data-slot="root"
		role="toolbar"
		aria-label="{count > 0 ? `${count} ${label}` : label} bulk actions"
		transition:fly={{ y: position === 'top' ? -16 : 16, duration: 180 }}
		class={cn(slots.root({ class: ui?.root }), className)}
		{...restProps}
	>
		<div class="flex items-center gap-2">
			{#if count > 0}
				<span data-slot="countBadge" class={slots.countBadge({ class: ui?.countBadge })}>
					{count}
				</span>
			{/if}
			<span data-slot="label" class={slots.label({ class: ui?.label })}>
				{label}
			</span>
		</div>

		{#if children}
			<div data-slot="divider" class={slots.divider({ class: ui?.divider })}></div>
			<div data-slot="actions" class={slots.actions({ class: ui?.actions })}>
				{@render children()}
			</div>
		{/if}

		{#if onclear}
			<div data-slot="divider" class={slots.divider({ class: ui?.divider })}></div>
			<button
				type="button"
				data-slot="clearButton"
				onclick={onclear}
				class={slots.clearButton({ class: ui?.clearButton })}
			>
				<span>{clearLabel}</span>
				<Kbd size="xs">Esc</Kbd>
			</button>
		{/if}
	</div>
{/if}
