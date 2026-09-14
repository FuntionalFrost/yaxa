<script module lang="ts">
	export interface DropzoneProps {
		accept?: string;
		multiple?: boolean;
		maxSize?: number; // in bytes
		disabled?: boolean;
		autoUpload?: boolean;
		endpoint?: string;
		files?: File[];
		label?: string;
		description?: string;
		class?: string;
		onchange?: (files: File[]) => void;
		onsuccess?: (result: { url: string; key?: string }) => void;
		onerror?: (err: string) => void;
	}
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Button from '../elements/Button.svelte';
	import Progress from '../elements/Progress.svelte';
	import { useUpload } from '$lib/composables/useUpload.svelte';

	let {
		accept = '*/*',
		multiple = false,
		maxSize = 10 * 1024 * 1024, // 10MB default
		disabled = false,
		autoUpload = false,
		endpoint = '/api/upload',
		files = $bindable([]),
		label = 'Click or drag files here to upload',
		description = 'SVG, PNG, JPG, or PDF (up to 10MB)',
		class: className = '',
		onchange,
		onsuccess,
		onerror
	}: DropzoneProps = $props();

	let isDragging = $state(false);
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);

	const uploader = useUpload({
		onSuccess: (res) => {
			if (onsuccess) onsuccess(res);
		},
		onError: (err) => {
			errorMessage = err.message;
			if (onerror) onerror(err.message);
		}
	});

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	}

	function validateFile(file: File): string | null {
		if (maxSize && file.size > maxSize) {
			return `File "${file.name}" exceeds maximum allowed size of ${formatBytes(maxSize)}`;
		}

		if (accept && accept !== '*/*') {
			const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
			const fileType = file.type.toLowerCase();
			const fileName = file.name.toLowerCase();

			const isMatch = acceptedTypes.some((pattern) => {
				if (pattern.startsWith('.')) {
					return fileName.endsWith(pattern);
				}
				if (pattern.endsWith('/*')) {
					return fileType.startsWith(pattern.replace('/*', ''));
				}
				return fileType === pattern;
			});

			if (!isMatch) {
				return `File "${file.name}" is not an accepted format (${accept})`;
			}
		}

		return null;
	}

	async function handleFiles(newFileList: FileList | File[]) {
		errorMessage = null;
		const validList: File[] = [];

		for (const file of Array.from(newFileList)) {
			const err = validateFile(file);
			if (err) {
				errorMessage = err;
				if (onerror) onerror(err);
				return;
			}
			validList.push(file);
		}

		if (multiple) {
			files = [...files, ...validList];
		} else {
			files = validList.slice(0, 1);
		}

		if (onchange) onchange(files);

		if (autoUpload && files.length > 0) {
			for (const file of files) {
				await uploader.upload(file, endpoint);
			}
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (disabled) return;
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (disabled || !e.dataTransfer?.files) return;
		handleFiles(e.dataTransfer.files);
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			handleFiles(target.files);
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		if (onchange) onchange(files);
	}
</script>

<div class="w-full space-y-3 {className}">
	<!-- Dropzone Box -->
	<button
		type="button"
		class="relative flex min-h-[160px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all outline-none {isDragging
			? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-500/10 dark:border-primary-400 dark:bg-primary-950/30'
			: 'border-neutral-300 bg-neutral-50/50 hover:border-neutral-400 hover:bg-neutral-100/50 dark:border-neutral-700 dark:bg-neutral-900/30 dark:hover:border-neutral-600 dark:hover:bg-neutral-900/60'} {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => {
			if (!disabled && fileInputEl) fileInputEl.click();
		}}
		aria-disabled={disabled}
	>
		<input
			bind:this={fileInputEl}
			type="file"
			{accept}
			{multiple}
			{disabled}
			class="hidden"
			onchange={handleInputChange}
		/>

		<div
			class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-transform group-hover:scale-110 dark:bg-primary-950/80 dark:text-primary-400"
		>
			<Icon name={isDragging ? 'arrow-up-tray' : 'cloud-arrow-up'} class="h-6 w-6" />
		</div>

		<p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
			{label}
		</p>
		<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
			{description}
		</p>
	</button>

	<!-- Error Alert -->
	{#if errorMessage}
		<div
			class="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
		>
			<Icon name="exclamation-circle" class="h-4 w-4 shrink-0" />
			<span>{errorMessage}</span>
		</div>
	{/if}

	<!-- Uploading Progress Bar -->
	{#if uploader.isUploading}
		<div
			class="space-y-1.5 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
		>
			<div class="flex items-center justify-between text-xs">
				<span class="font-medium text-neutral-700 dark:text-neutral-300"
					>Uploading to cloud storage...</span
				>
				<span class="font-mono font-bold text-primary-600 dark:text-primary-400"
					>{uploader.progress}%</span
				>
			</div>
			<Progress value={uploader.progress} color="primary" size="sm" />
		</div>
	{/if}

	<!-- File Previews List -->
	{#if files.length > 0}
		<div class="space-y-2">
			{#each files as file, idx}
				<div
					class="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-xs shadow-xs transition-all dark:border-neutral-800 dark:bg-neutral-900"
				>
					<div class="flex items-center gap-2.5 overflow-hidden">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
						>
							<Icon name="document-text" class="h-4 w-4" />
						</div>
						<div class="truncate">
							<p class="truncate font-semibold text-neutral-900 dark:text-white">{file.name}</p>
							<p class="text-[11px] text-neutral-500">{formatBytes(file.size)}</p>
						</div>
					</div>

					<Button
						variant="ghost"
						size="xs"
						color="neutral"
						onclick={() => removeFile(idx)}
						aria-label="Remove file"
					>
						<Icon name="x-mark" class="h-4 w-4 text-neutral-400 hover:text-rose-500" />
					</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
