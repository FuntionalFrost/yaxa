<script lang="ts">
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import { siteConfig } from '../../site.config';
</script>

<Seo
	config={siteConfig}
	title="Impressum / Legal Notice"
	description="Provider identification and legal disclosure pursuant to EU regulations (§ 5 TMG / DDG)."
/>

<LegalDocument type="impressum" lastUpdated="September 2026" />
