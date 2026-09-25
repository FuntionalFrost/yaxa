<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { IconSource } from '../elements/Icon.svelte';

	export interface ComboboxOption {
		value: string;
		label: string;
		icon?: IconSource;
		description?: string;
		disabled?: boolean;
	}

	export const comboboxVariants = tv({
		base: 'flex w-full items-center justify-between rounded-lg border bg-white text-neutral-900 transition-all duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100',
		variants: {
			size: {
				sm: 'h-9 px-3 text-xs gap-2',
				md: 'h-10 px-3.5 text-sm gap-2.5',
				lg: 'h-12 px-4 text-base gap-3'
			},
			status: {
				default:
					'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-neutral-700',
				error:
					'border-rose-500 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 dark:text-rose-100',
				success:
					'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-500'
			}
		},
		defaultVariants: {
			size: 'md',
			status: 'default'
		}
	});

	export type ComboboxProps = VariantProps<typeof comboboxVariants> & {
		id?: string;
		value?: string;
		options?: ComboboxOption[];
		placeholder?: string;
		searchPlaceholder?: string;
		icon?: IconSource;
		disabled?: boolean;
		clearable?: boolean;
		name?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
		itemSnippet?: Snippet<[ComboboxOption, boolean]>;
	};
</script>

<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		value = $bindable(''),
		options = [],
		placeholder = 'Select an option...',
		searchPlaceholder = 'Search options...',
		icon,
		disabled = false,
		clearable = true,
		name,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		size = 'md',
		status = 'default',
		class: className = '',
		itemSnippet
	}: ComboboxProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || fieldCtx?.name || placeholder || 'Combobox'
	);

	let open = $state(false);
	let query = $state('');
	let highlightedIndex = $state(0);

	let selectedOption = $derived(options.find((opt) => opt.value === value));

	let filteredOptions = $derived.by(() => {
		if (!query.trim()) return options;
		const q = query.toLowerCase();
		return options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(q) ||
				opt.value.toLowerCase().includes(q) ||
				opt.description?.toLowerCase().includes(q)
		);
	});

	function handleSelect(option: ComboboxOption) {
		if (option.disabled) return;
		value = option.value;
		open = false;
		query = '';
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		value = '';
		query = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'Enter') {
				e.preventDefault();
				open = true;
			}
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % Math.max(1, filteredOptions.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex =
				(highlightedIndex - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const opt = filteredOptions[highlightedIndex];
			if (opt) handleSelect(opt);
		} else if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

{#if effectiveName}
	<input type="hidden" name={effectiveName} {value} />
{/if}

<Popover.Root bind:open>
	<Popover.Trigger
		id={effectiveId}
		{disabled}
		class={comboboxVariants({ size, status: effectiveStatus, class: className })}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={effectiveAriaLabel}
		aria-invalid={ariaInvalid || undefined}
		aria-describedby={ariaDescribedBy}
	>
		<div class="flex flex-1 items-center gap-2 overflow-hidden text-left">
			{#if icon}
				<Icon name={icon} size={size === 'sm' ? 'xs' : 'sm'} class="shrink-0 text-neutral-400" />
			{:else if selectedOption?.icon}
				<Icon
					name={selectedOption.icon}
					size={size === 'sm' ? 'xs' : 'sm'}
					class="shrink-0 text-neutral-400"
				/>
			{/if}

			{#if selectedOption}
				<span class="truncate font-medium">{selectedOption.label}</span>
			{:else}
				<span class="truncate text-neutral-400 dark:text-neutral-500">{placeholder}</span>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if clearable && value && !disabled}
				<button
					type="button"
					onclick={handleClear}
					class="rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
					aria-label="Clear selection"
				>
					<Icon name="cross" size="xs" />
				</button>
			{/if}
			<Icon
				name="chevron-down"
				size="xs"
				class="text-neutral-400 transition-transform duration-200 {open ? 'rotate-180' : ''}"
			/>
		</div>
	</Popover.Trigger>

	<Popover.Portal>
		<Popover.Content
			sideOffset={6}
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-(--bits-popover-anchor-width) min-w-[200px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
		>
			<!-- Search Input -->
			<div
				class="flex items-center border-b border-neutral-100 px-2.5 pb-1.5 dark:border-neutral-800"
			>
				<Icon name="search" size="xs" class="mr-2 shrink-0 text-neutral-400" />
				<input
					id={name ? `${name}-search` : undefined}
					name={name ? `${name}-search` : 'comboboxSearch'}
					type="text"
					bind:value={query}
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder || 'Search options'}
					onkeydown={handleKeydown}
					class="h-8 w-full bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
				/>
			</div>

			<!-- Options List -->
			<div class="mt-1 max-h-56 overflow-y-auto" role="listbox">
				{#if filteredOptions.length === 0}
					<div class="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
						No options match "{query}".
					</div>
				{:else}
					{#each filteredOptions as option, index (option.value)}
						{@const isSelected = option.value === value}
						{@const isHighlighted = index === highlightedIndex}

						<button
							type="button"
							role="option"
							aria-selected={isSelected}
							disabled={option.disabled}
							onclick={() => handleSelect(option)}
							class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors {isSelected
								? 'bg-primary-50 font-semibold text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
								: isHighlighted
									? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800/60 dark:text-white'
									: 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/40'} {option.disabled
								? 'cursor-not-allowed opacity-40'
								: ''}"
						>
							{#if itemSnippet}
								{@render itemSnippet(option, isSelected)}
							{:else}
								<div class="flex items-center gap-2 overflow-hidden">
									{#if option.icon}
										<Icon name={option.icon} size="xs" class="shrink-0 text-neutral-400" />
									{/if}
									<div>
										<div>{option.label}</div>
										{#if option.description}
											<div class="text-[10px] text-neutral-400 dark:text-neutral-500">
												{option.description}
											</div>
										{/if}
									</div>
								</div>

								{#if isSelected}
									<Icon name="check" size="xs" class="text-primary-600 dark:text-primary-400" />
								{/if}
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
