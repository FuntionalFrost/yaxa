<script module lang="ts">
	import { tv, type VariantProps } from '../../utils/cn.js';

	export const avatarVariants = tv({
		base: 'relative inline-flex shrink-0 items-center justify-center font-medium select-none overflow-hidden rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
		variants: {
			size: {
				xs: 'h-6 w-6 text-[10px]',
				sm: 'h-8 w-8 text-xs',
				md: 'h-10 w-10 text-sm',
				lg: 'h-12 w-12 text-base',
				xl: 'h-14 w-14 text-lg',
				'2xl': 'h-16 w-16 text-xl'
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export type AvatarProps = VariantProps<typeof avatarVariants> & {
		src?: string;
		alt?: string;
		text?: string;
		fallback?: string;
		presence?: 'online' | 'busy' | 'away' | 'offline';
		class?: string;
	};
</script>

<script lang="ts">
	let {
		src,
		alt = 'Avatar',
		text,
		fallback,
		presence,
		size = 'md',
		class: className = ''
	}: AvatarProps = $props();

	let hasError = $state(false);

	let initials = $derived.by(() => {
		if (fallback) return fallback;
		if (text) return text.slice(0, 2).toUpperCase();
		if (alt) {
			const parts = alt.split(' ');
			if (parts.length > 1) {
				return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
			}
			return alt.slice(0, 2).toUpperCase();
		}
		return '?';
	});

	let presenceColor = $derived.by(() => {
		switch (presence) {
			case 'online':
				return 'bg-emerald-500';
			case 'busy':
				return 'bg-rose-500';
			case 'away':
				return 'bg-amber-500';
			case 'offline':
			default:
				return 'bg-neutral-400';
		}
	});

	let presenceSize = $derived.by(() => {
		switch (size) {
			case 'xs':
			case 'sm':
				return 'h-2 w-2 ring-1';
			case 'lg':
			case 'xl':
			case '2xl':
				return 'h-3.5 w-3.5 ring-2';
			case 'md':
			default:
				return 'h-2.5 w-2.5 ring-2';
		}
	});
</script>

<div class={avatarVariants({ size, class: className })}>
	{#if src && !hasError}
		<img
			{src}
			{alt}
			class="h-full w-full object-cover"
			onerror={() => {
				hasError = true;
			}}
		/>
	{:else}
		<span>{initials}</span>
	{/if}

	{#if presence}
		<span
			class="absolute right-0 bottom-0 rounded-full ring-white dark:ring-neutral-900 {presenceColor} {presenceSize}"
		></span>
	{/if}
</div>
