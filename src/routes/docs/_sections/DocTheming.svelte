<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import ThemeStudio from '$lib/components/theme/ThemeStudio.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';

	const backgroundUtilitySnippet = `<!-- Atmospheric noise texture -->
<div class="relative overflow-hidden rounded-2xl border border-neutral-200 p-8 dark:border-neutral-800">
  <div class="pointer-events-none absolute inset-0 yaxa-grain opacity-25"></div>
  <h3 class="font-bold">Tactile Grain Card</h3>
  <p class="text-sm text-neutral-500">Pure inline SVG data-URI noise filter.</p>
</div>

<!-- Ambient mesh glow backdrop -->
<div class="relative overflow-hidden rounded-2xl border border-neutral-200 p-8 yaxa-mesh-glow dark:border-neutral-800">
  <h3 class="font-bold">Radial Mesh Glow</h3>
  <p class="text-sm text-neutral-500">Subtle ambient illumination adapted for light and dark modes.</p>
</div>`;
</script>

<div class="space-y-12">
	<DocHeader
		title="Theme Studio & Dynamic Tokens"
		description="Live interactive customization of primary accent palettes, neutral scales, harmonic radii, typography presets, atmospheric background utilities, and auto-adaptive scrollbars."
		badge="Theming"
	/>

	<section class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-bold text-neutral-900 dark:text-white">Interactive Theme Studio</h2>
				<p class="mt-1 text-xs text-neutral-500">
					You can embed the <code>&lt;ThemeStudio /&gt;</code> component anywhere in your app or
					access the standalone full-screen studio at <code>/theme</code>.
				</p>
			</div>

			<Button href="/theme" variant="outline" size="sm">
				<Icon name="palette" size="xs" class="mr-1.5" />
				Full-Screen Studio
			</Button>
		</div>

		<ThemeStudio showHeader={false} />
	</section>

	<section class="space-y-6">
		<div>
			<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
				Atmospheric Background Utilities
			</h2>
			<p class="mt-1 text-xs text-neutral-500">
				Lightweight Tailwind CSS v4 <code>@utility</code> classes built into <code>theme.css</code> to
				add tactile texture and ambient depth without runtime dependencies or external assets.
			</p>
		</div>

		<DocSandbox title="Grain & Radial Mesh Glow" code={backgroundUtilitySnippet}>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Grain Preview Card -->
				<div
					class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/40 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60"
				>
					<div class="pointer-events-none absolute inset-0 yaxa-grain opacity-30"></div>
					<div class="relative z-10 space-y-2">
						<div class="flex items-center justify-between">
							<Badge color="primary" variant="subtle" size="xs">.yaxa-grain</Badge>
							<span class="font-mono text-[11px] text-neutral-400">Inline SVG Filter</span>
						</div>
						<h3 class="text-sm font-bold text-neutral-900 dark:text-white">
							Tactile Analog Noise Texture
						</h3>
						<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
							Subtle micro-texture rendered via pure SVG data-URI noise. Zero external HTTP
							requests, zero raster bitmaps.
						</p>
					</div>
				</div>

				<!-- Mesh Glow Preview Card -->
				<div
					class="relative overflow-hidden rounded-2xl border border-neutral-200/80 yaxa-mesh-glow p-6 shadow-xs dark:border-neutral-800"
				>
					<div class="relative z-10 space-y-2">
						<div class="flex items-center justify-between">
							<Badge color="success" variant="subtle" size="xs">.yaxa-mesh-glow</Badge>
							<span class="font-mono text-[11px] text-neutral-400">Pure CSS Gradient</span>
						</div>
						<h3 class="text-sm font-bold text-neutral-900 dark:text-white">Ambient Radial Glow</h3>
						<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
							Soft multi-stop radial gradient tailored for dark and light modes. Perfect for hero
							sections, pricing cards, and featured callouts.
						</p>
					</div>
				</div>
			</div>
		</DocSandbox>
	</section>
</div>
