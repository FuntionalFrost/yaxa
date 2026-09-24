<script module lang="ts">
	export interface ThemeStudioProps {
		class?: string;
	}
</script>

<script lang="ts">
	import {
		theme,
		ACCENT_PALETTES,
		NEUTRAL_PALETTES,
		RADIUS_PRESETS,
		FONT_PRESETS,
		FONT_SIZE_PRESETS,
		type AccentName,
		type NeutralName,
		type RadiusPreset,
		type FontFamily,
		type BaseFontSize
	} from '$lib/theme/theme.svelte';
	import Button from '../elements/Button.svelte';
	import Badge from '../elements/Badge.svelte';
	import Card from '../layout/Card.svelte';
	import Icon from '../elements/Icon.svelte';
	import Input from '../forms/Input.svelte';
	import Select from '../forms/Select.svelte';
	import LineChart from '../charts/LineChart.svelte';
	import DonutChart from '../charts/DonutChart.svelte';
	import CodeBlock from '../elements/CodeBlock.svelte';
	import Modal from '../overlays/Modal.svelte';
	import { useToast } from '$lib/composables/useToast';

	let { class: className = '' }: ThemeStudioProps = $props();

	const toast = useToast();
	let exportModalOpen = $state(false);

	// Sample data for live previews
	const sampleChartData = [
		{ label: 'Mon', active: 120, revenue: 450 },
		{ label: 'Tue', active: 190, revenue: 620 },
		{ label: 'Wed', active: 280, revenue: 840 },
		{ label: 'Thu', active: 240, revenue: 790 },
		{ label: 'Fri', active: 390, revenue: 1100 },
		{ label: 'Sat', active: 480, revenue: 1350 },
		{ label: 'Sun', active: 520, revenue: 1480 }
	];

	const sampleDonutData = [
		{ label: 'Enterprise', value: 45 },
		{ label: 'Pro Tier', value: 35 },
		{ label: 'Starter', value: 20 }
	];

	let generatedTailwindTheme = $derived(`@theme {
  --color-primary-50: ${ACCENT_PALETTES[theme.accent].shades[50]};
  --color-primary-500: ${ACCENT_PALETTES[theme.accent].shades[500]};
  --color-primary-600: ${ACCENT_PALETTES[theme.accent].shades[600]};
  --color-primary-950: ${ACCENT_PALETTES[theme.accent].shades[950]};

  --color-neutral-50: ${NEUTRAL_PALETTES[theme.neutral].shades[50]};
  --color-neutral-500: ${NEUTRAL_PALETTES[theme.neutral].shades[500]};
  --color-neutral-900: ${NEUTRAL_PALETTES[theme.neutral].shades[900]};
  --color-neutral-950: ${NEUTRAL_PALETTES[theme.neutral].shades[950]};

  --radius-sm: calc(${RADIUS_PRESETS[theme.radius].value} * 0.5);
  --radius-md: ${RADIUS_PRESETS[theme.radius].value};
  --radius-lg: calc(${RADIUS_PRESETS[theme.radius].value} * 1.5);
  --radius-xl: calc(${RADIUS_PRESETS[theme.radius].value} * 2);
}`);

	let generatedSiteConfig = $derived(`export const siteConfig = defineSiteConfig({
  theme: {
    accent: '${theme.accent}',
    neutral: '${theme.neutral}',
    radius: '${theme.radius}',
    fontFamily: '${theme.fontFamily}'
  }
});`);

	function copySnippet(text: string, title: string) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(text);
			toast.success(`Copied ${title} to clipboard`);
		}
	}
</script>

