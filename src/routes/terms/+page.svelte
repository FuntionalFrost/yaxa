<script lang="ts">
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import { siteConfig } from '../../site.config';
</script>

<Seo
	config={siteConfig}
	title="Terms of Service"
	description="Terms and conditions governing the use of Yaxa and our digital software services."
/>

<LegalDocument type="terms" lastUpdated="September 2026" />
