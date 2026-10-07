<script lang="ts">
	import type { Snippet } from 'svelte';
	import DocCodeBlock from './DocCodeBlock.svelte';

	interface Props {
		title?: string;
		description?: string;
		code?: string;
		filename?: string;
		controls?: Snippet;
		children: Snippet;
		class?: string;
		id?: string;
	}

	let {
		title = 'Interactive Preview',
		description,
		code = '',
		filename = '',
		controls,
		children,
		class: className = '',
		id
	}: Props = $props();

	let activeTab = $state<'preview' | 'code'>('preview');
	let copied = $state(false);

	function copyCode() {
		if (typeof navigator !== 'undefined' && navigator.clipboard && code) {
			navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	const headingId = $derived(
		id ||
			(title && title !== 'Interactive Preview'
				? title
						.toLowerCase()
						.trim()
						.replace(/[^\w\s-]/g, '')
						.replace(/\s+/g, '-')
				: undefined)
	);
</script>

<div
	class="my-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 {className}"
>
	<div
		class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/70 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/90"
	>
		<div>
			<h3 id={headingId} class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
				{title}
			</h3>
			{#if description}
				<span class="ml-2 text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
			{/if}
		</div>
		{#if code}
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={copyCode}
					class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
					aria-label="Copy snippet to clipboard"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if copied}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						{/if}
					</svg>
					<span>{copied ? 'Copied' : 'Copy'}</span>
				</button>

				<div
					class="flex items-center gap-1 rounded-lg bg-zinc-200/80 p-0.5 text-xs dark:bg-zinc-800"
				>
					<button
						type="button"
						onclick={() => (activeTab = 'preview')}
						class="rounded-md px-2.5 py-1 text-xs font-medium transition-all {activeTab ===
						'preview'
							? 'bg-white font-semibold text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
							: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}"
					>
						Preview
					</button>
					<button
						type="button"
						onclick={() => (activeTab = 'code')}
						class="rounded-md px-2.5 py-1 text-xs font-medium transition-all {activeTab === 'code'
							? 'bg-white font-semibold text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
							: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}"
					>
						Code
					</button>
				</div>
			</div>
		{/if}
	</div>

	{#if activeTab === 'preview'}
		<div class="flex min-h-[120px] items-center justify-center p-6 sm:p-8">
			{@render children()}
		</div>
		{#if controls}
			<div
				class="border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
			>
				{@render controls()}
			</div>
		{/if}
	{:else if code}
		<DocCodeBlock {code} {filename} class="my-0 rounded-none border-0" />
	{/if}
</div>