<div class="space-y-8 {className}">
	<!-- Top Bar -->
	<div
		class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
	>
		<div>
			<h1 class="text-xl font-bold text-neutral-900 dark:text-white">Visual Web Theme Studio</h1>
			<p class="mt-1 text-xs text-neutral-500">
				Visually customize palettes, harmonic radii, fonts, and scrollbars with instant live preview
				and zero FOUC.
			</p>
		</div>

		<div class="flex items-center gap-2.5">
			<Button variant="outline" size="sm" onclick={() => theme.reset()}>
				<Icon name="rotate-ccw" size="xs" class="mr-1.5" />
				Reset
			</Button>

			<Button variant="solid" size="sm" onclick={() => (exportModalOpen = true)}>
				<Icon name="download" size="xs" class="mr-1.5" />
				Export Theme Tokens
			</Button>
		</div>
	</div>

	<!-- Main Studio Grid -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
		<!-- Left Controls Sidebar (4 cols) -->
		<div class="space-y-6 lg:col-span-4">
			<!-- Color Mode -->
			<Card padding="sm" class="space-y-3">
				<div class="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
					Color Mode
				</div>
				<div class="grid grid-cols-3 gap-2">
					{#each ['light', 'dark', 'system'] as const as mode}
						<Button
							variant={theme.mode === mode ? 'solid' : 'outline'}
							size="xs"
							onclick={() => theme.setMode(mode)}
							class="capitalize"
						>
							<Icon
								name={mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'laptop'}
								size="xs"
								class="mr-1"
							/>
							{mode}
						</Button>
					{/each}
				</div>
			</Card>

			<!-- Primary Accent Palette -->
			<Card padding="sm" class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
						Primary Accent
					</div>
					<span class="text-xs font-semibold text-primary-500 capitalize">{theme.accent}</span>
				</div>
				<div class="grid grid-cols-4 gap-2">
					{#each Object.entries(ACCENT_PALETTES) as [key, pal]}
						<button
							type="button"
							onclick={() => theme.setAccent(key as AccentName)}
							class="group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all {theme.accent ===
							key
								? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40'
								: 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'}"
						>
							<span
								class="h-6 w-6 rounded-full shadow-xs transition-transform group-hover:scale-110"
								style="background-color: {pal.color}"
							></span>
							<span
								class="text-[10px] font-medium text-neutral-700 capitalize dark:text-neutral-300"
							>
								{key}
							</span>
						</button>
					{/each}
				</div>
			</Card>

			<!-- Neutral Scale -->
			<Card padding="sm" class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
						Neutral Scale
					</div>
					<span class="text-xs font-semibold text-neutral-600 capitalize dark:text-neutral-300">
						{theme.neutral}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					{#each Object.entries(NEUTRAL_PALETTES) as [key, pal]}
						<Button
							variant={theme.neutral === key ? 'solid' : 'outline'}
							size="xs"
							onclick={() => theme.setNeutral(key as NeutralName)}
							class="justify-start gap-2 capitalize"
						>
							<span class="h-3.5 w-3.5 rounded-full" style="background-color: {pal.shades[500]}"
							></span>
							{pal.name}
						</Button>
					{/each}
				</div>
			</Card>

			<!-- Harmonic Radius Scale -->
			<Card padding="sm" class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
						Harmonic Radius
					</div>
					<span class="text-xs font-semibold text-primary-500 capitalize">{theme.radius}</span>
				</div>
				<div class="grid grid-cols-3 gap-1.5">
					{#each Object.entries(RADIUS_PRESETS) as [key, r]}
						<Button
							variant={theme.radius === key ? 'solid' : 'outline'}
							size="xs"
							onclick={() => theme.setRadius(key as RadiusPreset)}
							class="text-xs"
						>
							{r.name}
						</Button>
					{/each}
				</div>
			</Card>

			<!-- Typography & Font Size -->
			<Card padding="sm" class="space-y-3">
				<div class="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
					Typography & Sizing
				</div>
				<div class="grid grid-cols-3 gap-1.5">
					{#each Object.entries(FONT_PRESETS) as [key]}
						<Button
							variant={theme.fontFamily === key ? 'solid' : 'outline'}
							size="xs"
							onclick={() => theme.setFontFamily(key as FontFamily)}
							class="text-xs capitalize"
						>
							{key}
						</Button>
					{/each}
				</div>

				<div class="pt-2">
					<div class="mb-1.5 text-[11px] font-semibold text-neutral-500">Density / Size Scale</div>
					<div class="grid grid-cols-3 gap-1.5">
						{#each Object.entries(FONT_SIZE_PRESETS) as [key, sz]}
							<Button
								variant={theme.fontSize === key ? 'solid' : 'outline'}
								size="xs"
								onclick={() => theme.setFontSize(key as BaseFontSize)}
								class="text-xs"
							>
								{sz.name}
							</Button>
						{/each}
					</div>
				</div>
			</Card>

			<!-- Scrollbar Auto-Alignment -->
			<Card padding="sm" class="space-y-2">
				<div class="flex items-center justify-between">
					<div>
						<div class="text-xs font-bold text-neutral-900 dark:text-white">Accent Scrollbars</div>
						<div class="text-[11px] text-neutral-500">Sync scrollbar thumb to active accent</div>
					</div>
					<Button
						variant={theme.accentScrollbar ? 'solid' : 'outline'}
						size="xs"
						onclick={() => theme.setAccentScrollbar(!theme.accentScrollbar)}
					>
						{theme.accentScrollbar ? 'Enabled' : 'Disabled'}
					</Button>
				</div>
			</Card>
		</div>

		<!-- Right Live Sandbox Canvas (8 cols) -->
		<div class="space-y-6 lg:col-span-8">
			<!-- Elements Preview Card -->
			<Card>
				{#snippet header()}
					<div class="flex items-center justify-between">
						<span class="font-semibold text-neutral-900 dark:text-white">
							Interactive Component Sandbox
						</span>
						<Badge variant="soft" color="primary">Live Preview</Badge>
					</div>
				{/snippet}

				<div class="space-y-6">
					<!-- Buttons Row -->
					<div>
						<div class="mb-2 text-xs font-semibold text-neutral-500 uppercase">
							Buttons & Variants
						</div>
						<div class="flex flex-wrap gap-2.5">
							<Button variant="solid" color="primary">Solid Primary</Button>
							<Button variant="outline" color="primary">Outline</Button>
							<Button variant="soft" color="primary">Soft</Button>
							<Button variant="ghost" color="primary">Ghost</Button>
							<Button variant="solid" color="primary">
								<Icon name="sparkles" size="xs" class="mr-1.5" />
								With Icon
							</Button>
						</div>
					</div>

					<!-- Form Inputs Row -->
					<div>
						<div class="mb-2 text-xs font-semibold text-neutral-500 uppercase">Form Controls</div>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<Input placeholder="Theme-adaptive input..." />
							<Select
								options={[
									{ value: '1', label: 'Option 1' },
									{ value: '2', label: 'Option 2' }
								]}
								placeholder="Select option..."
							/>
						</div>
					</div>

					<!-- Interactive Charts Row -->
					<div>
						<div class="mb-2 text-xs font-semibold text-neutral-500 uppercase">
							Native SVG Charts
						</div>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
							<div
								class="rounded-xl border border-neutral-200 p-3 md:col-span-8 dark:border-neutral-800"
							>
								<LineChart
									data={sampleChartData}
									series={[
										{ key: 'revenue', label: 'Revenue ($)', area: true },
										{ key: 'active', label: 'Active Users', dashed: true }
									]}
									height={200}
								/>
							</div>
							<div
								class="flex items-center justify-center rounded-xl border border-neutral-200 p-3 md:col-span-4 dark:border-neutral-800"
							>
								<DonutChart data={sampleDonutData} size={150} strokeWidth={18} />
							</div>
						</div>
					</div>

					<!-- Badges & Chips -->
					<div>
						<div class="mb-2 text-xs font-semibold text-neutral-500 uppercase">
							Badges & Accents
						</div>
						<div class="flex flex-wrap gap-2">
							<Badge variant="solid" color="primary">Solid Badge</Badge>
							<Badge variant="outline" color="primary">Outline</Badge>
							<Badge variant="soft" color="primary">Soft Accent</Badge>
							<Badge variant="soft" color="success">Success</Badge>
							<Badge variant="soft" color="warning">Warning</Badge>
							<Badge variant="soft" color="error">Error</Badge>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>

<!-- Export Token Modal -->
<Modal bind:open={exportModalOpen} title="Export Theme Design Tokens" size="lg">
	<div class="space-y-4">
		<p class="text-xs text-neutral-500">
			Copy and paste these tokens directly into your project's stylesheet or configuration file.
		</p>

		<div>
			<div class="mb-1.5 flex items-center justify-between text-xs font-semibold">
				<span>Tailwind CSS v4 (@theme Block)</span>
				<Button
					size="xs"
					variant="ghost"
					onclick={() => copySnippet(generatedTailwindTheme, 'Tailwind Theme CSS')}
				>
					<Icon name="copy" size="xs" class="mr-1" />
					Copy CSS
				</Button>
			</div>
			<CodeBlock code={generatedTailwindTheme} language="css" class="my-0 text-xs" />
		</div>

		<div>
			<div class="mb-1.5 flex items-center justify-between text-xs font-semibold">
				<span>site.config.ts Configuration</span>
				<Button
					size="xs"
					variant="ghost"
					onclick={() => copySnippet(generatedSiteConfig, 'Site Config')}
				>
					<Icon name="copy" size="xs" class="mr-1" />
					Copy Config
				</Button>
			</div>
			<CodeBlock code={generatedSiteConfig} language="typescript" class="my-0 text-xs" />
		</div>
	</div>

	{#snippet footer()}
		<div class="flex justify-end">
			<Button variant="solid" onclick={() => (exportModalOpen = false)}>Done</Button>
		</div>
	{/snippet}
</Modal>
