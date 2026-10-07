<script module lang="ts">
	import { tv, cn, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { IconSource } from '../elements/Icon.svelte';

	export const alertVariants = tv({
		base: 'relative w-full rounded-xl border p-4 transition-all duration-150',
		variants: {
			color: {
				info: 'border-sky-200 bg-sky-50/70 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
				success:
					'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
				warning:
					'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
				error:
					'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200'
			}
		},
		defaultVariants: {
			color: 'info'
		}
	});

	export interface AlertSlots {
		root?: string;
		icon?: string;
		title?: string;
		description?: string;
		body?: string;
		actions?: string;
		close?: string;
	}

	export type AlertProps = VariantProps<typeof alertVariants> & {
		title?: string;
		description?: string;
		icon?: IconSource;
		closable?: boolean;
		onclose?: () => void;
		actions?: Snippet;
		class?: string;
		ui?: AlertSlots;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';

	let {
		color = 'info',
		title,
		description,
		icon,
		closable = false,
		onclose,
		actions,
		class: className = '',
		ui,
		children
	}: AlertProps = $props();

	let visible = $state(true);

	let defaultIcon = $derived.by(() => {
		if (icon) return icon;
		switch (color) {
			case 'success':
				return 'check';
			case 'warning':
			case 'error':
				return 'alert';
			case 'info':
			default:
				return 'info';
		}
	});

	function handleClose() {
		visible = false;
		if (onclose) onclose();
	}
</script>

{#if visible}
	<div
		data-slot="root"
		class={cn(alertVariants({ color, class: className }), ui?.root)}
		role="alert"
	>
		<div class="flex items-start gap-3">
			<div data-slot="icon" class={cn('mt-0.5 shrink-0', ui?.icon)}>
				<Icon name={defaultIcon} size="sm" />
			</div>

			<div class="flex-1">
				{#if title}
					<h5 data-slot="title" class={cn('text-base font-semibold', ui?.title)}>{title}</h5>
				{/if}
				{#if description}
					<div data-slot="description" class={cn('mt-1 text-sm opacity-90', ui?.description)}>
						{description}
					</div>
				{/if}
				{#if children}
					<div data-slot="body" class={cn('mt-1 text-sm', ui?.body)}>
						{@render children()}
					</div>
				{/if}
				{#if actions}
					<div data-slot="actions" class={cn('mt-3 flex items-center gap-2', ui?.actions)}>
						{@render actions()}
					</div>
				{/if}
			</div>

			{#if closable}
				<button
					type="button"
					data-slot="close"
					onclick={handleClose}
					class={cn(
						'rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:outline-none',
						ui?.close
					)}
					aria-label="Dismiss alert"
				>
					<Icon name="cross" size="xs" />
				</button>
			{/if}
		</div>
	</div>
{/if}
