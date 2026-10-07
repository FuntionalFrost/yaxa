<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface BreadcrumbItem {
		label: string;
		href?: string;
		icon?: IconSource;
	}

	export interface BreadcrumbSlots {
		root?: string;
		list?: string;
		item?: string;
		link?: string;
		current?: string;
		separator?: string;
	}

	export interface BreadcrumbProps {
		items: BreadcrumbItem[];
		separator?: IconSource;
		class?: string;
		ui?: BreadcrumbSlots;
	}
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import { cn } from '../../utils/cn';

	let { items, separator = 'chevron-right', class: className = '', ui }: BreadcrumbProps = $props();
</script>

<nav aria-label="Breadcrumb" data-slot="root" class={cn('flex', className, ui?.root)}>
	<ol
		data-slot="list"
		class={cn(
			'inline-flex items-center space-x-1.5 text-sm text-neutral-500 md:space-x-2 dark:text-neutral-400',
			ui?.list
		)}
	>
		{#each items as item, index (item.href ?? item.label ?? index)}
			{@const isLast = index === items.length - 1}
			<li data-slot="item" class={cn('inline-flex items-center', ui?.item)}>
				{#if index > 0}
					<Icon name={separator} size="xs" class={cn('mx-1 text-neutral-400', ui?.separator)} />
				{/if}

				{#if item.href && !isLast}
					<a
						href={item.href}
						data-slot="link"
						class={cn(
							'inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:outline-none dark:hover:text-white',
							ui?.link
						)}
					>
						{#if item.icon}
							<Icon name={item.icon} size="xs" />
						{/if}
						<span>{item.label}</span>
					</a>
				{:else}
					<span
						data-slot="current"
						class={cn(
							'inline-flex items-center gap-1.5 font-medium',
							isLast && 'text-neutral-900 dark:text-white',
							ui?.current
						)}
						aria-current={isLast ? 'page' : undefined}
					>
						{#if item.icon}
							<Icon name={item.icon} size="xs" />
						{/if}
						<span>{item.label}</span>
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
