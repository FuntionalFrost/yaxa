<script lang="ts">
	import type { PageProps } from './$types';
	import DocIntro from '../_sections/DocIntro.svelte';
	import DocInstall from '../_sections/DocInstall.svelte';
	import DocConfig from '../_sections/DocConfig.svelte';
	import DocStaticSites from '../_sections/DocStaticSites.svelte';
	import DocSeoOg from '../_sections/DocSeoOg.svelte';
	import DocSeoRobots from '../_sections/DocSeoRobots.svelte';
	import DocButtons from '../_sections/DocButtons.svelte';
	import DocForms from '../_sections/DocForms.svelte';
	import DocOverlays from '../_sections/DocOverlays.svelte';
	import DocSaasSuite from '../_sections/DocSaasSuite.svelte';
	import DocLegal from '../_sections/DocLegal.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';

	let { data }: PageProps = $props();

	const SECTION_MAP: Record<string, any> = {
		intro: DocIntro,
		install: DocInstall,
		config: DocConfig,
		'static-sites': DocStaticSites,
		'seo-og': DocSeoOg,
		'seo-robots': DocSeoRobots,
		'comp-buttons': DocButtons,
		'comp-forms': DocForms,
		'comp-overlays': DocOverlays,
		'saas-suite': DocSaasSuite,
		'legal-suite': DocLegal
	};

	let ActiveSectionComponent = $derived(SECTION_MAP[data.slug] ?? DocIntro);
</script>

<Seo
	title={data.title}
	description={data.description}
	ogImage={{
		title: data.doc.title,
		description: data.doc.description,
		badge: data.doc.category
	}}
/>

<ActiveSectionComponent />
