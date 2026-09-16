<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Chip from '$lib/components/elements/Chip.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import CodeBlock from '$lib/components/elements/CodeBlock.svelte';
	import SortableList from '$lib/components/elements/SortableList.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import Switch from '$lib/components/forms/Switch.svelte';
	import Tabs from '$lib/components/navigation/Tabs.svelte';
	import { useToast } from '$lib/composables/useToast';
	import {
		theme,
		ACCENT_PALETTES,
		NEUTRAL_PALETTES,
		FONT_PRESETS,
		FONT_SIZE_PRESETS,
		RADIUS_PRESETS,
		type NeutralName,
		type FontFamily,
		type RadiusPreset,
		type BaseFontSize
	} from '$lib/theme/theme.svelte';

	const toast = useToast();
	const accentList = Object.values(ACCENT_PALETTES);
	const neutralList = (
		Object.entries(NEUTRAL_PALETTES) as [
			NeutralName,
			{ name: string; shades: Record<number, string> }
		][]
	).map(([id, item]) => ({
		id,
		name: item.name,
		color: item.shades[500]
	}));

	const fontOptions = (
		Object.entries(FONT_PRESETS) as [FontFamily, { name: string; value: string }][]
	).map(([id, item]) => ({
		id,
		name: item.name
	}));

	const radiusOptions = (
		Object.entries(RADIUS_PRESETS) as [RadiusPreset, { name: string; value: string }][]
	).map(([id, item]) => ({
		id,
		name: item.name,
		value: item.value
	}));

	const sizeOptions = (
		Object.entries(FONT_SIZE_PRESETS) as [
			BaseFontSize,
			{ name: string; value: string; label: string }
		][]
	).map(([id, item]) => ({
		id,
		name: item.name,
		label: item.label
	}));

	let activeDemoTab = $state('buttons');
	let demoSwitchState = $state(true);
	let demoInputValue = $state('user@yaxa.dev');

	let copiedInstall = $state(false);
	const installCommand = 'pnpm add yaxa-svelte @tailwindcss/vite tailwindcss';

	function copyInstall() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(installCommand);
			copiedInstall = true;
			toast.success('Copied to clipboard', installCommand);
			setTimeout(() => {
				copiedInstall = false;
			}, 2500);
		}
	}

	function copyConfigSnippet() {
		const snippet = `// src/site.config.ts
import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
  theme: {
    primaryColor: '${ACCENT_PALETTES[theme.accent]?.color || '#ff3e00'}',
    neutralColor: '${NEUTRAL_PALETTES[theme.neutral]?.shades[500] || '#71717a'}',
    defaultMode: '${theme.mode}'
  }
});`;

		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(snippet);
			toast.success('Theme Configuration Copied!', 'Paste into your src/site.config.ts file');
		}
	}

	let sampleTasks = $state([
		'⚡ Svelte 5 Runes Reactivity',
		'🎨 Tailwind CSS v4 Theme Studio',
		'🪄 Headless Actions Suite',
		'✨ Zero-WASM Syntax Highlighter'
	]);

	const demoTabs = [
		{ value: 'buttons', label: 'Actions' },
		{ value: 'code', label: 'Code Block' },
		{ value: 'sortable', label: 'Drag & Drop' },
		{ value: 'forms', label: 'Inputs' },
		{ value: 'badges', label: 'Status' },
		{ value: 'metrics', label: 'SaaS Stat' }
	];
</script>

