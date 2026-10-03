<script module lang="ts">
	import { tv, type VariantProps } from '#lib/utils/cn.js';
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

	export type AlertProps = VariantProps<typeof alertVariants> & {
		title?: string;
		description?: string;
		icon?: IconSource;
		closable?: boolean;
		onclose?: () => void;
		actions?: Snippet;
		class?: string;
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
	<div class={alertVariants({ color, class: className })} role="alert">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 shrink-0">
				<Icon name={defaultIcon} size="sm" />
			</div>

			<div class="flex-1">
				{#if title}
					<h5 class="text-base font-semibold">{title}</h5>
				{/if}
				{#if description}
					<div class="mt-1 text-sm opacity-90">{description}</div>
				{/if}
				{#if children}
					<div class="mt-1 text-sm">
						{@render children()}
					</div>
				{/if}
				{#if actions}
					<div class="mt-3 flex items-center gap-2">
						{@render actions()}
					</div>
				{/if}
			</div>

			{#if closable}
				<button
					type="button"
					onclick={handleClose}
					class="rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
					aria-label="Dismiss alert"
				>
					<Icon name="cross" size="xs" />
				</button>
			{/if}
		</div>
	</div>
{/if}
