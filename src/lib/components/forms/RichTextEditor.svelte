<script module lang="ts">
	export interface RichTextEditorProps {
		value?: string;
		placeholder?: string;
		minHeight?: number;
		showPreviewToggle?: boolean;
		disabled?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import Button from '../elements/Button.svelte';
	import Icon from '../elements/Icon.svelte';
	import CodeBlock from '../elements/CodeBlock.svelte';

	let {
		value = $bindable(''),
		placeholder = 'Write content in Markdown or rich text...',
		minHeight = 180,
		showPreviewToggle = true,
		disabled = false,
		class: className = ''
	}: RichTextEditorProps = $props();

	let mode = $state<'write' | 'preview'>('write');
	let textareaEl: HTMLTextAreaElement | null = $state(null);

	function wrapSelection(prefix: string, suffix = prefix, placeholderText = 'text') {
		if (!textareaEl) return;
		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const text = value;
		const selected = text.slice(start, end) || placeholderText;
		const replacement = `${prefix}${selected}${suffix}`;

		value = text.slice(0, start) + replacement + text.slice(end);

		setTimeout(() => {
			if (textareaEl) {
				textareaEl.focus();
				textareaEl.setSelectionRange(
					start + prefix.length,
					start + prefix.length + selected.length
				);
			}
		}, 0);
	}

	function insertLinePrefix(prefix: string) {
		if (!textareaEl) return;
		const start = textareaEl.selectionStart;
		const text = value;
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;

		value = text.slice(0, lineStart) + prefix + text.slice(lineStart);

		setTimeout(() => {
			if (textareaEl) {
				textareaEl.focus();
				textareaEl.setSelectionRange(start + prefix.length, start + prefix.length);
			}
		}, 0);
	}
</script>

<div
	class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-900 {className}"
>
	<!-- Formatting Toolbar -->
	<div
		class="flex flex-wrap items-center justify-between border-b border-neutral-200/80 bg-neutral-50/70 p-1.5 dark:border-neutral-800/80 dark:bg-neutral-900/60"
	>
		<div class="flex flex-wrap items-center gap-0.5">
			<!-- Bold -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => wrapSelection('**', '**', 'bold text')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Bold (Ctrl+B)"
				aria-label="Bold"
			>
				<Icon name="bold" size="xs" />
			</Button>

			<!-- Italic -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => wrapSelection('*', '*', 'italic text')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Italic (Ctrl+I)"
				aria-label="Italic"
			>
				<Icon name="italic" size="xs" />
			</Button>

			<!-- Strikethrough -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => wrapSelection('~~', '~~', 'strikethrough')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Strikethrough"
				aria-label="Strikethrough"
			>
				<Icon name="strikethrough" size="xs" />
			</Button>

			<div class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-700"></div>

			<!-- Heading 1 -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => insertLinePrefix('# ')}
				disabled={disabled || mode === 'preview'}
				class="h-7 px-1.5 text-xs font-bold"
				title="Heading 1"
				aria-label="Heading 1"
			>
				H1
			</Button>

			<!-- Heading 2 -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => insertLinePrefix('## ')}
				disabled={disabled || mode === 'preview'}
				class="h-7 px-1.5 text-xs font-bold"
				title="Heading 2"
				aria-label="Heading 2"
			>
				H2
			</Button>

			<!-- Blockquote -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => insertLinePrefix('> ')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Quote"
				aria-label="Quote"
			>
				<Icon name="quote" size="xs" />
			</Button>

			<!-- Code Block -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => wrapSelection('```\n', '\n```', 'code block')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Code Block"
				aria-label="Code Block"
			>
				<Icon name="code" size="xs" />
			</Button>

			<!-- Bullet List -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => insertLinePrefix('- ')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Bullet List"
				aria-label="Bullet List"
			>
				<Icon name="list" size="xs" />
			</Button>

			<!-- Numbered List -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => insertLinePrefix('1. ')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Numbered List"
				aria-label="Numbered List"
			>
				<Icon name="list-ordered" size="xs" />
			</Button>

			<!-- Link -->
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onclick={() => wrapSelection('[', '](https://example.com)', 'link text')}
				disabled={disabled || mode === 'preview'}
				class="h-7 w-7 p-0"
				title="Insert Link"
				aria-label="Insert Link"
			>
				<Icon name="link" size="xs" />
			</Button>
		</div>

		<!-- Mode Toggle (Write / Preview) -->
		{#if showPreviewToggle}
			<div class="flex items-center rounded-lg bg-neutral-200/60 p-0.5 dark:bg-neutral-800">
				<button
					type="button"
					onclick={() => (mode = 'write')}
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {mode === 'write'
						? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
				>
					Write
				</button>
				<button
					type="button"
					onclick={() => (mode = 'preview')}
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {mode === 'preview'
						? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
				>
					Preview
				</button>
			</div>
		{/if}
	</div>

	<!-- Editor / Preview Body -->
	{#if mode === 'write'}
		<textarea
			bind:this={textareaEl}
			bind:value
			{placeholder}
			{disabled}
			style="min-height: {minHeight}px"
			class="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
		></textarea>
	{:else}
		<div
			style="min-height: {minHeight}px"
			class="prose max-w-none p-4 text-sm prose-neutral dark:prose-invert"
		>
			{#if value.trim()}
				<CodeBlock code={value} language="markdown" themeMode="adaptive" />
			{:else}
				<p class="text-neutral-400 italic">Nothing to preview yet.</p>
			{/if}
		</div>
	{/if}
</div>
