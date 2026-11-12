<script module lang="ts">
	import { tv, cn, type VariantProps } from '#lib/utils/cn.js';
	import type { Snippet } from 'svelte';
	import type { IconSource } from '../elements/Icon.svelte';

	export const stepsVariants = tv({
		base: 'not-prose relative my-6 flex flex-col',
		variants: {
			size: {
				sm: 'gap-5',
				md: 'gap-7',
				lg: 'gap-9'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export interface StepGuideItem {
		title: string;
		description?: string;
		code?: string;
		language?: string;
		filename?: string;
		badge?: string;
		icon?: IconSource;
	}

	export interface StepsSlots {
		root?: string;
		item?: string;
		indicator?: string;
		line?: string;
		content?: string;
		title?: string;
		description?: string;
		code?: string;
	}

	export type StepsProps = VariantProps<typeof stepsVariants> & {
		items?: StepGuideItem[];
		level?: 'h2' | 'h3' | 'h4';
		class?: string;
		ui?: StepsSlots;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import CodeBlock from '../elements/CodeBlock.svelte';
	import Badge from '../elements/Badge.svelte';
	import Icon from '../elements/Icon.svelte';

	let {
		items = [],
		level = 'h3',
		size = 'md',
		class: className = '',
		ui,
		children
	}: StepsProps = $props();
</script>

<div data-slot="root" role="list" class={cn(stepsVariants({ size, class: className }), ui?.root)}>
	{#if items.length > 0}
		{#each items as item, index (item.title + '-' + index)}
			{@const isLast = index === items.length - 1}
			<div data-slot="item" role="listitem" class={cn('relative flex gap-4', ui?.item)}>
				<!-- Vertical Connector Line -->
				{#if !isLast}
					<div
						data-slot="line"
						aria-hidden="true"
						class={cn(
							'absolute top-8 -bottom-7 left-3.5 w-px bg-neutral-200 dark:bg-neutral-800',
							ui?.line
						)}
					></div>
				{/if}

				<!-- Number / Icon Indicator -->
				<div
					data-slot="indicator"
					class={cn(
						'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-800 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
						ui?.indicator
					)}
				>
					{#if item.icon}
						<Icon name={item.icon} size="xs" />
					{:else}
						<span>{index + 1}</span>
					{/if}
				</div>

				<!-- Step Content -->
				<div data-slot="content" class={cn('min-w-0 flex-1 space-y-2 pt-0.5', ui?.content)}>
					<div class="flex flex-wrap items-center gap-2">
						<svelte:element
							this={level}
							data-slot="title"
							class={cn(
								'font-semibold tracking-tight text-neutral-900 dark:text-neutral-100',
								size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
								ui?.title
							)}
						>
							{item.title}
						</svelte:element>

						{#if item.badge}
							<Badge size="sm" variant="subtle" color="primary">{item.badge}</Badge>
						{/if}
					</div>

					{#if item.description}
						<p
							data-slot="description"
							class={cn(
								'text-sm leading-relaxed text-neutral-600 dark:text-neutral-400',
								ui?.description
							)}
						>
							{item.description}
						</p>
					{/if}

					{#if item.code}
						<div data-slot="code" class={cn('pt-1', ui?.code)}>
							<CodeBlock
								code={item.code}
								language={item.language ?? 'bash'}
								filename={item.filename}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	{:else if children}
		<div class="relative border-l border-neutral-200 pl-6 dark:border-neutral-800">
			{@render children()}
		</div>
	{/if}
</div>
