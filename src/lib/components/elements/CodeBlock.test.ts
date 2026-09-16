import { describe, it, expect } from 'vitest';
import { tokenizeCode } from './CodeBlock.svelte';

describe('tokenizeCode', () => {
	it('tokenizes markdown headings correctly', () => {
		const tokens = tokenizeCode('# Hello World', 'markdown');
		expect(tokens).toHaveLength(1);
		expect(tokens[0]).toEqual([
			{ text: '# ', type: 'punctuation' },
			{ text: 'Hello World', type: 'heading' }
		]);
	});

	it('tokenizes typescript keywords and identifiers', () => {
		const tokens = tokenizeCode('const x = 42;', 'typescript');
		expect(tokens).toHaveLength(1);
		const texts = tokens[0].map((t) => t.text);
		expect(texts).toContain('const');
		expect(texts).toContain('x');
		expect(texts).toContain('42');
	});

	it('handles multiline code and empty lines', () => {
		const code = 'line 1\n\nline 3';
		const tokens = tokenizeCode(code, 'plain');
		expect(tokens).toHaveLength(3);
		expect(tokens[1]).toEqual([{ text: '', type: 'plain' }]);
	});
});
