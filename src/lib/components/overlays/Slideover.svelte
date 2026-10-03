<script module lang="ts">
	import { tv, type VariantProps } from '../../utils/cn.js';
	import type { Snippet } from 'svelte';

	export const slideoverVariants = tv({
		base: 'fixed z-50 flex flex-col border-neutral-200 bg-white p-6 shadow-2xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900',
		variants: {
			side: {
				right:
					'inset-y-0 right-0 h-full w-full max-w-md border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0',
				left: 'inset-y-0 left-0 h-full w-full max-w-md border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
				top: 'inset-x-0 top-0 w-full max-h-[80vh] border-b data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0',
				bottom:
					'inset-x-0 bottom-0 w-full max-h-[80vh] rounded-t-2xl border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0'
			}
		},
		defaultVariants: {
			side: 'right'
		}
	});

	export type SlideoverProps = VariantProps<typeof slideoverVariants> & {
		open?: boolean;
		title?: string;
		description?: string;
		trigger?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';

	let {
		open = $bindable(false),
		side = 'right',
		title,
		description,
		trigger,
		header,
		footer,
		children,
		class: className = ''
	}: SlideoverProps = $props();
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
		<Dialog.Content class={slideoverVariants({ side, class: className })}>
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
				<div class="my-2 flex-1 overflow-y-auto">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div
					class="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
				>
					{@render footer()}
				</div>
			{/if}

			<Dialog.Close
				class="absolute top-4 right-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
				aria-label="Close slideover"
			>
				<Icon name="cross" size="sm" />
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
