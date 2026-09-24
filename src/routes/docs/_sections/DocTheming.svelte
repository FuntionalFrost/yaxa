<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import ThemeStudio from '$lib/components/theme/ThemeStudio.svelte';
</script>

<div class="space-y-12">
	<DocHeader
		title="Theme Studio & Dynamic Tokens"
		description="Live interactive customization of primary accent palettes, neutral scales, harmonic radii, typography presets, and auto-adaptive scrollbars."
		badge="Theming"
	/>

	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-neutral-900 dark:text-white">Interactive Theme Studio</h2>

			<Button href="/theme" variant="solid" size="sm">
				<Icon name="palette" size="xs" class="mr-1.5" />
				Full-Screen Studio
			</Button>
		</div>

		<p class="text-xs text-neutral-500">
			You can embed the `<ThemeStudio />` component anywhere in your app or access the standalone
			full-screen studio at `/theme`.
		</p>

		<div class="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
			<ThemeStudio />
		</div>
	</section>
</div>
