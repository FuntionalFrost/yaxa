<script module lang="ts">
	export interface AiThoughtProps {
		duration?: number;
		running?: boolean;
		title?: string;
		steps?: string[];
		open?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';

	let {
		duration,
		running = false,
		title = 'Thinking Process',
		steps = [],
		open = $bindable(false),
		class: className = '',
		children
	}: AiThoughtProps = $props();

	function toggle() {
		open = !open;
	}
</script>

<div
	class="my-2 overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/60 transition-all dark:border-neutral-800/80 dark:bg-neutral-900/40 {className}"
>
	<!-- Header Bar -->
	<button
		type="button"
		onclick={toggle}
		class="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100/60 dark:text-neutral-300 dark:hover:bg-neutral-800/40"
		aria-expanded={open}
	>
		<div class="flex items-center gap-2">
			{#if running}
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
				</span>
			{:else}
				<Icon name="sparkles" size="xs" class="text-primary-500" />
			{/if}

			<span class="font-semibold text-neutral-800 dark:text-neutral-200">
				{title}
			</span>

			{#if running}
				<span class="animate-pulse text-[11px] text-primary-600 dark:text-primary-400">
					Thinking...
				</span>
			{:else if duration !== undefined}
				<span
					class="py-0.2 rounded bg-neutral-200/60 px-1.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
				>
					{duration.toFixed(1)}s
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-neutral-400">
			{#if steps.length > 0}
				<span class="text-[11px] text-neutral-500">
					{steps.length}
					{steps.length === 1 ? 'step' : 'steps'}
				</span>
			{/if}
			<Icon
				name={open ? 'chevron-up' : 'chevron-down'}
				size="xs"
				class="transition-transform duration-200"
			/>
		</div>
	</button>

	<!-- Collapsible Content -->
	{#if open}
		<div
			class="border-t border-neutral-200/60 px-3.5 py-3 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800/60 dark:text-neutral-300"
		>
			{#if steps.length > 0}
				<ul
					class="mb-2.5 space-y-1.5 border-b border-neutral-200/40 pb-2.5 dark:border-neutral-800/40"
				>
					{#each steps as step, idx (idx)}
						<li class="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
							<Icon name="check" size="xs" class="text-emerald-500" />
							<span>{step}</span>
						</li>
					{/each}
				</ul>
			{/if}

			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>
