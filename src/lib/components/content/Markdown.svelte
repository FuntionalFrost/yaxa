<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CalloutType } from './Callout.svelte';

	export const markdownVariants = tv({
		slots: {
			root: 'yaxa-markdown space-y-4 text-neutral-700 leading-relaxed dark:text-neutral-300',
			h1: 'mt-6 mb-3 text-3xl font-extrabold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-50',
			h2: 'mt-6 mb-2.5 border-b border-neutral-200/80 pb-2 text-2xl font-bold tracking-tight text-neutral-900 first:mt-0 dark:border-neutral-800/80 dark:text-neutral-100',
			h3: 'mt-5 mb-2 text-xl font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-100',
			h4: 'mt-4 mb-1.5 text-base font-semibold text-neutral-900 first:mt-0 dark:text-neutral-200',
			p: 'text-sm leading-7 text-neutral-700 dark:text-neutral-300',
			blockquote:
				'border-l-4 border-primary-500/60 bg-neutral-50/70 py-2 pr-4 pl-4 italic text-sm text-neutral-600 rounded-r-lg dark:bg-neutral-900/50 dark:text-neutral-400',
			ul: 'list-disc space-y-1.5 pl-5 text-sm text-neutral-700 dark:text-neutral-300',
			ol: 'list-decimal space-y-1.5 pl-5 text-sm text-neutral-700 dark:text-neutral-300',
			taskList: 'space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300',
			li: 'leading-relaxed',
			tableWrapper:
				'not-prose my-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800',
			table: 'w-full border-collapse text-left text-sm',
			th: 'border-b border-neutral-200 bg-neutral-50/90 px-4 py-2.5 font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100',
			td: 'border-b border-neutral-100 px-4 py-2.5 text-neutral-700 last:border-b-0 dark:border-neutral-800/60 dark:text-neutral-300',
			hr: 'my-6 border-neutral-200 dark:border-neutral-800'
		},
		variants: {
			size: {
				sm: {
					root: 'space-y-3 text-xs',
					p: 'text-xs leading-6',
					ul: 'text-xs',
					ol: 'text-xs'
				},
				md: {},
				lg: {
					root: 'space-y-5 text-base',
					p: 'text-base leading-8',
					ul: 'text-base',
					ol: 'text-base'
				}
			}
		},
		defaultVariants: {
			size: 'md'
		}
	});

	export type MarkdownVariants = VariantProps<typeof markdownVariants>;
	export type MarkdownSlots = keyof typeof markdownVariants.slots;

	export type InlineToken =
		| { type: 'text'; text: string }
		| { type: 'code'; text: string }
		| { type: 'bold'; text: string }
		| { type: 'italic'; text: string }
		| { type: 'strike'; text: string }
		| { type: 'link'; text: string; href: string; external: boolean };

	export type MarkdownBlock =
		| { id: string; type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string; slug: string }
		| { id: string; type: 'paragraph'; text: string }
		| { id: string; type: 'code'; language: string; filename?: string; code: string }
		| { id: string; type: 'callout'; calloutType: CalloutType; title?: string; text: string }
		| { id: string; type: 'blockquote'; text: string }
		| {
				id: string;
				type: 'list';
				ordered: boolean;
				isTask: boolean;
				items: { text: string; checked?: boolean }[];
		  }
		| {
				id: string;
				type: 'table';
				headers: string[];
				alignments: ('left' | 'center' | 'right')[];
				rows: string[][];
		  }
		| { id: string; type: 'hr' };

	export interface MarkdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
		/**
		 * Raw Markdown / GFM string to render.
		 */
		content: string;
		/**
		 * Typography scale preset.
		 * @default 'md'
		 */
		size?: MarkdownVariants['size'];
		/**
		 * Show line numbers inside fenced code blocks.
		 * @default false
		 */
		showLineNumbers?: boolean;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<MarkdownSlots, string>>;
	}

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-');
	}

	/**
	 * Tokenizes inline Markdown (`code`, **bold**, *italic*, ~~strike~~, [link](href))
	 * into safe AST tokens rendered via native Svelte DOM nodes (zero `{@html}` / XSS-proof).
	 */
	export function tokenizeInlineMarkdown(raw: string): InlineToken[] {
		if (!raw) return [];
		const tokens: InlineToken[] = [];
		const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*\n]+)\*/g;

		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = pattern.exec(raw)) !== null) {
			if (match.index > lastIndex) {
				tokens.push({ type: 'text', text: raw.slice(lastIndex, match.index) });
			}

			if (match[1] !== undefined) {
				tokens.push({ type: 'code', text: match[1] });
			} else if (match[2] !== undefined && match[3] !== undefined) {
				const label = match[2];
				const href = match[3].trim();
				const isSafe = /^(?:https?:\/\/|mailto:|\/|#|\.\.?\/)/i.test(href);
				if (isSafe) {
					tokens.push({
						type: 'link',
						text: label,
						href,
						external: /^https?:\/\//i.test(href)
					});
				} else {
					tokens.push({ type: 'text', text: label });
				}
			} else if (match[4] !== undefined) {
				tokens.push({ type: 'bold', text: match[4] });
			} else if (match[5] !== undefined) {
				tokens.push({ type: 'strike', text: match[5] });
			} else if (match[6] !== undefined) {
				tokens.push({ type: 'italic', text: match[6] });
			}

			lastIndex = pattern.lastIndex;
		}

		if (lastIndex < raw.length) {
			tokens.push({ type: 'text', text: raw.slice(lastIndex) });
		}

		return tokens;
	}

	/**
	 * Parses a Markdown / GFM document into structured AST blocks.
	 */
	export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
		const lines = (markdown ?? '').replace(/\r\n/g, '\n').split('\n');
		const blocks: MarkdownBlock[] = [];
		let i = 0;
		let blockCounter = 0;
		const nextId = () => `md-block-${++blockCounter}`;

		while (i < lines.length) {
			const line = lines[i];
			const trimmed = line.trim();

			if (!trimmed) {
				i++;
				continue;
			}

			// 1. Fenced Code Block: ```lang filename
			const fenceMatch = trimmed.match(/^```(\S*)?(?:\s+(.+))?$/);
			if (fenceMatch) {
				const language = fenceMatch[1] || 'text';
				const meta = fenceMatch[2]?.trim();
				const filename = meta?.replace(/^filename=/, '').replace(/^['"]|['"]$/g, '');
				i++;
				const codeLines: string[] = [];
				while (i < lines.length && !lines[i].trim().startsWith('```')) {
					codeLines.push(lines[i]);
					i++;
				}
				if (i < lines.length) i++;
				blocks.push({
					id: nextId(),
					type: 'code',
					language,
					filename,
					code: codeLines.join('\n')
				});
				continue;
			}

			// 2. Horizontal Rule
			if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
				blocks.push({ id: nextId(), type: 'hr' });
				i++;
				continue;
			}

			// 3. Heading (# .. ######)
			const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
			if (headingMatch) {
				const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
				const text = headingMatch[2].trim();
				blocks.push({
					id: nextId(),
					type: 'heading',
					level,
					text,
					slug: slugify(text)
				});
				i++;
				continue;
			}

			// 4. Blockquote or GitHub Alert (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])
			if (trimmed.startsWith('>')) {
				const quoteLines: string[] = [];
				while (i < lines.length && lines[i].trim().startsWith('>')) {
					quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
					i++;
				}
				const firstLine = quoteLines[0] ?? '';
				const alertMatch = firstLine.match(
					/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO|SUCCESS|DANGER)\](?:\s+(.*))?$/i
				);
				if (alertMatch) {
					const rawType = alertMatch[1].toLowerCase() as CalloutType;
					const customTitle = alertMatch[2]?.trim() || undefined;
					const bodyText = quoteLines.slice(1).join(' ').trim();
					blocks.push({
						id: nextId(),
						type: 'callout',
						calloutType: rawType,
						title: customTitle,
						text: bodyText || customTitle || ''
					});
				} else {
					blocks.push({
						id: nextId(),
						type: 'blockquote',
						text: quoteLines.join(' ')
					});
				}
				continue;
			}

			// 5. GFM Table
			if (
				trimmed.includes('|') &&
				i + 1 < lines.length &&
				/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])
			) {
				const parseRow = (rowStr: string) =>
					rowStr
						.trim()
						.replace(/^\||\|$/g, '')
						.split('|')
						.map((c) => c.trim());

				const headers = parseRow(lines[i]);
				const alignCells = parseRow(lines[i + 1]);
				const alignments: ('left' | 'center' | 'right')[] = alignCells.map((cell) => {
					if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
					if (cell.endsWith(':')) return 'right';
					return 'left';
				});
				i += 2;
				const rows: string[][] = [];
				while (i < lines.length && lines[i].trim().includes('|')) {
					rows.push(parseRow(lines[i]));
					i++;
				}
				blocks.push({
					id: nextId(),
					type: 'table',
					headers,
					alignments,
					rows
				});
				continue;
			}

			// 6. Unordered / Ordered / Task Lists
			if (/^(?:[-*+]\s+|\d+\.\s+)/.test(trimmed)) {
				const ordered = /^\d+\.\s+/.test(trimmed);
				const items: { text: string; checked?: boolean }[] = [];
				let isTask = false;

				while (i < lines.length && /^(?:[-*+]\s+|\d+\.\s+)/.test(lines[i].trim())) {
					const rawItem = lines[i].trim().replace(/^(?:[-*+]|\d+\.)\s+/, '');
					const taskMatch = rawItem.match(/^\[([ xX])\]\s+(.*)$/);
					if (taskMatch) {
						isTask = true;
						items.push({
							checked: taskMatch[1].toLowerCase() === 'x',
							text: taskMatch[2]
						});
					} else {
						items.push({ text: rawItem });
					}
					i++;
				}

				blocks.push({
					id: nextId(),
					type: 'list',
					ordered,
					isTask,
					items
				});
				continue;
			}

			// 7. Paragraph
			const paraLines: string[] = [];
			while (
				i < lines.length &&
				lines[i].trim() !== '' &&
				!lines[i].trim().startsWith('```') &&
				!lines[i].trim().startsWith('#') &&
				!lines[i].trim().startsWith('>') &&
				!/^(?:[-*+]\s+|\d+\.\s+)/.test(lines[i].trim()) &&
				!/^(?:---|\*\*\*|___)\s*$/.test(lines[i].trim())
			) {
				paraLines.push(lines[i].trim());
				i++;
			}
			blocks.push({
				id: nextId(),
				type: 'paragraph',
				text: paraLines.join(' ')
			});
		}

		return blocks;
	}
