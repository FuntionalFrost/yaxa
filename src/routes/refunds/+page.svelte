<script lang="ts">
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import Alert from '$lib/components/overlays/Alert.svelte';
	import Container from '$lib/components/layout/Container.svelte';
	import { siteConfig } from '../../site.config';
</script>

<Seo
	config={siteConfig}
	title="Open Source & Refund Policy"
	description="Yaxa is 100% free and open-source software under the MIT License."
/>

<Container size="lg" class="pt-8">
	<Alert
		color="info"
		title="Open Source Software Notice"
		description="Yaxa is free and open-source software licensed under MIT. We do not charge subscription fees or collect payments. The refund terms below are provided as a live component template for SaaS builders utilizing Yaxa in commercial projects."
	/>
</Container>

<LegalDocument type="refunds" lastUpdated="September 2026" />
