<script lang="ts">
	import { goto } from '$app/navigation';
	import { ALL_DOC_ITEMS } from '../_data/docs-nav';
	import Icon from '$lib/components/elements/Icon.svelte';
	import Kbd from '$lib/components/elements/Kbd.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';

	interface SearchItem {
		title: string;
		description: string;
		category: string;
		href: string;
		badge?: string;
		keywords?: string[];
	}

	const SEARCHABLE_ITEMS: SearchItem[] = [
		...ALL_DOC_ITEMS.map((item) => ({
			title: item.title,
			description: item.description,
			category: item.category,
			href: item.href,
			badge: item.badge,
			keywords: [item.label.toLowerCase(), item.id.toLowerCase()]
		})),
		// Direct component quick-jumps
		{
			title: 'DashboardShell',
			description:
				'Collapsible application shell with Ctrl+B shortcut and responsive mobile drawer.',
			category: 'Layout Blocks',
			href: '/docs/blocks#dashboard-shell',
			badge: 'Layout',
			keywords: ['sidebar', 'shell', 'dashboard', 'layout', 'drawer']
		},
		{
			title: 'VirtualList',
			description: 'Zero-dependency virtual windowing for 10,000+ items with 60fps scrolling.',
			category: 'Layout Blocks',
			href: '/docs/blocks#virtual-list',
			badge: 'Virtualization',
			keywords: ['scroll', 'virtual', 'list', 'performance', 'windowing']
		},
		{
			title: 'ResizablePanels',
			description:
				'Draggable horizontal and vertical split-panes with keyboard navigation & localStorage.',
			category: 'Layout Blocks',
			href: '/docs/blocks#resizable-panels',
			badge: 'Layout',
			keywords: ['split', 'resize', 'panels', 'drag', 'divider']
		},
		{
			title: 'Carousel',
			description: 'Touch-swipe slider with autoplay, pause-on-hover, and indicator dots.',
			category: 'Layout Blocks',
			href: '/docs/blocks#carousel',
			badge: 'Media',
			keywords: ['slider', 'carousel', 'swipe', 'touch', 'cards']
		},
		{
			title: 'InputOTP / PinInput',
			description: '6-slot OTP with auto-focus advance, backspace navigation, and paste splitting.',
			category: 'Forms & Pickers',
			href: '/docs/comp-forms#input-otp',
			badge: 'Forms',
			keywords: ['otp', 'pin', '2fa', 'code', 'auth']
		},
		{
			title: 'Combobox & MultiSelect',
			description: 'Searchable single and multi-chip selectors with keyboard filtering.',
			category: 'Forms & Pickers',
			href: '/docs/comp-forms#combobox',
			badge: 'Forms',
			keywords: ['select', 'combobox', 'multiselect', 'tags', 'chips']
		},
		{
			title: 'Modal & Drawer',
			description: 'Accessible dialog overlays and mobile-first bottom sheets with focus trap.',
			category: 'Overlays',
			href: '/docs/comp-overlays#modal',
			badge: 'Overlays',
			keywords: ['dialog', 'modal', 'drawer', 'popup', 'sheet']
		},
		{
			title: 'OrgSwitcher & Teams',
			description:
				'Multi-tenant organization switcher with Better-Auth integration and role badges.',
			category: 'SaaS Suite',
			href: '/docs/saas-suite#org-switcher',
			badge: 'Auth',
			keywords: ['organization', 'teams', 'org', 'tenant', 'roles']
		},
		{
			title: 'Dynamic OpenGraph Engine',
			description: 'Zero-WASM server-side SVG social preview card generator (/api/og).',
			category: 'Site & SEO',
			href: '/docs/seo-og',
			badge: 'SEO',
			keywords: ['og', 'opengraph', 'social', 'image', 'svg', 'twitter']
		}
	];

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let inputElement: HTMLInputElement | null = $state(null);

	let filteredResults = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return SEARCHABLE_ITEMS.slice(0, 8);
		return SEARCHABLE_ITEMS.filter((item) => {
			const inTitle = item.title.toLowerCase().includes(q);
			const inDesc = item.description.toLowerCase().includes(q);
			const inCategory = item.category.toLowerCase().includes(q);
			const inKeywords = item.keywords?.some((k) => k.includes(q)) ?? false;
			return inTitle || inDesc || inCategory || inKeywords;
		});
	});

	$effect(() => {
		if (open) {
			query = '';
			selectedIndex = 0;
			setTimeout(() => {
				inputElement?.focus();
			}, 50);
		}
	});

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = !open;
		} else if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % Math.max(1, filteredResults.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex =
				(selectedIndex - 1 + filteredResults.length) % Math.max(1, filteredResults.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selected = filteredResults[selectedIndex];
			if (selected) {
				navigateTo(selected.href);
			}
		}
	}

	function navigateTo(href: string) {
		open = false;
		goto(href);
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24"
		role="dialog"
		aria-modal="true"
		aria-label="Documentation search dialog"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
			onclick={() => (open = false)}
			aria-label="Close search modal"
		></button>

		<!-- Dialog Body -->
		<div
			class="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
			role="region"
			aria-label="Search box"
		>
			<!-- Search Input -->
			<div class="flex items-center border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
				<Icon name="search" class="mr-3 h-5 w-5 text-neutral-400" />
				<input
					id="doc-search-modal-input"
					name="docSearch"
					bind:this={inputElement}
					bind:value={query}
					onkeydown={handleModalKeydown}
					type="text"
					placeholder="Search documentation, components, props..."
					aria-label="Search documentation, components, props"
					class="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 outline-none dark:text-neutral-100"
				/>
				<button
					type="button"
					onclick={() => (open = false)}
					class="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					aria-label="Close search"
				>
					<Kbd>Esc</Kbd>
				</button>
			</div>

			<!-- Search Results List -->
			<div class="max-h-80 overflow-y-auto p-2">
				{#if filteredResults.length === 0}
					<div class="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
						No results found for "<span class="font-semibold text-neutral-800 dark:text-neutral-200"
							>{query}</span
						>".
					</div>
				{:else}
					<div class="space-y-1">
						{#each filteredResults as item, index}
							{@const isSelected = index === selectedIndex}
							<button
								type="button"
								onclick={() => navigateTo(item.href)}
								class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors {isSelected
									? 'bg-primary-50 text-primary-900 ring-1 ring-primary-500/30 dark:bg-primary-950/40 dark:text-primary-100 dark:ring-primary-400/30'
									: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'}"
							>
								<div class="min-w-0 pr-3">
									<div class="flex items-center gap-2">
										<span class="font-semibold text-neutral-900 dark:text-neutral-100"
											>{item.title}</span
										>
										<span class="text-[10px] text-neutral-400 dark:text-neutral-500"
											>{item.category}</span
										>
									</div>
									<p class="mt-0.5 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
										{item.description}
									</p>
								</div>
								{#if item.badge}
									<Badge size="xs" variant="subtle" color="primary" class="shrink-0">
										{item.badge}
									</Badge>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Keyboard Navigation Footer -->
			<div
				class="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/70 px-4 py-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400"
			>
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1">
						<Kbd>↑</Kbd>
						<Kbd>↓</Kbd>
						Navigate
					</span>
					<span class="flex items-center gap-1">
						<Kbd>↵</Kbd>
						Select
					</span>
				</div>
				<span>Press <Kbd>Esc</Kbd> to close</span>
			</div>
		</div>
	</div>
{/if}
