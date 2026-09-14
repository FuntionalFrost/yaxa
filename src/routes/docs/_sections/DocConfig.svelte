<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocCodeBlock from '../_components/DocCodeBlock.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import { theme, ACCENT_PALETTES, NEUTRAL_PALETTES } from '$lib/theme/theme.svelte';

	let sampleName = $state('My SaaS App');
	let sampleUrl = $state('https://mysaas.com');
	let sampleEmail = $state('hello@mysaas.com');
	let sampleLicense = $state('MIT');
	let sampleType = $state('open-source');

	let generatedConfig = $derived(`import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
  name: '${sampleName}',
  title: '${sampleName} — Modern Web App',
  description: 'Built with Yaxa, SvelteKit, and Tailwind CSS v4.',
  url: '${sampleUrl}',
  // Single-email mode: Solo developers don't need to configure company info!
  email: '${sampleEmail}',
  
  // Software Nature & License (Accurate SEO & OpenGraph badge)
  project: {
    license: '${sampleLicense}',
    type: '${sampleType}',
    pricingModel: '${sampleType === 'open-source' ? 'open-source' : 'freemium'}',
    repositoryUrl: 'https://github.com/my-org/my-app'
  },

  theme: {
    primaryColor: '${ACCENT_PALETTES[theme.accent]?.color || '#ff3e00'}',
    neutralColor: '${NEUTRAL_PALETTES[theme.neutral]?.shades[500] || '#71717a'}',
    defaultMode: '${theme.mode}'
  },
  seo: {
    titleTemplate: '%s · ${sampleName}',
    defaultOgImage: '/api/og',
    twitterCard: 'summary_large_image'
  },
  nav: [
    { label: 'Features', href: '#features' },
    { label: 'Docs', href: '/docs' },
    { label: 'Pricing', href: '#pricing' }
  ],
  socials: {
    github: 'https://github.com/my-org/my-app'
  }
});`);

	const soloDevSnippet = `// Minimal Solo Developer Configuration
export const siteConfig = defineSiteConfig({
  name: 'FocusBoard',
  title: 'FocusBoard — Minimalist Kanban for Solopreneurs',
  description: 'Track your daily tasks with zero distraction.',
  url: 'https://focusboard.app',
  email: 'alex@focusboard.app', // Automatically fills support, legal & DPO contact!
  project: {
    license: 'MIT',
    type: 'open-source' // Or 'commercial-saas', 'source-available', 'freemium'
  }
});`;

	const contextSnippet =
		`<` +
		`script lang="ts">
  import { getSiteConfig } from 'yaxa-svelte';

  // Reactively retrieve the current site configuration from context
  const site = getSiteConfig();
<` +
		`/script>

<h1>Welcome to {site.name}</h1>
<p>{site.description}</p>
<p>License: {site.project?.license}</p>`;
</script>

<DocHeader
	title="Site Configuration (site.config.ts)"
	description="Define your branding, single-email routing, project licensing, color themes, navigation, and SEO rules in one single source of truth."
	badge="100% DRY"
	category="Getting Started"
/>

<div class="space-y-8">
	<!-- Interactive Config Generator -->
	<DocSandbox title="Live Interactive site.config.ts Generator">
		<div class="w-full space-y-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div>
					<label
						for="cfg-site-name"
						class="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
					>
						Site / Brand Name
					</label>
					<input
						id="cfg-site-name"
						type="text"
						bind:value={sampleName}
						class="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
					/>
				</div>
				<div>
					<label
						for="cfg-site-url"
						class="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
					>
						Production URL
					</label>
					<input
						id="cfg-site-url"
						type="text"
						bind:value={sampleUrl}
						class="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
					/>
				</div>
				<div>
					<label
						for="cfg-site-email"
						class="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
					>
						Contact Email (Solo Dev)
					</label>
					<input
						id="cfg-site-email"
						type="email"
						bind:value={sampleEmail}
						class="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
					/>
				</div>
			</div>

			<DocCodeBlock code={generatedConfig} filename="src/site.config.ts" language="typescript" />
		</div>
	</DocSandbox>

	<!-- Solo Dev First & Project Nature -->
	<div class="space-y-4">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">
			Solo Dev First: Single-Email & Project Licensing
		</h3>
		<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
			If you're a solo developer without a registered company, you don't need to fill out complex
			legal addresses or VAT IDs. Simply supply your primary <code
				class="font-mono text-primary-600 dark:text-primary-400">email</code
			>
			and <code class="font-mono text-primary-600 dark:text-primary-400">project</code> configuration.
			Yaxa automatically derives support links, Schema.org publisher data, and OpenGraph badges accurately.
		</p>
		<DocCodeBlock code={soloDevSnippet} filename="src/site.config.ts" language="typescript" />
	</div>

	<!-- Context API -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">
			Accessing Config Anywhere (Context API)
		</h3>
		<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
			When wrapped in <code
				class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800"
				>&lt;YaxaApp /&gt;</code
			>, your configuration is provided to all descendant components via Svelte 5 context. You can
			retrieve it anytime using
			<code class="font-mono text-primary-600 dark:text-primary-400">getSiteConfig()</code>:
		</p>
		<DocCodeBlock
			code={contextSnippet}
			filename="src/routes/any-component.svelte"
			language="svelte"
		/>
	</div>
</div>