<svelte:head>
	<title>Yaxa — The Intuitive Svelte 5 UI & SEO Library</title>
	<meta
		name="description"
		content="A comprehensive Svelte 5 UI component library and automated Nuxt SEO parity suite with real-time Tailwind CSS v4 customization."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
	<!-- Subtle ambient glow matching dynamic primary color -->
	<div
		class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl transition-all duration-700 dark:opacity-30"
		style="background: radial-gradient(circle, var(--yaxa-primary-500, #ff3e00) 0%, transparent 70%);"
	></div>

	<Container size="2xl" class="relative text-center">
		<!-- Release Pill Badge -->
		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-50/50 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-xs backdrop-blur-md dark:border-primary-400/20 dark:bg-primary-950/40 dark:text-primary-300"
		>
			<span class="flex h-2 w-2 animate-pulse rounded-full bg-primary-500"></span>
			<span>Svelte 5 Runes · Tailwind CSS v4 · Nuxt UI & Nuxt SEO Parity</span>
		</div>

		<!-- Main Headline -->
		<h1
			class="mx-auto max-w-4xl text-4xl leading-[1.1] font-extrabold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl dark:text-white"
		>
			The Intuitive Svelte UI Library for <span
				class="bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500 bg-clip-text text-transparent dark:from-primary-400 dark:via-primary-300 dark:to-amber-300"
				>Fast Teams</span
			>
		</h1>

		<p
			class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-normal text-neutral-600 sm:text-xl dark:text-neutral-400"
		>
			45+ accessible components, layouts, SaaS page blocks, DOM virtualization, zero-WASM syntax highlighter, automated
			runtime OpenGraph cards, XML sitemaps, and real-time Tailwind theme customization.
		</p>

		<!-- Action CTA Buttons -->
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<Button
				href="/docs/intro"
				size="lg"
				color="primary"
				variant="solid"
				class="font-semibold shadow-lg shadow-primary-500/20"
			>
				<Icon name="bolt" class="mr-2 h-4 w-4" />
				Explore Documentation
			</Button>

			<Button
				href="/docs/comp-buttons"
				size="lg"
				variant="outline"
				color="neutral"
				class="font-semibold"
			>
				<Icon name="squares-2x2" class="mr-2 h-4 w-4" />
				Browse Components
			</Button>

			<Button
				href="https://github.com/FuntionalFrost/yaxa"
				size="lg"
				variant="ghost"
				color="neutral"
				target="_blank"
				class="font-semibold"
			>
				<Icon name="github" class="mr-2 h-4 w-4" />
				GitHub
			</Button>
		</div>

		<!-- One-Click Install Command Pill -->
		<div class="mx-auto mt-8 max-w-md">
			<button
				type="button"
				onclick={copyInstall}
				class="group flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 pl-4 font-mono text-xs shadow-xs backdrop-blur-md transition-all hover:border-primary-500/50 hover:bg-neutral-50/90 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-primary-500/40 dark:hover:bg-neutral-800/80"
			>
				<span class="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
					<span class="font-bold text-primary-500">$</span>
					<span>{installCommand}</span>
				</span>
				<span
					class="flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition-colors group-hover:bg-primary-100 group-hover:text-primary-700 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-primary-950 dark:group-hover:text-primary-300"
				>
					<Icon name={copiedInstall ? 'check' : 'clipboard-document'} class="h-3.5 w-3.5" />
					<span>{copiedInstall ? 'Copied!' : 'Copy'}</span>
				</span>
			</button>
		</div>
	</Container>
</section>

<!-- Live Theme Customizer Studio -->
<section
	id="theme-studio"
	class="border-y border-neutral-200/80 bg-neutral-50/60 py-16 dark:border-neutral-800/80 dark:bg-neutral-900/30"
