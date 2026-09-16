<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocCodeBlock from '../_components/DocCodeBlock.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import LegalDocument from '$lib/components/legal/LegalDocument.svelte';

	let activeDocType = $state('privacy');

	const siteConfigSnippet = `// src/site.config.ts
import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
  name: 'CodeSnap',
  url: 'https://codesnap.dev',
  
  // ✉️ Solo Dev Single-Email (No company registration needed!)
  email: 'support@codesnap.dev',

  // 📦 Software Nature & Licensing
  project: {
    license: 'MIT',
    type: 'open-source',
    repositoryUrl: 'https://github.com/codesnap/codesnap'
  },

  // ⚖️ Legal & Integrations
  legal: {
    jurisdiction: 'EU',              // Enables EU withdrawal & ODR clauses
    paymentProcessor: 'polar',       // Injects Polar Merchant of Record & EU VAT handling
    adNetwork: 'ethicalads',         // Injects zero-cookie / zero-tracking disclosure
    refundDays: 14,                  // 14-day money-back guarantee
    links: {
      privacy: '/privacy',
      terms: '/terms',
      refunds: '/refunds',
      impressum: '/impressum'
    }
  }
});`;

	const dropinRouteSnippet =
		`<!-- src/routes/privacy/+page.svelte -->\n<` +
		`script lang="ts">\n  import { LegalDocument } from 'yaxa-svelte';\n<` +
		`/script>\n\n<LegalDocument type="privacy" lastUpdated="September 2026" />`;

	const footerSnippet =
		`<!-- src/routes/+layout.svelte -->\n<` +
		`script lang="ts">\n  import { Footer, YaxaApp } from 'yaxa-svelte';\n  import { siteConfig } from '../site.config';\n<` +
		`/script>\n\n<YaxaApp config={siteConfig}>\n  <!-- Main app content -->\n  <Footer />\n</YaxaApp>`;
</script>

<DocHeader
	title="Legal Suite, Impressum & Compliance"
	description="Turnkey GDPR Privacy Policies, Polar.sh Merchant of Record terms, EthicalAds zero-cookie disclosures, and EU Impressum provider identification."
	badge="Zero-Boilerplate"
	category="Solo SaaS Suite"
	importStatement={"import { LegalDocument, Footer } from 'yaxa-svelte';"}
/>

<div class="space-y-10">
	<!-- Interactive Preview Sandbox -->
	<DocSandbox title="Interactive Legal Document Preview">
		<div class="w-full space-y-6">
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {activeDocType ===
					'privacy'
						? 'bg-primary-600 text-white'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}"
					onclick={() => (activeDocType = 'privacy')}
				>
					Privacy Policy
				</button>
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {activeDocType ===
					'terms'
						? 'bg-primary-600 text-white'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}"
					onclick={() => (activeDocType = 'terms')}
				>
					Terms of Service
				</button>
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {activeDocType ===
					'refunds'
						? 'bg-primary-600 text-white'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}"
					onclick={() => (activeDocType = 'refunds')}
				>
					Cancellation & Refunds
				</button>
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {activeDocType ===
					'impressum'
						? 'bg-primary-600 text-white'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}"
					onclick={() => (activeDocType = 'impressum')}
				>
					EU Impressum
				</button>
			</div>

			<div
				class="max-h-[460px] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
			>
				<LegalDocument type={activeDocType as any} lastUpdated="September 2026" />
			</div>
		</div>
	</DocSandbox>

	<!-- Setup Guide -->
	<div class="space-y-4">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">
			1. Define Company & Legal in `site.config.ts`
		</h3>
		<p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
			Provide your entity details, payment processor, and ad network in <code
				class="font-mono text-primary-600 dark:text-primary-400">src/site.config.ts</code
			>. All values automatically propagate to your footer, JSON-LD Schema, and legal pages:
		</p>
		<DocCodeBlock code={siteConfigSnippet} filename="src/site.config.ts" language="typescript" />
	</div>

	<!-- Drop-in Pages -->
	<div class="space-y-4">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">2. Drop-in Legal Routes</h3>
		<p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
			Create routes in <code class="font-mono text-primary-600 dark:text-primary-400"
				>src/routes/privacy/+page.svelte</code
			>,
			<code class="font-mono text-primary-600 dark:text-primary-400"
				>src/routes/terms/+page.svelte</code
			>, etc., using the
			<code class="font-mono text-primary-600 dark:text-primary-400">&lt;LegalDocument /&gt;</code> component:
		</p>
		<DocCodeBlock
			code={dropinRouteSnippet}
			filename="src/routes/privacy/+page.svelte"
			language="svelte"
		/>
	</div>

	<!-- Footer Integration -->
	<div class="space-y-4">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">
			3. Automated Footer Identification
		</h3>
		<p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
			The <code class="font-mono text-primary-600 dark:text-primary-400">&lt;Footer /&gt;</code> component
			automatically reads your legal settings and renders the entity identification bar, MoR notice, and
			policy links:
		</p>
		<DocCodeBlock code={footerSnippet} filename="src/routes/+layout.svelte" language="svelte" />
	</div>
</div>
