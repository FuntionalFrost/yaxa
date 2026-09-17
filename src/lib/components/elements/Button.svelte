<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import type { IconSource } from './Icon.svelte';

	export const buttonVariants = tv({
		base: 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none active:scale-[0.98]',
		variants: {
			variant: {
				solid: 'shadow-xs text-white',
				outline: 'border bg-transparent shadow-xs',
				soft: '',
				subtle: 'border',
				ghost: 'bg-transparent',
				link: 'p-0 underline-offset-4 hover:underline'
			},
			color: {
				primary: '',
				neutral: '',
				success: '',
				warning: '',
				error: ''
			},
			size: {
				xs: 'text-xs px-2 py-1 gap-1 rounded-md',
				sm: 'text-sm px-2.5 py-1.5 gap-1.5 rounded-md',
				md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
				lg: 'text-base px-4 py-2.5 gap-2 rounded-lg',
				xl: 'text-base px-5 py-3 gap-2.5 rounded-xl'
			},
			block: {
				true: 'w-full'
			},
			square: {
				true: 'aspect-square p-0'
			}
		},
		compoundVariants: [
			// Solid
			{
				variant: 'solid',
				color: 'primary',
				class:
					'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 focus-visible:ring-primary-500'
			},
			{
				variant: 'solid',
				color: 'neutral',
				class:
					'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 focus-visible:ring-neutral-400'
			},
			{
				variant: 'solid',
				color: 'success',
				class: 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500'
			},
			{
				variant: 'solid',
				color: 'warning',
				class: 'bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-500'
			},
			{
				variant: 'solid',
				color: 'error',
				class: 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-500'
			},

			// Outline
			{
				variant: 'outline',
				color: 'primary',
				class:
					'border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 focus-visible:ring-primary-500'
			},
			{
				variant: 'outline',
				color: 'neutral',
				class:
					'border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-400'
			},
			{
				variant: 'outline',
				color: 'success',
				class:
					'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus-visible:ring-emerald-500'
			},
			{
				variant: 'outline',
				color: 'warning',
				class:
					'border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 focus-visible:ring-amber-500'
			},
			{
				variant: 'outline',
				color: 'error',
				class:
					'border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus-visible:ring-rose-500'
			},

			// Soft
			{
				variant: 'soft',
				color: 'primary',
				class:
					'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/50 focus-visible:ring-primary-500'
			},
			{
				variant: 'soft',
				color: 'neutral',
				class:
					'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 focus-visible:ring-neutral-400'
			},
			{
				variant: 'soft',
				color: 'success',
				class:
					'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 focus-visible:ring-emerald-500'
			},
			{
				variant: 'soft',
				color: 'warning',
				class:
					'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/50 focus-visible:ring-amber-500'
			},
			{
				variant: 'soft',
				color: 'error',
				class:
					'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/50 focus-visible:ring-rose-500'
			},

			// Subtle
			{
				variant: 'subtle',
				color: 'primary',
				class:
					'border-primary-200 bg-primary-50/50 text-primary-700 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/50'
			},
			{
				variant: 'subtle',
				color: 'neutral',
				class:
					'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
			},

			// Ghost
			{
				variant: 'ghost',
				color: 'primary',
				class:
					'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/50 focus-visible:ring-primary-500'
			},
			{
				variant: 'ghost',
				color: 'neutral',
				class:
					'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-400'
			},
			{
				variant: 'ghost',
				color: 'error',
				class:
					'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 focus-visible:ring-rose-500'
			},

			// Link
			{
				variant: 'link',
				color: 'primary',
				class: 'text-primary-600 dark:text-primary-400'
			},
			{
				variant: 'link',
				color: 'neutral',
				class: 'text-neutral-700 dark:text-neutral-300'
			},

			// Square sizes
			{ square: true, size: 'xs', class: 'w-6 h-6' },
			{ square: true, size: 'sm', class: 'w-8 h-8' },
			{ square: true, size: 'md', class: 'w-9 h-9' },
			{ square: true, size: 'lg', class: 'w-10 h-10' },
			{ square: true, size: 'xl', class: 'w-12 h-12' }
		],
		defaultVariants: {
			variant: 'solid',
			color: 'primary',
			size: 'md',
			block: false,
			square: false
		}
	});

	export type ButtonProps = VariantProps<typeof buttonVariants> & {
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		as?: 'button' | 'a' | 'span' | 'div';
		disabled?: boolean;
		loading?: boolean;
		icon?: IconSource;
		trailingIcon?: IconSource;
		leading?: Snippet;
		trailing?: Snippet;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import Spinner from './Spinner.svelte';
	import Icon from './Icon.svelte';

	let {
		type = 'button',
		href,
		as = 'button',
		variant = 'solid',
		color = 'primary',
		size = 'md',
		block = false,
		square = false,
		disabled = false,
		loading = false,
		icon,
		trailingIcon,
		leading,
		trailing,
		children,
		onclick,
		class: className = '',
		...restProps
	}: ButtonProps = $props();

	const classes = $derived(
		buttonVariants({
			variant,
			color,
			size,
			block,
			square,
			class: className
		})
	);
</script>

{#if as === 'span'}
	<span class={classes} aria-disabled={disabled || loading} {onclick} {...restProps}>
		{#if loading}
			<Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
		{:else if leading}
			{@render leading()}
		{:else if icon}
			<Icon name={icon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}

		{#if children}
			{@render children()}
		{/if}

		{#if trailing}
			{@render trailing()}
		{:else if trailingIcon}
			<Icon name={trailingIcon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}
	</span>
{:else if as === 'div'}
	<div class={classes} aria-disabled={disabled || loading} {onclick} {...restProps}>
		{#if loading}
			<Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
		{:else if leading}
			{@render leading()}
		{:else if icon}
			<Icon name={icon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}

		{#if children}
			{@render children()}
		{/if}

		{#if trailing}
			{@render trailing()}
		{:else if trailingIcon}
			<Icon name={trailingIcon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}
	</div>
{:else if href || as === 'a'}
	<a
		{href}
		class={classes}
		aria-disabled={disabled || loading}
		{onclick}
		{...restProps as HTMLAnchorAttributes}
	>
		{#if loading}
			<Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
		{:else if leading}
			{@render leading()}
		{:else if icon}
			<Icon name={icon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}

		{#if children}
			{@render children()}
		{/if}

		{#if trailing}
			{@render trailing()}
		{:else if trailingIcon}
			<Icon name={trailingIcon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}
	</a>
{:else}
	<button
		{type}
		class={classes}
		disabled={disabled || loading}
		{onclick}
		{...restProps as HTMLButtonAttributes}
	>
		{#if loading}
			<Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
		{:else if leading}
			{@render leading()}
		{:else if icon}
			<Icon name={icon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}

		{#if children}
			{@render children()}
		{/if}

		{#if trailing}
			{@render trailing()}
		{:else if trailingIcon}
			<Icon name={trailingIcon} size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} />
		{/if}
	</button>
{/if}
