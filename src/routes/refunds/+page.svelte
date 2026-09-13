<script lang="ts">
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import { siteConfig } from '../../site.config';
</script>

<Seo
	config={siteConfig}
	title="Cancellation & Refund Policy"
	description="Our transparent 14-day money-back guarantee, self-serve cancellation terms, and EU statutory withdrawal rights."
/>

<LegalDocument type="refunds" lastUpdated="September 2026" />
