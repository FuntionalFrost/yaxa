<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { Tooltip } from 'bits-ui';
	import { type SiteConfig, DEFAULT_SITE_CONFIG } from '$lib/site/config';
	import { theme, themeInitScript } from '$lib/theme/theme.svelte';
	import Favicons from '../seo/Favicons.svelte';
	import Seo from '../seo/Seo.svelte';
	import { initYaxaState, type AuthUserContext } from '$lib/site/context';
	import '$lib/styles/yaxa.css';

	export interface YaxaAppProps {
		config?: SiteConfig;
		user?: AuthUserContext | null;
		enableDefaultSeo?: boolean;
		children?: Snippet;
	}

	export type Props = YaxaAppProps;

	let {
		config = DEFAULT_SITE_CONFIG,
		user = null,
		enableDefaultSeo = true,
		children
	}: YaxaAppProps = $props();

	// Initialize SSR-safe reactive state container for descendant components
	initYaxaState(
		() => config,
		() => user
	);

	const scriptTag = `<script>${themeInitScript}</` + `script>`;
</script>

<svelte:head>
	{@html scriptTag}
</svelte:head>

{#if enableDefaultSeo}
	<Seo {config} />
{/if}
<Favicons {config} />

<Tooltip.Provider delayDuration={200}>
	<div
		class="flex min-h-screen flex-col bg-white text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-50"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</Tooltip.Provider>

<!-- Global Toast Container with dynamic theme synchronization -->
<Toaster richColors theme={theme.resolvedTheme} position="top-right" closeButton />
