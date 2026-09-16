<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { IconSource } from './Icon.svelte';

	export interface TimelineItem {
		id: string | number;
		title: string;
		description?: string;
		timestamp?: string;
		icon?: IconSource;
		color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
		tag?: string;
	}

	export const timelineVariants = tv({
		base: 'relative space-y-6',
		variants: {
			size: {
				sm: 'space-y-4 text-xs',
				md: 'space-y-6 text-sm',
				lg: 'space-y-8 text-base'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export type TimelineProps = VariantProps<typeof timelineVariants> & {
		items?: TimelineItem[];
		itemSnippet?: Snippet<[TimelineItem]>;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import Badge from './Badge.svelte';

	let { items = [], size = 'md', itemSnippet, class: className = '' }: TimelineProps = $props();

	function getBadgeClasses(color: TimelineItem['color'] = 'primary') {
		switch (color) {
			case 'success':
				return 'bg-emerald-500 text-white shadow-emerald-500/20';
			case 'warning':
				return 'bg-amber-500 text-white shadow-amber-500/20';
			case 'error':
				return 'bg-rose-500 text-white shadow-rose-500/20';
			case 'info':
				return 'bg-sky-500 text-white shadow-sky-500/20';
			case 'neutral':
				return 'bg-neutral-600 text-white dark:bg-neutral-700 shadow-neutral-500/20';
			case 'primary':
			default:
				return 'bg-primary-600 text-white shadow-primary-500/20';
		}
	}
</script>

<div class={timelineVariants({ size, class: className })}>
	{#if items.length > 0}
		<!-- Vertical Connector Line -->
		<div
			class="absolute top-4 bottom-4 left-4 -ml-px w-0.5 bg-neutral-200 dark:bg-neutral-800"
			aria-hidden="true"
		></div>

		{#each items as item (item.id)}
			<div class="relative flex items-start gap-4">
				<!-- Icon / Dot Node -->
				<div
					class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm {getBadgeClasses(
						item.color
					)}"
				>
					{#if item.icon}
						<Icon name={item.icon} size="xs" />
					{:else}
						<span class="h-2 w-2 rounded-full bg-white"></span>
					{/if}
				</div>

				<!-- Content Body -->
				<div class="min-w-0 flex-1 pt-0.5">
					{#if itemSnippet}
						{@render itemSnippet(item)}
					{:else}
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<span class="font-semibold text-neutral-900 dark:text-white">
									{item.title}
								</span>
								{#if item.tag}
									<Badge size="xs" variant="subtle" color={item.color || 'primary'}>
										{item.tag}
									</Badge>
								{/if}
							</div>
							{#if item.timestamp}
								<time class="text-xs text-neutral-400 dark:text-neutral-500">
									{item.timestamp}
								</time>
							{/if}
						</div>

						{#if item.description}
							<p class="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
								{item.description}
							</p>
						{/if}
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>
