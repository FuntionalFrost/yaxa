<script lang="ts">
	import { page } from '$app/state';
	import { DOC_NAV_GROUPS, ALL_DOC_ITEMS } from './_data/docs-nav';
	import Container from '$lib/components/layout/Container.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import Kbd from '$lib/components/elements/Kbd.svelte';
	import DocSearchModal from './_components/DocSearchModal.svelte';
	import DocToc from './_components/DocToc.svelte';
	import DocPagination from './_components/DocPagination.svelte';

	let { children } = $props();

	let searchOpen = $state(false);
	let currentPath = $derived(page.url.pathname);
	let currentItem = $derived(ALL_DOC_ITEMS.find((i) => i.href === currentPath) || ALL_DOC_ITEMS[0]);
</script>

<DocSearchModal bind:open={searchOpen} />

<div class="border-b border-zinc-200 bg-zinc-50/50 py-3 dark:border-zinc-800 dark:bg-zinc-900/30">
	<Container size="2xl">
		<div class="flex items-center justify-between gap-4 text-xs">
			<!-- Breadcrumb trail -->
			<div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
				<a href="/" class="font-medium hover:text-primary-600 dark:hover:text-primary-400">Home</a>
				<span>/</span>
				<a href="/docs/intro" class="font-medium hover:text-primary-600 dark:hover:text-primary-400"
					>Docs</a
				>
				<span>/</span>
				<span class="font-semibold text-zinc-900 dark:text-white">{currentItem.label}</span>
			</div>

			<!-- Search Button & External Links -->
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={() => (searchOpen = true)}
					class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
					aria-label="Search documentation (Ctrl+K)"
				>
					<Icon name="search" class="h-3.5 w-3.5" />
					<span class="hidden sm:inline">Search docs...</span>
					<Kbd class="hidden text-[10px] sm:inline-block">Ctrl K</Kbd>
				</button>

				<div class="hidden items-center gap-3 font-mono text-zinc-500 sm:inline-flex">
					<a
						href="https://www.npmjs.com/package/yaxa-svelte"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1.5 hover:text-red-500 dark:hover:text-red-400"
					>
						<Icon name="npm" class="h-3.5 w-3.5" />
						<span>npm</span>
					</a>
					<span class="text-zinc-300 dark:text-zinc-700">·</span>
					<a
						href="https://github.com/FuntionalFrost/yaxa"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white"
					>
						<Icon name="github" class="h-3.5 w-3.5" />
						<span>GitHub</span>
					</a>
				</div>
			</div>
		</div>

		<!-- Mobile Horizontal Section Scrollbar -->
		<div class="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
			{#each ALL_DOC_ITEMS as item}
				{@const active = currentPath === item.href}
				<a
					href={item.href}
					class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all {active
						? 'bg-primary-600 text-white shadow-xs dark:bg-primary-500'
						: 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}"
				>
					{item.label}
				</a>
			{/each}
		</div>
	</Container>
</div>

<Container size="2xl" class="py-8 sm:py-12">
	<div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
		<!-- Left Sidebar (Sticky Desktop) -->
		<aside
			class="sticky top-24 hidden max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto pr-4 lg:col-span-3 lg:block"
		>
			<button
				type="button"
				onclick={() => (searchOpen = true)}
				class="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
			>
				<span class="flex items-center gap-2">
					<Icon name="search" class="h-3.5 w-3.5" />
					<span>Search...</span>
				</span>
				<Kbd class="text-[10px]">Ctrl K</Kbd>
			</button>

			{#each DOC_NAV_GROUPS as group}
				<div class="space-y-1.5">
					<h3
						class="px-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
					>
						{group.title}
					</h3>
					<nav class="space-y-0.5">
						{#each group.items as item}
							{@const active = currentPath === item.href}
							<a
								href={item.href}
								class="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all {active
									? 'bg-primary-50 font-bold text-primary-600 ring-1 ring-primary-500/20 dark:bg-primary-950/40 dark:text-primary-400 dark:ring-primary-400/30'
									: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-white'}"
							>
								<span class="truncate">{item.label}</span>
								{#if item.badge}
									<Badge size="xs" variant={active ? 'solid' : 'subtle'} color="primary">
										{item.badge}
									</Badge>
								{/if}
							</a>
						{/each}
					</nav>
				</div>
			{/each}
		</aside>

		<!-- Main Content Section -->
		<main class="min-w-0 lg:col-span-6 xl:col-span-7">
			{@render children()}
			<DocPagination />
		</main>

		<!-- Right Sidebar (On This Page TOC) -->
		<aside
			class="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 lg:col-span-3 lg:block xl:col-span-2"
		>
			<DocToc />
		</aside>
	</div>
</Container>
