<script module lang="ts">
	import type { Component, Snippet } from 'svelte';

	export type IconSource =
		string | Component<{ class?: string; size?: string | number; [key: string]: any }>;

	export interface IconProps {
		name?: IconSource;
		icon?: IconSource;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	let {
		name,
		icon,
		size = 'md',
		class: className = '',
		children,
		...restProps
	}: IconProps = $props();

	let sizeClass = $derived.by(() => {
		if (typeof size === 'number') return `w-[${size}px] h-[${size}px]`;
		switch (size) {
			case 'xs':
				return 'w-3.5 h-3.5';
			case 'sm':
				return 'w-4 h-4';
			case 'lg':
				return 'w-6 h-6';
			case 'xl':
				return 'w-8 h-8';
			case 'md':
			default:
				return 'w-5 h-5';
		}
	});

	let IconComponent = $derived.by(() => {
		if (icon && typeof icon !== 'string') return icon;
		if (name && typeof name !== 'string') return name;
		return null;
	});

	let stringIconName = $derived.by(() => {
		if (typeof icon === 'string') return icon;
		if (typeof name === 'string') return name;
		return null;
	});

	// Common built-in SVGs for immediate zero-config use
	const builtInIcons: Record<string, string> = {
		check:
			'<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		cross:
			'<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		'chevron-down':
			'<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		'chevron-up':
			'<path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		'chevron-right':
			'<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		'chevron-left':
			'<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		search:
			'<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		sun: '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
		moon: '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		computer:
			'<rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>',
		sparkles:
			'<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
		info: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
		alert:
			'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		'external-link':
			'<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		copy: '<rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
		github:
			'<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		twitter:
			'<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
		lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
	};
</script>

{#if children}
	<span class="inline-flex shrink-0 items-center justify-center {sizeClass} {className}">
		{@render children()}
	</span>
{:else if IconComponent}
	{@const RenderIcon = IconComponent}
	<RenderIcon
		class="inline-flex shrink-0 items-center justify-center {sizeClass} {className}"
		{...restProps}
	/>
{:else if stringIconName && builtInIcons[stringIconName]}
	<svg
		class="inline-flex shrink-0 items-center justify-center {sizeClass} {className}"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
		{...restProps}
	>
		{@html builtInIcons[stringIconName]}
	</svg>
{:else}
	<svg
		class="inline-flex shrink-0 items-center justify-center {sizeClass} {className}"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
		{...restProps}
	>
		<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
	</svg>
{/if}
