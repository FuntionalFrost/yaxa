<script module lang="ts">
	import type { IconSource } from '../elements/Icon.svelte';

	export interface AccordionItem {
		value: string;
		title: string;
		content?: string;
		icon?: IconSource;
		disabled?: boolean;
	}

	export interface AccordionSlots {
		root?: string;
		item?: string;
		header?: string;
		trigger?: string;
		title?: string;
		icon?: string;
		chevron?: string;
		content?: string;
	}

	export interface AccordionProps {
		items: AccordionItem[];
		type?: 'single' | 'multiple';
		class?: string;
		ui?: AccordionSlots;
	}
</script>

<script lang="ts">
	import { Accordion } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import { cn } from '../../utils/cn';

	let { items, type = 'single', class: className = '', ui }: AccordionProps = $props();
</script>

<Accordion.Root
	{type}
	data-slot="root"
	class={cn('w-full divide-y divide-neutral-200 dark:divide-neutral-800', className, ui?.root)}
>
	{#each items as item (item.value)}
		<Accordion.Item
			value={item.value}
			disabled={item.disabled}
			data-slot="item"
			class={cn('py-1', ui?.item)}
		>
			<Accordion.Header data-slot="header" class={ui?.header}>
				<Accordion.Trigger
					data-slot="trigger"
					class={cn(
						'flex w-full items-center justify-between rounded-md py-4 text-left text-sm font-medium text-neutral-900 transition-all hover:underline focus-visible:ring-2 focus-visible:ring-[var(--yaxa-ring)] focus-visible:outline-none motion-reduce:transition-none dark:text-white [&[data-state=open]>svg]:rotate-180',
						ui?.trigger
					)}
				>
					<div class="flex items-center gap-2.5">
						{#if item.icon}
							<Icon name={item.icon} size="xs" class={cn('text-neutral-500', ui?.icon)} />
						{/if}
						<span data-slot="title" class={ui?.title}>{item.title}</span>
					</div>
					<Icon
						name="chevron-down"
						size="xs"
						class={cn(
							'text-neutral-500 transition-transform duration-200 motion-reduce:transition-none',
							ui?.chevron
						)}
					/>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content
				data-slot="content"
				class={cn(
					'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden pb-4 text-sm text-neutral-600 motion-reduce:transition-none dark:text-neutral-400',
					ui?.content
				)}
			>
				{item.content}
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
