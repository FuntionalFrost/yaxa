<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export const numberInputVariants = tv({
		base: 'flex items-center rounded-lg border bg-white text-neutral-900 transition-all duration-150 focus-within:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100',
		variants: {
			size: {
				sm: 'h-9 text-xs',
				md: 'h-10 text-sm',
				lg: 'h-12 text-base'
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

	export type NumberInputProps = VariantProps<typeof numberInputVariants> & {
		id?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		prefix?: string;
		suffix?: string;
		placeholder?: string;
		disabled?: boolean;
		name?: string;
		label?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		value = $bindable(0),
		min,
		max,
		step = 1,
		prefix,
		suffix,
		placeholder,
		disabled = false,
		name,
		label,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		size = 'md',
		status = 'default',
		class: className = ''
	}: NumberInputProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || label || placeholder || fieldCtx?.name || 'Number input'
	);

	function clamp(val: number): number {
		let res = val;
		if (min !== undefined && res < min) res = min;
		if (max !== undefined && res > max) res = max;
		return res;
	}

	function increment() {
		if (disabled) return;
		value = clamp((value ?? 0) + step);
	}

	function decrement() {
		if (disabled) return;
		value = clamp((value ?? 0) - step);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const num = parseFloat(target.value);
		if (!isNaN(num)) {
			value = clamp(num);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			increment();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			decrement();
		}
	}
</script>

<div class={numberInputVariants({ size, status: effectiveStatus, class: className })}>
	<!-- Decrement Button -->
	<button
		type="button"
		{disabled}
		onclick={decrement}
		class="flex h-full items-center justify-center px-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
		aria-label="Decrement value"
	>
		<Icon name="minus" size="xs" />
	</button>

	<!-- Input Area -->
	<div class="flex flex-1 items-center px-1">
		{#if prefix}
			<span class="mr-1 text-xs text-neutral-400 select-none dark:text-neutral-500">{prefix}</span>
		{/if}

		<input
			id={effectiveId}
			type="number"
			name={effectiveName}
			{min}
			{max}
			{step}
			{disabled}
			{placeholder}
			{value}
			aria-label={effectiveAriaLabel}
			aria-invalid={ariaInvalid || undefined}
			aria-describedby={ariaDescribedBy}
			oninput={handleInput}
			onkeydown={handleKeydown}
			class="w-full [appearance:textfield] bg-transparent text-center font-mono focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		/>

		{#if suffix}
			<span class="ml-1 text-xs text-neutral-400 select-none dark:text-neutral-500">{suffix}</span>
		{/if}
	</div>

	<!-- Increment Button -->
	<button
		type="button"
		{disabled}
		onclick={increment}
		class="flex h-full items-center justify-center px-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
		aria-label="Increment value"
	>
		<Icon name="plus" size="xs" />
	</button>
</div>
