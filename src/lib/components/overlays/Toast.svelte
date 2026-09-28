<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { ToastItem } from '$lib/composables/useToast.svelte';

	export const toastVariants = tv({
		base: 'yaxa-toast group relative pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-200 select-none',
		variants: {
			variant: {
				soft: 'border',
				solid: 'border-transparent text-white',
				outline: 'border bg-white/95 dark:bg-neutral-900/95',
				subtle: 'border bg-white/95 dark:bg-neutral-900/95'
			},
			color: {
				neutral:
					'border-neutral-200 bg-white/95 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-50',
				primary: '',
				success: '',
				warning: '',
				error: '',
				info: '',
				loading:
					'border-neutral-200 bg-white/95 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-50'
			}
		},
		compoundVariants: [
			// Soft
			{
				variant: 'soft',
				color: 'primary',
				class:
					'border-primary-200 bg-primary-50/90 text-primary-950 dark:border-primary-900/50 dark:bg-primary-950/80 dark:text-primary-100'
			},
			{
				variant: 'soft',
				color: 'success',
				class:
					'border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-100'
			},
			{
				variant: 'soft',
				color: 'warning',
				class:
					'border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-100'
			},
			{
				variant: 'soft',
				color: 'error',
				class:
					'border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-100'
			},
			{
				variant: 'soft',
				color: 'info',
				class:
					'border-sky-200 bg-sky-50/90 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/80 dark:text-sky-100'
			},
			// Solid
			{
				variant: 'solid',
				color: 'primary',
				class: 'bg-primary-600 text-white'
			},
			{
				variant: 'solid',
				color: 'success',
				class: 'bg-emerald-600 text-white'
			},
			{
				variant: 'solid',
				color: 'warning',
				class: 'bg-amber-600 text-white'
			},
			{
				variant: 'solid',
				color: 'error',
				class: 'bg-rose-600 text-white'
			},
			{
				variant: 'solid',
				color: 'info',
				class: 'bg-sky-600 text-white'
			},
			{
				variant: 'solid',
				color: 'neutral',
				class: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
			},
			// Outline
			{
				variant: 'outline',
				color: 'primary',
				class: 'border-primary-500 text-primary-600 dark:text-primary-400'
			},
			{
				variant: 'outline',
				color: 'success',
				class: 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
			},
			{
				variant: 'outline',
				color: 'warning',
				class: 'border-amber-500 text-amber-600 dark:text-amber-400'
			},
			{
				variant: 'outline',
				color: 'error',
				class: 'border-rose-500 text-rose-600 dark:text-rose-400'
			},
			{
				variant: 'outline',
				color: 'info',
				class: 'border-sky-500 text-sky-600 dark:text-sky-400'
			},
			{
				variant: 'outline',
				color: 'neutral',
				class: 'border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
			}
		],
		defaultVariants: {
			variant: 'soft',
			color: 'neutral'
		}
	});

	export type ToastProps = VariantProps<typeof toastVariants> & {
		item: ToastItem;
		closable?: boolean;
		onclose?: (id: string | number) => void;
		onpause?: (id: string | number) => void;
		onresume?: (id: string | number) => void;
		class?: string;
	};
</script>

<script lang="ts">
	import { toast } from '$lib/composables/useToast.svelte';
	import Icon, { type IconSource } from '../elements/Icon.svelte';
	import Spinner from '../elements/Spinner.svelte';
	import Button from '../elements/Button.svelte';

	let {
		item,
		closable = true,
		onclose,
		onpause,
		onresume,
		class: className = ''
	}: ToastProps = $props();

	let isClosable = $derived(item.closable !== undefined ? item.closable : closable);

	let defaultIcon = $derived.by<IconSource | null>(() => {
		if (item.icon) return item.icon;
		switch (item.color) {
			case 'success':
				return 'check';
			case 'warning':
			case 'error':
				return 'alert';
			case 'info':
				return 'info';
			default:
				return null;
		}
	});

	let isAlert = $derived(item.color === 'error' || item.color === 'warning');

	function handleClose() {
		if (onclose) {
			onclose(item.id);
		} else {
			toast.dismiss(item.id);
		}
	}

	function handleMouseEnter() {
		if (onpause) {
			onpause(item.id);
		} else {
			toast.pause(item.id);
		}
	}

	function handleMouseLeave() {
		if (onresume) {
			onresume(item.id);
		} else {
			toast.resume(item.id);
		}
	}
</script>

<div
	role={isAlert ? 'alert' : 'status'}
	aria-live={isAlert ? 'assertive' : 'polite'}
	aria-atomic="true"
	class={toastVariants({
		variant: item.variant ?? 'soft',
		color: item.color ?? 'neutral',
		class: className
	})}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<!-- Status Icon or Loading Spinner or Avatar -->
	{#if item.color === 'loading'}
		<div class="mt-0.5 shrink-0 text-current">
			<Spinner size="sm" />
		</div>
	{:else if item.avatar}
		<img
			src={item.avatar.src}
			alt={item.avatar.alt ?? ''}
			class="h-6 w-6 shrink-0 rounded-full object-cover"
		/>
	{:else if defaultIcon}
		<div class="mt-0.5 shrink-0">
			<Icon name={defaultIcon} size="sm" />
		</div>
	{/if}

	<!-- Content Area -->
	<div class="min-w-0 flex-1">
		{#if item.title}
			<div class="text-sm leading-tight font-semibold">{item.title}</div>
		{/if}

		{#if item.description}
			<div class="mt-1 text-xs leading-relaxed opacity-90">{item.description}</div>
		{/if}

		{#if item.snippet}
			<div class="mt-2 text-xs">
				{@render item.snippet()}
			</div>
		{/if}

		<!-- Custom Action & Cancel Buttons -->
		{#if item.actions && item.actions.length > 0}
			<div class="mt-3 flex flex-wrap items-center gap-2">
				{#each item.actions as act, i (`${act.label}-${i}`)}
					<Button
						size="xs"
						variant={act.variant ?? 'solid'}
						color={act.color ?? 'neutral'}
						onclick={() => {
							act.onClick?.();
							handleClose();
						}}
					>
						{act.label}
					</Button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Close Button -->
	{#if isClosable}
		<button
			type="button"
			class="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-current/30 focus:outline-none"
			aria-label="Close notification"
			onclick={handleClose}
		>
			<Icon name="cross" size="xs" />
		</button>
	{/if}

	<!-- Micro Duration Countdown Progress Bar -->
	{#if item.progress && item.duration > 0 && item.duration < Infinity}
		<div class="absolute right-0 bottom-0 left-0 h-0.5 overflow-hidden bg-current/10">
			<div
				class="yaxa-toast-progress-bar h-full bg-current/40"
				style:animation-duration="{item.duration}ms"
				style:animation-play-state={item.paused ? 'paused' : 'running'}
			></div>
		</div>
	{/if}
</div>