</script>

<script lang="ts">
	import { cn } from '../../utils/cn';
	import CodeBlock from '../elements/CodeBlock.svelte';
	import Callout from './Callout.svelte';

	let {
		content,
		size = 'md',
		showLineNumbers = false,
		ui,
		class: className = '',
		...restProps
	}: MarkdownProps = $props();

	const slots = $derived(markdownVariants({ size }));
	const blocks = $derived(parseMarkdownBlocks(content));
</script>

{#snippet renderInline(raw: string)}
	{#each tokenizeInlineMarkdown(raw) as token, tIdx (tIdx)}
		{#if token.type === 'text'}
			{token.text}
		{:else if token.type === 'code'}
			<code
				class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-primary-600 dark:bg-neutral-800 dark:text-primary-400"
				>{token.text}</code
			>
		{:else if token.type === 'bold'}
			<strong class="font-semibold text-neutral-900 dark:text-neutral-100">{token.text}</strong>
		{:else if token.type === 'italic'}
			<em class="italic">{token.text}</em>
		{:else if token.type === 'strike'}
			<del class="line-through opacity-75">{token.text}</del>
		{:else if token.type === 'link'}
			<a
				href={token.href}
				target={token.external ? '_blank' : undefined}
				rel={token.external ? 'noopener noreferrer' : undefined}
				class="font-medium text-primary-600 underline underline-offset-4 hover:text-primary-500 dark:text-primary-400"
				>{token.text}</a
			>
		{/if}
	{/each}
{/snippet}

<div data-slot="root" class={cn(slots.root({ class: ui?.root }), className)} {...restProps}>
	{#each blocks as block (block.id)}
		{#if block.type === 'heading'}
			{#if block.level === 1}
				<h1 id={block.slug} data-slot="h1" class={slots.h1({ class: ui?.h1 })}>
					{@render renderInline(block.text)}
				</h1>
			{:else if block.level === 2}
				<h2 id={block.slug} data-slot="h2" class={slots.h2({ class: ui?.h2 })}>
					{@render renderInline(block.text)}
				</h2>
			{:else if block.level === 3}
				<h3 id={block.slug} data-slot="h3" class={slots.h3({ class: ui?.h3 })}>
					{@render renderInline(block.text)}
				</h3>
			{:else}
				<h4 id={block.slug} data-slot="h4" class={slots.h4({ class: ui?.h4 })}>
					{@render renderInline(block.text)}
				</h4>
			{/if}
		{:else if block.type === 'paragraph'}
			<p data-slot="p" class={slots.p({ class: ui?.p })}>
				{@render renderInline(block.text)}
			</p>
		{:else if block.type === 'code'}
			<CodeBlock
				code={block.code}
				language={block.language}
				filename={block.filename}
				{showLineNumbers}
			/>
		{:else if block.type === 'callout'}
			<Callout type={block.calloutType} title={block.title} description={block.text} />
		{:else if block.type === 'blockquote'}
			<blockquote data-slot="blockquote" class={slots.blockquote({ class: ui?.blockquote })}>
				{@render renderInline(block.text)}
			</blockquote>
		{:else if block.type === 'list'}
			{#if block.isTask}
				<ul data-slot="ul" class={slots.taskList({ class: ui?.ul })}>
					{#each block.items as item, idx (`${block.id}-item-${idx}`)}
						<li data-slot="li" class={cn('flex items-start gap-2.5', slots.li({ class: ui?.li }))}>
							<input
								type="checkbox"
								checked={Boolean(item.checked)}
								disabled
								class="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 dark:border-neutral-700"
							/>
							<span class={item.checked ? 'line-through opacity-60' : ''}>
								{@render renderInline(item.text)}
							</span>
						</li>
					{/each}
				</ul>
			{:else if block.ordered}
				<ol data-slot="ol" class={slots.ol({ class: ui?.ol })}>
					{#each block.items as item, idx (`${block.id}-item-${idx}`)}
						<li data-slot="li" class={slots.li({ class: ui?.li })}>
							{@render renderInline(item.text)}
						</li>
					{/each}
				</ol>
			{:else}
				<ul data-slot="ul" class={slots.ul({ class: ui?.ul })}>
					{#each block.items as item, idx (`${block.id}-item-${idx}`)}
						<li data-slot="li" class={slots.li({ class: ui?.li })}>
							{@render renderInline(item.text)}
						</li>
					{/each}
				</ul>
			{/if}
		{:else if block.type === 'table'}
			<div data-slot="tableWrapper" class={slots.tableWrapper({ class: ui?.tableWrapper })}>
				<table data-slot="table" class={slots.table({ class: ui?.table })}>
					<thead>
						<tr>
							{#each block.headers as header, hIdx (`${block.id}-th-${hIdx}`)}
								<th
									data-slot="th"
									style="text-align: {block.alignments[hIdx] ?? 'left'}"
									class={slots.th({ class: ui?.th })}
								>
									{@render renderInline(header)}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each block.rows as row, rIdx (`${block.id}-tr-${rIdx}`)}
							<tr>
								{#each row as cell, cIdx (`${block.id}-td-${rIdx}-${cIdx}`)}
									<td
										data-slot="td"
										style="text-align: {block.alignments[cIdx] ?? 'left'}"
										class={slots.td({ class: ui?.td })}
									>
										{@render renderInline(cell)}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if block.type === 'hr'}
			<hr data-slot="hr" class={slots.hr({ class: ui?.hr })} />
		{/if}
	{/each}
</div>
