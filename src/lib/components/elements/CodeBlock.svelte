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

	// Zero-WASM Multi-Language Pure JavaScript Tokenizer with Svelte 5 Rune Recognition
	export function tokenizeCode(code: string, language: string = 'typescript'): Token[][] {
		const lines = code.split('\n');
		const lang = language.toLowerCase();

		const isMarkdown = ['markdown', 'md', 'gfm'].includes(lang);
		const isLatex = ['latex', 'tex', 'math'].includes(lang);
		const isVue = lang === 'vue';
		const isJsx = ['tsx', 'jsx', 'react'].includes(lang);
		const isSvelte = ['svelte', 'svelte5', 'sv'].includes(lang);
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

				// 3. Markdown Formatting (Bold, Italic, Code, Links)
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

				// 7. Svelte 5 Native Runes ($state, $state.raw, $derived, $derived.by, $effect, $props, $bindable, etc.)
				const svelteRuneMatch = remaining.match(
					/^(\$(?:state(?:\.raw|\.snapshot)?|derived(?:\.by)?|effect(?:\.pre|\.root)?|props|bindable|inspect(?:\.trace)?|host))\b/
				);
				if (svelteRuneMatch) {
					tokens.push({ text: svelteRuneMatch[0], type: 'rune' });
					remaining = remaining.slice(svelteRuneMatch[0].length);
					continue;
				}

				// 8. Keywords Across Languages
				const kwMatch = remaining.match(
					/^(import|export|from|default|const|let|var|function|return|async|await|class|interface|type|extends|implements|new|this|typeof|instanceof|if|else|switch|case|break|for|while|try|catch|finally|throw|as|in|of|true|false|null|undefined|fn|mut|struct|enum|impl|trait|pub|use|mod|crate|where|loop|unsafe|package|func|defer|go|chan|select|iota|def|self|yield|lambda|elif|except|with|None|True|False|pass|query|mutation|subscription|schema|scalar|fragment|directive|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP|ORDER|BY|LIMIT|pnpm|npm|npx|bun|yarn|git|docker)\b/i
				);
				if (kwMatch) {
					tokens.push({ text: kwMatch[0], type: 'keyword' });
					remaining = remaining.slice(kwMatch[0].length);
					continue;
				}

				// 9. React Hooks / Generic Macro tokens
				const macroMatch = remaining.match(/^(use[A-Z]\w+)\b/);
				if (macroMatch) {
					tokens.push({ text: macroMatch[0], type: 'macro' });
					remaining = remaining.slice(macroMatch[0].length);
					continue;
				}

				// 10. Function invocations (funcName())
				const fnMatch = remaining.match(/^(\$?\w+)(?=\s*\()/);
				if (fnMatch) {
					tokens.push({ text: fnMatch[0], type: 'function' });
					remaining = remaining.slice(fnMatch[0].length);
					continue;
				}

				// 11. Numbers
				const numMatch = remaining.match(/^\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?)\b/);
				if (numMatch) {
					tokens.push({ text: numMatch[0], type: 'number' });
					remaining = remaining.slice(numMatch[0].length);
					continue;
				}

				// 12. Punctuation & Math Operators
				const punctMatch = remaining.match(/^([{}()[\].,;:?!=<>+\-*/%&|^~_^\\]+)/);
				if (punctMatch) {
					tokens.push({ text: punctMatch[0], type: 'punctuation' });
					remaining = remaining.slice(punctMatch[0].length);
					continue;
				}

				// 13. Plain text / whitespace
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
			class="flex items-center justify-between border-b px-4 py-2 font-mono text-xs {isAdaptive
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
						<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
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
			</div>

			<div class="flex items-center gap-1.5">
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
			>{#each tokenizedLines as lineTokens, lineIdx}{@const lineNum =
					lineIdx + 1}{@const isHighlighted = highlightLines.includes(lineNum)}<div
					class="table-row {isHighlighted
						? '-mx-4 block border-l-2 border-primary-500 bg-primary-500/10 px-4'
						: ''}">{#if showLineNumbers}<span
							class="table-cell pr-4 text-right select-none {isAdaptive
								? 'text-neutral-400 dark:text-neutral-600'
								: 'text-neutral-600 dark:text-neutral-500'}">{lineNum}</span
						>{/if}<span class="table-cell"
						>{#each lineTokens as token}{#if token.type === 'rune'}<span
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
