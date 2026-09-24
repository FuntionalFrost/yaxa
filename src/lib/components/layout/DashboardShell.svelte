<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const dashboardShellVariants = tv({
		slots: {
			root: 'flex min-h-screen w-full bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100',
			sidebar:
				'relative hidden flex-col border-r border-neutral-200 bg-[var(--yaxa-sidebar-bg,#ffffff)] text-[var(--yaxa-sidebar-fg,inherit)] transition-all duration-300 ease-in-out md:flex dark:border-neutral-800 dark:bg-[var(--yaxa-sidebar-bg,#18181b)]',
			topbar:
				'flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 md:px-6',
			main: 'flex flex-1 flex-col overflow-hidden',
			content: 'flex-1 overflow-y-auto p-4 md:p-6 lg:p-8'
		},
		variants: {
			collapsed: {
				true: {
					sidebar: 'w-18'
				},
				false: {
					sidebar: 'w-64'
				}
			}
		},
		defaultVariants: {
			collapsed: false
		}
	});

	export type DashboardShellProps = VariantProps<typeof dashboardShellVariants> & {
		collapsed?: boolean;
		mobileOpen?: boolean;
		stickyHeader?: boolean;
		brand?: Snippet;
		navigation?: Snippet<[{ collapsed: boolean }]>;
		sidebarFooter?: Snippet<[{ collapsed: boolean }]>;
		topbar?: Snippet;
		actions?: Snippet;
		children?: Snippet;
		class?: string;
		sidebarClass?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Drawer from '../overlays/Drawer.svelte';

	let {
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		stickyHeader = true,
		brand,
		navigation,
		sidebarFooter,
		topbar,
		actions,
		children,
		class: className = '',
		sidebarClass = ''
	}: DashboardShellProps = $props();

	const slots = $derived(dashboardShellVariants({ collapsed }));

	function toggleCollapse() {
		collapsed = !collapsed;
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			toggleCollapse();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="{slots.root()} {className}">
	<!-- Desktop Sidebar with Independent Design Token Support -->
	<aside class="{slots.sidebar()} {sidebarClass}" aria-label="Sidebar Navigation">
		<!-- Sidebar Brand Header -->
		<div
			class="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800"
		>
			<div class="flex items-center gap-3 overflow-hidden">
				{#if brand}
					{@render brand()}
				{/if}
			</div>

			<!-- Collapse Toggle Button -->
			<button
				type="button"
				onclick={toggleCollapse}
				class="hidden rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:inline-flex dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
				aria-label={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
				title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
			>
				<Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size="sm" />
			</button>
		</div>

		<!-- Sidebar Navigation Area -->
		<div class="flex-1 overflow-y-auto px-3 py-4">
			{#if navigation}
				{@render navigation({ collapsed })}
			{/if}
		</div>

		<!-- Sidebar Footer Area -->
		{#if sidebarFooter}
			<div class="border-t border-neutral-200 p-3 dark:border-neutral-800">
				{@render sidebarFooter({ collapsed })}
			</div>
		{/if}
	</aside>

	<!-- Mobile Drawer -->
	<Drawer bind:open={mobileOpen} responsive={false} showHandle={true} class="p-0">
		<div class="flex h-full flex-col bg-white dark:bg-neutral-900">
			<div
				class="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800"
			>
				<div class="flex items-center gap-3">
					{#if brand}
						{@render brand()}
					{/if}
				</div>
			</div>

			<div class="flex-1 overflow-y-auto px-4 py-4">
				{#if navigation}
					{@render navigation({ collapsed: false })}
				{/if}
			</div>

			{#if sidebarFooter}
				<div class="border-t border-neutral-200 p-4 dark:border-neutral-800">
					{@render sidebarFooter({ collapsed: false })}
				</div>
			{/if}
		</div>
	</Drawer>

	<!-- Main App Shell -->
	<div class={slots.main()}>
		<!-- Topbar Header -->
		<header class="{slots.topbar()} {stickyHeader ? 'sticky top-0 z-30' : ''}">
			<div class="flex items-center gap-3">
				<!-- Mobile Menu Trigger -->
				<button
					type="button"
					onclick={() => (mobileOpen = true)}
					class="inline-flex rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 md:hidden dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
					aria-label="Open mobile menu"
				>
					<Icon name="menu" size="md" />
				</button>

				{#if topbar}
					{@render topbar()}
				{/if}
			</div>

			{#if actions}
				<div class="flex items-center gap-2">
					{@render actions()}
				</div>
			{/if}
		</header>

		<!-- Main Content Viewport -->
		<main class={slots.content()}>
			{#if children}
				{@render children()}
			{/if}
		</main>
	</div>
</div>
