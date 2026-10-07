<script module lang="ts">
	export interface TooltipSlots {
		trigger?: string;
		content?: string;
		arrow?: string;
	}

	export interface TooltipProps {
		text?: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		arrow?: boolean;
		unstyled?: boolean;
		trigger?: Snippet;
		content?: Snippet;
		children?: Snippet;
		class?: string;
		ui?: TooltipSlots;
	}
</script>

<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '../../utils/cn';

	let {
		text,
		side = 'top',
		arrow = true,
		unstyled = false,
		trigger,
		content,
		children,
		class: className = '',
		ui
	}: TooltipProps = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class={cn('inline-flex', ui?.trigger)} data-slot="trigger">
			{#snippet child({ props })}
				<span {...props} class="inline-flex">
					{#if trigger}
						{@render trigger()}
					{:else if children}
						{@render children()}
					{/if}
				</span>
			{/snippet}
		</Tooltip.Trigger>

		<Tooltip.Portal>
			<Tooltip.Content
				{side}
				sideOffset={6}
				data-slot="content"
				class={unstyled
					? cn(className, ui?.content)
					: cn(
							'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 overflow-hidden rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-md duration-150 motion-reduce:animate-none motion-reduce:transition-none dark:bg-neutral-100 dark:text-neutral-900',
							className,
							ui?.content
						)}
			>
				{#if content}
					{@render content()}
				{:else if text}
					{text}
				{/if}
				{#if arrow && !unstyled}
					<Tooltip.Arrow
						data-slot="arrow"
						class={cn('fill-neutral-900 dark:fill-neutral-100', ui?.arrow)}
					/>
				{/if}
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
