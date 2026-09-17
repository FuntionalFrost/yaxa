<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';

	let count = $state(0);
	let doubleCount = $derived(count * 2);
	let isEven = $derived(count % 2 === 0);

	const svelte5Snippet =
		`<` +
		`script lang="ts">
  let count = $state(0);
  let doubleCount = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
<` +
		`/script>

<Button onclick={() => count++}>Count: {count}</Button>
<p>Double: {doubleCount} ({isEven ? 'Even' : 'Odd'})</p>`;
</script>

<DocHeader
	title="Introduction to Yaxa"
	description="The intuitive, production-grade UI component and automated SEO library for SvelteKit 2.7+ and Svelte 5 Runes. Bringing full Nuxt UI v4 & Nuxt SEO DX to the Svelte ecosystem."
	badge="Svelte 5 Runes"
	category="Getting Started"
	importStatement={"import { YaxaApp, Button, defineSiteConfig } from 'yaxa-svelte';"}
/>

<div class="space-y-8">
	<!-- Architecture Features Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<div
			class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
		>
			<div
				class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
			>
				<Icon name="bolt" class="h-5 w-5" />
			</div>
			<h3 class="mb-1 text-sm font-bold text-zinc-900 dark:text-white">Svelte 5 Runes Native</h3>
			<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
				Pure runes reactivity (`$state`, `$derived`, `&#123;#snippet&#125;`) with zero Svelte 4
				store overhead.
			</p>
		</div>

		<div
			class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
		>
			<div
				class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
			>
				<Icon name="cube" class="h-5 w-5" />
			</div>
			<h3 class="mb-1 text-sm font-bold text-zinc-900 dark:text-white">
				createContext & Class State
			</h3>
			<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
				SSR-safe `createContext` state containers. Direct property access via `useYaxa()` with zero
				prop drilling or leaks.
			</p>
		</div>

		<div
			class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
		>
			<div
				class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
			>
				<Icon name="swatch" class="h-5 w-5" />
			</div>
			<h3 class="mb-1 text-sm font-bold text-zinc-900 dark:text-white">Tailwind CSS v4 Ready</h3>
			<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
				CSS-first `@theme` configuration with instant reactive CSS variables for dynamic 11-shade
				color paletting.
			</p>
		</div>

		<div
			class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
		>
			<div
				class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
			>
				<Icon name="globe" class="h-5 w-5" />
			</div>
			<h3 class="mb-1 text-sm font-bold text-zinc-900 dark:text-white">
				100% DRY SEO & Edge Parity
			</h3>
			<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
				Single-file `site.config.ts` powers runtime SVG OpenGraph cards, XML sitemaps, robots.txt,
				and Schema.org.
			</p>
		</div>
	</div>

	<!-- Interactive Svelte 5 Runes Sandbox -->
	<DocSandbox title="Interactive Svelte 5 Runes Demo" code={svelte5Snippet}>
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex items-center gap-3">
				<Button
					variant="outline"
					size="sm"
					onclick={() => count > 0 && count--}
					disabled={count === 0}
				>
					- Decrement
				</Button>
				<Button variant="solid" color="primary" size="md" onclick={() => count++}>
					<Icon name="plus" class="mr-1.5 h-4 w-4" />
					Count: <span class="ml-1 font-mono font-bold">{count}</span>
				</Button>
				<Button variant="ghost" size="sm" onclick={() => (count = 0)}>Reset</Button>
			</div>

			<div class="flex items-center gap-3 font-mono text-xs">
				<span
					class="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
				>
					$derived(count * 2) = <strong class="text-primary-600 dark:text-primary-400"
						>{doubleCount}</strong
					>
				</span>
				<Badge color={isEven ? 'primary' : 'neutral'} variant="subtle" size="sm">
					{isEven ? 'Even number' : 'Odd number'}
				</Badge>
			</div>
		</div>
	</DocSandbox>

	<!-- Nuxt UI vs Yaxa Feature Parity Table -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Nuxt UI vs. Yaxa Parity Matrix</h3>
		<div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
			<table class="w-full text-left text-xs">
				<thead
					class="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
				>
					<tr>
						<th class="px-4 py-2.5">Feature Domain</th>
						<th class="px-4 py-2.5">Nuxt UI / Nuxt SEO</th>
						<th class="px-4 py-2.5">Yaxa (SvelteKit)</th>
						<th class="px-4 py-2.5">Status</th>
					</tr>
				</thead>
				<tbody
					class="divide-y divide-zinc-200 font-medium text-zinc-600 dark:divide-zinc-800/60 dark:text-zinc-400"
				>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">Reactivity Model</td>
						<td class="px-4 py-2.5">Vue 3 Composition API (`ref`, `computed`)</td>
						<td class="px-4 py-2.5 font-mono text-primary-600 dark:text-primary-400"
							>$state, $derived, $props</td
						>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">100% Native</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">Single Source Config</td
						>
						<td class="px-4 py-2.5">`app.config.ts` / `nuxt.config.ts`</td>
						<td class="px-4 py-2.5 font-mono">src/site.config.ts</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">100% DRY</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Dynamic OG Card Engine</td
						>
						<td class="px-4 py-2.5">`nuxt-og-image` (Satori / Resvg)</td>
						<td class="px-4 py-2.5 font-mono">/api/og (Zero-dep SVG)</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Zero-Config</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Robots & XML Sitemaps</td
						>
						<td class="px-4 py-2.5">`@nuxtjs/robots` & `@nuxtjs/sitemap`</td>
						<td class="px-4 py-2.5 font-mono">createYaxaHook(config)</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">1-Line Hook</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">CSS Engine</td>
						<td class="px-4 py-2.5">Tailwind CSS v3 / v4</td>
						<td class="px-4 py-2.5">Tailwind CSS v4 (@tailwindcss/vite)</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Modern</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Headless Actions Suite</td
						>
						<td class="px-4 py-2.5">VueUse (`useTextareaAutosize`, `onClickOutside`)</td>
						<td class="px-4 py-2.5 font-mono">use:autosize, use:clickOutside, use:portal</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Headless</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">Subpath Architecture</td
						>
						<td class="px-4 py-2.5">Nuxt Layers & Modules</td>
						<td class="px-4 py-2.5 font-mono">yaxa-svelte/auth, /server, /db, /polar</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Zero-Tax</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">Syntax Engine</td>
						<td class="px-4 py-2.5">Shiki / Prism (WASM/Heavy)</td>
						<td class="px-4 py-2.5 font-mono">&lt;CodeBlock /&gt; (Zero-WASM LaTeX/GFM/Vue/TSX)</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Pure Web</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Context & State Isolation</td
						>
						<td class="px-4 py-2.5">Vue `provide` / `inject` & Pinia</td>
						<td class="px-4 py-2.5 font-mono text-primary-600 dark:text-primary-400"
							>Svelte 5.40+ createContext & YaxaState</td
						>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">SSR Leak-Proof</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Unified Config & Edge Deploy</td
						>
						<td class="px-4 py-2.5">Nitro / `nuxt.config.ts`</td>
						<td class="px-4 py-2.5 font-mono">vite.config.ts + adapter-vercel</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Zero-Config</Badge></td>
					</tr>
					<tr>
						<td class="px-4 py-2.5 font-bold text-zinc-900 dark:text-white"
							>Solo SaaS & Auth Suite</td
						>
						<td class="px-4 py-2.5">NuxtHub / Nuxt Auth</td>
						<td class="px-4 py-2.5 font-mono">Better-Auth, Drizzle, Polar & Resend</td>
						<td class="px-4 py-2.5"><Badge color="primary" size="xs">Turnkey</Badge></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
