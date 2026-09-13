<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocCodeBlock from '../_components/DocCodeBlock.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';

	const installSnippet = `pnpm add -D @sveltejs/adapter-static`;

	const viteConfigSnippet = `// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: undefined, // Set to '404.html' for SPA fallback if needed
        precompress: true
      })
    })
  ]
});`;

	const layoutTsSnippet = `// src/routes/+layout.ts
export const prerender = true;
export const ssr = true;`;

	const staticOgSnippet = `// src/routes/api/og/+server.ts
import { createOgImageHandler } from 'yaxa-svelte';
import { siteConfig } from '../../site.config';

// Mark the SVG OG route as prerenderable
export const prerender = true;

export const GET = createOgImageHandler({ config: siteConfig });`;

	const cloudflareSnippet = `# Cloudflare Pages Build Settings
Build command:      pnpm build
Build output dir:   build
Node.js Version:    >=20`;

	const githubPagesSnippet = `# .github/workflows/deploy.yml (GitHub Pages)
name: Deploy Static Site
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build/
      - uses: actions/deploy-pages@v4`;
</script>

<DocHeader
	title="Static Site Generation (SSG) & Deployments"
	description="Deploy blazing-fast, 100% static websites with pre-rendered SEO, zero-FOUC theming, and no server maintenance using @sveltejs/adapter-static."
	badge="SSG"
	category="Getting Started"
/>

<div class="space-y-10">
	<!-- Overview Alert / Intro -->
	<div
		class="rounded-xl border border-primary-200 bg-primary-50/50 p-5 text-sm text-neutral-700 dark:border-primary-900/50 dark:bg-primary-950/20 dark:text-neutral-300"
	>
		<p class="font-semibold text-primary-900 dark:text-primary-200">
			⚡ Zero Server Cost & Maximum Speed
		</p>
		<p class="mt-1 leading-relaxed">
			Yaxa is 100% compatible with static site generators. All components, animations, theme stores,
			and SEO meta tags compile directly into static <code class="font-mono text-xs">.html</code> files
			that can be hosted on any CDN (Cloudflare Pages, GitHub Pages, Vercel Static, Netlify, or S3).
		</p>
	</div>

	<!-- Step 1: Install Adapter -->
	<div class="space-y-3">
		<div class="flex items-center gap-2.5">
			<span
				class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white dark:bg-primary-500"
			>
				1
			</span>
			<h3 class="text-base font-bold text-neutral-900 dark:text-white">
				Install @sveltejs/adapter-static
			</h3>
		</div>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Add SvelteKit's official static adapter to your dev dependencies:
		</p>
		<DocCodeBlock code={installSnippet} filename="Terminal" language="bash" />
	</div>

	<!-- Step 2: Configure Vite / SvelteKit -->
	<div class="space-y-3">
		<div class="flex items-center gap-2.5">
			<span
				class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white dark:bg-primary-500"
			>
				2
			</span>
			<h3 class="text-base font-bold text-neutral-900 dark:text-white">
				Configure Adapter in `vite.config.ts`
			</h3>
		</div>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Replace any server adapter with <code class="font-mono text-xs">adapter-static</code>:
		</p>
		<DocCodeBlock code={viteConfigSnippet} filename="vite.config.ts" language="typescript" />
	</div>

	<!-- Step 3: Enable Global Prerendering -->
	<div class="space-y-3">
		<div class="flex items-center gap-2.5">
			<span
				class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white dark:bg-primary-500"
			>
				3
			</span>
			<h3 class="text-base font-bold text-neutral-900 dark:text-white">
				Enable Global Prerendering in `src/routes/+layout.ts`
			</h3>
		</div>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Create or edit <code class="font-mono text-xs">src/routes/+layout.ts</code> to instruct
			SvelteKit to pre-render every page into static HTML during
			<code class="font-mono text-xs">pnpm build</code>:
		</p>
		<DocCodeBlock code={layoutTsSnippet} filename="src/routes/+layout.ts" language="typescript" />
	</div>

	<!-- Step 4: Prerender Dynamic OG & SEO Endpoints -->
	<div class="space-y-3">
		<div class="flex items-center gap-2.5">
			<Badge color="primary" variant="subtle" size="sm">Static SEO</Badge>
			<h3 class="text-base font-bold text-neutral-900 dark:text-white">
				Pre-rendering Robots, Sitemap & SVG OpenGraph Cards
			</h3>
		</div>
		<p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
			Because Yaxa's dynamic Open Graph generator creates lightweight inline SVGs instead of
			requiring heavy headless browsers, your social preview cards can be statically generated at
			build time too:
		</p>
		<DocCodeBlock
			code={staticOgSnippet}
			filename="src/routes/api/og/+server.ts"
			language="typescript"
		/>
	</div>

	<!-- Step 5: Hosting Recipes -->
	<div class="space-y-6">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">Deployment Recipes</h3>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Cloudflare Pages -->
			<div
				class="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<h4 class="font-bold text-neutral-900 dark:text-white">Cloudflare Pages</h4>
				<p class="text-xs text-neutral-600 dark:text-neutral-400">
					Connect your GitHub repo to Cloudflare Pages with zero configuration:
				</p>
				<DocCodeBlock code={cloudflareSnippet} filename="Cloudflare Dashboard" language="text" />
			</div>

			<!-- GitHub Pages -->
			<div
				class="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<h4 class="font-bold text-neutral-900 dark:text-white">GitHub Pages (Actions)</h4>
				<p class="text-xs text-neutral-600 dark:text-neutral-400">
					Push to GitHub and deploy automatically with GitHub Actions:
				</p>
				<DocCodeBlock
					code={githubPagesSnippet}
					filename=".github/workflows/deploy.yml"
					language="yaml"
				/>
			</div>
		</div>
	</div>

	<!-- Feature Comparison -->
	<div class="space-y-4">
		<h3 class="text-lg font-bold text-neutral-900 dark:text-white">
			Static Site (SSG) vs. Full-Stack SaaS Mode
		</h3>
		<div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
			<table class="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
				<thead
					class="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-900 dark:text-neutral-400"
				>
					<tr>
						<th class="px-4 py-3">Feature</th>
						<th class="px-4 py-3">Static Site (SSG)</th>
						<th class="px-4 py-3">Full-Stack SaaS</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
					<tr>
						<td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">Hosting Cost</td>
						<td class="px-4 py-3 text-emerald-600 dark:text-emerald-400">100% Free on CDNs</td>
						<td class="px-4 py-3">Serverless / Node.js Server</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-medium text-neutral-900 dark:text-white"
							>Time to First Byte (TTFB)</td
						>
						<td class="px-4 py-3 text-emerald-600 dark:text-emerald-400"
							>Instant (Edge CDN cached)</td
						>
						<td class="px-4 py-3">Fast (Server rendered)</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">Theme & Dark Mode</td
						>
						<td class="px-4 py-3">Zero-FOUC (pre-hydration script)</td>
						<td class="px-4 py-3">Zero-FOUC (SSR + pre-hydration script)</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">Database & Auth</td>
						<td class="px-4 py-3 text-neutral-400">Client-only / External API</td>
						<td class="px-4 py-3">Built-in Better-Auth & Drizzle</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">Sitemap & Robots</td>
						<td class="px-4 py-3">Pre-rendered at build time</td>
						<td class="px-4 py-3">Generated dynamically via hooks</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