>
	<Container size="2xl">
		<div class="mb-10 text-center">
			<div
				class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
			>
				<Icon name="swatch" class="h-3.5 w-3.5" /> Live Tailwind CSS v4 Theme Studio
			</div>
			<h2
				class="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
			>
				Customize Every Dimension in Real Time
			</h2>
			<p class="mx-auto mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
				Watch components and typography adapt instantly across the entire page with pure CSS
				variables.
			</p>
		</div>

		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- Theme Controls Panel -->
			<div
				class="space-y-6 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm lg:col-span-6 dark:border-neutral-800 dark:bg-neutral-900/90"
			>
				<!-- 1. Primary Accent Palette -->
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span
							class="text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
						>
							1. Primary Accent
						</span>
						<span
							class="font-mono text-xs font-semibold text-primary-600 capitalize dark:text-primary-400"
						>
							{theme.accent}
						</span>
					</div>
					<div class="flex flex-wrap gap-2.5">
						{#each accentList as item}
							{@const active = theme.accent === item.id}
							<button
								type="button"
								onclick={() => theme.setAccent(item.id)}
								class="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 {active
									? 'shadow-md ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950'
									: 'opacity-80 hover:opacity-100'}"
								style="background-color: {item.color};"
								title={item.name}
							>
								{#if active}
									<span class="h-2 w-2 rounded-full bg-white shadow-xs"></span>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- 2. Neutral Base Tone -->
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span
							class="text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
						>
							2. Neutral Undertone
						</span>
						<span
							class="font-mono text-xs font-semibold text-neutral-600 capitalize dark:text-neutral-400"
						>
							{theme.neutral}
						</span>
					</div>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each neutralList as item}
							{@const active = theme.neutral === item.id}
							<button
								type="button"
								onclick={() => theme.setNeutral(item.id)}
								class="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all {active
									? 'border-primary-500 bg-primary-50/50 text-primary-700 ring-1 ring-primary-500 dark:bg-primary-950/40 dark:text-primary-300'
									: 'border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300 dark:hover:bg-neutral-800'}"
							>
								<span class="h-3 w-3 shrink-0 rounded-full" style="background-color: {item.color};"
								></span>
								<span>{item.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- 3. Typography Family -->
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span
							class="text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
						>
							3. Typography Family
						</span>
						<span
							class="font-mono text-xs font-semibold text-neutral-600 capitalize dark:text-neutral-400"
						>
							{theme.fontFamily}
						</span>
					</div>
					<div class="grid grid-cols-3 gap-2">
						{#each fontOptions as item}
							{@const active = theme.fontFamily === item.id}
							<button
								type="button"
								onclick={() => theme.setFontFamily(item.id)}
								class="rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-all {active
									? 'border-primary-500 bg-primary-50/50 text-primary-700 ring-1 ring-primary-500 dark:bg-primary-950/40 dark:text-primary-300'
									: 'border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300'}"
							>
								<div class="capitalize">{item.id}</div>
								<div class="text-[10px] font-normal text-neutral-500">{item.name}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- 4. Corner Radius & 5. Size Density -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<span
							class="mb-2 block text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
						>
							4. Corner Radius
						</span>
						<div class="flex flex-wrap gap-1.5">
							{#each radiusOptions as item}
								{@const active = theme.radius === item.id}
								<button
									type="button"
									onclick={() => theme.setRadius(item.id)}
									class="rounded-md border px-2.5 py-1 text-xs font-medium transition-all {active
										? 'border-primary-500 bg-primary-500 font-bold text-white'
										: 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'}"
								>
									{item.name}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<span
							class="mb-2 block text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
						>
							5. Density Scale
						</span>
						<div class="flex flex-wrap gap-1.5">
							{#each sizeOptions as item}
								{@const active = theme.fontSize === item.id}
								<button
									type="button"
									onclick={() => theme.setFontSize(item.id)}
									class="rounded-md border px-2.5 py-1 text-xs font-medium transition-all {active
										? 'border-primary-500 bg-primary-500 font-bold text-white'
										: 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'}"
								>
									{item.name}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Controls Footer Actions -->
				<div
					class="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800"
				>
					<Button variant="ghost" size="xs" color="neutral" onclick={() => theme.reset()}>
						<Icon name="arrow-path" class="mr-1 h-3.5 w-3.5" /> Reset Defaults
					</Button>

					<Button size="xs" color="primary" variant="solid" onclick={copyConfigSnippet}>
						<Icon name="code-bracket" class="mr-1 h-3.5 w-3.5" /> Copy site.config.ts
					</Button>
				</div>
			</div>

			<!-- Live Interactive Component Sandbox reacting to Studio -->
			<div class="space-y-6 lg:col-span-6">
				<div
					class="space-y-6 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/90"
				>
					<div
						class="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800"
					>
						<div>
							<h3 class="text-sm font-bold text-neutral-900 dark:text-white">
								Live Sandbox Preview
							</h3>
							<p class="text-xs text-neutral-500">Reacting to active palette & radius tokens</p>
						</div>
						<Badge color="primary" variant="subtle" size="xs">Live State</Badge>
					</div>

					<!-- Sandbox Tab Strip -->
					<Tabs items={demoTabs} bind:value={activeDemoTab} />

					{#if activeDemoTab === 'buttons'}
						<div class="space-y-4">
							<div class="flex flex-wrap gap-2.5">
								<Button variant="solid" color="primary">Solid Accent</Button>
								<Button variant="outline" color="primary">Outline</Button>
								<Button variant="soft" color="primary">Soft</Button>
								<Button variant="subtle" color="primary">Subtle</Button>
								<Button variant="ghost">Ghost</Button>
							</div>

							<div class="flex items-center gap-3">
								<Chip color="primary" pulse>Live Deploy</Chip>
								<Chip color="success" pulse>Connected</Chip>
								<Chip color="warning">Pending</Chip>
							</div>
						</div>
					{:else if activeDemoTab === 'code'}
						<div class="space-y-2">
							<CodeBlock
								code={'<' +
									'script lang="ts">\n  import { useLocale } from "yaxa-svelte";\n  const { formatCurrency } = useLocale();\n<' +
									'/script>\n\n<p>Price: {formatCurrency(29.99, "EUR")}</p>'}
								language="svelte"
								filename="Pricing.svelte"
								showLineNumbers={true}
							/>
						</div>
					{:else if activeDemoTab === 'sortable'}
						<div class="space-y-2">
							<p class="text-xs text-neutral-500">Drag cards by handle to reorder:</p>
							<SortableList bind:items={sampleTasks} />
						</div>
					{:else if activeDemoTab === 'forms'}
						<div class="space-y-4">
							<div>
								<label
									for="demo-work-email-input"
									class="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
								>
									Work Email
								</label>
								<Input
									id="demo-work-email-input"
									bind:value={demoInputValue}
									placeholder="you@company.com"
									icon="envelope"
								/>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
									>Auto Deploy on Push</span
								>
								<Switch bind:checked={demoSwitchState} />
							</div>
						</div>
					{:else if activeDemoTab === 'badges'}
						<div class="flex flex-wrap gap-2">
							<Badge color="primary" variant="solid">Primary</Badge>
							<Badge color="primary" variant="subtle">Accent Subtle</Badge>
							<Badge color="success" variant="subtle">Operational</Badge>
							<Badge color="warning" variant="subtle">Maintenance</Badge>
							<Badge color="info" variant="subtle">Beta 2.0</Badge>
						</div>
					{:else if activeDemoTab === 'metrics'}
						<div class="space-y-3">
							<MetricCard
								title="Monthly Recurring Revenue"
								value="$14,250"
								change={18.4}
								changePeriod="vs last month"
								sparkline={[8200, 9400, 11200, 10800, 12600, 13500, 14250]}
								sparklineColor="primary"
								icon="lightning"
							/>
						</div>
					{/if}

					<div
						class="rounded-xl bg-neutral-100 p-3 font-mono text-xs text-neutral-600 dark:bg-neutral-950 dark:text-neutral-400"
					>
						<div>// Active CSS Variables:</div>
						<div class="text-primary-600 dark:text-primary-400">
							--yaxa-primary: {ACCENT_PALETTES[theme.accent]?.color}
						</div>
						<div>--radius: {RADIUS_PRESETS[theme.radius]?.value}</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>

<!-- 6 Pillar Features Grid -->
<section class="py-20">
	<Container size="2xl">
		<div class="mb-14 text-center">
			<Badge color="primary" variant="subtle" size="sm" class="mb-3">Architectural Pillars</Badge>
			<h2
				class="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
			>
				Why Yaxa for SvelteKit?
			</h2>
			<p class="mx-auto mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
				Modern web development primitives built specifically for solo developers who value velocity
				and DX.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Card 1 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
				>
					<Icon name="bolt" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					Svelte 5 Runes Native
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					Zero legacy Svelte 4 store baggage. Pure Svelte 5 runes (`$state`, `$derived`, `$props`,
					and snippets) for lightning-fast reactivity and ultra-clean code.
				</p>
			</div>

			<!-- Card 2 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
				>
					<Icon name="photo" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					Dynamic OG Card Engine
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					Zero-dependency runtime SVG OpenGraph image generator (`/api/og`). Generates pixel-perfect
					social preview cards at the edge without heavy canvas binaries.
				</p>
			</div>

			<!-- Card 3 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
				>
					<Icon name="document-text" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					Automated Robots & Sitemaps
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					Mount `createYaxaHook(siteConfig)` in `src/hooks.server.ts` to get environment-aware
					robots.txt, XML sitemaps with human-readable XSL dashboards, and webmanifests.
				</p>
			</div>

			<!-- Card 4 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
				>
					<Icon name="swatch" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					Tailwind CSS v4 Ready
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					Built for `@tailwindcss/vite` with pure CSS `@theme` variables. Dynamic 11-shade color
					paletting without configuring giant JavaScript theme objects.
				</p>
			</div>

			<!-- Card 5 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
				>
					<Icon name="squares-plus" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					45+ Accessible Primitives
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					DashboardShell, Carousel, VirtualList, ResizablePanels, Terminal, Timeline, Tree, MultiSelect, Combobox, Stepper, Modals, Slideovers, and DataTables ready for deployment.
				</p>
			</div>

			<!-- Card 6 -->
			<div
				class="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-primary-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
				>
					<Icon name="sparkles" class="h-5 w-5" />
				</div>
				<h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
					Solo Dev DX & 100% DRY
				</h3>
				<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
					Single-email mode, automated project licensing badges, and turnkey Polar.sh billing. Never
					repeat metadata or boilerplate across files.
				</p>
			</div>
		</div>
	</Container>
</section>

<!-- Documentation Quick Directory -->
<section
	class="border-t border-neutral-200/80 bg-neutral-50/60 py-16 dark:border-neutral-800/80 dark:bg-neutral-900/30"
>
	<Container size="2xl">
		<div class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div>
				<Badge color="primary" variant="subtle" size="sm" class="mb-2">Documentation Hub</Badge>
				<h2
					class="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
				>
					Explore Yaxa by Category
				</h2>
			</div>
			<div class="flex items-center gap-3">
				<Button href="/saas" color="neutral" variant="outline" size="sm">SaaS Demo ↗</Button>
				<Button href="/docs/intro" color="primary" variant="solid" size="sm">
					View Documentation ↗
				</Button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<a
				href="/docs/intro"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-primary-600 uppercase dark:text-primary-400"
				>
					Getting Started
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400"
				>
					Quickstart & SSG
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Svelte 5 Runes, install guide, and static adapter recipes.
				</p>
			</a>

			<a
				href="/docs/blocks"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400"
				>
					Page Blocks
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
				>
					Pre-Built Templates
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					DashboardShell, Carousel, VirtualList, and ResizablePanels.
				</p>
			</a>

			<a
				href="/docs/seo-og"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
				>
					SEO Suite
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400"
				>
					Dynamic OG & Sitemaps
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Interactive OG Studio, XML sitemaps, and robots.txt.
				</p>
			</a>

			<a
				href="/docs/saas-suite"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400"
				>
					Solo SaaS Suite
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400"
				>
					Full-Stack SaaS Stack
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Better-Auth Multi-Tenancy, Drizzle ORM, and Polar.sh.
				</p>
			</a>

			<a
				href="/docs/admin-suite"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400"
				>
					Admin Suite
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400"
				>
					Drizzle DB Inspector
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Schema introspection, table CRUD, and impersonation.
				</p>
			</a>

			<a
				href="/docs/legal-suite"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400"
				>
					Compliance
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400"
				>
					Legal Suite & Impressum
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					GDPR Privacy Policies, Polar MoR terms, and EU Impressum.
				</p>
			</a>

			<a
				href="/docs/comp-buttons"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div class="mb-1 text-xs font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
					Components
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400"
				>
					Buttons & Form Inputs
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Buttons, OTP input, DatePickers, ToggleGroups, and selects.
				</p>
			</a>

			<a
				href="/docs/comp-overlays"
				class="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div
					class="mb-1 text-xs font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400"
				>
					Overlays
				</div>
				<h3
					class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400"
				>
					Modals & DataTables
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-neutral-500">
					Dialog overlays, sheets, dropdowns, and data tables.
				</p>
			</a>
		</div>
	</Container>
</section>

<!-- Call to Action Banner -->
<section class="py-20">
	<Container size="lg">
		<div
			class="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-br from-primary-900/40 via-neutral-900/90 to-neutral-950 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12"
		>
			<div
				class="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"
			></div>

			<Badge color="primary" variant="subtle" size="sm" class="mb-4">Production Ready</Badge>
			<h2 class="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
				Start Building Faster with Yaxa
			</h2>
			<p class="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-neutral-300">
				Supercharge your SvelteKit development with accessible Tailwind CSS components and automated
				SEO parity.
			</p>

			<div class="flex flex-wrap items-center justify-center gap-4">
				<Button
					href="/docs/intro"
					size="lg"
					color="primary"
					variant="solid"
					class="font-semibold shadow-lg shadow-primary-500/30"
				>
					Read the Documentation ↗
				</Button>
				<Button
					href="https://github.com/FuntionalFrost/yaxa"
					target="_blank"
					size="lg"
					variant="outline"
					color="neutral"
					class="border-neutral-700 font-semibold text-white hover:bg-neutral-800"
				>
					Star on GitHub ★
				</Button>
			</div>
		</div>
	</Container>
</section>
