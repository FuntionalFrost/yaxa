<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from '../elements/Icon.svelte';

	export interface MultiSelectOption {
		value: string;
		label: string;
		icon?: IconSource;
		description?: string;
		disabled?: boolean;
	}

	export const multiSelectVariants = tv({
		base: 'flex min-h-[40px] w-full flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5 text-neutral-900 transition-all duration-150 focus-within:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100',
		variants: {
			size: {
				sm: 'min-h-[36px] text-xs p-1 gap-1',
				md: 'min-h-[40px] text-sm p-1.5 gap-1.5',
				lg: 'min-h-[48px] text-base p-2 gap-2'
			},
			status: {
				default:
					'border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500/20 dark:border-neutral-700',
				error:
					'border-rose-500 text-rose-900 focus-within:border-rose-500 focus-within:ring-rose-500/20 dark:text-rose-100',
				success:
					'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-500/20 dark:border-emerald-500'
			}
		},
		defaultVariants: {
			size: 'md',
			status: 'default'
		}
	});

	export type MultiSelectProps = VariantProps<typeof multiSelectVariants> & {
		id?: string;
		values?: string[];
		options?: MultiSelectOption[];
		placeholder?: string;
		searchPlaceholder?: string;
		max?: number;
		disabled?: boolean;
		clearable?: boolean;
		name?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		values = $bindable([]),
		options = [],
		placeholder = 'Select options...',
		searchPlaceholder = 'Search...',
		max,
		disabled = false,
		clearable = true,
		name,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		size = 'md',
		status = 'default',
		class: className = ''
	}: MultiSelectProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || fieldCtx?.name || placeholder || 'MultiSelect'
	);

	let open = $state(false);
	let searchQuery = $state('');

	let selectedOptions = $derived(
		values
			.map((v) => options.find((opt) => opt.value === v))
			.filter((opt): opt is MultiSelectOption => Boolean(opt))
	);

	let filteredOptions = $derived(
		options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	let isMaxReached = $derived(max !== undefined && values.length >= max);

	function toggleValue(val: string) {
		if (disabled) return;
		if (values.includes(val)) {
			values = values.filter((v) => v !== val);
		} else {
			if (isMaxReached) return;
			values = [...values, val];
		}
	}

	function removeValue(val: string, e?: MouseEvent) {
		e?.stopPropagation();
		if (disabled) return;
		values = values.filter((v) => v !== val);
	}

	function clearAll(e?: MouseEvent) {
		e?.stopPropagation();
		if (disabled) return;
		values = [];
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Backspace' && searchQuery === '' && values.length > 0) {
			values = values.slice(0, -1);
		}
	}
</script>

{#if effectiveName}
	{#each values as val (val)}
		<input type="hidden" name={effectiveName} value={val} />
	{/each}
{/if}

<Popover.Root bind:open>
	<div class={multiSelectVariants({ size, status: effectiveStatus, class: className })}>
		<!-- Selected Chips -->
		{#each selectedOptions as opt (opt.value)}
			<Badge variant="subtle" color="primary" size={size === 'sm' ? 'xs' : 'sm'} class="shrink-0">
				{#if opt.icon}
					<Icon name={opt.icon} size="xs" class="mr-1" />
				{/if}
				<span>{opt.label}</span>
				{#if !disabled}
					<button
						type="button"
						onclick={(e) => removeValue(opt.value, e)}
						class="ml-1 rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
						aria-label="Remove {opt.label}"
					>
						<Icon name="cross" size="xs" />
					</button>
				{/if}
			</Badge>
		{/each}

		<Popover.Trigger
			id={effectiveId}
			{disabled}
			class="flex min-w-[120px] flex-1 items-center justify-between text-left focus:outline-none"
			aria-haspopup="listbox"
			aria-expanded={open}
			aria-label={effectiveAriaLabel}
			aria-invalid={ariaInvalid || undefined}
			aria-describedby={ariaDescribedBy}
		>
			<span class="truncate text-xs text-neutral-400 dark:text-neutral-500">
				{values.length === 0 ? placeholder : ''}
			</span>

			<div class="ml-auto flex shrink-0 items-center gap-1">
				{#if clearable && values.length > 0 && !disabled}
					<button
						type="button"
						onclick={clearAll}
						class="rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
						aria-label="Clear all selections"
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
	</div>

	<Popover.Portal>
		<Popover.Content
			sideOffset={6}
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-(--bits-popover-anchor-width) min-w-[220px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
		>
			<!-- Search Input -->
			<div
				class="flex items-center border-b border-neutral-100 px-2.5 pb-1.5 dark:border-neutral-800"
			>
				<Icon name="search" size="xs" class="mr-2 shrink-0 text-neutral-400" />
				<input
					id={name ? `${name}-search` : undefined}
					name={name ? `${name}-search` : 'multiselectSearch'}
					type="text"
					bind:value={searchQuery}
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder || 'Search options'}
					onkeydown={handleKeyDown}
					class="h-8 w-full bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
				/>
			</div>

			<!-- Options List -->
			<div class="mt-1 max-h-56 overflow-y-auto" role="listbox">
				{#if filteredOptions.length === 0}
					<div class="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
						No options match "{searchQuery}".
					</div>
				{:else}
					{#each filteredOptions as option (option.value)}
						{@const isSelected = values.includes(option.value)}
						{@const isMaxReached = Boolean(max && values.length >= max && !isSelected)}

						<button
							type="button"
							role="option"
							aria-selected={isSelected}
							disabled={option.disabled || isMaxReached}
							onclick={() => toggleValue(option.value)}
							class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors {isSelected
								? 'bg-primary-50 font-semibold text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
								: 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/40'} {option.disabled ||
							isMaxReached
								? 'cursor-not-allowed opacity-40'
								: ''}"
						>
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
						</button>
					{/each}
				{/if}
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
