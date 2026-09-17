<script lang="ts">
	import { browser } from '$app/environment';
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

	// Navigation mode ('sidebar' | 'topbar') and TOC visibility
	let navMode = $state<'sidebar' | 'topbar'>('topbar');
	let showToc = $state<boolean>(true);
	let openCategory = $state<string | null>(null);

	// Initialize preferences from localStorage on mount
	if (browser) {
		const savedNav = localStorage.getItem('yaxa_docs_nav_mode');
		if (savedNav === 'sidebar' || savedNav === 'topbar') {
			navMode = savedNav;
		}
		const savedToc = localStorage.getItem('yaxa_docs_show_toc');
		if (savedToc !== null) {
			showToc = savedToc === 'true';
		}
	}

	function setNavMode(mode: 'sidebar' | 'topbar') {
		navMode = mode;
		openCategory = null;
		if (browser) {
			localStorage.setItem('yaxa_docs_nav_mode', mode);
		}
	}

	function toggleToc() {
		showToc = !showToc;
		if (browser) {
			localStorage.setItem('yaxa_docs_show_toc', String(showToc));
		}
	}

	function toggleCategory(cat: string) {
		openCategory = openCategory === cat ? null : cat;
	}

	// Dynamic main content column span based on layout settings
	let mainColSpan = $derived.by(() => {
		if (navMode === 'topbar') {
			return showToc ? 'lg:col-span-9 xl:col-span-10' : 'lg:col-span-12 xl:col-span-12';
		} else {
			return showToc ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-9 xl:col-span-9';
		}
	});
</script>

<DocSearchModal bind:open={searchOpen} />

<!-- Sub-header Breadcrumb & Layout Switcher Bar -->
<div
	class="border-b border-zinc-200 bg-zinc-50/70 py-2.5 transition-colors dark:border-zinc-800 dark:bg-zinc-900/40"
>
	<Container size="2xl">
		<div class="flex flex-wrap items-center justify-between gap-3 text-xs">
			<!-- Breadcrumb trail -->
			<div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
				<a href="/" class="font-medium hover:text-primary-600 dark:hover:text-primary-400">Home</a>
				<span>/</span>
				<a href="/docs/intro" class="font-medium hover:text-primary-600 dark:hover:text-primary-400"
					>Docs</a
				>
				<span>/</span>
				<span class="font-semibold text-zinc-900 dark:text-white">{currentItem.label}</span>
				<Badge size="xs" variant="subtle" color="primary" class="ml-1 hidden sm:inline-flex">
					{currentItem.category}
				</Badge>
			</div>

			<!-- Layout Controls (Sidebar/Topbar Mode & TOC Toggle) -->
			<div class="flex items-center gap-2">
				<!-- Nav Mode Switcher -->
				<div
					class="flex items-center rounded-lg border border-zinc-200 bg-zinc-200/60 p-0.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/70"
					role="group"
					aria-label="Navigation layout mode"
				>
					<button
						type="button"
						onclick={() => setNavMode('sidebar')}
						class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all {navMode ===
						'sidebar'
							? 'bg-white font-bold text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
							: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}"
						title="Left Sidebar navigation mode"
					>
						<Icon name="sidebar" class="h-3.5 w-3.5" />
						<span class="hidden sm:inline">Sidebar</span>
					</button>

					<button
						type="button"
						onclick={() => setNavMode('topbar')}
						class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all {navMode ===
						'topbar'
							? 'bg-white font-bold text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
							: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}"
						title="Horizontal Topbar navigation mode"
					>
						<Icon name="layout-top" class="h-3.5 w-3.5" />
						<span class="hidden sm:inline">Topbar</span>
					</button>
				</div>

				<!-- TOC Toggle Button -->
				<button
					type="button"
					onclick={toggleToc}
					class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all {showToc
						? 'border-primary-300 bg-primary-50 font-semibold text-primary-700 dark:border-primary-800/80 dark:bg-primary-950/50 dark:text-primary-300'
						: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white'}"
					title={showToc
						? 'Hide Table of Contents (On this page)'
						: 'Show Table of Contents (On this page)'}
				>
					<Icon name="panel-right" class="h-3.5 w-3.5" />
					<span class="hidden md:inline">{showToc ? 'TOC On' : 'TOC Off'}</span>
				</button>

				<!-- Quick Search Trigger in Topbar Mode -->
				{#if navMode === 'topbar'}
					<button
						type="button"
						onclick={() => (searchOpen = true)}
						class="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					>
						<Icon name="search" class="h-3.5 w-3.5" />
						<span class="hidden sm:inline">Search</span>
						<Kbd class="text-[9px]">Ctrl K</Kbd>
					</button>
				{/if}
			</div>
		</div>

		<!-- Horizontal Topbar Navigation Mode Bar (Visible when navMode === 'topbar') -->
		{#if navMode === 'topbar'}
			<div class="mt-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80">
				<!-- Category Dropdown Links -->
				<div class="flex flex-wrap items-center gap-2">
					{#each DOC_NAV_GROUPS as group (group.category)}
						{@const isGroupActive = group.items.some((i) => i.href === currentPath)}
						{@const isOpen = openCategory === group.category}
						<div class="relative">
							<button
								type="button"
								onclick={() => toggleCategory(group.category)}
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all {isGroupActive
									? 'bg-primary-600 text-white shadow-xs dark:bg-primary-500'
									: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800'}"
							>
								<span>{group.title}</span>
								<Icon
									name="chevron-down"
									class="h-3 w-3 opacity-70 transition-transform {isOpen ? 'rotate-180' : ''}"
								/>
							</button>

							<!-- Dropdown Menu -->
							{#if isOpen}
								<div
									class="absolute top-full left-0 z-40 mt-1.5 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900"
								>
									<div class="space-y-1">
										{#each group.items as item (item.href)}
											{@const active = currentPath === item.href}
											<a
												href={item.href}
												onclick={() => (openCategory = null)}
												class="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors {active
													? 'bg-primary-50 font-bold text-primary-600 dark:bg-primary-950/60 dark:text-primary-400'
													: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'}"
											>
												<span class="truncate">{item.label}</span>
												{#if item.badge}
													<Badge size="xs" variant={active ? 'solid' : 'subtle'} color="primary">
														{item.badge}
													</Badge>
												{/if}
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Mobile Horizontal Section Scrollbar (when in sidebar mode on small screens) -->
		{#if navMode === 'sidebar'}
			<div class="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
				{#each ALL_DOC_ITEMS as item (item.href)}
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
		{/if}
	</Container>
</div>

<!-- Main Documentation Grid Container -->
<Container size="2xl" class="py-8 sm:py-12">
	<div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
		<!-- Left Sidebar (Visible only when navMode === 'sidebar') -->
		{#if navMode === 'sidebar'}
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

				{#each DOC_NAV_GROUPS as group (group.category)}
					<div class="space-y-1.5">
						<h3
							class="px-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
						>
							{group.title}
						</h3>
						<nav class="space-y-0.5">
							{#each group.items as item (item.href)}
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
		{/if}

		<!-- Main Content Section -->
		<main class="min-w-0 {mainColSpan} transition-all">
			{@render children()}
			<DocPagination />
		</main>

		<!-- Right Sidebar (On This Page TOC - Rendered conditionally when showToc is true) -->
		{#if showToc}
			<aside
				class="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 lg:col-span-3 lg:block xl:col-span-2"
			>
				<DocToc />
			</aside>
		{/if}
	</div>
</Container>
