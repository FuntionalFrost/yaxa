<script module lang="ts">
	import { tv, cn, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const modalVariants = tv({
		base: 'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-neutral-800 dark:bg-neutral-900 yaxa-surface-elevated motion-reduce:transition-none',
		variants: {
			size: {
				sm: 'max-w-sm',
				md: 'max-w-lg',
				lg: 'max-w-2xl',
				xl: 'max-w-4xl',
				full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export interface ModalSlots {
		overlay?: string;
		content?: string;
		header?: string;
		title?: string;
		description?: string;
		body?: string;
		footer?: string;
		close?: string;
	}

	export type ModalProps = VariantProps<typeof modalVariants> & {
		open?: boolean;
		title?: string;
		description?: string;
		trigger?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		class?: string;
		ui?: ModalSlots;
	};
</script>

<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		trigger,
		header,
		footer,
		children,
		class: className = '',
		ui
	}: ModalProps = $props();
</script>

<Dialog.Root bind:open>
	{#if trigger}
		<Dialog.Trigger class="inline-flex">
			{@render trigger()}
		</Dialog.Trigger>
	{/if}

	<Dialog.Portal>
		<Dialog.Overlay
			data-slot="overlay"
			class={cn(
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs duration-200 motion-reduce:transition-none',
				ui?.overlay
			)}
		/>
		<Dialog.Content
			data-slot="content"
			class={cn(modalVariants({ size, class: className }), ui?.content)}
		>
			{#if header}
				<div data-slot="header" class={ui?.header}>
					{@render header()}
				</div>
			{:else if title || description}
				<div data-slot="header" class={cn('mb-4', ui?.header)}>
					{#if title}
						<Dialog.Title
							data-slot="title"
							class={cn('text-lg font-bold text-neutral-900 dark:text-white', ui?.title)}
						>
							{title}
						</Dialog.Title>
					{/if}
					{#if description}
						<Dialog.Description
							data-slot="description"
							class={cn('mt-1 text-sm text-neutral-500 dark:text-neutral-400', ui?.description)}
						>
							{description}
						</Dialog.Description>
					{/if}
				</div>
			{/if}

			{#if children}
				<div data-slot="body" class={cn('my-2', ui?.body)}>
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div data-slot="footer" class={cn('mt-6 flex justify-end gap-3', ui?.footer)}>
					{@render footer()}
				</div>
			{/if}

			<Dialog.Close
				data-slot="close"
				class={cn(
					'absolute top-4 right-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
					ui?.close
				)}
				aria-label="Close dialog"
			>
				<Icon name="cross" size="sm" />
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
