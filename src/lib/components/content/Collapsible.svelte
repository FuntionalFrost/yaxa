<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export const collapsibleVariants = tv({
		slots: {
			root: 'not-prose w-full overflow-hidden rounded-xl transition-colors',
			trigger:
				'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-neutral-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100',
			titleWrapper: 'flex min-w-0 items-center gap-2.5',
			icon: 'h-4 w-4 shrink-0 text-primary-500 dark:text-primary-400',
			title: 'truncate',
			badge:
				'inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
			chevron:
				'h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500',
			content:
				'border-t border-neutral-200/80 px-4 py-3.5 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800/80 dark:text-neutral-300'
		},
		variants: {
			variant: {
				bordered: {
					root: 'border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900/60',
					trigger: 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50'
				},
				subtle: {
					root: 'border border-neutral-200/60 bg-neutral-50/70 dark:border-neutral-800/60 dark:bg-neutral-900/40',
					trigger: 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
				},
				ghost: {
					root: 'rounded-lg',
					trigger: ' rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/60',
					content: 'border-t-0 px-3 pt-1 pb-3'
				}
			}
		},
		defaultVariants: {
			variant: 'bordered'
		}
	});

	export type CollapsibleVariants = VariantProps<typeof collapsibleVariants>;
	export type CollapsibleSlots = keyof typeof collapsibleVariants.slots;

	export interface CollapsibleProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'title' | 'ontoggle'
	> {
		/**
		 * Controls whether the collapsible panel is expanded.
		 * @default false
		 */
		open?: boolean;
		/**
		 * Header trigger label.
		 */
		title?: string;
		/**
		 * Optional subtitle or description shown under the title.
		 */
		description?: string;
		/**
		 * Optional badge text next to the title.
		 */
		badge?: string;
		/**
		 * Optional icon name from `<Icon />`.
		 */
		icon?: string;
		/**
		 * Shorthand to toggle between `'bordered'` (`true`) and `'ghost'` (`false`).
		 */
		bordered?: boolean;
		/**
		 * Visual style variant.
		 * @default 'bordered'
		 */
		variant?: CollapsibleVariants['variant'];
		/**
		 * Disable toggling.
		 * @default false
		 */
		disabled?: boolean;
		/**
		 * Callback invoked when open state toggles.
		 */
		ontoggle?: (open: boolean) => void;
		/**
		 * Custom trigger content snippet.
		 */
		trigger?: Snippet<[{ open: boolean }]>;
		/**
		 * Expandable body content snippet.
		 */
		children?: Snippet;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<CollapsibleSlots, string>>;
	}
</script>

<script lang="ts">
	import { cn } from '../../utils/cn';
	import { smoothSlide } from '../../motion/transitions';
	import Icon from '../elements/Icon.svelte';

	let {
		open = $bindable(false),
		title = 'Details',
		description,
		badge,
		icon,
		bordered,
		variant = 'bordered',
		disabled = false,
		ontoggle,
		trigger,
		children,
		ui,
		class: className = '',
		...restProps
	}: CollapsibleProps = $props();

	const resolvedVariant = $derived(
		bordered !== undefined ? (bordered ? 'bordered' : 'ghost') : variant
	);
	const slots = $derived(collapsibleVariants({ variant: resolvedVariant }));

	function toggle() {
		if (disabled) return;
		open = !open;
		ontoggle?.(open);
	}
</script>

<div
	data-slot="root"
	data-state={open ? 'open' : 'closed'}
	class={cn(slots.root({ class: ui?.root }), className)}
	{...restProps}
>
	<button
		type="button"
		data-slot="trigger"
		aria-expanded={open}
		{disabled}
		onclick={toggle}
		class={slots.trigger({ class: ui?.trigger })}
	>
		{#if trigger}
			{@render trigger({ open })}
		{:else}
			<span data-slot="titleWrapper" class={slots.titleWrapper({ class: ui?.titleWrapper })}>
				{#if icon}
					<Icon name={icon} class={slots.icon({ class: ui?.icon })} />
				{/if}
				<span class="min-w-0">
					<span data-slot="title" class={slots.title({ class: ui?.title })}>{title}</span>
					{#if description}
						<span class="block truncate text-xs font-normal text-neutral-500 dark:text-neutral-400">
							{description}
						</span>
					{/if}
				</span>
				{#if badge}
					<span data-slot="badge" class={slots.badge({ class: ui?.badge })}>{badge}</span>
				{/if}
			</span>
		{/if}
		<svg
			data-slot="chevron"
			class={cn(slots.chevron({ class: ui?.chevron }), open && 'rotate-180')}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if open}
		<div
			data-slot="content"
			transition:smoothSlide={{ duration: 200 }}
			class={slots.content({ class: ui?.content })}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>
