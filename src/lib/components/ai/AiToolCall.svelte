<script module lang="ts">
	export type ToolCallStatus = 'idle' | 'running' | 'success' | 'error';

	export interface AiToolCallProps {
		name: string;
		status?: ToolCallStatus;
		args?: Record<string, any> | string;
		result?: Record<string, any> | string;
		open?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import CodeBlock from '../elements/CodeBlock.svelte';

	let {
		name,
		status = 'idle',
		args,
		result,
		open = $bindable(false),
		class: className = '',
		children
	}: AiToolCallProps = $props();

	function toggle() {
		open = !open;
	}

	let formattedArgs = $derived(
		typeof args === 'object' ? JSON.stringify(args, null, 2) : args || ''
	);

	let formattedResult = $derived(
		typeof result === 'object' ? JSON.stringify(result, null, 2) : result || ''
	);
</script>

<div
	class="my-2.5 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition-all dark:border-neutral-800 dark:bg-neutral-900 {className}"
>
	<!-- Header Bar -->
	<button
		type="button"
		onclick={toggle}
		class="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
		aria-expanded={open}
	>
		<div class="flex items-center gap-2.5">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
			>
				<Icon name="terminal" size="xs" />
			</div>

			<div>
				<div class="flex items-center gap-2">
					<span class="font-mono font-semibold text-neutral-900 dark:text-white">
						{name}
					</span>

					{#if status === 'running'}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300"
						>
							<span class="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500"></span>
							Running
						</span>
					{:else if status === 'success'}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
						>
							<Icon name="check" size="xs" />
							Success
						</span>
					{:else if status === 'error'}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-300"
						>
							<Icon name="x" size="xs" />
							Error
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex items-center gap-1 text-neutral-400">
			<span class="text-[11px] text-neutral-500">
				{open ? 'Hide details' : 'View details'}
			</span>
			<Icon
				name={open ? 'chevron-up' : 'chevron-down'}
				size="xs"
				class="transition-transform duration-200"
			/>
		</div>
	</button>

	<!-- Details Drawer -->
	{#if open}
		<div
			class="border-t border-neutral-200/80 bg-neutral-50/50 p-3.5 text-xs dark:border-neutral-800/80 dark:bg-neutral-950/40"
		>
			{#if formattedArgs}
				<div class="mb-3">
					<div class="mb-1 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
						Parameters
					</div>
					<CodeBlock code={formattedArgs} language="json" class="my-0 text-xs" />
				</div>
			{/if}

			{#if formattedResult}
				<div>
					<div class="mb-1 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
						Result Output
					</div>
					<CodeBlock code={formattedResult} language="json" class="my-0 text-xs" />
				</div>
			{/if}

			{#if children}
				<div class="mt-2">
					{@render children()}
				</div>
			{/if}
		</div>
	{/if}
</div>
