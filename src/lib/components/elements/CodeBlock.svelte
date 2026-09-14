<script module lang="ts">
	export interface CodeBlockProps {
		code: string;
		language?: string;
		filename?: string;
		showLineNumbers?: boolean;
		highlightLines?: number[];
		wrap?: boolean;
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
			| 'heading'
			| 'bold'
			| 'italic'
			| 'link'
			| 'directive'
			| 'decorator';
	}

	// Zero-WASM Multi-Language Pure JavaScript Tokenizer
	export function tokenizeCode(code: string, language: string = 'typescript'): Token[][] {
		const lines = code.split('\n');
		const lang = language.toLowerCase();

		const isMarkdown = ['markdown', 'md', 'gfm'].includes(lang);
		const isLatex = ['latex', 'tex', 'math'].includes(lang);
		const isVue = lang === 'vue';
		const isJsx = ['tsx', 'jsx', 'react'].includes(lang);
		const isSvelte = lang === 'svelte';
		const isHtml = ['html', 'xml', 'svg'].includes(lang);
		const isPython = ['python', 'py'].includes(lang);
		const isSql = lang === 'sql';
		const isBash = ['bash', 'sh', 'zsh', 'shell'].includes(lang);

		return lines.map((line) => {
			if (!line) return [{ text: '', type: 'plain' }];

			// Special full-line rule: Markdown Headings (# Header)
			if (isMarkdown) {
				const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
				if (headingMatch) {
					return [
						{ text: headingMatch[1], type: 'punctuation' },
						{ text: headingMatch[2], type: 'heading' }
					];
				}
				const blockquoteMatch = line.match(/^(\s*>\s+)(.*)$/);
				if (blockquoteMatch) {
					return [
						{ text: blockquoteMatch[1], type: 'punctuation' },
						{ text: blockquoteMatch[2], type: 'italic' }
					];
				}
			}

			const tokens: Token[] = [];
			let remaining = line;

			while (remaining.length > 0) {
				// 1. Comments
				if (
					(!isLatex && (remaining.startsWith('//') || remaining.startsWith('/*'))) ||
					((isMarkdown || isHtml || isSvelte || isVue) && remaining.startsWith('<!--')) ||
					((isPython || isBash || lang === 'env' || lang === 'yaml' || lang === 'yml') &&
						remaining.startsWith('#')) ||
					(isLatex && remaining.startsWith('%')) ||
					(isSql && remaining.startsWith('--'))
				) {
					tokens.push({ text: remaining, type: 'comment' });
					break;
				}

				// 2. LaTeX Math Macros and Math Blocks
				if (isLatex) {
					// Macros (\frac, \sqrt, \alpha, \sum, \int, \begin, etc.)
					const macroMatch = remaining.match(/^(\\[a-zA-Z]+|\\\[|\\\]|\\\(|\\\))/);
					if (macroMatch) {
						tokens.push({ text: macroMatch[0], type: 'macro' });
						remaining = remaining.slice(macroMatch[0].length);
						continue;
					}
					// Inline math delimiters ($...$ or $$...$$)
					const mathDelimMatch = remaining.match(/^(\${1,2})/);
					if (mathDelimMatch) {
						tokens.push({ text: mathDelimMatch[0], type: 'keyword' });
						remaining = remaining.slice(mathDelimMatch[0].length);
						continue;
					}
				}

				// 3. Markdown Formatting (Bold, Italic, Code, Links)
				if (isMarkdown) {
					// Inline code (`...`)
					const codeMatch = remaining.match(/^(`[^`]+`)/);
					if (codeMatch) {
						tokens.push({ text: codeMatch[0], type: 'string' });
						remaining = remaining.slice(codeMatch[0].length);
						continue;
					}
					// Bold (**...**)
					const boldMatch = remaining.match(/^(\*\*[^*]+\*\*)/);
					if (boldMatch) {
						tokens.push({ text: boldMatch[0], type: 'bold' });
						remaining = remaining.slice(boldMatch[0].length);
						continue;
					}
					// Link ([text](url))
					const linkMatch = remaining.match(/^(\[[^\]]+\])(\([^)]+\))/);
					if (linkMatch) {
						tokens.push({ text: linkMatch[1], type: 'link' });
						tokens.push({ text: linkMatch[2], type: 'string' });
						remaining = remaining.slice(linkMatch[0].length);
						continue;
					}
				}

				// 4. Strings
				const strMatch = remaining.match(
					/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/
				);
				if (strMatch) {
					tokens.push({ text: strMatch[0], type: 'string' });
					remaining = remaining.slice(strMatch[0].length);
					continue;
				}

				// 5. Python Decorators (@decorator)
				if (isPython) {
					const decMatch = remaining.match(/^(@\w+)/);
					if (decMatch) {
						tokens.push({ text: decMatch[0], type: 'decorator' });
						remaining = remaining.slice(decMatch[0].length);
						continue;
					}
				}

				// 6. Vue / Svelte / JSX Directives & Tags
				if (isVue || isSvelte || isHtml || isJsx) {
					// HTML / Svelte / Vue / JSX Tags
					const tagMatch = remaining.match(/^(<\/?[\w.:-]+|\/>|>)/);
					if (tagMatch) {
						tokens.push({ text: tagMatch[0], type: 'tag' });
						remaining = remaining.slice(tagMatch[0].length);
						continue;
					}

					// Vue Directives (v-if, v-for, :class, @click, #slot)
					if (isVue) {
						const vueDirMatch = remaining.match(/^((?:v-[\w-]+|:[\w-]+|@[\w-]+|#[\w-]+))(?=\s*=?)/);
						if (vueDirMatch) {
							tokens.push({ text: vueDirMatch[0], type: 'directive' });
							remaining = remaining.slice(vueDirMatch[0].length);
							continue;
						}
					}

					// Attributes (bind:*, class=, onClick=, etc.)
					const attrMatch = remaining.match(/^([\w:.-]+)(?=\s*=\s*)/);
					if (attrMatch) {
						tokens.push({ text: attrMatch[0], type: 'attr' });
						remaining = remaining.slice(attrMatch[0].length);
						continue;
					}
				}

				// 7. Keywords Across Languages
				const kwMatch = remaining.match(
					/^(import|export|from|default|const|let|var|function|return|async|await|class|interface|type|extends|implements|new|this|typeof|instanceof|if|else|switch|case|break|for|while|try|catch|finally|throw|as|in|of|true|false|null|undefined|fn|mut|struct|enum|impl|trait|pub|use|mod|crate|where|loop|unsafe|package|func|defer|go|chan|select|iota|def|self|yield|lambda|elif|except|with|None|True|False|pass|query|mutation|subscription|schema|scalar|fragment|directive|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP|ORDER|BY|LIMIT|pnpm|npm|npx|bun|yarn|git|docker)\b/i
				);
				if (kwMatch) {
					tokens.push({ text: kwMatch[0], type: 'keyword' });
					remaining = remaining.slice(kwMatch[0].length);
					continue;
				}

				// 8. Svelte Runes ($state, $derived, $effect, $props, $bindable, $inspect) & React Hooks
				const runeMatch = remaining.match(
					/^(\$(?:state|derived|effect|props|bindable|inspect|host)|use[A-Z]\w+)\b/
				);
				if (runeMatch) {
					tokens.push({ text: runeMatch[0], type: 'macro' });
					remaining = remaining.slice(runeMatch[0].length);
					continue;
				}

				// 9. Function invocations (funcName())
				const fnMatch = remaining.match(/^(\$?\w+)(?=\s*\()/);
				if (fnMatch) {
					tokens.push({ text: fnMatch[0], type: 'function' });
					remaining = remaining.slice(fnMatch[0].length);
					continue;
				}

				// 10. Numbers
				const numMatch = remaining.match(/^\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?)\b/);
				if (numMatch) {
					tokens.push({ text: numMatch[0], type: 'number' });
					remaining = remaining.slice(numMatch[0].length);
					continue;
				}

				// 11. Punctuation & Math Operators
				const punctMatch = remaining.match(/^([{}()[\].,;:?!=<>+\-*/%&|^~_^\\]+)/);
				if (punctMatch) {
					tokens.push({ text: punctMatch[0], type: 'punctuation' });
					remaining = remaining.slice(punctMatch[0].length);
					continue;
				}

				// 12. Plain text / whitespace
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
	import { useToast } from '$lib/composables/useToast';

	let {
		code,
		language = 'typescript',
		filename = '',
		showLineNumbers = false,
		highlightLines = [],
		wrap = false,
		class: className = ''
	}: CodeBlockProps = $props();

	let copied = $state(false);
	const toast = useToast();

	let tokenizedLines = $derived(tokenizeCode(code.trim(), language));

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
	class="my-4 overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-950 shadow-md transition-all dark:border-neutral-800 {className}"
>
	<!-- Header Bar -->
	{#if filename || language}
		<div
			class="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 py-2 font-mono text-xs text-neutral-400"
		>
			<div class="flex items-center gap-2">
				{#if filename}
					<span class="flex items-center gap-1.5 font-medium text-neutral-200">
						<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
						{filename}
					</span>
				{:else}
					<span
						class="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase"
					>
						{language}
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-1.5">
				{#if filename && language}
					<span
						class="rounded bg-neutral-800/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase"
					>
						{language}
					</span>
				{/if}
				<Button
					size="xs"
					variant="ghost"
					onclick={copyToClipboard}
					class="h-6 px-2 text-xs text-neutral-400 hover:text-white"
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
				class="h-6 px-2 text-xs text-neutral-400 hover:text-white"
				aria-label="Copy code to clipboard"
			>
				<Icon name={copied ? 'check' : 'copy'} size="xs" class="mr-1" />
				{copied ? 'Copied' : 'Copy'}
			</Button>
		</div>
	{/if}

	<!-- Code Area -->
	<pre
		class="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-neutral-200 {wrap
			? 'whitespace-pre-wrap'
			: 'whitespace-pre'}"><code class="language-{language}"
			>{#each tokenizedLines as lineTokens, lineIdx}{@const lineNum =
					lineIdx + 1}{@const isHighlighted = highlightLines.includes(lineNum)}<div
					class="table-row {isHighlighted
						? '-mx-4 block border-l-2 border-primary-500 bg-primary-950/40 px-4'
						: ''}">{#if showLineNumbers}<span
							class="table-cell pr-4 text-right text-neutral-600 select-none dark:text-neutral-500"
							>{lineNum}</span
						>{/if}<span class="table-cell"
						>{#each lineTokens as token}{#if token.type === 'keyword'}<span
									class="font-semibold text-primary-400">{token.text}</span
								>{:else if token.type === 'string'}<span class="text-emerald-400">{token.text}</span
								>{:else if token.type === 'comment'}<span class="text-neutral-500 italic"
									>{token.text}</span
								>{:else if token.type === 'tag'}<span class="font-semibold text-rose-400"
									>{token.text}</span
								>{:else if token.type === 'directive'}<span class="font-medium text-amber-400"
									>{token.text}</span
								>{:else if token.type === 'attr'}<span class="text-amber-300">{token.text}</span
								>{:else if token.type === 'function'}<span class="text-sky-400">{token.text}</span
								>{:else if token.type === 'macro'}<span class="font-semibold text-indigo-400"
									>{token.text}</span
								>{:else if token.type === 'heading'}<span class="font-bold text-amber-300"
									>{token.text}</span
								>{:else if token.type === 'bold'}<span class="font-bold text-white"
									>{token.text}</span
								>{:else if token.type === 'italic'}<span class="text-neutral-300 italic"
									>{token.text}</span
								>{:else if token.type === 'link'}<span class="text-sky-400 underline"
									>{token.text}</span
								>{:else if token.type === 'decorator'}<span class="text-purple-400"
									>{token.text}</span
								>{:else if token.type === 'number'}<span class="text-purple-400">{token.text}</span
								>{:else if token.type === 'punctuation'}<span class="text-neutral-400"
									>{token.text}</span
								>{:else}<span>{token.text}</span>{/if}{/each}</span
					></div>{/each}</code
		></pre>
</div>
