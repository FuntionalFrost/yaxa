<script module lang="ts">
	import { tv, cn, type VariantProps } from '#lib/utils/cn.js';
	import { SvelteMap } from 'svelte/reactivity';
	import type { Snippet } from 'svelte';
	import type { IconSource } from '../elements/Icon.svelte';

	// Reactive cross-instance tab synchronization registry
	const syncedTabs = new SvelteMap<string, string>();

	export const codeGroupVariants = tv({
		base: 'not-prose my-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm',
		variants: {
			themeMode: {
				dark: 'border-neutral-800 bg-neutral-950 text-neutral-100',
				adaptive:
					'border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100'
			}
		},
		defaultVariants: {
			themeMode: 'dark'
		}
	});

	export interface CodeGroupItem {
		label: string;
		value?: string;
		code: string;
		language?: string;
		filename?: string;
		icon?: IconSource;
		showLineNumbers?: boolean;
		highlightLines?: number[];
	}

	export interface CodeGroupSlots {
		root?: string;
		header?: string;
		tabList?: string;
		tab?: string;
		activeTab?: string;
		copyButton?: string;
		body?: string;
	}

	export type CodeGroupProps = VariantProps<typeof codeGroupVariants> & {
		items?: CodeGroupItem[];
		activeTab?: string;
		syncKey?: string;
		showLineNumbers?: boolean;
		wrap?: boolean;
		class?: string;
		ui?: CodeGroupSlots;
		children?: Snippet<[string]>;
	};
</script>

<script lang="ts">
	import CodeBlock from '../elements/CodeBlock.svelte';
	import Icon from '../elements/Icon.svelte';

	let {
		items = [],
		activeTab = $bindable(''),
		syncKey,
		showLineNumbers = false,
		wrap = false,
		themeMode = 'dark',
		class: className = '',
		ui,
		children
	}: CodeGroupProps = $props();

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	function getItemValue(item: CodeGroupItem): string {
		return item.value ?? item.label;
	}

	function inferLanguage(item: CodeGroupItem): string {
		if (item.language) return item.language;
		const lower = (item.filename || item.label).toLowerCase();
		if (['pnpm', 'npm', 'bun', 'yarn', 'npx', 'bash', 'sh', 'terminal', 'shell'].includes(lower)) {
			return 'bash';
		}
		if (lower.endsWith('.svelte')) return 'svelte';
		if (lower.endsWith('.ts') || lower.endsWith('.mts')) return 'typescript';
		if (lower.endsWith('.js') || lower.endsWith('.mjs')) return 'javascript';
		if (lower.endsWith('.json')) return 'json';
		if (lower.endsWith('.css')) return 'css';
		if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
		if (lower.endsWith('.md') || lower.endsWith('.svx')) return 'markdown';
		if (lower.endsWith('.sql')) return 'sql';
		return 'typescript';
	}

	let resolvedTab = $derived.by(() => {
		if (syncKey) {
			const memVal = syncedTabs.get(syncKey);
			if (memVal && items.some((item) => getItemValue(item) === memVal)) {
				return memVal;
			}
			if (typeof window !== 'undefined') {
				try {
					const stored = window.localStorage.getItem(`yaxa-cg:${syncKey}`);
					if (stored && items.some((item) => getItemValue(item) === stored)) {
						return stored;
					}
				} catch {
					// Ignore storage access errors
				}
			}
		}
		if (activeTab && items.some((item) => getItemValue(item) === activeTab)) {
			return activeTab;
		}
		return items.length > 0 ? getItemValue(items[0]) : '';
	});

	let currentItem = $derived(
		items.find((item) => getItemValue(item) === resolvedTab) ?? items[0] ?? null
	);

	function selectTab(val: string) {
		activeTab = val;
		if (syncKey) {
			syncedTabs.set(syncKey, val);
			if (typeof window !== 'undefined') {
				try {
					window.localStorage.setItem(`yaxa-cg:${syncKey}`, val);
				} catch {
					// Ignore storage write errors
				}
			}
		}
	}

	async function handleCopy() {
		if (!currentItem?.code) return;
		try {
			await navigator.clipboard.writeText(currentItem.code);
			copied = true;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard API unavailable
		}
	}
</script>

<div data-slot="root" class={cn(codeGroupVariants({ themeMode, class: className }), ui?.root)}>
	<!-- Tab Bar Header -->
	<div
		data-slot="header"
		class={cn(
			'flex items-center justify-between border-b px-3 py-1.5',
			themeMode === 'adaptive'
				? 'border-neutral-200 bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-900/80'
				: 'border-neutral-800 bg-neutral-900/80',
			ui?.header
		)}
	>
		<div
			data-slot="tabList"
			role="tablist"
			aria-label="Code group tabs"
			class={cn('flex items-center gap-1 overflow-x-auto', ui?.tabList)}
		>
			{#each items as item (item.value ?? item.label)}
				{@const val = getItemValue(item)}
				{@const isActive = resolvedTab === val}
				<button
					type="button"
					role="tab"
					aria-selected={isActive}
					data-slot="tab"
					data-state={isActive ? 'active' : 'inactive'}
					onclick={() => selectTab(val)}
					class={cn(
						'relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-medium whitespace-nowrap transition-colors focus:outline-none',
						themeMode === 'adaptive'
							? isActive
								? 'bg-white text-neutral-950 shadow-2xs dark:bg-neutral-800 dark:text-white'
								: 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
							: isActive
								? 'bg-neutral-800 text-white shadow-2xs'
								: 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200',
						ui?.tab,
						isActive && ui?.activeTab
					)}
				>
					{#if item.icon}
						<Icon name={item.icon} size="xs" />
					{/if}
					<span>{item.label}</span>
				</button>
			{/each}
		</div>

		{#if currentItem}
			<button
				type="button"
				data-slot="copyButton"
				onclick={handleCopy}
				class={cn(
					'ml-2 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
					themeMode === 'adaptive'
						? 'text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
						: 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
					ui?.copyButton
				)}
				aria-label="Copy code"
			>
				<Icon name={copied ? 'check' : 'copy'} size="xs" />
				<span>{copied ? 'Copied' : 'Copy'}</span>
			</button>
		{/if}
	</div>

	<!-- Active Code Body -->
	<div data-slot="body" class={cn('[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0', ui?.body)}>
		{#if children}
			{@render children(resolvedTab)}
		{:else if currentItem}
			<CodeBlock
				code={currentItem.code}
				language={inferLanguage(currentItem)}
				showLineNumbers={currentItem.showLineNumbers ?? showLineNumbers}
				highlightLines={currentItem.highlightLines}
				{wrap}
				{themeMode}
				class="my-0 rounded-none border-0 shadow-none"
			/>
		{/if}
	</div>
</div>
