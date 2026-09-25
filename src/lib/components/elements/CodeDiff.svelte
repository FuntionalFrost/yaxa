<script module lang="ts">
	import { tokenizeCode } from './CodeBlock.svelte';

	export type DiffViewMode = 'split' | 'unified';
	export type DiffLineType = 'unchanged' | 'added' | 'removed';

	export interface UnifiedDiffLine {
		type: DiffLineType;
		oldLineNumber?: number;
		newLineNumber?: number;
		text: string;
	}

	export interface SplitDiffSide {
		lineNumber?: number;
		text: string;
		type: DiffLineType | 'empty';
	}

	export interface SplitDiffRow {
		left: SplitDiffSide;
		right: SplitDiffSide;
	}

	export interface CodeDiffProps {
		original: string;
		modified: string;
		language?: string;
		filename?: string;
		viewMode?: DiffViewMode;
		showLineNumbers?: boolean;
		themeMode?: 'dark' | 'adaptive';
		class?: string;
	}

	export function computeDiff(original: string, modified: string) {
		const oldLines = original.split('\n');
		const newLines = modified.split('\n');

		const n = oldLines.length;
		const m = newLines.length;

		// Compute LCS matrix
		const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

		for (let i = 1; i <= n; i++) {
			for (let j = 1; j <= m; j++) {
				if (oldLines[i - 1] === newLines[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1] + 1;
				} else {
					dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
				}
			}
		}

		// Backtrack to find diff operations
		const unified: UnifiedDiffLine[] = [];
		let i = n;
		let j = m;

		const rawOps: { type: DiffLineType; oldIdx?: number; newIdx?: number; text: string }[] = [];

		while (i > 0 || j > 0) {
			if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
				rawOps.unshift({
					type: 'unchanged',
					oldIdx: i,
					newIdx: j,
					text: oldLines[i - 1]
				});
				i--;
				j--;
			} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
				rawOps.unshift({
					type: 'added',
					newIdx: j,
					text: newLines[j - 1]
				});
				j--;
			} else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
				rawOps.unshift({
					type: 'removed',
					oldIdx: i,
					text: oldLines[i - 1]
				});
				i--;
			}
		}

		for (const op of rawOps) {
			unified.push({
				type: op.type,
				oldLineNumber: op.oldIdx,
				newLineNumber: op.newIdx,
				text: op.text
			});
		}

		// Build split rows
		const splitRows: SplitDiffRow[] = [];
		let leftPending: UnifiedDiffLine[] = [];
		let rightPending: UnifiedDiffLine[] = [];

		function flushPending() {
			const maxLen = Math.max(leftPending.length, rightPending.length);
			for (let k = 0; k < maxLen; k++) {
				const leftItem = leftPending[k];
				const rightItem = rightPending[k];

				splitRows.push({
					left: leftItem
						? {
								lineNumber: leftItem.oldLineNumber,
								text: leftItem.text,
								type: leftItem.type
							}
						: { text: '', type: 'empty' },
					right: rightItem
						? {
								lineNumber: rightItem.newLineNumber,
								text: rightItem.text,
								type: rightItem.type
							}
						: { text: '', type: 'empty' }
				});
			}
			leftPending = [];
			rightPending = [];
		}

		for (const line of unified) {
			if (line.type === 'unchanged') {
				flushPending();
				splitRows.push({
					left: { lineNumber: line.oldLineNumber, text: line.text, type: 'unchanged' },
					right: { lineNumber: line.newLineNumber, text: line.text, type: 'unchanged' }
				});
			} else if (line.type === 'removed') {
				leftPending.push(line);
			} else if (line.type === 'added') {
				rightPending.push(line);
			}
		}
		flushPending();

		const stats = {
			additions: unified.filter((l) => l.type === 'added').length,
			deletions: unified.filter((l) => l.type === 'removed').length
		};

		return { unified, splitRows, stats };
	}
</script>

