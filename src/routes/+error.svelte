<script lang="ts">
	import { page } from '$app/state';
	import Link from '$lib/components/elements/Link.svelte';
</script>

<svelte:head>
	<title>{page.status} · Yaxa</title>
</svelte:head>

<main class="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
	<p class="text-muted-foreground font-mono text-sm font-medium tracking-widest uppercase">
		Error {page.status}
	</p>
	<h1 class="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
		{#if page.status === 404}
			Page not found
		{:else}
			Something went wrong
		{/if}
	</h1>
	<p class="text-muted-foreground max-w-md text-base">
		{page.error?.message || 'An unexpected error occurred. Please try again or return home.'}
	</p>
	<Link href="/" class="mt-2">← Back to home</Link>
</main>
