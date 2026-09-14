<script lang="ts">
	import { page } from '$app/state';
	import { computeProjectBadge, type SiteConfig } from '$lib/site/config';
	import { getSiteConfig } from '$lib/site/context';
	import { generateWebSiteSchema } from '$lib/site/schema';

	interface Props {
		title?: string;
		description?: string;
		canonical?: string;
		ogImage?:
			string | { title?: string; description?: string; badge?: string; theme?: 'dark' | 'light' };
		twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
		noindex?: boolean;
		nofollow?: boolean;
		keywords?: string[];
		schema?: Record<string, unknown> | Record<string, unknown>[];
		config?: SiteConfig;
	}

	let {
		title: propTitle,
		description: propDescription,
		canonical: propCanonical,
		ogImage: propOgImage,
		twitterCard = 'summary_large_image',
		noindex = false,
		nofollow = false,
		keywords: propKeywords,
		schema,
		config: propConfig
	}: Props = $props();

	// Read config from prop or Svelte 5 context
	let config = $derived(propConfig || getSiteConfig());

	// Dynamic resolution from props OR SvelteKit page.data (e.g. +page.server.ts load data)
	let pageData = $derived(page.data || {});
	let pageSeo = $derived((pageData.seo as Record<string, unknown>) || {});

	let resolvedTitle = $derived(
		propTitle ||
			(pageSeo.title as string) ||
			(pageData.title as string) ||
			config.title ||
			config.name
	);

	let fullTitle = $derived.by(() => {
		if (propTitle || pageSeo.title || pageData.title) {
			const activeTitle = (propTitle || pageSeo.title || pageData.title) as string;
			if (config.seo?.titleTemplate) {
				return config.seo.titleTemplate.replace('%s', activeTitle);
			}
			return `${activeTitle} · ${config.name}`;
		}
		return config.title || config.name;
	});

	let metaDescription = $derived(
		propDescription ||
			(pageSeo.description as string) ||
			(pageData.description as string) ||
			config.description
	);

	let currentUrl = $derived.by(() => {
		if (propCanonical) return propCanonical;
		try {
			return `${config.url}${page.url.pathname}`;
		} catch {
			return config.url;
		}
	});

	let ogImage = $derived(propOgImage || pageSeo.ogImage || pageData.ogImage);

	let resolvedOgImageUrl = $derived.by(() => {
		if (typeof ogImage === 'string') {
			return ogImage.startsWith('http') ? ogImage : `${config.url}${ogImage}`;
		}
		if (typeof ogImage === 'object' && ogImage !== null) {
			const pairs: string[] = [];
			const img = ogImage as {
				title?: string;
				description?: string;
				badge?: string;
				theme?: 'dark' | 'light';
			};
			if (img.title) pairs.push(`title=${encodeURIComponent(img.title)}`);
			if (img.description) pairs.push(`description=${encodeURIComponent(img.description)}`);
			if (img.badge) {
				pairs.push(`badge=${encodeURIComponent(img.badge)}`);
			} else if (config.project) {
				pairs.push(`badge=${encodeURIComponent(computeProjectBadge(config.project))}`);
			}
			if (img.theme) pairs.push(`theme=${encodeURIComponent(img.theme)}`);
			return `${config.url}/api/og?${pairs.join('&')}`;
		}
		if (resolvedTitle && resolvedTitle !== config.name) {
			const pairs: string[] = [
				`title=${encodeURIComponent(resolvedTitle)}`,
				`description=${encodeURIComponent(metaDescription)}`
			];
			if (config.project) {
				pairs.push(`badge=${encodeURIComponent(computeProjectBadge(config.project))}`);
			}
			return `${config.url}/api/og?${pairs.join('&')}`;
		}
		return `${config.url}${config.seo?.defaultOgImage || '/api/og'}`;
	});

	let robotsContent = $derived.by(() => {
		const parts: string[] = [];
		if (noindex || pageSeo.noindex) parts.push('noindex');
		else parts.push('index');

		if (nofollow || pageSeo.nofollow) parts.push('nofollow');
		else parts.push('follow');

		return parts.join(', ');
	});

	let keywords = $derived(
		propKeywords || (pageSeo.keywords as string[]) || config.seo?.keywords || []
	);

	let jsonLdSchemas = $derived.by(() => {
		const schemas: Record<string, unknown>[] = [generateWebSiteSchema(config)];
		if (schema) {
			if (Array.isArray(schema)) {
				schemas.push(...schema);
			} else {
				schemas.push(schema);
			}
		}
		return schemas;
	});
</script>

<svelte:head>
	<!-- Standard Metadata -->
	<title>{fullTitle}</title>
	<meta name="description" content={metaDescription} />
	{#if keywords && keywords.length > 0}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	<link rel="canonical" href={currentUrl} />
	<meta name="robots" content={robotsContent} />
	<meta name="theme-color" content={config.theme?.primaryColor || '#ff3e00'} />
	{#if config.project?.license}
		<meta name="project:license" content={config.project.license} />
	{/if}
	{#if config.project?.type}
		<meta name="project:type" content={config.project.type} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:image" content={resolvedOgImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content={config.name} />
	<meta property="og:locale" content={config.defaultLocale || 'en'} />

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={resolvedOgImageUrl} />
	{#if config.author?.twitter}
		<meta name="twitter:creator" content={config.author.twitter} />
	{/if}

	<!-- Schema.org JSON-LD -->
	{#each jsonLdSchemas as schemaItem}
		{@html `<script type="application/ld+json">${JSON.stringify(schemaItem)}</` + `script>`}
	{/each}
</svelte:head>
