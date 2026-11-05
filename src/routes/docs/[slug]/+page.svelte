<script lang="ts">
	import type { PageProps } from './$types';
	import Seo from '#lib/components/seo/Seo.svelte';
	import { generateBreadcrumbSchema, generateArticleSchema } from '#lib/site/schema.js';
	import { siteConfig } from '../../../site.config';

	let { data }: PageProps = $props();

	let ActiveSectionComponent = $derived(data.component);

	let breadcrumbs = $derived(
		generateBreadcrumbSchema(siteConfig, [
			{ name: 'Home', url: '/' },
			{ name: 'Docs', url: '/docs/intro' },
			{ name: data.doc.label, url: `/docs/${data.slug}` }
		])
	);

	let techArticle = $derived(
		generateArticleSchema(siteConfig, {
			title: data.doc.title,
			description: data.doc.description,
			url: `${siteConfig.url}/docs/${data.slug}`,
			datePublished: '2026-01-01',
			dateModified: '2026-11-05'
		})
	);
</script>

<Seo
	title={data.title}
	description={data.description}
	ogImage={{
		title: data.doc.title,
		description: data.doc.description,
		badge: data.doc.category
	}}
	schema={[breadcrumbs, techArticle]}
/>

<ActiveSectionComponent />
