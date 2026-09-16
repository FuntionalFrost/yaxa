<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export interface TerminalLine {
		command?: string;
		output?: string;
		comment?: string;
		prompt?: string;
	}

	export const terminalVariants = tv({
		base: 'w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 font-mono shadow-2xl transition-all'
	});

	export type TerminalProps = VariantProps<typeof terminalVariants> & {
		title?: string;
		lines?: TerminalLine[];
		copyable?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import { useClipboard } from '$lib/composables/useClipboard.svelte';

	let {
		title = 'bash',
		lines = [],
		copyable = true,
		class: className = ''
	}: TerminalProps = $props();

	const clipboard = useClipboard();

	let fullCommandText = $derived(
		lines
			.filter((l) => l.command)
			.map((l) => l.command)
			.join('\n')
	);
</script>

<div class={terminalVariants({ class: className })}>
	<!-- Header Bar -->
	<div
		class="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/80 px-4 py-2.5"
	>
		<!-- Window Control Dots -->
		<div class="flex items-center gap-1.5" aria-hidden="true">
			<span class="h-3 w-3 rounded-full bg-rose-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
			<span class="h-3 w-3 rounded-full bg-emerald-500/80"></span>
		</div>

		<!-- Title -->
		<div class="text-[11px] font-medium text-neutral-400">
			{title}
		</div>

		<!-- Copy Button -->
		<div>
			{#if copyable && fullCommandText}
				<button
					type="button"
					onclick={() => clipboard.copy(fullCommandText)}
					class="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
					aria-label="Copy terminal commands"
				>
					{#if clipboard.copied}
						<Icon name="check" size="xs" class="text-emerald-400" />
						<span class="text-emerald-400">Copied</span>
					{:else}
						<Icon name="clipboard" size="xs" />
						<span>Copy</span>
					{/if}
				</button>
			{:else}
				<span class="w-8"></span>
			{/if}
		</div>
	</div>

	<!-- Terminal Body -->
	<div class="space-y-2 overflow-x-auto p-4 text-xs leading-relaxed text-neutral-200">
		{#each lines as line}
			{#if line.comment}
				<div class="text-neutral-500 select-none">
					# {line.comment}
				</div>
			{/if}

			{#if line.command}
				<div class="flex items-center gap-2">
					<span class="font-semibold text-emerald-400 select-none">{line.prompt || '$'}</span>
					<span class="font-medium text-white">{line.command}</span>
				</div>
			{/if}

			{#if line.output}
				<div class="pl-4 font-normal whitespace-pre-wrap text-neutral-400">
					{line.output}
				</div>
			{/if}
		{/each}
	</div>
</div>
