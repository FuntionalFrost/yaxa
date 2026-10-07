<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const kbdVariants = tv({
		base: 'inline-flex items-center justify-center font-mono font-medium rounded border border-neutral-300 bg-neutral-100 text-neutral-700 shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 select-none',
		variants: {
			size: {
				xs: 'h-4 min-w-[16px] px-1 text-[10px]',
				sm: 'h-5 min-w-[20px] px-1.5 text-xs',
				md: 'h-6 min-w-[24px] px-2 text-xs',
				lg: 'h-7 min-w-[28px] px-2.5 text-sm'
			}
		},
		defaultVariants: {
			size: 'sm'
		}
	});

	export type KbdProps = VariantProps<typeof kbdVariants> & {
		value?: string;
		keys?: string[];
		combo?: string[] | string;
		class?: string;
		children?: Snippet;
	};

	const KEY_MAP: Record<string, { mac: string; default: string }> = {
		meta: { mac: '⌘', default: 'Ctrl' },
		cmd: { mac: '⌘', default: 'Ctrl' },
		command: { mac: '⌘', default: 'Ctrl' },
		ctrl: { mac: '⌃', default: 'Ctrl' },
		control: { mac: '⌃', default: 'Ctrl' },
		alt: { mac: '⌥', default: 'Alt' },
		option: { mac: '⌥', default: 'Alt' },
		shift: { mac: '⇧', default: 'Shift' },
		enter: { mac: '↵', default: 'Enter' },
		return: { mac: '↵', default: 'Enter' },
		backspace: { mac: '⌫', default: 'Backspace' },
		delete: { mac: '⌦', default: 'Del' },
		tab: { mac: '⇥', default: 'Tab' },
		esc: { mac: 'Esc', default: 'Esc' },
		escape: { mac: 'Esc', default: 'Esc' },
		up: { mac: '↑', default: '↑' },
		down: { mac: '↓', default: '↓' },
		left: { mac: '←', default: '←' },
		right: { mac: '→', default: '→' }
	};

	export function formatKbdKey(key: string, isApple: boolean): string {
		const k = key.trim().toLowerCase();
		if (KEY_MAP[k]) {
			return isApple ? KEY_MAP[k].mac : KEY_MAP[k].default;
		}
		return key.toUpperCase();
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';

	let { value, keys, combo, size = 'sm', class: className = '', children }: KbdProps = $props();

	function checkApplePlatform(): boolean {
		if (!browser) return false;
		const nav = window.navigator as { userAgentData?: { platform?: string }; platform?: string };
		const platform = nav.userAgentData?.platform || nav.platform || window.navigator.userAgent;
		return /Mac|iPhone|iPad|iPod/i.test(platform);
	}

	let isApple = $derived.by(() => checkApplePlatform());

	let resolvedKeys = $derived.by(() => {
		if (keys && keys.length > 0) return keys;
		if (Array.isArray(combo)) return combo;
		if (typeof combo === 'string') return combo.split('+').map((s) => s.trim());
		return [];
	});
</script>

{#if resolvedKeys.length > 0}
	<span class="inline-flex items-center gap-1">
		{#each resolvedKeys as k, i (i)}
			<kbd class={kbdVariants({ size, class: className })}>
				{formatKbdKey(k, isApple)}
			</kbd>
		{/each}
	</span>
{:else}
	<kbd class={kbdVariants({ size, class: className })}>
		{#if value}
			{KEY_MAP[value.trim().toLowerCase()] ? formatKbdKey(value, isApple) : value}
		{:else if children}
			{@render children()}
		{/if}
	</kbd>
{/if}
