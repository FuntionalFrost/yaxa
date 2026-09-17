<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import DocCodeBlock from '../_components/DocCodeBlock.svelte';
	import OgImage from '$lib/components/seo/OgImage.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';

	let ogTitle = $state('Building Faster with SvelteKit & Yaxa');
	let ogDescription = $state(
		'The complete Svelte 5 component suite with zero-config SVG OpenGraph generation.'
	);
	let ogBadge = $state('Featured Release');
	let ogTheme = $state<'dark' | 'light'>('dark');

	let liveUrl = $derived(
		`/api/og?title=${encodeURIComponent(ogTitle)}&description=${encodeURIComponent(ogDescription)}&badge=${encodeURIComponent(ogBadge)}&theme=${ogTheme}`
	);

	const codeUsage =
		`<` +
		`script lang="ts">
  import { OgImage } from 'yaxa-svelte';
<` +
		`/script>

<!-- Renders live responsive preview and meta tags -->
<OgImage
  title="My Blog Post Title"
  description="A concise summary for Twitter and LinkedIn cards"
  badge="SvelteKit 2.7"
  theme="dark"
/>`;
</script>

<DocHeader
	title="Dynamic Open Graph Generator (/api/og)"
	description="Zero-dependency runtime SVG Open Graph image generator. Automatically creates branded 1200x630 social share cards without headless Chrome or heavy canvas dependencies."
	badge="Automated SEO"
	category="Site & SEO Kit"
	importStatement={"import { createOgImageHandler, generateOgSvg } from 'yaxa-svelte';"}
/>

<div class="space-y-8">
	<!-- Interactive OG Studio Sandbox -->
	<DocSandbox title="Live Interactive OpenGraph Card Studio">
		<div class="w-full space-y-6">
			<!-- Controls -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="sm:col-span-2">
					<label
						for="og-card-title"
						class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
					>
						Card Title
					</label>
					<input
						id="og-card-title"
						name="ogTitle"
						type="text"
						bind:value={ogTitle}
						class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
					/>
				</div>
				<div>
					<label
						for="og-badge-tag"
						class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
					>
						Badge Tag
					</label>
					<input
						id="og-badge-tag"
						name="ogBadge"
						type="text"
						bind:value={ogBadge}
						class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
					/>
				</div>
				<div class="sm:col-span-2">
					<label
						for="og-description-text"
						class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
					>
						Description / Subtitle
					</label>
					<input
						id="og-description-text"
						name="ogDescription"
						type="text"
						bind:value={ogDescription}
						class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
					/>
				</div>
				<div>
					<span class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
						Color Mode
					</span>
					<div class="mt-1 flex items-center gap-2">
						<button
							type="button"
							onclick={() => (ogTheme = 'dark')}
							class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all {ogTheme ===
							'dark'
								? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
								: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}"
						>
							Dark
						</button>
						<button
							type="button"
							onclick={() => (ogTheme = 'light')}
							class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all {ogTheme ===
							'light'
								? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
								: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}"
						>
							Light
						</button>
					</div>
				</div>
			</div>

			<!-- Live SVG Preview -->
			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs text-zinc-500">
					<span>Rendered 1200 × 630 Card</span>
					<a
						href={liveUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 font-mono text-primary-600 hover:underline dark:text-primary-400"
					>
						Open raw SVG endpoint <Icon name="arrow-top-right-on-square" class="h-3.5 w-3.5" />
					</a>
				</div>
				<OgImage
					title={ogTitle}
					description={ogDescription}
					badge={ogBadge}
					theme={ogTheme}
					class="w-full shadow-lg"
				/>
			</div>
		</div>
	</DocSandbox>

	<!-- Usage Code Snippet -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Component Usage</h3>
		<DocCodeBlock
			code={codeUsage}
			filename="src/routes/blog/[slug]/+page.svelte"
			language="svelte"
		/>
	</div>
</div>
