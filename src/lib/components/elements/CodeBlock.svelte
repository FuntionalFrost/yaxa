<script module lang="ts">
	export interface CodeBlockProps {
		code: string;
		language?: string;
		filename?: string;
		showLineNumbers?: boolean;
		highlightLines?: number[];
		wrap?: boolean;
		themeMode?: 'dark' | 'adaptive';
		class?: string;
	}

	interface Token {
		text: string;
		type:
			| 'plain'
			| 'keyword'
			| 'string'
			| 'comment'
			| 'number'
			| 'tag'
			| 'attr'
			| 'function'
			| 'punctuation'
			| 'macro'
			| 'rune'
			| 'heading'
			| 'bold'
			| 'italic'
			| 'link'
			| 'directive'
			| 'decorator';
	}

	// Zero-WASM Multi-Language Pure JavaScript Tokenizer with Svelte 5 Rune Recognition & Multi-Line State
	export function tokenizeCode(code: string, language: string = 'typescript'): Token[][] {
		const lines = code.split('\n');
		const lang = language.toLowerCase();

		const isMarkdown = ['markdown', 'md', 'gfm'].includes(lang);
		const isLatex = ['latex', 'tex', 'math'].includes(lang);
		const isVue = lang === 'vue';
		const isJsx = ['tsx', 'jsx', 'react'].includes(lang);
		const isTs = ['typescript', 'ts', 'tsx'].includes(lang);
		const isJs = ['javascript', 'js', 'jsx', 'mjs', 'cjs'].includes(lang);
		const isSvelte = ['svelte', 'svelte5', 'sv'].includes(lang);
		const isHtml = ['html', 'xml', 'svg'].includes(lang);
		const isPython = ['python', 'py'].includes(lang);
		const isRust = ['rust', 'rs'].includes(lang);
		const isGo = ['go', 'golang'].includes(lang);
		const isSql = ['sql', 'pgsql', 'postgres', 'postgresql', 'mysql', 'sqlite'].includes(lang);
		const isGraphQL = ['graphql', 'gql'].includes(lang);
		const isBash = ['bash', 'sh', 'zsh', 'shell'].includes(lang);
		const isJson = ['json', 'jsonc', 'json5'].includes(lang);
		const isCss = ['css', 'scss', 'postcss', 'tailwind', 'tailwindcss'].includes(lang);
		const isYaml = ['yaml', 'yml'].includes(lang);
		const isToml = ['toml', 'cargo'].includes(lang);

		let multilineState:
			| null
			| { type: 'comment'; delimiter: '/*' | '<!--' }
			| { type: 'string'; delimiter: '"""' | "'''" | '`' } = null;

		return lines.map((line) => {
			if (!line) {
				if (multilineState !== null) {
					return [{ text: '', type: multilineState.type }];
				}
				return [{ text: '', type: 'plain' }];
			}

			const tokens: Token[] = [];
			let remaining = line;

			// Handle multi-line comment or string continuation from previous line
			if (multilineState !== null) {
				if (multilineState.type === 'comment') {
					const closeDelim = multilineState.delimiter === '/*' ? '*/' : '-->';
					const closeIdx = remaining.indexOf(closeDelim);
					if (closeIdx !== -1) {
						const endIdx = closeIdx + closeDelim.length;
						tokens.push({ text: remaining.slice(0, endIdx), type: 'comment' });
						remaining = remaining.slice(endIdx);
						multilineState = null;
					} else {
						tokens.push({ text: remaining, type: 'comment' });
						return tokens;
					}
				} else if (multilineState.type === 'string') {
					const delim = multilineState.delimiter;
					if (delim === '`') {
						const closeMatch = remaining.match(/^(?:[^`\\]|\\.)*?`/);
						if (closeMatch) {
							tokens.push({ text: closeMatch[0], type: 'string' });
							remaining = remaining.slice(closeMatch[0].length);
							multilineState = null;
						} else {
							tokens.push({ text: remaining, type: 'string' });
							return tokens;
						}
					} else {
						// Python triple quotes """ or '''
						const closeIdx = remaining.indexOf(delim);
						if (closeIdx !== -1) {
							const endIdx = closeIdx + delim.length;
							tokens.push({ text: remaining.slice(0, endIdx), type: 'string' });
							remaining = remaining.slice(endIdx);
							multilineState = null;
						} else {
							tokens.push({ text: remaining, type: 'string' });
							return tokens;
						}
					}
				}
			}

			// Special full-line Markdown rules
			if (isMarkdown && remaining === line) {
				// Fenced code blocks (```lang or ~~~lang)
				const fenceMatch = remaining.match(/^(\s*(?:`{3,}|~{3,})[\w-]*\s*)$/);
				if (fenceMatch) {
					return [{ text: fenceMatch[1], type: 'macro' }];
				}
				// Frontmatter & Horizontal rule (--- or ***)
				const hrMatch = remaining.match(/^(\s*(?:---|___|\*\*\*)\s*)$/);
				if (hrMatch) {
					return [{ text: hrMatch[1], type: 'punctuation' }];
				}
				// Markdown Headings (# Header)
				const headingMatch = remaining.match(/^(#{1,6}\s+)(.*)$/);
				if (headingMatch) {
					return [
						{ text: headingMatch[1], type: 'punctuation' },
						{ text: headingMatch[2], type: 'heading' }
					];
				}
				// Blockquotes (> Quote)
				const blockquoteMatch = remaining.match(/^(\s*>\s+)(.*)$/);
				if (blockquoteMatch) {
					return [
						{ text: blockquoteMatch[1], type: 'punctuation' },
						{ text: blockquoteMatch[2], type: 'italic' }
					];
				}
				// Lists & Task checkboxes (- [x] Item, * Item, 1. Item)
				const listMatch = remaining.match(/^(\s*(?:[-*+]|\d+\.)(?:\s+\[[ xX]\])?\s+)(.*)$/);
				if (listMatch) {
					return [
						{ text: listMatch[1], type: 'punctuation' },
						{ text: listMatch[2], type: 'plain' }
					];
				}
			}

			while (remaining.length > 0) {
				// 1. Comments
				if (!isLatex && remaining.startsWith('/*')) {
					const closeIdx = remaining.indexOf('*/', 2);
					if (closeIdx !== -1) {
						const endIdx = closeIdx + 2;
						tokens.push({ text: remaining.slice(0, endIdx), type: 'comment' });
						remaining = remaining.slice(endIdx);
						continue;
					} else {
						tokens.push({ text: remaining, type: 'comment' });
						multilineState = { type: 'comment', delimiter: '/*' };
						break;
					}
				}

				if ((isMarkdown || isHtml || isSvelte || isVue) && remaining.startsWith('<!--')) {
					const closeIdx = remaining.indexOf('-->', 4);
					if (closeIdx !== -1) {
						const endIdx = closeIdx + 3;
						tokens.push({ text: remaining.slice(0, endIdx), type: 'comment' });
						remaining = remaining.slice(endIdx);
						continue;
					} else {
						tokens.push({ text: remaining, type: 'comment' });
						multilineState = { type: 'comment', delimiter: '<!--' };
						break;
					}
				}

				if (
					(!isLatex && remaining.startsWith('//')) ||
					((isPython || isBash || lang === 'env' || isYaml || isToml || isGraphQL) &&
						remaining.startsWith('#')) ||
					(isLatex && remaining.startsWith('%')) ||
					(isSql && remaining.startsWith('--'))
				) {
					tokens.push({ text: remaining, type: 'comment' });
					break;
				}

				// 2. Python & TOML Triple-Quoted Strings (Docstrings / Multiline)
				if ((isPython || isToml) && (remaining.startsWith('"""') || remaining.startsWith("'''"))) {
					const delim = remaining.startsWith('"""') ? '"""' : "'''";
					const closeIdx = remaining.indexOf(delim, 3);
					if (closeIdx !== -1) {
						const endIdx = closeIdx + 3;
						tokens.push({ text: remaining.slice(0, endIdx), type: 'string' });
						remaining = remaining.slice(endIdx);
						continue;
					} else {
						tokens.push({ text: remaining, type: 'string' });
						multilineState = { type: 'string', delimiter: delim };
						break;
					}
				}

				// 3. Multi-line Template Literals (Backticks) for JS / TS / Svelte / Vue
				if ((isJs || isTs || isSvelte || isVue) && remaining.startsWith('`')) {
					const fullBacktickMatch = remaining.match(/^(`(?:[^`\\]|\\.)*`)/);
					if (fullBacktickMatch) {
						tokens.push({ text: fullBacktickMatch[0], type: 'string' });
						remaining = remaining.slice(fullBacktickMatch[0].length);
						continue;
					} else {
						tokens.push({ text: remaining, type: 'string' });
						multilineState = { type: 'string', delimiter: '`' };
						break;
					}
				}

				// 4. JSON Object Keys ("key":)
				if (isJson) {
					const jsonKeyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")(?=\s*:)/);
					if (jsonKeyMatch) {
						tokens.push({ text: jsonKeyMatch[1], type: 'attr' });
						remaining = remaining.slice(jsonKeyMatch[1].length);
						continue;
					}
				}

				// 4b. YAML Key-Value Pairs, Anchors, Aliases & Directives
				if (isYaml) {
					// Anchors & Aliases (&anchor, *alias)
					const anchorMatch = remaining.match(/^([&*][\w.-]+)/);
					if (anchorMatch) {
						tokens.push({ text: anchorMatch[0], type: 'macro' });
						remaining = remaining.slice(anchorMatch[0].length);
						continue;
					}

					// Tags (!!str, !!int, !!map, !custom)
					const yamlTagMatch = remaining.match(/^(!{1,2}[\w.-]+)/);
					if (yamlTagMatch) {
						tokens.push({ text: yamlTagMatch[0], type: 'directive' });
						remaining = remaining.slice(yamlTagMatch[0].length);
						continue;
					}

					// Document start/end markers (--- or ...)
					if (remaining === line) {
						const docMarkerMatch = remaining.match(/^(\s*(?:---|(?:\.\.\.))\s*)$/);
						if (docMarkerMatch) {
							tokens.push({ text: docMarkerMatch[1], type: 'punctuation' });
							remaining = remaining.slice(docMarkerMatch[1].length);
							continue;
						}
					}

					// Quoted keys before ':'
					const yamlQuotedKeyMatch = remaining.match(
						/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(?=\s*:(?:\s|$))/
					);
					if (yamlQuotedKeyMatch) {
						tokens.push({ text: yamlQuotedKeyMatch[1], type: 'attr' });
						remaining = remaining.slice(yamlQuotedKeyMatch[1].length);
						continue;
					}

					// Bare keys before ':'
					const yamlKeyMatch = remaining.match(/^([\w.-]+)(?=\s*:(?:\s|$))/);
					if (yamlKeyMatch) {
						tokens.push({ text: yamlKeyMatch[0], type: 'attr' });
						remaining = remaining.slice(yamlKeyMatch[0].length);
						continue;
					}

					// YAML booleans, nulls & block scalar indicators
					const yamlKwMatch = remaining.match(/^(true|false|yes|no|on|off|null|~|[|>][+-]?)\b/i);
					if (yamlKwMatch) {
						tokens.push({ text: yamlKwMatch[0], type: 'keyword' });
						remaining = remaining.slice(yamlKwMatch[0].length);
						continue;
					}
				}

				// 4c. TOML Table Headers & Key-Value Pairs
				if (isToml) {
					// Table headers ([table] or [[array_of_tables]])
					const tomlTableMatch = remaining.match(/^(\[\[?[\w.:"-]+\]\]?)/);
					if (tomlTableMatch) {
						tokens.push({ text: tomlTableMatch[0], type: 'directive' });
						remaining = remaining.slice(tomlTableMatch[0].length);
						continue;
					}

					// Quoted keys before '='
					const tomlQuotedKeyMatch = remaining.match(
						/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(?=\s*=)/
					);
					if (tomlQuotedKeyMatch) {
						tokens.push({ text: tomlQuotedKeyMatch[1], type: 'attr' });
						remaining = remaining.slice(tomlQuotedKeyMatch[1].length);
						continue;
					}

					// Bare or dotted keys before '='
					const tomlKeyMatch = remaining.match(/^([\w.-]+)(?=\s*=)/);
					if (tomlKeyMatch) {
						tokens.push({ text: tomlKeyMatch[0], type: 'attr' });
						remaining = remaining.slice(tomlKeyMatch[0].length);
						continue;
					}

					// Special TOML float constants (+inf, -inf, nan)
					const tomlFloatMatch = remaining.match(/^([+-]?(?:inf|nan))\b/i);
					if (tomlFloatMatch) {
						tokens.push({ text: tomlFloatMatch[0], type: 'number' });
						remaining = remaining.slice(tomlFloatMatch[0].length);
						continue;
					}
				}

				// 4d. ISO Dates / Timestamps for YAML & TOML
				if (isYaml || isToml) {
					const dateMatch = remaining.match(
						/^(\d{4}-\d{2}-\d{2}(?:[Tt\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})?)?|\d{2}:\d{2}:\d{2}(?:\.\d+)?)\b/
					);
					if (dateMatch) {
						tokens.push({ text: dateMatch[0], type: 'number' });
						remaining = remaining.slice(dateMatch[0].length);
						continue;
					}
				}

				// 5. CSS & Tailwind CSS v4 At-Rules, Variables & Colors
				if (isCss) {
					// Tailwind v4 & CSS At-rules (@theme, @utility, @source, @plugin, @import, @custom-variant, etc.)
					const atRuleMatch = remaining.match(
						/^(@(?:theme|utility|custom-variant|source|plugin|import|apply|keyframes|media|supports|container|layer|font-face|page|starting-style))\b/
					);
					if (atRuleMatch) {
						tokens.push({ text: atRuleMatch[0], type: 'directive' });
						remaining = remaining.slice(atRuleMatch[0].length);
						continue;
					}

					// CSS Custom Properties / Design Tokens (--color-primary-500, etc.)
					const cssVarMatch = remaining.match(/^(--[\w-]+)/);
					if (cssVarMatch) {
						tokens.push({ text: cssVarMatch[0], type: 'macro' });
						remaining = remaining.slice(cssVarMatch[0].length);
						continue;
					}

					// Hex Color Literals (#ff3e00, #18181b, etc.)
					const hexColorMatch = remaining.match(
						/^#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/
					);
					if (hexColorMatch) {
						tokens.push({ text: hexColorMatch[0], type: 'number' });
						remaining = remaining.slice(hexColorMatch[0].length);
						continue;
					}

					// CSS Properties before colon (e.g. display:, background-color:)
					const cssPropMatch = remaining.match(/^([\w-]+)(?=\s*:)/);
					if (cssPropMatch && !cssPropMatch[0].startsWith('-')) {
						tokens.push({ text: cssPropMatch[0], type: 'keyword' });
						remaining = remaining.slice(cssPropMatch[0].length);
						continue;
					}
				}

				// 6. LaTeX Math Macros and Math Blocks
				if (isLatex) {
					const macroMatch = remaining.match(/^(\\[a-zA-Z]+|\\\[|\\\]|\\\(|\\\))/);
					if (macroMatch) {
						tokens.push({ text: macroMatch[0], type: 'macro' });
						remaining = remaining.slice(macroMatch[0].length);
						continue;
					}
					const mathDelimMatch = remaining.match(/^(\${1,2})/);
					if (mathDelimMatch) {
						tokens.push({ text: mathDelimMatch[0], type: 'keyword' });
						remaining = remaining.slice(mathDelimMatch[0].length);
						continue;
					}
				}

				// 7. Markdown Formatting (Bold, Italic, Code, Links)
				if (isMarkdown) {
					const codeMatch = remaining.match(/^(`[^`]+`)/);
					if (codeMatch) {
						tokens.push({ text: codeMatch[0], type: 'string' });
						remaining = remaining.slice(codeMatch[0].length);
						continue;
					}
					const boldMatch = remaining.match(/^(\*\*[^*]+\*\*)/);
					if (boldMatch) {
						tokens.push({ text: boldMatch[0], type: 'bold' });
						remaining = remaining.slice(boldMatch[0].length);
						continue;
					}
					const linkMatch = remaining.match(/^(\[[^\]]+\])(\([^)]+\))/);
					if (linkMatch) {
						tokens.push({ text: linkMatch[1], type: 'link' });
						tokens.push({ text: linkMatch[2], type: 'string' });
						remaining = remaining.slice(linkMatch[0].length);
						continue;
					}
				}

				// 8. Python Decorators (@decorator)
				if (isPython) {
					const decMatch = remaining.match(/^(@\w+)/);
					if (decMatch) {
						tokens.push({ text: decMatch[0], type: 'decorator' });
						remaining = remaining.slice(decMatch[0].length);
						continue;
					}
				}

				// 9. Python Built-in Types & Modern Typing Constructs (Python 3.0 to 3.13+)
				if (isPython) {
					const pyTypeMatch = remaining.match(
						/^(str|int|float|bool|dict|list|tuple|set|bytes|Any|Optional|Union|Callable|Literal|TypeIs|TypeGuard|Self)\b/
					);
					if (pyTypeMatch) {
						tokens.push({ text: pyTypeMatch[0], type: 'macro' });
						remaining = remaining.slice(pyTypeMatch[0].length);
						continue;
					}
				}

				// 10. TypeScript / JavaScript Primitive Types & Type Operators (TS 5.x / TS 6 & ES2026)
				if (isTs || isJs) {
					const tsTypeMatch = remaining.match(
						/^(string|number|boolean|unknown|never|any|void|readonly|satisfies|keyof|infer|Promise|Record|Array|Partial|Omit|Pick|Awaited|ReturnType|Parameters|ConstructorParameters|InstanceType|Extract|Exclude|NonNullable|Uppercase|Lowercase|Capitalize|Uncapitalize|Disposable|AsyncDisposable|BigInt|Symbol)\b/
					);
					if (tsTypeMatch) {
						tokens.push({ text: tsTypeMatch[0], type: 'macro' });
						remaining = remaining.slice(tsTypeMatch[0].length);
						continue;
					}
				}

				// 10b. Rust Attributes, Macro Invocations, Lifetimes & Standard Types
				if (isRust) {
					// Rust Attributes (#[derive(Debug, Clone)], #![no_std])
					const rustAttrMatch = remaining.match(/^#(!?\[[\w:,()=\s"-]+\])/);
					if (rustAttrMatch) {
						tokens.push({ text: rustAttrMatch[0], type: 'decorator' });
						remaining = remaining.slice(rustAttrMatch[0].length);
						continue;
					}

					// Rust Macro Invocations (println!, vec!, format!, panic!, etc.)
					const rustMacroMatch = remaining.match(
						/^(println|eprintln|print|eprint|format|vec|panic|assert|assert_eq|assert_ne|todo|unimplemented|unreachable|write|writeln|cfg|include|env|concat)!/
					);
					if (rustMacroMatch) {
						tokens.push({ text: rustMacroMatch[0], type: 'macro' });
						remaining = remaining.slice(rustMacroMatch[0].length);
						continue;
					}

					// Rust Lifetimes ('a, 'static)
					const lifetimeMatch = remaining.match(/^'(?:static|[a-z_]\w*)(?!')\b/);
					if (lifetimeMatch) {
						tokens.push({ text: lifetimeMatch[0], type: 'macro' });
						remaining = remaining.slice(lifetimeMatch[0].length);
						continue;
					}

					// Rust Primitive & Standard Types
					const rustTypeMatch = remaining.match(
						/^(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Option|Result|Vec|Box|Rc|Arc|Cell|RefCell|Mutex|RwLock|HashMap|HashSet|BTreeMap|BTreeSet|Self|None|Some|Ok|Err)\b/
					);
					if (rustTypeMatch) {
						tokens.push({ text: rustTypeMatch[0], type: 'macro' });
						remaining = remaining.slice(rustTypeMatch[0].length);
						continue;
					}
				}

				// 10c. Go Primitive Types & Built-ins
				if (isGo) {
					const goTypeMatch = remaining.match(
						/^(string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|byte|rune|float32|float64|complex64|complex128|error|any|bool)\b/
					);
					if (goTypeMatch) {
						tokens.push({ text: goTypeMatch[0], type: 'macro' });
						remaining = remaining.slice(goTypeMatch[0].length);
						continue;
					}

					const goBuiltinMatch = remaining.match(
						/^(make|len|cap|new|append|copy|close|delete|panic|recover|print|println|complex|real|imag)\b(?=\s*\()/
					);
					if (goBuiltinMatch) {
						tokens.push({ text: goBuiltinMatch[0], type: 'function' });
						remaining = remaining.slice(goBuiltinMatch[0].length);
						continue;
					}
				}

				// 10d. SQL Data Types & Clauses
				if (isSql) {
					// SQL Standard Data Types
					const sqlTypeMatch = remaining.match(
						/^(INTEGER|INT|BIGINT|SMALLINT|TINYINT|SERIAL|BIGSERIAL|VARCHAR|TEXT|CHAR|CHARACTER|BOOLEAN|BOOL|DATE|TIME|TIMESTAMP|TIMESTAMPTZ|NUMERIC|DECIMAL|FLOAT|REAL|DOUBLE\s+PRECISION|DOUBLE|JSON|JSONB|UUID|BLOB|BYTEA|ARRAY|INTERVAL)\b/i
					);
					if (sqlTypeMatch) {
						tokens.push({ text: sqlTypeMatch[0], type: 'macro' });
						remaining = remaining.slice(sqlTypeMatch[0].length);
						continue;
					}

					// Comprehensive SQL Clauses & Keywords
					const sqlKwMatch = remaining.match(
						/^(CREATE|ALTER|DROP|TRUNCATE|TABLE|DATABASE|SCHEMA|VIEW|INDEX|TRIGGER|FUNCTION|PROCEDURE|PRIMARY|FOREIGN|KEY|REFERENCES|CONSTRAINT|CHECK|DEFAULT|UNIQUE|NOT|NULL|CASCADE|RESTRICT|SELECT|DISTINCT|FROM|WHERE|AND|OR|IN|BETWEEN|LIKE|ILIKE|IS|EXISTS|HAVING|GROUP|ORDER|BY|ASC|DESC|LIMIT|OFFSET|FETCH|FIRST|NEXT|ROWS|ONLY|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|USING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|RETURNING|UNION|INTERSECT|EXCEPT|ALL|CASE|WHEN|THEN|ELSE|END|AS|BEGIN|COMMIT|ROLLBACK|TRANSACTION|SAVEPOINT|GRANT|REVOKE|WITH|RECURSIVE|OVER|PARTITION)\b/i
					);
					if (sqlKwMatch) {
						tokens.push({ text: sqlKwMatch[0], type: 'keyword' });
						remaining = remaining.slice(sqlKwMatch[0].length);
						continue;
					}
				}

				// 10e. GraphQL Variables, Directives & Scalars
				if (isGraphQL) {
					// GraphQL Variables ($id, $input)
					const gqlVarMatch = remaining.match(/^(\$[\w]+)\b/);
					if (gqlVarMatch) {
						tokens.push({ text: gqlVarMatch[0], type: 'macro' });
						remaining = remaining.slice(gqlVarMatch[0].length);
						continue;
					}

					// Directives (@include, @skip, @deprecated, @specifiedBy)
					const gqlDirMatch = remaining.match(/^(@(?:include|skip|deprecated|specifiedBy))\b/);
					if (gqlDirMatch) {
						tokens.push({ text: gqlDirMatch[0], type: 'decorator' });
						remaining = remaining.slice(gqlDirMatch[0].length);
						continue;
					}

					// Core Scalars
					const gqlScalarMatch = remaining.match(/^(String|Int|Float|Boolean|ID)\b/);
					if (gqlScalarMatch) {
						tokens.push({ text: gqlScalarMatch[0], type: 'macro' });
						remaining = remaining.slice(gqlScalarMatch[0].length);
						continue;
					}

					// GraphQL Keywords
					const gqlKwMatch = remaining.match(
						/^(query|mutation|subscription|fragment|on|type|input|interface|union|enum|scalar|schema|directive|extend)\b/
					);
					if (gqlKwMatch) {
						tokens.push({ text: gqlKwMatch[0], type: 'keyword' });
						remaining = remaining.slice(gqlKwMatch[0].length);
						continue;
					}
				}

				// 11. Bash / Shell Variables & CLI Flags
				if (isBash) {
					const bashVarMatch = remaining.match(/^(\$\{?[\w#?@*!$-]+\}?)/);
					if (bashVarMatch) {
						tokens.push({ text: bashVarMatch[0], type: 'macro' });
						remaining = remaining.slice(bashVarMatch[0].length);
						continue;
					}
					const bashFlagMatch = remaining.match(/^(--?[\w-]+)/);
					if (bashFlagMatch) {
						tokens.push({ text: bashFlagMatch[0], type: 'attr' });
						remaining = remaining.slice(bashFlagMatch[0].length);
						continue;
					}
				}

				// 12. Svelte 5 Native Runes & Template Logic Blocks
				if (isSvelte) {
					// Svelte 5 Runes ($state, $derived, $props, $effect, etc.)
					const svelteRuneMatch = remaining.match(
						/^(\$(?:state(?:\.raw|\.snapshot)?|derived(?:\.by)?|effect(?:\.pre|\.root)?|props|bindable|inspect(?:\.trace)?|host))\b/
					);
					if (svelteRuneMatch) {
						tokens.push({ text: svelteRuneMatch[0], type: 'rune' });
						remaining = remaining.slice(svelteRuneMatch[0].length);
						continue;
					}

					// Svelte Control Flow & Snippets ({#if}, {#each}, {#snippet}, {@render}, {@html}, etc.)
					const svelteBlockMatch = remaining.match(
						/^(\{(?:#(?:if|each|await|snippet|key)|:(?:else\s+if|else|then|catch)|\/(?:if|each|await|snippet|key)|@(?:render|html|const|debug)))\b/
					);
					if (svelteBlockMatch) {
						tokens.push({ text: svelteBlockMatch[0], type: 'directive' });
						remaining = remaining.slice(svelteBlockMatch[0].length);
						continue;
					}
				}

				// 13. HTML / Vue / Svelte / JSX Tags & Attributes
				if (isVue || isSvelte || isHtml || isJsx) {
					const tagMatch = remaining.match(/^(<\/?[\w.:-]+|\/>|>)/);
					if (tagMatch) {
						tokens.push({ text: tagMatch[0], type: 'tag' });
						remaining = remaining.slice(tagMatch[0].length);
						continue;
					}

					if (isVue) {
						const vueDirMatch = remaining.match(/^((?:v-[\w-]+|:[\w-]+|@[\w-]+|#[\w-]+))(?=\s*=?)/);
						if (vueDirMatch) {
							tokens.push({ text: vueDirMatch[0], type: 'directive' });
							remaining = remaining.slice(vueDirMatch[0].length);
							continue;
						}
					}

					const attrMatch = remaining.match(/^([\w:.-]+)(?=\s*=\s*)/);
					if (attrMatch) {
						tokens.push({ text: attrMatch[0], type: 'attr' });
						remaining = remaining.slice(attrMatch[0].length);
						continue;
					}
				}

				// 14. Standard Strings (Single & Double Quoted)
				const strMatch = remaining.match(
					/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/
				);
				if (strMatch) {
					tokens.push({ text: strMatch[0], type: 'string' });
					remaining = remaining.slice(strMatch[0].length);
					continue;
				}

				// 15. Keywords Across Languages (including ES2026 and TS6)
				const kwMatch = remaining.match(
					/^(import|export|from|default|const|let|var|function|return|async|await|class|interface|type|extends|implements|new|this|typeof|instanceof|if|else|switch|case|break|for|while|try|catch|finally|throw|as|in|of|true|false|null|undefined|fn|mut|struct|enum|impl|trait|pub|use|mod|crate|where|loop|unsafe|package|func|defer|go|chan|select|iota|def|self|yield|lambda|elif|except|with|None|True|False|pass|assert|raise|match|when|using|accessor|override|declare|namespace|asserts|is|del|global|nonlocal|query|mutation|subscription|schema|scalar|fragment|directive|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP|ORDER|BY|LIMIT|pnpm|npm|npx|bun|yarn|git|docker|curl|wget|mkdir|echo|cat|rm|cp|mv|chmod|chown|sudo|cd|ls|pwd|grep|sed|awk)\b/i
				);
				if (kwMatch) {
					tokens.push({ text: kwMatch[0], type: 'keyword' });
					remaining = remaining.slice(kwMatch[0].length);
					continue;
				}

				// 16. React Hooks / Generic Macro tokens
				const macroMatch = remaining.match(/^(use[A-Z]\w+)\b/);
				if (macroMatch) {
					tokens.push({ text: macroMatch[0], type: 'macro' });
					remaining = remaining.slice(macroMatch[0].length);
					continue;
				}

				// 17. Function Invocations (funcName())
				const fnMatch = remaining.match(/^(\$?\w+)(?=\s*\()/);
				if (fnMatch) {
					tokens.push({ text: fnMatch[0], type: 'function' });
					remaining = remaining.slice(fnMatch[0].length);
					continue;
				}

				// 18. Numbers (integers, floats, scientific, BigInt, hex, binary, octal & CSS units)
				const numMatch = remaining.match(
					/^(?:0[xX][0-9a-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?n?(?:px|rem|em|%|vh|vw|dvh|dvw|s|ms)?)\b/
				);
				if (numMatch) {
					tokens.push({ text: numMatch[0], type: 'number' });
					remaining = remaining.slice(numMatch[0].length);
					continue;
				}

				// 19. Punctuation & Math Operators
				const punctMatch = remaining.match(/^([{}()[\].,;:?!=<>+\-*/%&|^~_^\\]+)/);
				if (punctMatch) {
					tokens.push({ text: punctMatch[0], type: 'punctuation' });
					remaining = remaining.slice(punctMatch[0].length);
					continue;
				}

				// 20. Plain text / whitespace
				const plainMatch = remaining.match(/^([\w$]+|\s+)/);
				if (plainMatch) {
					tokens.push({ text: plainMatch[0], type: 'plain' });
					remaining = remaining.slice(plainMatch[0].length);
					continue;
				}

				// Fallback
				tokens.push({ text: remaining[0], type: 'plain' });
				remaining = remaining.slice(1);
			}

			return tokens;
		});
	}
</script>

<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { useToast } from '#lib/composables/useToast.svelte.js';

	let {
		code,
		language = 'typescript',
		filename = '',
		showLineNumbers = false,
		highlightLines = [],
		wrap = false,
		themeMode = 'dark',
		class: className = ''
	}: CodeBlockProps = $props();

	let copied = $state(false);
	const toast = useToast();

	let tokenizedLines = $derived(tokenizeCode(code.trim(), language));
	let isAdaptive = $derived(themeMode === 'adaptive');

	function copyToClipboard() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(code);
			copied = true;
			toast.success('Copied to clipboard', filename || `${language.toUpperCase()} snippet`);
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div
	class="my-4 overflow-hidden rounded-xl border transition-all {isAdaptive
		? 'border-neutral-200 bg-neutral-50 shadow-xs dark:border-neutral-800 dark:bg-neutral-950'
		: 'border-neutral-200/90 bg-neutral-950 shadow-md dark:border-neutral-800'} {className}"
>
	<!-- Header Bar -->
	{#if filename || language}
		<div
			class="flex items-center justify-between gap-2 border-b px-4 py-2 font-mono text-xs {isAdaptive
				? 'border-neutral-200 bg-neutral-100/80 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400'
				: 'border-neutral-800 bg-neutral-900/80 text-neutral-400'}"
		>
			<div class="flex min-w-0 items-center gap-2">
				{#if filename}
					<span
						class="flex min-w-0 items-center gap-1.5 truncate font-medium {isAdaptive
							? 'text-neutral-800 dark:text-neutral-200'
							: 'text-neutral-200'}"
					>
						<span class="h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>
						<span class="truncate">{filename}</span>
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
			</div>

			<div class="flex shrink-0 items-center gap-2">
				{#if filename && language}
					<span
						class="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase {isAdaptive
							? 'bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300'
							: 'bg-neutral-800/80 text-neutral-400'}"
					>
						{language}
					</span>
				{/if}
				<Button
					size="xs"
					variant="ghost"
					onclick={copyToClipboard}
					class="h-6 px-2 text-xs {isAdaptive
						? 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
						: 'text-neutral-400 hover:text-white'}"
					aria-label="Copy code to clipboard"
				>
					<Icon name={copied ? 'check' : 'copy'} size="xs" class="mr-1" />
					{copied ? 'Copied' : 'Copy'}
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex justify-end p-2 pb-0">
			<Button
				size="xs"
				variant="ghost"
				onclick={copyToClipboard}
				class="h-6 px-2 text-xs {isAdaptive
					? 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
					: 'text-neutral-400 hover:text-white'}"
				aria-label="Copy code to clipboard"
			>
				<Icon name={copied ? 'check' : 'copy'} size="xs" class="mr-1" />
				{copied ? 'Copied' : 'Copy'}
			</Button>
		</div>
	{/if}

	<!-- Code Area -->
	<pre
		class="overflow-x-auto p-4 font-mono text-xs leading-relaxed {isAdaptive
			? 'text-neutral-800 dark:text-neutral-200'
			: 'text-neutral-200'} {wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}"><code
			class="language-{language}"
			>{#each tokenizedLines as lineTokens, lineIdx (lineIdx)}{@const lineNum =
					lineIdx + 1}{@const isHighlighted = highlightLines.includes(lineNum)}<div
					class="table-row {isHighlighted
						? '-mx-4 block border-l-2 border-primary-500 bg-primary-500/10 px-4'
						: ''}">{#if showLineNumbers}<span
							class="table-cell pr-4 text-right select-none {isAdaptive
								? 'text-neutral-400 dark:text-neutral-600'
								: 'text-neutral-600 dark:text-neutral-500'}">{lineNum}</span
						>{/if}<span class="table-cell"
						>{#each lineTokens as token, tokenIdx (tokenIdx)}{#if token.type === 'rune'}<span
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
								>{:else if token.type === 'heading'}<span
									class="font-bold text-amber-600 dark:text-amber-300">{token.text}</span
								>{:else if token.type === 'bold'}<span
									class="font-bold text-neutral-900 dark:text-white">{token.text}</span
								>{:else if token.type === 'italic'}<span
									class="text-neutral-600 italic dark:text-neutral-300">{token.text}</span
								>{:else if token.type === 'link'}<span
									class="text-sky-600 underline dark:text-sky-400">{token.text}</span
								>{:else if token.type === 'decorator'}<span
									class="text-purple-600 dark:text-purple-400">{token.text}</span
								>{:else if token.type === 'number'}<span
									class="text-purple-600 dark:text-purple-400">{token.text}</span
								>{:else if token.type === 'punctuation'}<span
									class="text-neutral-500 dark:text-neutral-400">{token.text}</span
								>{:else}<span>{token.text}</span>{/if}{/each}</span
					></div>{/each}</code
		></pre>
</div>
