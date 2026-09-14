<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import Modal from '$lib/components/overlays/Modal.svelte';
	import Slideover from '$lib/components/overlays/Slideover.svelte';
	import Tooltip from '$lib/components/overlays/Tooltip.svelte';
	import DropdownMenu, { type MenuItem } from '$lib/components/navigation/DropdownMenu.svelte';
	import Alert from '$lib/components/overlays/Alert.svelte';
	import DataTable, { type Column } from '$lib/components/elements/DataTable.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import { useToast } from '$lib/composables/useToast';

	import Popover from '$lib/components/overlays/Popover.svelte';
	import Accordion, { type AccordionItem } from '$lib/components/overlays/Accordion.svelte';
	import ContextMenu, { type ContextMenuItem } from '$lib/components/overlays/ContextMenu.svelte';
	import Breadcrumb, { type BreadcrumbItem as NavBreadcrumbItem } from '$lib/components/navigation/Breadcrumb.svelte';
	import Pagination from '$lib/components/navigation/Pagination.svelte';

	let modalOpen = $state(false);
	let slideoverOpen = $state(false);
	let popoverOpen = $state(false);
	let currentPage = $state(2);
	let tableSearch = $state('');
	const toast = useToast();

	const demoTableData = [
		{ id: '1', name: 'Button.svelte', category: 'Elements', lines: 180, status: 'Ready' },
		{ id: '2', name: 'Modal.svelte', category: 'Overlays', lines: 140, status: 'Ready' },
		{ id: '3', name: 'FormField.svelte', category: 'Forms', lines: 110, status: 'Ready' },
		{ id: '4', name: 'DataTable.svelte', category: 'Elements', lines: 230, status: 'Beta' },
		{ id: '5', name: 'OgImage.svelte', category: 'SEO Suite', lines: 95, status: 'Ready' }
	];

	const demoColumns: Column[] = [
		{ key: 'name', label: 'Component Name', sortable: true },
		{ key: 'category', label: 'Category', sortable: true },
		{ key: 'lines', label: 'Lines of Code', sortable: true },
		{ key: 'status', label: 'Release Status' }
	];

	const dropdownItems: MenuItem[] = [
		{ id: '1', label: 'Edit Profile', icon: 'pencil' },
		{ id: '2', label: 'Documentation', icon: 'book-open' },
		{ id: '3', label: '', separator: true },
		{ id: '4', label: 'Log Out', icon: 'arrow-right-on-rectangle', destructive: true }
	];

	const contextMenuItems: ContextMenuItem[] = [
		{ id: '1', label: 'Copy Link', icon: 'clipboard', shortcut: '⌘C', onSelect: () => toast.success('Link copied') },
		{ id: '2', label: 'Inspect Component', icon: 'bolt', shortcut: '⌥I' },
		{ id: '3', label: 'Duplicate', icon: 'plus' },
		{ id: '4', label: '', separator: true },
		{ id: '5', label: 'Delete Row', icon: 'trash', destructive: true, onSelect: () => toast.error('Row deleted') }
	];

	const accordionItems: AccordionItem[] = [
		{
			value: 'q1',
			title: 'How does Yaxa differ from shadcn-svelte?',
			content: 'Yaxa is a zero-boilerplate single-package library (like Nuxt UI) rather than a code-copy CLI. Everything updates cleanly via npm/pnpm with full type safety.',
			icon: 'bolt'
		},
		{
			value: 'q2',
			title: 'Does it support SvelteKit 2.7+ and Svelte 5 Runes?',
			content: 'Yes! 100% of Yaxa primitives are written natively with Svelte 5 runes ($state, $derived, $effect, and snippet slots) and Tailwind CSS v4.',
			icon: 'sparkles'
		},
		{
			value: 'q3',
			title: 'Are SEO tags and Open Graph images automated?',
			content: 'Yes. Yaxa includes dynamic SVG OG image generation, automated sitemaps with XSL styling, robots.txt handlers, and Schema.org JSON-LD generation.',
			icon: 'document'
		}
	];

	const breadcrumbItems: NavBreadcrumbItem[] = [
		{ label: 'Home', href: '/', icon: 'home' },
		{ label: 'Docs', href: '/docs' },
		{ label: 'Components', href: '/docs/comp-overlays' },
		{ label: 'Overlays & Navigation' }
	];
