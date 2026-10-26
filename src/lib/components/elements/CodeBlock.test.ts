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

	it('tokenizes python keywords, types, operators, and multiline docstrings', () => {
		const pyCode = `def add(x: int = 1) -> str:
    """
    Multi-line Python docstring
    """
    assert x > 0
    return str(x)`;
		const tokens = tokenizeCode(pyCode, 'python');
		expect(tokens).toHaveLength(6);

		// Line 0: def add(x: int = 1) -> str:
		const line0Types = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0Types).toContainEqual({ text: 'def', type: 'keyword' });
		expect(line0Types).toContainEqual({ text: 'add', type: 'function' });
		expect(line0Types).toContainEqual({ text: 'int', type: 'macro' });
		expect(line0Types).toContainEqual({ text: 'str', type: 'macro' });
		expect(line0Types.some((t) => t.text.includes('->'))).toBe(true);
		expect(line0Types.some((t) => t.text.includes('='))).toBe(true);

		// Docstring continuation
		expect(tokens[1].some((t) => t.type === 'string')).toBe(true);
		expect(tokens[2][0].type).toBe('string');
		expect(tokens[3].some((t) => t.type === 'string')).toBe(true);

		// Line 4: assert x > 0
		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: 'assert', type: 'keyword' });
	});

	it('tokenizes Python 3.13+ syntax: type parameters, TypeIs narrowing, match/case and decorators', () => {
		const pyCode = `type Point[T = int] = tuple[T, T]
@deprecated
def is_str(val: object) -> TypeIs[str]:
    match val:
        case str():
            return True
        case _:
            return False`;
		const tokens = tokenizeCode(pyCode, 'python');
		expect(tokens).toHaveLength(8);

		// Line 0: type Point[T = int] = tuple[T, T]
		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: 'type', type: 'keyword' });
		expect(line0).toContainEqual({ text: 'int', type: 'macro' });
		expect(line0).toContainEqual({ text: 'tuple', type: 'macro' });

		// Line 1: @deprecated
		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: '@deprecated', type: 'decorator' });

		// Line 2: def is_str(val: object) -> TypeIs[str]:
		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'def', type: 'keyword' });
		expect(line2).toContainEqual({ text: 'TypeIs', type: 'macro' });
		expect(line2).toContainEqual({ text: 'str', type: 'macro' });

		// Line 3 & 4: match / case
		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: 'match', type: 'keyword' });

		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: 'case', type: 'keyword' });
	});

	it('tokenizes tailwind css v4 at-rules, variables and hex colors', () => {
		const cssCode = `@theme {
  --color-primary-500: #ff3e00;
  display: flex;
}`;
		const tokens = tokenizeCode(cssCode, 'css');
		expect(tokens).toHaveLength(4);

		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: '@theme', type: 'directive' });

		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: '--color-primary-500', type: 'macro' });
		expect(line1).toContainEqual({ text: '#ff3e00', type: 'number' });

		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'display', type: 'keyword' });
	});

	it('tokenizes svelte 5 runes and control flow blocks', () => {
		const svelteCode = `let count = $state(0);
{#if count > 0}
  <span>Positive</span>
{/if}`;
		const tokens = tokenizeCode(svelteCode, 'svelte');
		expect(tokens).toHaveLength(4);

		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: '$state', type: 'rune' });

		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: '{#if', type: 'directive' });

		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: '{/if', type: 'directive' });
	});

	it('tokenizes json object keys separately from string values', () => {
		const jsonCode = '{\n  "version": "2.0.2"\n}';
		const tokens = tokenizeCode(jsonCode, 'json');
		expect(tokens).toHaveLength(3);

		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: '"version"', type: 'attr' });
		expect(line1).toContainEqual({ text: '"2.0.2"', type: 'string' });
	});

	it('tokenizes bash environment variables and flags', () => {
		const bashCode = 'curl -s -L $API_URL --output file.txt';
		const tokens = tokenizeCode(bashCode, 'bash');
		expect(tokens).toHaveLength(1);

		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: 'curl', type: 'keyword' });
		expect(line0).toContainEqual({ text: '$API_URL', type: 'macro' });
		expect(line0).toContainEqual({ text: '--output', type: 'attr' });
	});

	it('maintains multiline block comments in typescript', () => {
		const tsCode = `/*
 * Description of function
 */
function test() {}`;
		const tokens = tokenizeCode(tsCode, 'typescript');
		expect(tokens).toHaveLength(4);
		expect(tokens[0][0].type).toBe('comment');
		expect(tokens[1][0].type).toBe('comment');
		expect(tokens[2][0].type).toBe('comment');
		expect(tokens[3].some((t) => t.text === 'function' && t.type === 'keyword')).toBe(true);
	});

	it('supports ES2026 and TypeScript 6 keywords, utility types, and modern numeric separators', () => {
		const modernCode = `import defer * as mod from './heavy-module';
using file = openFile();
class Service {
  accessor count = 0;
  override process() {}
}
function check(val: unknown): asserts val is string {
  if (typeof val !== 'string') throw new Error();
}
const amount = 1_000_000n;
const mask = 0xFF_AA_00;
type TaskResult = Awaited<Promise<Record<string, unknown>>>;`;

		const tokens = tokenizeCode(modernCode, 'typescript');
		expect(tokens.length).toBeGreaterThan(5);

		// Line 0: import defer
		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: 'import', type: 'keyword' });
		expect(line0).toContainEqual({ text: 'defer', type: 'keyword' });

		// Line 1: using file
		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: 'using', type: 'keyword' });

		// Line 3: accessor count
		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: 'accessor', type: 'keyword' });

		// Line 4: override process
		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: 'override', type: 'keyword' });

		// Line 6: asserts val is string
		const line6 = tokens[6].map((t) => ({ text: t.text, type: t.type }));
		expect(line6).toContainEqual({ text: 'asserts', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'is', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'unknown', type: 'macro' });
		expect(line6).toContainEqual({ text: 'string', type: 'macro' });

		// Line 9: amount = 1_000_000n
		const line9 = tokens[9].map((t) => ({ text: t.text, type: t.type }));
		expect(line9).toContainEqual({ text: '1_000_000n', type: 'number' });

		// Line 10: mask = 0xFF_AA_00
		const line10 = tokens[10].map((t) => ({ text: t.text, type: t.type }));
		expect(line10).toContainEqual({ text: '0xFF_AA_00', type: 'number' });

		// Line 11: Awaited utility type
		const line11 = tokens[11].map((t) => ({ text: t.text, type: t.type }));
		expect(line11).toContainEqual({ text: 'Awaited', type: 'macro' });
	});
});
