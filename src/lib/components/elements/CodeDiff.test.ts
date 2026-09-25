import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import CodeDiff, { computeDiff } from './CodeDiff.svelte';

describe('CodeDiff Component & Diff Algorithm', () => {
	it('should correctly compute line additions, deletions, and unchanged lines', () => {
		const original = `let count = 0;\nfunction increment() {\n  count += 1;\n}`;
		const modified = `let count = $state(0);\nfunction increment() {\n  count += 1;\n}`;

		const result = computeDiff(original, modified);

		expect(result.stats.deletions).toBe(1);
		expect(result.stats.additions).toBe(1);
		expect(result.unified.length).toBeGreaterThanOrEqual(3);

		const removedLine = result.unified.find((l) => l.type === 'removed');
		const addedLine = result.unified.find((l) => l.type === 'added');

		expect(removedLine?.text).toBe('let count = 0;');
		expect(addedLine?.text).toBe('let count = $state(0);');
	});

	it('should compute split rows for side-by-side view', () => {
		const original = `import { writable } from 'svelte/store';\nconst count = writable(0);`;
		const modified = `let count = $state(0);`;

		const result = computeDiff(original, modified);
		expect(result.splitRows.length).toBeGreaterThan(0);
	});

	it('should render unified mode with badge counts and diff markers in DOM', () => {
		const original = `export let title = 'Hello';`;
		const modified = `let { title = 'Hello' } = $props();`;

		const { target, cleanup } = renderComponent(CodeDiff, {
			original,
			modified,
			filename: 'Header.svelte',
			viewMode: 'unified'
		});

		expect(target.textContent).toContain('Header.svelte');
		expect(target.textContent).toContain('+1');
		expect(target.textContent).toContain('-1');
		expect(target.textContent).toContain('$props');

		cleanup();
	});

	it('should render split side-by-side mode', () => {
		const original = `<script>\n  export let name = 'world';\n</script>`;
		const modified = `<script>\n  let { name = 'world' } = $props();\n</script>`;

		const { target, cleanup } = renderComponent(CodeDiff, {
			original,
			modified,
			filename: 'Greeting.svelte',
			viewMode: 'split'
		});

		expect(target.textContent).toContain('Original (Before)');
		expect(target.textContent).toContain('Modified (After)');
		expect(target.textContent).toContain('Greeting.svelte');

		cleanup();
	});
});
