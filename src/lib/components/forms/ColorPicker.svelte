<script lang="ts">
	import Popover from '../overlays/Popover.svelte';
	import Icon from '../elements/Icon.svelte';

	interface Props {
		id?: string;
		name?: string;
		label?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		value?: string;
		presets?: string[];
		disabled?: boolean;
		inline?: boolean;
		class?: string;
	}

	const defaultPresets = [
		'#ff3e00', // Svelte Flame
		'#f59e0b', // Amber
		'#10b981', // Emerald
		'#0ea5e9', // Sky
		'#8b5cf6', // Violet
		'#f43f5e', // Rose
		'#64748b', // Slate
		'#18181b', // Dark
		'#ffffff' // White
	];

	let {
		id,
		name,
		label,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		value = $bindable('#ff3e00'),
		presets = defaultPresets,
		disabled = false,
		inline = false,
		class: className = ''
	}: Props = $props();

	let popoverOpen = $state(false);
</script>

{#if inline}
	<div
		class="inline-flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 {className}"
	>
		<!-- Swatches Grid -->
		<div class="grid grid-cols-5 gap-1.5">
			{#each presets as hex}
				<button
					type="button"
					{disabled}
					onclick={() => (value = hex)}
					class="h-6 w-6 rounded-md border border-neutral-300/40 transition-transform hover:scale-110 {value.toLowerCase() ===
					hex.toLowerCase()
						? 'scale-105 ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
						: ''}"
					style="background-color: {hex};"
					title={hex}
					aria-label="Select color {hex}"
				></button>
			{/each}
		</div>

		<!-- Custom Hex & Native Color input -->
		<div class="flex items-center gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
			<label
				class="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700"
				style="background-color: {value};"
			>
				<input
					id={id ? `${id}-color` : name ? `${name}-color` : undefined}
					name={name ? `${name}-color` : 'colorPickerValue'}
					type="color"
					bind:value
					{disabled}
					class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					aria-label={ariaLabelAttr || ariaLabel || label || 'Pick color'}
				/>
			</label>
			<input
				id={id ? `${id}-hex` : name ? `${name}-hex` : undefined}
				name={name || 'colorHex'}
				type="text"
				bind:value
				{disabled}
				placeholder="#ff3e00"
				aria-label="Hex color code"
				class="h-8 w-full rounded-md border border-neutral-200 bg-neutral-50 px-2.5 font-mono text-sm text-neutral-800 focus:border-primary-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
			/>
		</div>
	</div>
{:else}
	<Popover bind:open={popoverOpen}>
		{#snippet trigger()}
			<button
				type="button"
				{disabled}
				class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 {className}"
			>
				<span
					class="h-4 w-4 rounded border border-neutral-300/40"
					style="background-color: {value};"
				></span>
				<span class="font-mono">{value}</span>
				<Icon name="chevron-down" size="xs" class="text-neutral-400" />
			</button>
		{/snippet}

		<div class="w-48 space-y-3 p-3">
			<div class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Color Swatches</div>
			<!-- Swatches Grid -->
			<div class="grid grid-cols-5 gap-1.5">
				{#each presets as hex}
					<button
						type="button"
						onclick={() => {
							value = hex;
							popoverOpen = false;
						}}
						class="h-6 w-6 rounded-md border border-neutral-300/40 transition-transform hover:scale-110 {value.toLowerCase() ===
						hex.toLowerCase()
							? 'scale-105 ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
							: ''}"
						style="background-color: {hex};"
						title={hex}
						aria-label="Select color {hex}"
					></button>
				{/each}
			</div>

			<!-- Custom Hex & Native Color input -->
			<div class="flex items-center gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
				<label
					class="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700"
					style="background-color: {value};"
				>
					<input
						id={id ? `${id}-popover-color` : name ? `${name}-popover-color` : undefined}
						name={name ? `${name}-popover-color` : 'colorPickerValue'}
						type="color"
						bind:value
						class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label={ariaLabelAttr || ariaLabel || label || 'Pick color'}
					/>
				</label>
				<input
					id={id ? `${id}-popover-hex` : name ? `${name}-popover-hex` : undefined}
					name={name || 'colorHex'}
					type="text"
					bind:value
					placeholder="#ff3e00"
					aria-label="Hex color code"
					class="h-8 w-full rounded-md border border-neutral-200 bg-neutral-50 px-2.5 font-mono text-sm text-neutral-800 focus:border-primary-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
				/>
			</div>
		</div>
	</Popover>
{/if}
