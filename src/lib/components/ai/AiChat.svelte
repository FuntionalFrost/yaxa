<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface AiMessageThought {
		duration?: number;
		running?: boolean;
		text?: string;
		steps?: string[];
	}

	export interface AiMessageTool {
		name: string;
		status?: 'idle' | 'running' | 'success' | 'error';
		args?: Record<string, any> | string;
		result?: Record<string, any> | string;
	}

	export interface AiMessage {
		id: string;
		role: 'user' | 'assistant' | 'system';
		content: string;
		createdAt?: Date | string;
		thought?: AiMessageThought;
		tools?: AiMessageTool[];
		isStreaming?: boolean;
	}

	export interface AiChatProps {
		messages?: AiMessage[];
		loading?: boolean;
		userAvatar?: string;
		assistantAvatar?: string;
		assistantName?: string;
		placeholder?: string;
		autoScroll?: boolean;
		class?: string;
		onsend?: (text: string, files?: File[]) => void;
		onstop?: () => void;
		onretry?: (message: AiMessage) => void;
		header?: Snippet;
		messageSlot?: Snippet<[AiMessage]>;
		footer?: Snippet;
	}
</script>

<script lang="ts">
	import Avatar from '../elements/Avatar.svelte';
	import Icon from '../elements/Icon.svelte';
	import PromptBar from './PromptBar.svelte';
	import AiThought from './AiThought.svelte';
	import AiToolCall from './AiToolCall.svelte';
	import { useToast } from '$lib/composables/useToast';

	let {
		messages = [],
		loading = false,
		userAvatar = '',
		assistantAvatar = '',
		assistantName = 'AI Assistant',
		placeholder = 'Ask a question or type / for commands...',
		autoScroll = true,
		class: className = '',
		onsend,
		onstop,
		onretry,
		header,
		messageSlot,
		footer
	}: AiChatProps = $props();

	let scrollContainer: HTMLDivElement | null = $state(null);
	let promptValue = $state('');
	const toast = useToast();

	function scrollToBottom(smooth = true) {
		if (scrollContainer && autoScroll) {
			scrollContainer.scrollTo({
				top: scrollContainer.scrollHeight,
				behavior: smooth ? 'smooth' : 'auto'
			});
		}
	}

	$effect(() => {
		if (messages.length > 0) {
			setTimeout(() => scrollToBottom(true), 50);
		}
	});

	function copyMessage(text: string) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		}
	}
</script>

<div
	class="flex h-full min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-950 {className}"
>
	<!-- Chat Header Bar -->
	<div
		class="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800/80 dark:bg-neutral-900/50"
	>
		{#if header}
			{@render header()}
		{:else}
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400"
				>
					<Icon name="bot" size="sm" />
				</div>
				<div>
					<div class="text-sm font-semibold text-neutral-900 dark:text-white">
						{assistantName}
					</div>
					<div class="flex items-center gap-1.5 text-[11px] text-neutral-500">
						<span
							class="h-1.5 w-1.5 rounded-full {loading
								? 'animate-ping bg-amber-500'
								: 'bg-emerald-500'}"
						></span>
						<span>{loading ? 'Generating response...' : 'Online & Ready'}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Scrollable Messages Container -->
	<div
		bind:this={scrollContainer}
		class="yaxa-scrollbar flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
	>
		{#if messages.length === 0}
			<div class="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
				>
					<Icon name="sparkles" size="lg" />
				</div>
				<h3 class="text-base font-semibold text-neutral-900 dark:text-white">
					How can I help you today?
				</h3>
				<p class="mt-1 max-w-sm text-xs text-neutral-500">
					Ask questions, analyze documents, generate code, or explore ideas with interactive AI.
				</p>
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				{#if messageSlot}
					{@render messageSlot(msg)}
				{:else}
					<div class="flex gap-3.5 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
						{#if msg.role === 'assistant'}
							<Avatar
								src={assistantAvatar}
								alt={assistantName}
								size="sm"
								class="mt-1 flex-shrink-0"
							/>
						{/if}

						<div
							class="flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] {msg.role === 'user'
								? 'items-end'
								: 'items-start'}"
						>
							<!-- Agent Reasoning / Thoughts -->
							{#if msg.thought}
								<AiThought
									duration={msg.thought.duration}
									running={msg.thought.running}
									steps={msg.thought.steps}
									class="w-full"
								>
									{#if msg.thought.text}
										<p>{msg.thought.text}</p>
									{/if}
								</AiThought>
							{/if}

							<!-- Agent Tool Invocations -->
							{#if msg.tools && msg.tools.length > 0}
								<div class="w-full space-y-2">
									{#each msg.tools as tool}
										<AiToolCall
											name={tool.name}
											status={tool.status}
											args={tool.args}
											result={tool.result}
										/>
									{/each}
								</div>
							{/if}

							<!-- Message Bubble -->
							<div
								class="relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs {msg.role ===
								'user'
									? 'bg-primary-500 text-white dark:bg-primary-600'
									: 'border border-neutral-200/80 bg-neutral-50 text-neutral-900 dark:border-neutral-800/80 dark:bg-neutral-900 dark:text-neutral-100'}"
							>
								<div class="whitespace-pre-wrap">{msg.content}</div>

								{#if msg.isStreaming}
									<span class="inline-block h-4 w-1.5 animate-pulse bg-current"></span>
								{/if}
							</div>

							<!-- Action Buttons -->
							<div class="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-neutral-400">
								<button
									type="button"
									onclick={() => copyMessage(msg.content)}
									class="hover:text-neutral-700 dark:hover:text-neutral-200"
									title="Copy message"
								>
									<Icon name="copy" size="xs" />
								</button>

								{#if msg.role === 'assistant' && onretry}
									<button
										type="button"
										onclick={() => onretry(msg)}
										class="hover:text-neutral-700 dark:hover:text-neutral-200"
										title="Regenerate response"
									>
										<Icon name="rotate-cw" size="xs" />
									</button>
								{/if}
							</div>
						</div>

						{#if msg.role === 'user'}
							<Avatar src={userAvatar} alt="User" size="sm" class="mt-1 flex-shrink-0" />
						{/if}
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- Bottom Prompt Input Bar -->
	<div
		class="border-t border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-800/80 dark:bg-neutral-900/50"
	>
		{#if footer}
			{@render footer()}
		{:else}
			<PromptBar
				bind:value={promptValue}
				{placeholder}
				{loading}
				onsubmit={(text, files) => {
					if (onsend) onsend(text, files);
				}}
				{onstop}
			/>
		{/if}
	</div>
</div>
