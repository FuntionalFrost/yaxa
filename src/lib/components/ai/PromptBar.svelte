<script module lang="ts">
	export interface SlashCommand {
		name: string;
		description: string;
		icon?: string;
	}

	export interface PromptBarProps {
		value?: string;
		placeholder?: string;
		loading?: boolean;
		disabled?: boolean;
		maxHeight?: number;
		attachments?: File[];
		commands?: SlashCommand[];
		audioRecording?: boolean;
		class?: string;
		onsubmit?: (text: string, files?: File[]) => void;
		onstop?: () => void;
		ontoggleAudio?: () => void;
	}
</script>

<script lang="ts">
	import { autosize } from '$lib/actions';
	import Button from '../elements/Button.svelte';
	import Icon from '../elements/Icon.svelte';

	let {
		value = $bindable(''),
		placeholder = 'Ask anything or type / for commands...',
		loading = false,
		disabled = false,
		maxHeight = 200,
		attachments = $bindable([]),
		commands = [
			{ name: '/explain', description: 'Explain this concept simply' },
			{ name: '/fix', description: 'Debug and fix the provided code' },
			{ name: '/summarize', description: 'Summarize key points' }
		],
		audioRecording = $bindable(false),
		class: className = '',
		onsubmit,
		onstop,
		ontoggleAudio
	}: PromptBarProps = $props();

	let fileInputEl: HTMLInputElement | null = $state(null);
	let selectedCommandIdx = $state(0);
	let dismissedQuery = $state('');

	let filteredCommands = $derived.by(() => {
		if (!value.startsWith('/')) return [];
		const query = value.slice(1).toLowerCase();
		return commands.filter(
			(cmd) =>
				cmd.name.slice(1).toLowerCase().includes(query) ||
				cmd.description.toLowerCase().includes(query)
		);
	});

	let showCommands = $derived(
		value.startsWith('/') && filteredCommands.length > 0 && dismissedQuery !== value
	);

	function handleSubmit() {
		if (loading) {
			if (onstop) onstop();
			return;
		}

		if ((!value.trim() && attachments.length === 0) || disabled) return;

		if (onsubmit) {
			onsubmit(value.trim(), [...attachments]);
		}

		value = '';
		attachments = [];
		dismissedQuery = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (showCommands) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedCommandIdx = (selectedCommandIdx + 1) % filteredCommands.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedCommandIdx =
					(selectedCommandIdx - 1 + filteredCommands.length) % filteredCommands.length;
				return;
			}
			if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				const cmd = filteredCommands[selectedCommandIdx];
				if (cmd) {
					value = `${cmd.name} `;
					dismissedQuery = '';
				}
				return;
			}
			if (e.key === 'Escape') {
				dismissedQuery = value;
				return;
			}
		}

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	function triggerFileUpload() {
		fileInputEl?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			attachments = [...attachments, ...Array.from(target.files)];
		}
	}

	function removeAttachment(index: number) {
		attachments = attachments.filter((_, i) => i !== index);
	}

	function selectCommand(cmd: SlashCommand) {
		value = `${cmd.name} `;
		dismissedQuery = '';
	}
</script>

<div class="relative w-full {className}">
	<!-- Slash Command Autocomplete Menu -->
	{#if showCommands}
		<div
			class="absolute bottom-full left-0 mb-2 w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
		>
			<div class="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 uppercase">
				Quick Commands
			</div>
			{#each filteredCommands as cmd, i}
				<button
					type="button"
					onclick={() => selectCommand(cmd)}
					class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors {i ===
					selectedCommandIdx
						? 'bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
						: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'}"
				>
					<div class="flex items-center gap-2">
						<span class="font-mono font-medium">{cmd.name}</span>
						<span class="text-neutral-500">{cmd.description}</span>
					</div>
					<Icon name="corner-down-left" size="xs" class="text-neutral-400" />
				</button>
			{/each}
		</div>
	{/if}

	<!-- Hidden File Input -->
	<input
		type="file"
		multiple
		bind:this={fileInputEl}
		onchange={handleFileChange}
		class="hidden"
		aria-label="Upload file attachments"
	/>

	<!-- Main Input Container -->
	<div
		class="flex flex-col rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-md transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-900"
	>
		<!-- Attached Files List -->
		{#if attachments.length > 0}
			<div class="mb-2 flex flex-wrap gap-1.5 px-1.5 pt-1">
				{#each attachments as file, idx}
					<div
						class="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
					>
						<Icon name="paperclip" size="xs" class="text-neutral-400" />
						<span class="max-w-[140px] truncate">{file.name}</span>
						<button
							type="button"
							onclick={() => removeAttachment(idx)}
							class="text-neutral-400 hover:text-rose-500"
							aria-label="Remove attachment"
						>
							<Icon name="x" size="xs" />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Textarea -->
		<textarea
			bind:value
			{placeholder}
			{disabled}
			rows={1}
			onkeydown={handleKeydown}
			use:autosize={{ maxHeight }}
			class="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
		></textarea>

		<!-- Bottom Toolbar Actions -->
		<div class="mt-2 flex items-center justify-between pt-1">
			<div class="flex items-center gap-1">
				<!-- File Attachment Button -->
				<Button
					type="button"
					variant="ghost"
					size="xs"
					onclick={triggerFileUpload}
					class="h-8 w-8 rounded-lg p-0 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
					aria-label="Attach files"
					title="Attach files"
				>
					<Icon name="paperclip" size="sm" />
				</Button>

				<!-- Audio / Mic Toggle Button -->
				<Button
					type="button"
					variant="ghost"
					size="xs"
					onclick={() => {
						audioRecording = !audioRecording;
						if (ontoggleAudio) ontoggleAudio();
					}}
					class="h-8 w-8 rounded-lg p-0 {audioRecording
						? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
						: 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
					aria-label={audioRecording ? 'Stop voice recording' : 'Voice prompt'}
					title={audioRecording ? 'Stop voice recording' : 'Voice prompt'}
				>
					{#if audioRecording}
						<Icon name="mic-off" size="sm" class="animate-pulse text-rose-500" />
					{:else}
						<Icon name="mic" size="sm" />
					{/if}
				</Button>
			</div>

			<div class="flex items-center gap-2">
				<span class="hidden text-[11px] text-neutral-400 sm:inline-block">
					<kbd
						class="rounded border border-neutral-200 bg-neutral-100 px-1 py-0.5 text-[10px] dark:border-neutral-800 dark:bg-neutral-800"
						>↵</kbd
					> to send
				</span>

				<!-- Submit or Stop Button -->
				<Button
					type="button"
					variant="solid"
					size="xs"
					onclick={handleSubmit}
					disabled={!loading && !value.trim() && attachments.length === 0}
					class="h-8 rounded-lg px-3 transition-transform active:scale-95"
				>
					{#if loading}
						<Icon name="square" size="xs" class="mr-1 fill-current" />
						Stop
					{:else}
						<Icon name="arrow-up" size="sm" />
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>
