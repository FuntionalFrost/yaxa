<script module lang="ts">
	import { tv, type VariantProps } from '../../utils/cn.js';
	import type { Snippet } from 'svelte';
	import type { IconSource } from './Icon.svelte';

	export const badgeVariants = tv({
		base: 'inline-flex items-center font-medium select-none transition-colors duration-150',
		variants: {
			variant: {
				solid: 'text-white',
				outline: 'border bg-transparent',
				soft: '',
				subtle: 'border'
			},
			color: {
				primary: '',
				neutral: '',
				success: '',
				warning: '',
				error: '',
				info: ''
			},
			size: {
				xs: 'text-[10px] px-1.5 py-0.5 gap-1 rounded',
				sm: 'text-xs px-2.5 py-0.5 gap-1.5 rounded-md',
				md: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
				lg: 'text-sm px-3 py-1.5 gap-2 rounded-lg'
			}
		},
		compoundVariants: [
			// Solid
			{ variant: 'solid', color: 'primary', class: 'bg-primary-600' },
			{
				variant: 'solid',
				color: 'neutral',
				class: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900'
			},
			{ variant: 'solid', color: 'success', class: 'bg-emerald-600' },
			{ variant: 'solid', color: 'warning', class: 'bg-amber-600' },
			{ variant: 'solid', color: 'error', class: 'bg-rose-600' },
			{ variant: 'solid', color: 'info', class: 'bg-sky-600' },

			// Outline
			{
				variant: 'outline',
				color: 'primary',
				class: 'border-primary-500 text-primary-600 dark:text-primary-400'
			},
			{
				variant: 'outline',
				color: 'neutral',
				class: 'border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
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

			// Soft
			{
				variant: 'soft',
				color: 'primary',
				class: 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
			},
			{
				variant: 'soft',
				color: 'neutral',
				class: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
			},
			{
				variant: 'soft',
				color: 'success',
				class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
			},
			{
				variant: 'soft',
				color: 'warning',
				class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
			},
			{
				variant: 'soft',
				color: 'error',
				class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
			},
			{
				variant: 'soft',
				color: 'info',
				class: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
			},

			// Subtle
			{
				variant: 'subtle',
				color: 'primary',
				class:
					'border-primary-200 bg-primary-50/60 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300'
			},
			{
				variant: 'subtle',
				color: 'neutral',
				class:
					'border-neutral-200 bg-neutral-50 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200'
			},
			{
				variant: 'subtle',
				color: 'success',
				class:
					'border-emerald-200 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
			},
			{
				variant: 'subtle',
				color: 'warning',
				class:
					'border-amber-200 bg-amber-50/60 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
			},
			{
				variant: 'subtle',
				color: 'error',
				class:
					'border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
			},
			{
				variant: 'subtle',
				color: 'info',
				class:
					'border-sky-200 bg-sky-50/60 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
			}
		],
		defaultVariants: {
			variant: 'soft',
			color: 'primary',
			size: 'sm'
		}
	});

	export type BadgeProps = VariantProps<typeof badgeVariants> & {
		dot?: boolean;
		icon?: IconSource;
		class?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		variant = 'soft',
		color = 'primary',
		size = 'sm',
		dot = false,
		icon,
		class: className = '',
		children
	}: BadgeProps = $props();

	let classes = $derived(
		badgeVariants({
			variant,
			color,
			size,
			class: className
		})
	);
</script>

<span class={classes}>
	{#if dot}
		<span
			class="h-1.5 w-1.5 rounded-full {color === 'success'
				? 'bg-emerald-500'
				: color === 'warning'
					? 'bg-amber-500'
					: color === 'error'
						? 'bg-rose-500'
						: 'bg-primary-500'}"
		></span>
	{/if}

	{#if icon}
		<Icon name={icon} size={size === 'xs' ? 'xs' : 'sm'} />
	{/if}

	{#if children}
		{@render children()}
	{/if}
</span>
