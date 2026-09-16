<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocCodeBlock from '../_components/DocCodeBlock.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';

	const hookSnippet = `// src/hooks.server.ts
import { createYaxaHook } from 'yaxa-svelte';
import { siteConfig } from './site.config';

// 1-line handler automatically mounts:
// - /robots.txt
// - /sitemap.xml
// - /sitemap.xsl (styled visual dashboard)
// - /site.webmanifest
// - /api/og
export const handle = createYaxaHook(siteConfig);`;

	const customSitemapSnippet = `// src/site.config.ts
export const siteConfig = defineSiteConfig({
  sitemap: {
    changefreq: 'weekly',
    priority: 0.8,
    exclude: ['/api/*', '/admin/*', '/dashboard/*'],
    dynamicUrls: async () => {
      // Fetch dynamic blog posts or products from your database / CMS:
      const posts = await getPosts();
      return posts.map(p => ({
        loc: \`/blog/\${p.slug}\`,
        lastmod: p.updatedAt,
        changefreq: 'monthly',
        priority: 0.7
      }));
    }
  }
});`;
</script>

<DocHeader
	title="Robots, Sitemaps & Webmanifest Engine"
	description="Automated environment-gated robots.txt, dynamic XML sitemaps with human-readable XSL stylesheets, and PWA site.webmanifest generation."
	badge="SEO Suite"
	category="Site & SEO Kit"
	importStatement={"import { createRobotsHandler, createSitemapHandler, createManifestHandler } from 'yaxa-svelte';"}
/>

<div class="space-y-8">
	<!-- 1-Line Hook Setup -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">1-Line Zero-Route Server Hook</h3>
		<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
			Instead of manually writing endpoint files for every SEO route, Yaxa exports <code
				class="font-mono text-primary-600 dark:text-primary-400">createYaxaHook()</code
			> to intercept and generate them on the fly:
		</p>
		<DocCodeBlock code={hookSnippet} filename="src/hooks.server.ts" language="typescript" />
	</div>

	<!-- Live SEO Endpoints Explorer -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Live Endpoint Explorer</h3>
		<p class="text-xs text-zinc-600 dark:text-zinc-400">
			Test the live generated endpoints on this deployment:
		</p>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<a
				href="/robots.txt"
				target="_blank"
				class="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
			>
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span class="font-mono text-xs font-bold text-primary-600 dark:text-primary-400"
							>/robots.txt</span
						>
						<Badge size="xs" variant="subtle" color="primary">Text</Badge>
					</div>
					<p class="text-xs text-zinc-500">
						Environment-aware crawling directives and Sitemap reference.
					</p>
				</div>
				<div
					class="mt-3 flex items-center text-xs font-semibold text-primary-600 group-hover:underline dark:text-primary-400"
				>
					View robots.txt ↗
				</div>
			</a>

			<a
				href="/sitemap.xml"
				target="_blank"
				class="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
			>
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
							>/sitemap.xml</span
						>
						<Badge size="xs" variant="subtle" color="success">XML + XSL</Badge>
					</div>
					<p class="text-xs text-zinc-500">
						Standard XML sitemap styled with human-readable XSL dashboard.
					</p>
				</div>
				<div
					class="mt-3 flex items-center text-xs font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400"
				>
					View sitemap.xml ↗
				</div>
			</a>

			<a
				href="/site.webmanifest"
				target="_blank"
				class="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
			>
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span class="font-mono text-xs font-bold text-sky-600 dark:text-sky-400"
							>/site.webmanifest</span
						>
						<Badge size="xs" variant="subtle" color="info">JSON</Badge>
					</div>
					<p class="text-xs text-zinc-500">
						PWA web app manifest with branding icons and theme colors.
					</p>
				</div>
				<div
					class="mt-3 flex items-center text-xs font-semibold text-sky-600 group-hover:underline dark:text-sky-400"
				>
					View manifest ↗
				</div>
			</a>
		</div>
	</div>

	<!-- Custom Dynamic Sitemaps -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Dynamic Content Sitemaps</h3>
		<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
			Supply an async function to index dynamic routes directly from your database or CMS:
		</p>
		<DocCodeBlock code={customSitemapSnippet} filename="src/site.config.ts" language="typescript" />
	</div>
</div>
