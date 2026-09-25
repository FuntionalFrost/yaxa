<script module lang="ts">
	export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';

	export interface CreditCardInputProps {
		id?: string;
		cardNumber?: string;
		expiry?: string;
		cvc?: string;
		cardBrand?: CardBrand;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		status?: 'default' | 'error' | 'success';
		class?: string;
	}

	export function detectCardBrand(number: string): CardBrand {
		const clean = number.replace(/\s+/g, '');
		if (/^4/.test(clean)) return 'visa';
		if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'mastercard';
		if (/^3[47]/.test(clean)) return 'amex';
		if (/^6(?:011|5)/.test(clean)) return 'discover';
		return 'generic';
	}
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		cardNumber = $bindable(''),
		expiry = $bindable(''),
		cvc = $bindable(''),
		cardBrand = $bindable('generic'),
		disabled = false,
		required = false,
		name,
		status = 'default',
		class: className = ''
	}: CreditCardInputProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id ?? 'card-number-input');
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveBrand = $derived(cardBrand !== 'generic' ? cardBrand : detectCardBrand(cardNumber));

	function formatCardNumber(val: string): string {
		const digits = val.replace(/\D/g, '').slice(0, 16);
		const parts: string[] = [];
		for (let i = 0; i < digits.length; i += 4) {
			parts.push(digits.slice(i, i + 4));
		}
		return parts.join(' ');
	}

	function formatExpiry(val: string): string {
		const digits = val.replace(/\D/g, '').slice(0, 4);
		if (digits.length >= 3) {
			return `${digits.slice(0, 2)}/${digits.slice(2)}`;
		}
		return digits;
	}

	function formatCvc(val: string): string {
		return val.replace(/\D/g, '').slice(0, 4);
	}

	function handleCardNumberInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const formatted = formatCardNumber(target.value);
		cardNumber = formatted;
		cardBrand = detectCardBrand(formatted);
	}

	function handleExpiryInput(e: Event) {
		const target = e.target as HTMLInputElement;
		expiry = formatExpiry(target.value);
	}

	function handleCvcInput(e: Event) {
		const target = e.target as HTMLInputElement;
		cvc = formatCvc(target.value);
	}
</script>

<div
	class="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-xs transition-all focus-within:ring-2 {effectiveStatus ===
	'error'
		? 'border-rose-500 text-rose-900 focus-within:border-rose-500 focus-within:ring-rose-500/20 dark:text-rose-100'
		: effectiveStatus === 'success'
			? 'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-500/20 dark:border-emerald-500'
			: 'border-neutral-200 focus-within:border-primary-500 focus-within:ring-primary-500/20 dark:border-neutral-800'} dark:bg-neutral-900 {className}"
>
	<!-- Card Number Field -->
	<div>
		<label
			for={effectiveId}
			class="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
		>
			Card Number
		</label>
		<div class="relative flex items-center">
			<input
				id={effectiveId}
				name={name || 'cardNumber'}
				type="text"
				bind:value={cardNumber}
				oninput={handleCardNumberInput}
				placeholder="4242 4242 4242 4242"
				{disabled}
				{required}
				autocomplete="cc-number"
				aria-invalid={ariaInvalid || undefined}
				aria-describedby={ariaDescribedBy}
				class="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pr-12 pl-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-900"
			/>

			<!-- Brand Badge -->
			<div class="absolute right-3 flex items-center text-xs font-bold text-neutral-400 uppercase">
				{#if effectiveBrand === 'visa'}
					<span class="font-extrabold text-blue-600 italic">VISA</span>
				{:else if effectiveBrand === 'mastercard'}
					<span class="font-extrabold text-amber-600">MC</span>
				{:else if effectiveBrand === 'amex'}
					<span class="font-extrabold text-sky-600">AMEX</span>
				{:else if effectiveBrand === 'discover'}
					<span class="font-extrabold text-orange-600">DISC</span>
				{:else}
					<Icon name="credit-card" size="sm" class="text-neutral-400" />
				{/if}
			</div>
		</div>
	</div>

	<!-- Expiry & CVC Sub-fields -->
	<div class="grid grid-cols-2 gap-3">
		<!-- Expiry Field -->
		<div>
			<label
				for="card-expiry-input"
				class="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
			>
				Expires
			</label>
			<input
				id="card-expiry-input"
				name="cardExpiry"
				type="text"
				bind:value={expiry}
				oninput={handleExpiryInput}
				placeholder="MM / YY"
				{disabled}
				{required}
				autocomplete="cc-exp"
				class="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-900"
			/>
		</div>

		<!-- CVC Field -->
		<div>
			<label
				for="card-cvc-input"
				class="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
			>
				CVC / CVV
			</label>
			<div class="relative flex items-center">
				<input
					id="card-cvc-input"
					name="cardCvc"
					type="password"
					bind:value={cvc}
					oninput={handleCvcInput}
					placeholder="123"
					{disabled}
					{required}
					autocomplete="cc-csc"
					class="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pr-8 pl-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-900"
				/>
				<Icon name="lock" size="xs" class="absolute right-3 text-neutral-400" />
			</div>
		</div>
	</div>
</div>
