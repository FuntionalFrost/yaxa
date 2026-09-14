<script lang="ts">
	import CodeBlock from '$lib/components/elements/CodeBlock.svelte';

	interface Props {
		code: string;
		filename?: string;
		language?: string;
		showLineNumbers?: boolean;
		highlightLines?: number[];
		wrap?: boolean;
		class?: string;
	}

	let {
		code,
		filename = '',
		language = 'svelte',
		showLineNumbers = false,
		highlightLines = [],
		wrap = false,
		class: className = ''
	}: Props = $props();
</script>

<CodeBlock
	{code}
	{filename}
	{language}
	{showLineNumbers}
	{highlightLines}
	{wrap}
	class={className}
/>
