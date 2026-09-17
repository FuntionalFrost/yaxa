<script lang="ts">
	import type { SiteConfig } from '$lib/site/config';
	import { getSiteConfigGetter } from '$lib/site/context';

	interface Props {
		config?: SiteConfig;
		faviconSvg?: string;
		faviconPng32?: string;
		faviconPng16?: string;
		appleTouchIcon?: string;
		manifest?: string;
		browserConfig?: string;
		tileColor?: string;
	}

	let {
		config,
		faviconSvg = '/favicon.svg',
		faviconPng32,
		faviconPng16,
		appleTouchIcon,
		manifest,
		browserConfig,
		tileColor
	}: Props = $props();

	const getContextConfig = getSiteConfigGetter();
	let currentConfig = $derived(config || getContextConfig());
	let primaryColor = $derived(currentConfig.theme?.primaryColor || '#ff3e00');
	let resolvedTileColor = $derived(tileColor || primaryColor);
	let resolvedAppleTouchIcon = $derived(appleTouchIcon || currentConfig.seo?.appleTouchIcon);
</script>

<svelte:head>
	<!-- Standard & Scalable Vector Favicon -->
	{#if faviconSvg}
		<link rel="icon" type="image/svg+xml" href={faviconSvg} />
		<link rel="mask-icon" href={faviconSvg} color={primaryColor} />
	{/if}

	{#if faviconPng32}
		<link rel="alternate icon" type="image/png" sizes="32x32" href={faviconPng32} />
	{/if}
	{#if faviconPng16}
		<link rel="alternate icon" type="image/png" sizes="16x16" href={faviconPng16} />
	{/if}

	<!-- Apple Touch Icon -->
	{#if resolvedAppleTouchIcon}
		<link rel="apple-touch-icon" sizes="180x180" href={resolvedAppleTouchIcon} />
	{/if}

	<!-- Web Manifest -->
	{#if manifest}
		<link rel="manifest" href={manifest} />
	{/if}

	<!-- Mobile Browser Chrome & Theme Colors (Adaptive Dark / Light) -->
	<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b" />
	<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
	<meta name="theme-color" content={primaryColor} />

	<!-- Apple Mobile Web App Settings -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-title" content={currentConfig.name} />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />

	<!-- Microsoft Windows Tile -->
	<meta name="msapplication-TileColor" content={resolvedTileColor} />
	{#if browserConfig}
		<meta name="msapplication-config" content={browserConfig} />
	{/if}
</svelte:head>
