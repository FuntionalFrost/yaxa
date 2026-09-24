<script lang="ts">
	import ThemeStudio from '$lib/components/theme/ThemeStudio.svelte';
	import Container from '$lib/components/layout/Container.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
</script>

<Header>
	{#snippet actions()}
		<div class="flex items-center gap-2">
			<Button href="/docs" variant="ghost" size="sm">Docs</Button>
			<Button href="/" variant="outline" size="sm">
				<Icon name="home" size="xs" class="mr-1.5" />
				Home
			</Button>
		</div>
	{/snippet}
</Header>

<main class="py-8">
	<Container size="2xl">
		<ThemeStudio />
	</Container>
</main>

<Footer />
