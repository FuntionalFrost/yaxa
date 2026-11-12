<script module lang="ts">
	import { tv, cn, type VariantProps } from '#lib/utils/cn.js';
	import type { Snippet } from 'svelte';
	import type { IconSource } from '../elements/Icon.svelte';

	export const calloutVariants = tv({
		base: 'not-prose group relative my-4 flex w-full gap-3.5 overflow-hidden rounded-xl border border-l-4 p-4 text-sm transition-all duration-150',
		variants: {
			type: {
				note: 'border-sky-200/80 border-l-sky-500 bg-sky-50/50 text-sky-950 dark:border-sky-900/40 dark:border-l-sky-400 dark:bg-sky-950/25 dark:text-sky-100',
				info: 'border-sky-200/80 border-l-sky-500 bg-sky-50/50 text-sky-950 dark:border-sky-900/40 dark:border-l-sky-400 dark:bg-sky-950/25 dark:text-sky-100',
				tip: 'border-emerald-200/80 border-l-emerald-500 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:border-l-emerald-400 dark:bg-emerald-950/25 dark:text-emerald-100',
				success:
					'border-emerald-200/80 border-l-emerald-500 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:border-l-emerald-400 dark:bg-emerald-950/25 dark:text-emerald-100',
				important:
					'border-violet-200/80 border-l-violet-500 bg-violet-50/50 text-violet-950 dark:border-violet-900/40 dark:border-l-violet-400 dark:bg-violet-950/25 dark:text-violet-100',
				warning:
					'border-amber-200/80 border-l-amber-500 bg-amber-50/50 text-amber-950 dark:border-amber-900/40 dark:border-l-amber-400 dark:bg-amber-950/25 dark:text-amber-100',
				caution:
					'border-rose-200/80 border-l-rose-500 bg-rose-50/50 text-rose-950 dark:border-rose-900/40 dark:border-l-rose-400 dark:bg-rose-950/25 dark:text-rose-100',
				danger:
					'border-rose-200/80 border-l-rose-500 bg-rose-50/50 text-rose-950 dark:border-rose-900/40 dark:border-l-rose-400 dark:bg-rose-950/25 dark:text-rose-100'
			}
		},
		defaultVariants: {
			type: 'note'
		}
	});

	export type CalloutType = NonNullable<VariantProps<typeof calloutVariants>['type']>;

	export interface CalloutSlots {
		root?: string;
		icon?: string;
		content?: string;
		title?: string;
		body?: string;
		close?: string;
	}

	export type CalloutProps = VariantProps<typeof calloutVariants> & {
		title?: string;
		description?: string;
		icon?: IconSource;
		href?: string;
		target?: string;
		closable?: boolean;
		onclose?: () => void;
		class?: string;
		ui?: CalloutSlots;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';

	let {
		type = 'note',
		title,
		description,
		icon,
		href,
		target,
		closable = false,
		onclose,
		class: className = '',
		ui,
		children
	}: CalloutProps = $props();

	let visible = $state(true);

	const iconColorMap: Record<CalloutType, string> = {
		note: 'text-sky-600 dark:text-sky-400',
		info: 'text-sky-600 dark:text-sky-400',
		tip: 'text-emerald-600 dark:text-emerald-400',
		success: 'text-emerald-600 dark:text-emerald-400',
		important: 'text-violet-600 dark:text-violet-400',
		warning: 'text-amber-600 dark:text-amber-400',
		caution: 'text-rose-600 dark:text-rose-400',
		danger: 'text-rose-600 dark:text-rose-400'
	};

	let resolvedIcon = $derived.by((): IconSource => {
		if (icon) return icon;
		switch (type) {
			case 'tip':
			case 'success':
				return 'check';
			case 'important':
				return 'sparkles';
			case 'warning':
			case 'caution':
			case 'danger':
				return 'alert';
			case 'note':
			case 'info':
			default:
				return 'info';
		}
	});

	function handleClose(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		visible = false;
		onclose?.();
	}
</script>

{#if visible}
	<svelte:element
		this={href ? 'a' : 'div'}
		{href}
		{target}
		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
		data-slot="root"
		data-callout-type={type}
		role="note"
		class={cn(
			calloutVariants({ type, class: className }),
			href && 'cursor-pointer hover:shadow-sm',
			ui?.root
		)}
	>
		<div data-slot="icon" class={cn('mt-0.5 shrink-0', iconColorMap[type ?? 'note'], ui?.icon)}>
			<Icon name={resolvedIcon} size="sm" />
		</div>

		<div data-slot="content" class={cn('min-w-0 flex-1 space-y-1', ui?.content)}>
			{#if title}
				<div
					data-slot="title"
					class={cn('flex items-center gap-1.5 font-semibold tracking-tight', ui?.title)}
				>
					<span>{title}</span>
					{#if href}
						<Icon
							name="arrow-right"
							size="xs"
							class="transition-transform duration-150 group-hover:translate-x-0.5"
						/>
					{/if}
				</div>
			{/if}

			{#if description}
				<div data-slot="body" class={cn('leading-relaxed opacity-90', ui?.body)}>
					{description}
				</div>
			{/if}

			{#if children}
				<div
					data-slot="body"
					class={cn(
						'leading-relaxed opacity-90 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs dark:[&_code]:bg-white/10',
						ui?.body
					)}
				>
					{@render children()}
				</div>
			{/if}
		</div>

		{#if closable}
			<button
				type="button"
				data-slot="close"
				onclick={handleClose}
				class={cn(
					'-mt-1 -mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100 focus:outline-none dark:hover:bg-white/10',
					ui?.close
				)}
				aria-label="Dismiss callout"
			>
				<Icon name="close" size="xs" />
			</button>
		{/if}
	</svelte:element>
{/if}
