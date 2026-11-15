import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { renderComponent } from '#lib/testing/index.js';
import Callout, { calloutVariants } from './Callout.svelte';
import CodeGroup, { codeGroupVariants } from './CodeGroup.svelte';
import Steps, { stepsVariants } from './Steps.svelte';
import Markdown, { parseMarkdownBlocks, tokenizeInlineMarkdown } from './Markdown.svelte';
import Collapsible, { collapsibleVariants } from './Collapsible.svelte';
import ActionBar from '../overlays/ActionBar.svelte';

describe('Docs & Content Primitives (Callout, CodeGroup, Steps)', () => {
	describe('Callout', () => {
		it('generates semantic variant classes for note, tip, warning, and danger', () => {
			expect(calloutVariants({ type: 'note' })).toContain('border-l-sky-500');
			expect(calloutVariants({ type: 'tip' })).toContain('border-l-emerald-500');
			expect(calloutVariants({ type: 'important' })).toContain('border-l-violet-500');
			expect(calloutVariants({ type: 'warning' })).toContain('border-l-amber-500');
			expect(calloutVariants({ type: 'danger' })).toContain('border-l-rose-500');
		});

		it('renders title, description, and dismisses when closable is clicked', () => {
			let closed = false;
			const { target, cleanup } = renderComponent(Callout, {
				type: 'tip',
				title: 'Performance Tip',
				description: 'Use Svelte 5 runes for fine-grained reactivity.',
				closable: true,
				onclose: () => {
					closed = true;
				}
			});

			expect(target.textContent).toContain('Performance Tip');
			expect(target.textContent).toContain('Use Svelte 5 runes for fine-grained reactivity.');

			const closeBtn = target.querySelector('[data-slot="close"]') as HTMLButtonElement | null;
			expect(closeBtn).not.toBeNull();
			closeBtn?.click();
			flushSync();

			expect(closed).toBe(true);
			expect(target.querySelector('[data-slot="root"]')).toBeNull();
			cleanup();
		});

		it('renders as an anchor element when href is provided', () => {
			const { target, cleanup } = renderComponent(Callout, {
				type: 'important',
				title: 'Read the Migration Guide',
				href: '/docs/migration'
			});

			const root = target.querySelector('[data-slot="root"]');
			expect(root?.tagName.toLowerCase()).toBe('a');
			expect(root?.getAttribute('href')).toBe('/docs/migration');
			cleanup();
		});
	});

	describe('CodeGroup', () => {
		it('generates variant classes for dark and adaptive theme modes', () => {
			expect(codeGroupVariants({ themeMode: 'dark' })).toContain('bg-neutral-950');
			expect(codeGroupVariants({ themeMode: 'adaptive' })).toContain('dark:bg-neutral-950');
		});

		it('renders tabs, displays active code, and synchronizes across instances via syncKey', () => {
			const items = [
				{ label: 'pnpm', code: 'pnpm add yaxa-svelte' },
				{ label: 'npm', code: 'npm install yaxa-svelte' },
				{ label: 'bun', code: 'bun add yaxa-svelte' }
			];

			const first = renderComponent(CodeGroup, {
				items,
				syncKey: 'test-pm-sync'
			});
			const second = renderComponent(CodeGroup, {
				items,
				syncKey: 'test-pm-sync'
			});

			expect(first.target.textContent).toContain('pnpm add yaxa-svelte');
			expect(second.target.textContent).toContain('pnpm add yaxa-svelte');

			// Click 'bun' tab on first CodeGroup
			const tabs = first.target.querySelectorAll('[role="tab"]');
			expect(tabs).toHaveLength(3);
			(tabs[2] as HTMLButtonElement).click();
			flushSync();

			// Both first and second CodeGroup instances should now show 'bun add yaxa-svelte'
			expect(first.target.textContent).toContain('bun add yaxa-svelte');
			expect(second.target.textContent).toContain('bun add yaxa-svelte');

			first.cleanup();
			second.cleanup();
		});
	});

	describe('Steps', () => {
		it('generates size variant classes', () => {
			expect(stepsVariants({ size: 'sm' })).toContain('gap-5');
			expect(stepsVariants({ size: 'md' })).toContain('gap-7');
			expect(stepsVariants({ size: 'lg' })).toContain('gap-9');
		});

		it('renders numbered step guide items with badges, descriptions, and code blocks', () => {
			const items = [
				{
					title: 'Install Package',
					badge: 'Required',
					description: 'Add Yaxa to your SvelteKit project.',
					code: 'pnpm add yaxa-svelte'
				},
				{
					title: 'Configure Styles',
					description: 'Import the Tailwind v4 stylesheet.',
					code: "@import 'yaxa-svelte/yaxa.css';",
					language: 'css'
				}
			];

			const { target, cleanup } = renderComponent(Steps, {
				items
			});

			const stepItems = target.querySelectorAll('[data-slot="item"]');
			expect(stepItems).toHaveLength(2);
			expect(target.textContent).toContain('Install Package');
			expect(target.textContent).toContain('Required');
			expect(target.textContent).toContain('Configure Styles');
			expect(target.textContent).toContain('pnpm add yaxa-svelte');

			cleanup();
		});
	});

	describe('Markdown', () => {
		it('parses headings, GFM alerts, tables, task lists, and code blocks', () => {
			const md = `# Release v2.9

> [!TIP] Fast Setup
> Zero external dependencies required.

- [x] Ship Markdown renderer
- [ ] Add Sparkline

| Feature | Status |
| :--- | :---: |
| Callout | Ready |

\`\`\`ts
const x = 42;
\`\`\``;

			const blocks = parseMarkdownBlocks(md);
			expect(blocks.map((b) => b.type)).toEqual(['heading', 'callout', 'list', 'table', 'code']);

			const { target, cleanup } = renderComponent(Markdown, { content: md });
			expect(target.querySelector('h1')?.textContent).toContain('Release v2.9');
			expect(target.textContent).toContain('Fast Setup');
			expect(target.textContent).toContain('Ship Markdown renderer');
			expect(target.querySelector('table')?.textContent).toContain('Callout');
			cleanup();
		});

		it('blocks unsafe javascript: links in inline markdown', () => {
			const tokens = tokenizeInlineMarkdown(
				'Click [Safe](https://yaxa.dev) or [Evil](javascript:alert(1))'
			);
			const linkTokens = tokens.filter((t) => t.type === 'link');
			expect(linkTokens).toHaveLength(1);
			expect(linkTokens[0]).toMatchObject({ type: 'link', href: 'https://yaxa.dev' });
		});
	});

	describe('ActionBar', () => {
		it('renders floating toolbar when count > 0 and triggers onclear', () => {
			let cleared = false;
			const { target, cleanup } = renderComponent(ActionBar, {
				count: 3,
				label: 'rows selected',
				onclear: () => {
					cleared = true;
				}
			});

			expect(target.querySelector('[role="toolbar"]')).not.toBeNull();
			expect(target.textContent).toContain('3');
			expect(target.textContent).toContain('rows selected');

			const clearBtn = target.querySelector(
				'[data-slot="clearButton"]'
			) as HTMLButtonElement | null;
			clearBtn?.click();
			flushSync();
			expect(cleared).toBe(true);
			cleanup();
		});
	});

	describe('Collapsible', () => {
		it('generates root classes with not-prose isolation', () => {
			const slots = collapsibleVariants({ variant: 'bordered' });
			expect(slots.root()).toContain('not-prose');
		});

		it('toggles open state when trigger button is clicked', () => {
			let toggledState: boolean | null = null;
			const { target, cleanup } = renderComponent(Collapsible, {
				title: 'System Logs',
				description: 'Expand for stack trace',
				badge: 'Debug',
				open: false,
				ontoggle: (next: boolean) => {
					toggledState = next;
				}
			});

			const trigger = target.querySelector('[data-slot="trigger"]') as HTMLButtonElement | null;
			expect(trigger?.getAttribute('aria-expanded')).toBe('false');
			expect(target.textContent).toContain('System Logs');
			expect(target.textContent).toContain('Debug');

			trigger?.click();
			flushSync();

			expect(toggledState).toBe(true);
			expect(trigger?.getAttribute('aria-expanded')).toBe('true');
			cleanup();
		});
	});
});
