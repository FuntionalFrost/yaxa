<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import Button from '#lib/components/elements/Button.svelte';
	import Icon from '#lib/components/elements/Icon.svelte';
	import ThemeStudio from '#lib/components/theme/ThemeStudio.svelte';
</script>

<div class="space-y-8">
	<DocHeader
		title="Theme Studio & Dynamic Tokens"
		description="Live interactive customization of primary accent palettes, neutral scales, harmonic radii, typography presets, and auto-adaptive scrollbars."
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
</div>