<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Badge from './Badge.svelte';
	import { useToast } from '$lib/composables/useToast';

	let {
		original = '',
		modified = '',
		language = 'typescript',
		filename = '',
		viewMode = $bindable('unified'),
		showLineNumbers = true,
		themeMode = 'dark',
		class: className = ''
	}: CodeDiffProps = $props();

	let copied = $state(false);
	const toast = useToast();

	let diffData = $derived(computeDiff(original.trim(), modified.trim()));
	let isAdaptive = $derived(themeMode === 'adaptive');

	function copyModified() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(modified);
			copied = true;
			toast.success('Modified code copied', filename || `${language.toUpperCase()} diff`);
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div
	class="my-4 overflow-hidden rounded-xl border transition-all {isAdaptive
		? 'border-neutral-200 bg-neutral-50 shadow-xs dark:border-neutral-800 dark:bg-neutral-950'
		: 'border-neutral-800 bg-neutral-950 shadow-md'} {className}"
>
	<!-- Header Bar -->
	<div
		class="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 font-mono text-xs {isAdaptive
			? 'border-neutral-200 bg-neutral-100/80 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400'
			: 'border-neutral-800 bg-neutral-900/80 text-neutral-400'}"
	>
		<div class="flex items-center gap-2">
			{#if filename}
				<span
					class="flex items-center gap-1.5 font-medium {isAdaptive
						? 'text-neutral-800 dark:text-neutral-200'
						: 'text-neutral-200'}"
				>
					<Icon name="code" size="xs" class="text-primary-500" />
					{filename}
				</span>
			{:else}
				<span
					class="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase {isAdaptive
						? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
						: 'bg-neutral-800 text-neutral-400'}"
				>
					{language}
				</span>
			{/if}

			<div class="flex items-center gap-1.5 pl-2">
				{#if diffData.stats.additions > 0}
					<Badge variant="soft" color="success" size="xs">
						+{diffData.stats.additions}
					</Badge>
				{/if}
				{#if diffData.stats.deletions > 0}
					<Badge variant="soft" color="error" size="xs">
						-{diffData.stats.deletions}
					</Badge>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-2">
			<!-- View Mode Toggle -->
			<div
				class="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<button
					type="button"
					onclick={() => (viewMode = 'unified')}
					class="rounded px-2 py-0.5 text-[11px] font-medium transition-colors {viewMode ===
					'unified'
						? 'bg-primary-600 text-white shadow-xs'
						: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
				>
					Unified
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'split')}
					class="rounded px-2 py-0.5 text-[11px] font-medium transition-colors {viewMode === 'split'
						? 'bg-primary-600 text-white shadow-xs'
						: 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
				>
					Split
				</button>
			</div>

			<Button
				size="xs"
				variant="ghost"
				onclick={copyModified}
				class="h-6 px-2 text-xs {isAdaptive
					? 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
					: 'text-neutral-400 hover:text-white'}"
				aria-label="Copy modified code"
			>
				<Icon name={copied ? 'check' : 'copy'} size="xs" class="mr-1" />
				{copied ? 'Copied' : 'Copy'}
			</Button>
		</div>
	</div>

	<!-- Diff Body -->
	{#if viewMode === 'unified'}
		<!-- Unified View -->
		<pre
			class="overflow-x-auto p-2 font-mono text-xs leading-relaxed {isAdaptive
				? 'text-neutral-800 dark:text-neutral-200'
				: 'text-neutral-200'}"><code
				>{#each diffData.unified as line, idx (idx)}{@const tokenized = tokenizeCode(
						line.text || ' ',
						language
					)[0]}<div
						class="flex w-full items-center font-mono transition-colors {line.type === 'added'
							? 'bg-emerald-500/15 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
							: line.type === 'removed'
								? 'bg-rose-500/15 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
								: 'hover:bg-neutral-100/50 dark:hover:bg-neutral-900/40'}">{#if showLineNumbers}<div
								class="flex w-16 shrink-0 text-right text-[11px] opacity-50 select-none">
							<span class="w-8 pr-2">{line.type === 'added' ? '' : (line.oldLineNumber ?? '')}</span>
							<span class="w-8 pr-2">{line.type === 'removed' ? '' : (line.newLineNumber ?? '')}</span>
						</div>{/if}<span
							class="w-5 shrink-0 text-center font-bold select-none {line.type === 'added'
								? 'text-emerald-600 dark:text-emerald-400'
								: line.type === 'removed'
									? 'text-rose-600 dark:text-rose-400'
									: 'opacity-0'}"
							>{line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}</span
						><span class="flex-1 overflow-x-auto px-1 whitespace-pre"
							>{#each tokenized as token, tIdx (tIdx)}{#if token.type === 'rune'}<span
										class="font-bold text-amber-500 dark:text-amber-400">{token.text}</span
									>{:else if token.type === 'keyword'}<span class="font-semibold text-primary-500"
										>{token.text}</span
									>{:else if token.type === 'string'}<span
										class="text-emerald-600 dark:text-emerald-400">{token.text}</span
									>{:else if token.type === 'comment'}<span
										class="text-neutral-400 italic dark:text-neutral-500">{token.text}</span
									>{:else if token.type === 'tag'}<span
										class="font-semibold text-rose-600 dark:text-rose-400">{token.text}</span
									>{:else if token.type === 'directive'}<span
										class="font-medium text-amber-600 dark:text-amber-400">{token.text}</span
									>{:else if token.type === 'attr'}<span class="text-amber-600 dark:text-amber-300"
										>{token.text}</span
									>{:else if token.type === 'function'}<span class="text-sky-600 dark:text-sky-400"
										>{token.text}</span
									>{:else if token.type === 'macro'}<span
										class="font-semibold text-indigo-600 dark:text-indigo-400">{token.text}</span
									>{:else if token.type === 'number'}<span
										class="text-purple-600 dark:text-purple-400">{token.text}</span
									>{:else if token.type === 'punctuation'}<span
										class="text-neutral-500 dark:text-neutral-400">{token.text}</span
									>{:else}<span>{token.text}</span>{/if}{/each}</span
						></div>{/each}</code
			></pre>
	{:else}
		<!-- Split Side-by-Side View -->
		<div
			class="grid grid-cols-2 divide-x divide-neutral-200 overflow-x-auto p-2 font-mono text-xs leading-relaxed dark:divide-neutral-800 {isAdaptive
				? 'text-neutral-800 dark:text-neutral-200'
				: 'text-neutral-200'}"
		>
			<!-- Left (Original / Removed) -->
			<div class="space-y-0.5 pr-1">
				<div
					class="border-b border-neutral-200 px-2 py-1 text-[11px] font-bold text-neutral-500 uppercase select-none dark:border-neutral-800 dark:text-neutral-400"
				>
					Original (Before)
				</div>
				{#each diffData.splitRows as row, idx (idx)}
					{@const tokenized = tokenizeCode(row.left.text || ' ', language)[0]}
					<div
						class="flex w-full items-center {row.left.type === 'removed'
							? 'bg-rose-500/15 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
							: row.left.type === 'empty'
								? 'bg-neutral-100/40 opacity-30 dark:bg-neutral-900/30'
								: 'hover:bg-neutral-100/50 dark:hover:bg-neutral-900/40'}"
					>
						{#if showLineNumbers}
							<span class="w-8 shrink-0 pr-2 text-right text-[11px] opacity-50 select-none">
								{row.left.lineNumber ?? ''}
							</span>
						{/if}
						<span
							class="w-4 shrink-0 text-center font-bold select-none {row.left.type === 'removed'
								? 'text-rose-600 dark:text-rose-400'
								: 'opacity-0'}"
						>
							{row.left.type === 'removed' ? '-' : ' '}
						</span>
						<span class="flex-1 overflow-x-auto px-1 whitespace-pre">
							{#each tokenized as token, tIdx (tIdx)}
								{#if token.type === 'rune'}
									<span class="font-bold text-amber-500 dark:text-amber-400">{token.text}</span>
								{:else if token.type === 'keyword'}
									<span class="font-semibold text-primary-500">{token.text}</span>
								{:else if token.type === 'string'}
									<span class="text-emerald-600 dark:text-emerald-400">{token.text}</span>
								{:else if token.type === 'comment'}
									<span class="text-neutral-400 italic dark:text-neutral-500">{token.text}</span>
								{:else if token.type === 'tag'}
									<span class="font-semibold text-rose-600 dark:text-rose-400">{token.text}</span>
								{:else if token.type === 'directive'}
									<span class="font-medium text-amber-600 dark:text-amber-400">{token.text}</span>
								{:else if token.type === 'attr'}
									<span class="text-amber-600 dark:text-amber-300">{token.text}</span>
								{:else if token.type === 'function'}
									<span class="text-sky-600 dark:text-sky-400">{token.text}</span>
								{:else if token.type === 'number'}
									<span class="text-purple-600 dark:text-purple-400">{token.text}</span>
								{:else if token.type === 'punctuation'}
									<span class="text-neutral-500 dark:text-neutral-400">{token.text}</span>
								{:else}
									<span>{token.text}</span>
								{/if}
							{/each}
						</span>
					</div>
				{/each}
			</div>

			<!-- Right (Modified / Added) -->
			<div class="space-y-0.5 pl-1">
				<div
					class="border-b border-neutral-200 px-2 py-1 text-[11px] font-bold text-neutral-500 uppercase select-none dark:border-neutral-800 dark:text-neutral-400"
				>
					Modified (After)
				</div>
				{#each diffData.splitRows as row, idx (idx)}
					{@const tokenized = tokenizeCode(row.right.text || ' ', language)[0]}
					<div
						class="flex w-full items-center {row.right.type === 'added'
							? 'bg-emerald-500/15 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
							: row.right.type === 'empty'
								? 'bg-neutral-100/40 opacity-30 dark:bg-neutral-900/30'
								: 'hover:bg-neutral-100/50 dark:hover:bg-neutral-900/40'}"
					>
						{#if showLineNumbers}
							<span class="w-8 shrink-0 pr-2 text-right text-[11px] opacity-50 select-none">
								{row.right.lineNumber ?? ''}
							</span>
						{/if}
						<span
							class="w-4 shrink-0 text-center font-bold select-none {row.right.type === 'added'
								? 'text-emerald-600 dark:text-emerald-400'
								: 'opacity-0'}"
						>
							{row.right.type === 'added' ? '+' : ' '}
						</span>
						<span class="flex-1 overflow-x-auto px-1 whitespace-pre">
							{#each tokenized as token, tIdx (tIdx)}
								{#if token.type === 'rune'}
									<span class="font-bold text-amber-500 dark:text-amber-400">{token.text}</span>
								{:else if token.type === 'keyword'}
									<span class="font-semibold text-primary-500">{token.text}</span>
								{:else if token.type === 'string'}
									<span class="text-emerald-600 dark:text-emerald-400">{token.text}</span>
								{:else if token.type === 'comment'}
									<span class="text-neutral-400 italic dark:text-neutral-500">{token.text}</span>
								{:else if token.type === 'tag'}
									<span class="font-semibold text-rose-600 dark:text-rose-400">{token.text}</span>
								{:else if token.type === 'directive'}
									<span class="font-medium text-amber-600 dark:text-amber-400">{token.text}</span>
								{:else if token.type === 'attr'}
									<span class="text-amber-600 dark:text-amber-300">{token.text}</span>
								{:else if token.type === 'function'}
									<span class="text-sky-600 dark:text-sky-400">{token.text}</span>
								{:else if token.type === 'number'}
									<span class="text-purple-600 dark:text-purple-400">{token.text}</span>
								{:else if token.type === 'punctuation'}
									<span class="text-neutral-500 dark:text-neutral-400">{token.text}</span>
								{:else}
									<span>{token.text}</span>
								{/if}
							{/each}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
