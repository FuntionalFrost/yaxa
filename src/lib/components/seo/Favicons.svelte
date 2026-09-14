<script lang="ts">
	import type { SiteConfig } from '$lib/site/config';
	import { getSiteConfig } from '$lib/site/context';

	interface Props {
		config?: SiteConfig;
		faviconSvg?: string;
		appleTouchIcon?: string;
		tileColor?: string;
	}

	let {
		config,
		faviconSvg = '/favicon.svg',
		appleTouchIcon = '/apple-touch-icon.png',
		tileColor
	}: Props = $props();

	let currentConfig = $derived(config || getSiteConfig());
	let primaryColor = $derived(currentConfig.theme?.primaryColor || '#ff3e00');
	let resolvedTileColor = $derived(tileColor || primaryColor);
</script>

<svelte:head>
	<!-- Standard & Scalable Vector Favicon -->
	<link rel="icon" type="image/svg+xml" href={faviconSvg} />
	<link rel="alternate icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="alternate icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

	<!-- Apple Touch Icon & Safari Pinned Tab -->
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
	<link rel="mask-icon" href={faviconSvg} color={primaryColor} />

	<!-- Web Manifest -->
	<link rel="manifest" href="/site.webmanifest" />

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
	<meta name="msapplication-config" content="/browserconfig.xml" />
</svelte:head>