</script>

<DocHeader
	title="Modals, Slideover Drawers, Toasts & DataTables"
	description="Accessible dialog overlays, slideover sheets, popovers, dropdown menus, context menus, alert banners, and reactive data tables."
	badge="Overlays"
	source="src/lib/components/overlays/Modal.svelte"
	category="Components"
/>

<div class="space-y-8">
	<!-- Modal & Slideover Sandbox -->
	<DocSandbox title="Modal Dialogs & Slideover Sheets">
		<div class="flex flex-wrap items-center justify-center gap-4">
			<Button variant="solid" color="primary" onclick={() => (modalOpen = true)}>
				<Icon name="window" class="mr-1.5 h-4 w-4" />
				Open Modal Dialog
			</Button>

			<Button variant="outline" color="neutral" onclick={() => (slideoverOpen = true)}>
				<Icon name="bars-3-bottom-right" class="mr-1.5 h-4 w-4" />
				Open Slideover Sheet
			</Button>
		</div>
	</DocSandbox>

	<!-- Modal Component -->
	<Modal
		bind:open={modalOpen}
		title="Deploying to Production"
		description="Review configuration before promoting build to edge network."
	>
		<p class="text-xs text-zinc-600 dark:text-zinc-400">
			Your application will be built and distributed globally across 300+ edge nodes in seconds with
			automatic TLS certificates.
		</p>
		{#snippet footer()}
			<div class="flex justify-end gap-2">
				<Button variant="ghost" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button
					color="primary"
					onclick={() => {
						modalOpen = false;
						toast.success('Deploy started', 'Promoting to production');
					}}
				>
					Confirm Deploy
				</Button>
			</div>
		{/snippet}
	</Modal>

	<!-- Slideover Component -->
	<Slideover
		bind:open={slideoverOpen}
		title="Project Settings"
		description="Manage environment variables and branch deployment rules."
	>
		<div class="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
			<p>Configure custom domains, automatic SSL certificates, and CI/CD webhooks.</p>
			<div class="rounded-lg bg-zinc-100 p-3 font-mono text-[11px] dark:bg-zinc-800/60">
				VERCEL_ANALYTICS_ID=yaxa_prod_99
			</div>
		</div>
		{#snippet footer()}
			<Button color="primary" class="w-full" onclick={() => (slideoverOpen = false)}>
				Save Changes
			</Button>
		{/snippet}
	</Slideover>

	<!-- Popovers, Tooltips & Dropdowns Sandbox -->
	<DocSandbox title="Popovers, Tooltips, Dropdowns & Context Menus">
		<div class="flex flex-wrap items-center justify-center gap-4">
			<Tooltip text="Svelte 5 Runes Native">
				<Button variant="outline">Hover for Tooltip</Button>
			</Tooltip>

			<DropdownMenu items={dropdownItems}>
				{#snippet trigger()}
					<Button variant="outline">
						User Menu <Icon name="chevron-down" class="ml-1.5 h-4 w-4" />
					</Button>
				{/snippet}
			</DropdownMenu>

			<Popover bind:open={popoverOpen}>
				{#snippet trigger()}
					<Button variant="outline">
						<Icon name="adjustments-horizontal" class="mr-1.5 h-4 w-4" />
						Filters Popover
					</Button>
				{/snippet}
				<div class="w-64 space-y-3">
					<h4 class="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">Display Settings</h4>
					<div class="space-y-2 text-xs">
						<label class="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
							<span>Compact view</span>
							<input type="checkbox" class="rounded accent-primary-600" />
						</label>
						<label class="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
							<span>Show sparklines</span>
							<input type="checkbox" checked class="rounded accent-primary-600" />
						</label>
					</div>
					<Button size="xs" color="primary" class="w-full" onclick={() => (popoverOpen = false)}>Apply</Button>
				</div>
			</Popover>

			<Button
				variant="solid"
				color="success"
				onclick={() => toast.success('Success notification', 'Changes saved automatically')}
			>
				Trigger Toast
			</Button>
		</div>

		<!-- Context Menu Target Area -->
		<div class="mt-6 w-full max-w-md mx-auto">
			<ContextMenu items={contextMenuItems}>
				<div class="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center transition-all hover:bg-neutral-100/50 dark:border-neutral-700 dark:bg-neutral-900/30 dark:hover:bg-neutral-900/60 cursor-context-menu">
					<Icon name="cursor-arrow-rays" class="mx-auto mb-2 h-6 w-6 text-neutral-400" />
					<p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Right-Click Area for Context Menu</p>
					<p class="text-[11px] text-neutral-500">Includes keyboard shortcuts, item separators & actions</p>
				</div>
			</ContextMenu>
		</div>
	</DocSandbox>

	<!-- Accordion Collapsible Panels Sandbox -->
	<DocSandbox title="Accordion (Collapsible FAQ & Panels)">
		<div class="w-full max-w-xl mx-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
			<Accordion items={accordionItems} type="single" />
		</div>
	</DocSandbox>

	<!-- Navigation: Breadcrumbs & Pagination Sandbox -->
	<DocSandbox title="Breadcrumb Navigation & Pagination Controls">
		<div class="w-full space-y-6">
			<div class="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/40">
				<span class="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Breadcrumb Trail</span>
				<Breadcrumb items={breadcrumbItems} separator="chevron-right" />
			</div>

			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<span class="text-xs text-neutral-500">Showing page <strong class="text-neutral-900 dark:text-white">{currentPage}</strong> of 10</span>
				<Pagination total={100} pageSize={10} bind:page={currentPage} />
			</div>
		</div>
	</DocSandbox>

	<!-- Alert Banners -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Alert Banners</h3>
		<div class="space-y-3">
			<Alert
				color="info"
				title="Svelte 5 Runes Support"
				description="Yaxa requires Svelte 5.0.0 or later and SvelteKit 2.7+."
			/>
			<Alert
				color="warning"
				title="Tailwind CSS v4 Requirement"
				description="Make sure to install @tailwindcss/vite and import 'yaxa/yaxa.css' in your root layout."
			/>
		</div>
	</div>

	<!-- DataTable Sandbox -->
	<div class="space-y-3">
		<h3 class="text-lg font-bold text-zinc-900 dark:text-white">Reactive DataTable Component</h3>
		<p class="text-xs text-zinc-600 dark:text-zinc-400">
			Includes built-in column sorting, search query filtering, and optional selectable rows:
		</p>
		<div
			class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
		>
			<div class="mb-3 max-w-xs">
				<Input bind:value={tableSearch} placeholder="Filter components..." icon="search" />
			</div>
			<DataTable data={demoTableData} columns={demoColumns} searchQuery={tableSearch} selectable>
				{#snippet cell(item: (typeof demoTableData)[number], col: Column)}
					{#if col.key === 'name'}
						<span class="font-mono font-bold text-primary-600 dark:text-primary-400"
							>{item.name}</span
						>
					{:else if col.key === 'status'}
						<Badge
							color={item.status === 'Ready' ? 'success' : 'warning'}
							size="xs"
							variant="subtle"
						>
							{item.status}
						</Badge>
					{:else}
						{item[col.key as keyof typeof item]}
					{/if}
				{/snippet}
			</DataTable>
		</div>
	</div>
</div>
