<script lang="ts">
	import type { PageProps } from './$types';
	import Seo from '$lib/components/seo/Seo.svelte';

	let { data }: PageProps = $props();

	let ActiveSectionComponent = $derived(data.component);
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

