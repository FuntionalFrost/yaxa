<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const drawerVariants = tv({
		base: 'fixed z-50 overflow-y-auto border border-neutral-200 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900',
		variants: {
			responsive: {
				true: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
				false:
					'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
			}
		},
		defaultVariants: {
			responsive: true
		}
	});

	export type DrawerProps = VariantProps<typeof drawerVariants> & {
		open?: boolean;
		title?: string;
		description?: string;
		trigger?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		showHandle?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';

	let {
		open = $bindable(false),
		title,
		description,
		responsive = true,
		showHandle = true,
		trigger,
		header,
		footer,
		children,
		class: className = ''
	}: DrawerProps = $props();
</script>

<Dialog.Root bind:open>
	{#if trigger}
		<Dialog.Trigger class="inline-flex">
			{@render trigger()}
		</Dialog.Trigger>
	{/if}

	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs duration-300"
		/>
		<Dialog.Content class={drawerVariants({ responsive, class: className })}>
			{#if showHandle}
				<div class="mb-4 flex justify-center md:hidden">
					<div class="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
				</div>
			{/if}

			{#if header}
				{@render header()}
			{:else if title || description}
				<div class="mb-4">
					{#if title}
						<Dialog.Title class="text-lg font-bold text-neutral-900 dark:text-white">
							{title}
						</Dialog.Title>
					{/if}
					{#if description}
						<Dialog.Description class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
							{description}
						</Dialog.Description>
					{/if}
				</div>
			{/if}

			{#if children}
				<div class="my-2">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="mt-6 flex items-center justify-end gap-3">
					{@render footer()}
				</div>
			{/if}

			<Dialog.Close
				class="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
				aria-label="Close"
			>
				<Icon name="cross" size="xs" />
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
