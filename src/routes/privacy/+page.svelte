<script lang="ts">
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import { siteConfig } from '../../site.config';
</script>

<Seo
	config={siteConfig}
	title="Privacy Policy"
	description="How Yaxa protects your data, upholds GDPR rights, and ensures zero-cookie privacy."
/>

<LegalDocument type="privacy" lastUpdated="September 2026" />
