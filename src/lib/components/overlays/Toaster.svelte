<script module lang="ts">
	import type { ToastPosition } from '../../composables/useToast.svelte.js';

	export interface ToasterProps {
		position?: ToastPosition;
		maxToasts?: number;
		richColors?: boolean;
		duration?: number;
		closeButton?: boolean;
		expand?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { toast } from '../../composables/useToast.svelte.js';
	import Toast from './Toast.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		position = 'top-right',
		maxToasts = 5,
		closeButton = true,
		class: className = '',
		...restProps
	}: ToasterProps = $props();

	let positionClasses = $derived.by(() => {
		switch (position) {
			case 'top-left':
				return 'top-4 left-4 items-start';
			case 'top-center':
				return 'top-4 left-1/2 -translate-x-1/2 items-center';
			case 'bottom-right':
				return 'bottom-4 right-4 items-end';
			case 'bottom-left':
				return 'bottom-4 left-4 items-start';
			case 'bottom-center':
				return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
			case 'top-right':
			default:
				return 'top-4 right-4 items-end';
		}
	});

	let yOffset = $derived(position.startsWith('top') ? -16 : 16);

	let visibleToasts = $derived.by(() => {
		const list = toast.toasts;
		if (list.length <= maxToasts) return list;
		return list.slice(list.length - maxToasts);
	});
</script>

{#if visibleToasts.length > 0}
	<div
		class="yaxa-toaster pointer-events-none fixed z-[9999] flex w-full max-w-md flex-col gap-2.5 p-4 sm:p-0 {positionClasses} {className}"
		aria-label="Notifications"
		data-rich-colors={restProps.richColors ?? true}
		data-expand={restProps.expand ?? false}
	>
		{#each visibleToasts as item (item.id)}
			<div
				transition:fly={{ y: yOffset, duration: 250, easing: cubicOut }}
				class="pointer-events-auto w-full max-w-sm"
			>
				<Toast {item} closable={closeButton} />
			</div>
		{/each}
	</div>
{/if}
