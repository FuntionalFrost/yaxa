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

	it('tokenizes YAML keys, anchors, aliases, tags, booleans and document markers', () => {
		const yamlCode = `---
# App configuration
name: "yaxa-app"
version: 2.1
enabled: true
maintenance: off
defaults: &base_config
  timeout: 30
production: *base_config
tag_demo: !custom_tag
created_at: 2026-10-27`;

		const tokens = tokenizeCode(yamlCode, 'yaml');
		expect(tokens).toHaveLength(11);

		// Line 0: ---
		expect(tokens[0][0]).toEqual({ text: '---', type: 'punctuation' });

		// Line 1: # App configuration
		expect(tokens[1][0]).toEqual({ text: '# App configuration', type: 'comment' });

		// Line 2: name: "yaxa-app"
		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'name', type: 'attr' });
		expect(line2).toContainEqual({ text: '"yaxa-app"', type: 'string' });

		// Line 4: enabled: true
		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: 'enabled', type: 'attr' });
		expect(line4).toContainEqual({ text: 'true', type: 'keyword' });

		// Line 5: maintenance: off
		const line5 = tokens[5].map((t) => ({ text: t.text, type: t.type }));
		expect(line5).toContainEqual({ text: 'maintenance', type: 'attr' });
		expect(line5).toContainEqual({ text: 'off', type: 'keyword' });

		// Line 6: defaults: &base_config
		const line6 = tokens[6].map((t) => ({ text: t.text, type: t.type }));
		expect(line6).toContainEqual({ text: 'defaults', type: 'attr' });
		expect(line6).toContainEqual({ text: '&base_config', type: 'macro' });

		// Line 8: production: *base_config
		const line8 = tokens[8].map((t) => ({ text: t.text, type: t.type }));
		expect(line8).toContainEqual({ text: 'production', type: 'attr' });
		expect(line8).toContainEqual({ text: '*base_config', type: 'macro' });

		// Line 9: tag_demo: !custom_tag
		const line9 = tokens[9].map((t) => ({ text: t.text, type: t.type }));
		expect(line9).toContainEqual({ text: 'tag_demo', type: 'attr' });
		expect(line9).toContainEqual({ text: '!custom_tag', type: 'directive' });

		// Line 10: created_at: 2026-10-27
		const line10 = tokens[10].map((t) => ({ text: t.text, type: t.type }));
		expect(line10).toContainEqual({ text: 'created_at', type: 'attr' });
		expect(line10).toContainEqual({ text: '2026-10-27', type: 'number' });
	});

	it('tokenizes TOML table headers, keys, dates, and multiline strings', () => {
		const tomlCode = `[server]
port = 8080
enabled = true
started = 1979-05-27T07:32:00Z
bio = """
Hello World
Multilined
"""`;

		const tokens = tokenizeCode(tomlCode, 'toml');
		expect(tokens).toHaveLength(8);

		// Line 0: [server]
		expect(tokens[0][0]).toEqual({ text: '[server]', type: 'directive' });

		// Line 1: port = 8080
		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: 'port', type: 'attr' });
		expect(line1).toContainEqual({ text: '8080', type: 'number' });

		// Line 2: enabled = true
		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'enabled', type: 'attr' });
		expect(line2).toContainEqual({ text: 'true', type: 'keyword' });

		// Line 3: started = 1979-05-27T07:32:00Z
		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: 'started', type: 'attr' });
		expect(line3).toContainEqual({ text: '1979-05-27T07:32:00Z', type: 'number' });

		// Multiline string across lines 4, 5, 6, 7
		expect(tokens[4].some((t) => t.type === 'string')).toBe(true);
		expect(tokens[5][0].type).toBe('string');
		expect(tokens[6][0].type).toBe('string');
		expect(tokens[7].some((t) => t.type === 'string')).toBe(true);
	});

	it('tokenizes Rust attributes, macros, lifetimes, and standard types to Tier 1 standard', () => {
		const rustCode = `#[derive(Debug, Clone)]
pub fn process<'a>(name: &'a str) -> Option<String> {
    let items: Vec<i32> = vec![1, 2, 3];
    println!("Processed: {}", name);
    Some(name.to_string())
}`;

		const tokens = tokenizeCode(rustCode, 'rust');
		expect(tokens).toHaveLength(6);

		// Line 0: #[derive(Debug, Clone)]
		expect(tokens[0][0].type).toBe('decorator');

		// Line 1: pub fn process<'a>(name: &'a str) -> Option<String>
		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: 'pub', type: 'keyword' });
		expect(line1).toContainEqual({ text: 'fn', type: 'keyword' });
		expect(line1).toContainEqual({ text: "'a", type: 'macro' });
		expect(line1).toContainEqual({ text: 'str', type: 'macro' });
		expect(line1).toContainEqual({ text: 'Option', type: 'macro' });
		expect(line1).toContainEqual({ text: 'String', type: 'macro' });

		// Line 2: let items: Vec<i32> = vec![1, 2, 3];
		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'Vec', type: 'macro' });
		expect(line2).toContainEqual({ text: 'i32', type: 'macro' });
		expect(line2).toContainEqual({ text: 'vec!', type: 'macro' });

		// Line 3: println!("...")
		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: 'println!', type: 'macro' });

		// Line 4: Some(...)
		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: 'Some', type: 'macro' });
	});

	it('tokenizes Go built-in functions and primitive types to Tier 1 standard', () => {
		const goCode = `package main
func NewBuffer(size int) (error, any) {
    buf := make([]byte, size)
    println(len(buf))
    return nil, buf
}`;

		const tokens = tokenizeCode(goCode, 'go');
		expect(tokens).toHaveLength(6);

		// Line 0: package main
		expect(tokens[0].some((t) => t.text === 'package' && t.type === 'keyword')).toBe(true);

		// Line 1: func NewBuffer(size int) (error, any)
		const line1 = tokens[1].map((t) => ({ text: t.text, type: t.type }));
		expect(line1).toContainEqual({ text: 'func', type: 'keyword' });
		expect(line1).toContainEqual({ text: 'int', type: 'macro' });
		expect(line1).toContainEqual({ text: 'error', type: 'macro' });
		expect(line1).toContainEqual({ text: 'any', type: 'macro' });

		// Line 2: make([]byte)
		const line2 = tokens[2].map((t) => ({ text: t.text, type: t.type }));
		expect(line2).toContainEqual({ text: 'make', type: 'function' });
		expect(line2).toContainEqual({ text: 'byte', type: 'macro' });

		// Line 3: len(buf)
		const line3 = tokens[3].map((t) => ({ text: t.text, type: t.type }));
		expect(line3).toContainEqual({ text: 'len', type: 'function' });
	});

	it('tokenizes SQL DDL, constraints, clauses, and data types to Tier 1 standard', () => {
		const sqlCode = `CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
SELECT id, email FROM users WHERE id IS NOT NULL ORDER BY created_at DESC LIMIT 10;`;

		const tokens = tokenizeCode(sqlCode, 'sql');
		expect(tokens).toHaveLength(7);

		// Line 0: CREATE TABLE users (
		const line0 = tokens[0].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line0).toContainEqual({ text: 'CREATE', type: 'keyword' });
		expect(line0).toContainEqual({ text: 'TABLE', type: 'keyword' });

		// Line 1: id UUID PRIMARY KEY DEFAULT ...
		const line1 = tokens[1].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line1).toContainEqual({ text: 'UUID', type: 'macro' });
		expect(line1).toContainEqual({ text: 'PRIMARY', type: 'keyword' });
		expect(line1).toContainEqual({ text: 'KEY', type: 'keyword' });
		expect(line1).toContainEqual({ text: 'DEFAULT', type: 'keyword' });

		// Line 2: VARCHAR
		const line2 = tokens[2].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line2).toContainEqual({ text: 'VARCHAR', type: 'macro' });
		expect(line2).toContainEqual({ text: 'NOT', type: 'keyword' });
		expect(line2).toContainEqual({ text: 'NULL', type: 'keyword' });
		expect(line2).toContainEqual({ text: 'UNIQUE', type: 'keyword' });

		// Line 3: JSONB
		const line3 = tokens[3].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line3).toContainEqual({ text: 'JSONB', type: 'macro' });

		// Line 4: TIMESTAMPTZ
		const line4 = tokens[4].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line4).toContainEqual({ text: 'TIMESTAMPTZ', type: 'macro' });

		// Line 6: SELECT query
		const line6 = tokens[6].map((t) => ({ text: t.text.toUpperCase(), type: t.type }));
		expect(line6).toContainEqual({ text: 'SELECT', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'FROM', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'WHERE', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'ORDER', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'BY', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'DESC', type: 'keyword' });
		expect(line6).toContainEqual({ text: 'LIMIT', type: 'keyword' });
	});

	it('tokenizes GraphQL queries, variables, directives, and scalar types to Tier 1 standard', () => {
		const gqlCode = `query GetUser($userId: ID!, $withDetails: Boolean = true) {
  user(id: $userId) {
    id
    name
    email @include(if: $withDetails)
  }
}`;

		const tokens = tokenizeCode(gqlCode, 'graphql');
		expect(tokens).toHaveLength(7);

		// Line 0: query GetUser($userId: ID!, $withDetails: Boolean = true)
		const line0 = tokens[0].map((t) => ({ text: t.text, type: t.type }));
		expect(line0).toContainEqual({ text: 'query', type: 'keyword' });
		expect(line0).toContainEqual({ text: '$userId', type: 'macro' });
		expect(line0).toContainEqual({ text: 'ID', type: 'macro' });
		expect(line0).toContainEqual({ text: '$withDetails', type: 'macro' });
		expect(line0).toContainEqual({ text: 'Boolean', type: 'macro' });

		// Line 4: email @include(if: $withDetails)
		const line4 = tokens[4].map((t) => ({ text: t.text, type: t.type }));
		expect(line4).toContainEqual({ text: '@include', type: 'decorator' });
	});
});
