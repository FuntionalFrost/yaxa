<script lang="ts">
	import ThemeStudio from '#lib/components/theme/ThemeStudio.svelte';
	import Container from '#lib/components/layout/Container.svelte';
	import Seo from '#lib/components/seo/Seo.svelte';
</script>

<Seo
	title="Theme Studio — Visual Tailwind CSS v4 & Svelte 5 Token Designer"
	description="Live interactive theme designer for primary accents, neutral base scales, harmonic radius, and pure SVG chart series palettes with 1-click Tailwind v4 @theme export."
	keywords={[
		'Theme Designer',
		'Tailwind CSS v4 Generator',
		'Svelte 5 Theme Studio',
		'Color Palette Generator',
		'Radius Scale',
		'Design Tokens'
	]}
	ogImage={{
		title: 'Theme Studio',
		description: 'Visual Tailwind v4 & Svelte 5 Theme Designer',
		badge: 'Theme Studio'
	}}
/>

<main class="py-4 sm:py-8">
	<Container size="2xl">
		<ThemeStudio />
	</Container>
</main>
