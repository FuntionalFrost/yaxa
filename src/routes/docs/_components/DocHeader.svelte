<script lang="ts">
	import Badge from '$lib/components/elements/Badge.svelte';
	import Link from '$lib/components/elements/Link.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import { useClipboard } from '$lib/composables/useClipboard.svelte';
	import { useToast } from '$lib/composables/useToast';

	interface Props {
		title: string;
		description: string;
		badge?: string;
		source?: string;
		category?: string;
		importStatement?: string;
	}

	let {
		title,
		description,
		badge = 'Svelte 5 Runes',
		source = '',
		category = '',
		importStatement = ''
	}: Props = $props();

	const clipboard = useClipboard();
	const toast = useToast();

	function handleCopy() {
		if (importStatement) {
			clipboard.copy(importStatement);
			toast.success('Copied to clipboard', importStatement);
		}
	}
</script>

<div class="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
	<div class="mb-3 flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			{#if category}
				<span
					class="text-xs font-semibold tracking-wider text-primary-600 uppercase dark:text-primary-400"
				>
					{category}
				</span>
				<span class="text-zinc-300 dark:text-zinc-700">/</span>
			{/if}
			{#if badge}
				<Badge color="primary" variant="subtle" size="sm">{badge}</Badge>
			{/if}
		</div>
		{#if source}
			<Link
				href="https://github.com/FuntionalFrost/yaxa/blob/main/{source}"
				external
				class="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
			>
				<Icon name="github" class="h-3.5 w-3.5" />
				<span>View Source</span>
			</Link>
		{/if}
	</div>
	<h1 class="mb-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
		{title}
	</h1>
	<p class="max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
		{description}
	</p>

	{#if importStatement}
		<div class="mt-4 flex items-center">
			<button
				type="button"
				onclick={handleCopy}
				class="group flex max-w-full items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-950 px-3.5 py-2 font-mono text-xs text-zinc-100 shadow-xs transition-all hover:border-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
				title="Click to copy import statement"
			>
				{#if importStatement.startsWith('import')}
					<span class="font-semibold text-primary-400 select-none">import</span>
					<span class="truncate text-zinc-200"
						>{importStatement.replace(/^import\s+/, '').replace(/\s+from\s+.*$/, '')}</span
					>
					<span class="font-semibold text-primary-400 select-none">from</span>
					<span class="text-emerald-400"
						>{importStatement.match(/from\s+('.*?'|".*?")/)?.[1] || "'yaxa-svelte'"}</span
					>
				{:else}
					<span class="text-primary-400 select-none">$</span>
					<span class="truncate font-semibold text-zinc-100">{importStatement}</span>
				{/if}
				<span class="ml-1.5 shrink-0 text-zinc-400 transition-colors group-hover:text-white">
					{#if clipboard.copied}
						<Icon name="check" class="h-3.5 w-3.5 text-emerald-400" />
					{:else}
						<Icon name="copy" class="h-3.5 w-3.5" />
					{/if}
				</span>
			</button>
		</div>
	{/if}
</div>
