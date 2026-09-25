<script module lang="ts">
	export interface Country {
		code: string;
		name: string;
		dialCode: string;
		flag: string;
	}

	export const COUNTRIES: Country[] = [
		{ code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
		{ code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
		{ code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
		{ code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
		{ code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
		{ code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
		{ code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
		{ code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
		{ code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
		{ code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
		{ code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
		{ code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
		{ code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
		{ code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' }
	];

	export interface PhoneInputProps {
		id?: string;
		value?: string;
		countryCode?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		status?: 'default' | 'error' | 'success';
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Popover from '../overlays/Popover.svelte';
	import Icon from '../elements/Icon.svelte';
	import { getFormFieldContext } from './form-context';

	let {
		id,
		value = $bindable(''),
		countryCode = $bindable('US'),
		placeholder = '(555) 000-0000',
		disabled = false,
		required = false,
		name,
		status = 'default',
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = ''
	}: PhoneInputProps = $props();

	const fieldCtx = getFormFieldContext();

	let effectiveId = $derived(id ?? fieldCtx?.id);
	let effectiveName = $derived(name ?? fieldCtx?.name);
	let effectiveStatus = $derived(status !== 'default' ? status : (fieldCtx?.status ?? 'default'));
	let ariaInvalid = $derived(effectiveStatus === 'error' || Boolean(fieldCtx?.error));
	let ariaDescribedBy = $derived(
		[fieldCtx?.descriptionId, fieldCtx?.errorId].filter(Boolean).join(' ') || undefined
	);
	let effectiveAriaLabel = $derived(
		ariaLabelAttr || ariaLabel || placeholder || fieldCtx?.name || 'Phone number'
	);

	let searchQuery = $state('');
	let openDropdown = $state(false);

	let selectedCountry = $derived(COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0]);

	let filteredCountries = $derived.by(() => {
		if (!searchQuery.trim()) return COUNTRIES;
		const q = searchQuery.toLowerCase();
		return COUNTRIES.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.dialCode.includes(q) ||
				c.code.toLowerCase().includes(q)
		);
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		// Keep only numbers and standard formatting characters
		const raw = target.value.replace(/[^\d\s()-]/g, '');
		value = raw;
	}

	function selectCountry(country: Country) {
		countryCode = country.code;
		openDropdown = false;
		searchQuery = '';
	}
</script>

<div
	class="flex w-full items-center overflow-hidden rounded-xl border bg-white shadow-xs transition-all focus-within:ring-2 {effectiveStatus ===
	'error'
		? 'border-rose-500 text-rose-900 focus-within:border-rose-500 focus-within:ring-rose-500/20 dark:text-rose-100'
		: effectiveStatus === 'success'
			? 'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-500/20 dark:border-emerald-500'
			: 'border-neutral-200 focus-within:border-primary-500 focus-within:ring-primary-500/20 dark:border-neutral-800'} dark:bg-neutral-900 {className}"
>
	<!-- Country Selector Popover -->
	<Popover bind:open={openDropdown}>
		{#snippet trigger()}
			<button
				type="button"
				{disabled}
				class="flex h-10 items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
				aria-label="Select country"
			>
				<span class="text-base">{selectedCountry.flag}</span>
				<span class="font-mono text-neutral-500 dark:text-neutral-400"
					>{selectedCountry.dialCode}</span
				>
				<Icon name="chevron-down" size="xs" class="text-neutral-400" />
			</button>
		{/snippet}

		<div class="w-64 space-y-2 p-1 text-xs">
			<div class="relative px-1 pt-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search country or code..."
					class="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
				/>
			</div>

			<div class="max-h-48 overflow-y-auto">
				{#each filteredCountries as country (country.code)}
					<button
						type="button"
						onclick={() => selectCountry(country)}
						class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 {country.code ===
						countryCode
							? 'bg-primary-50 font-semibold text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
							: 'text-neutral-700 dark:text-neutral-300'}"
					>
						<div class="flex items-center gap-2">
							<span class="text-base">{country.flag}</span>
							<span>{country.name}</span>
						</div>
						<span class="font-mono text-neutral-400">{country.dialCode}</span>
					</button>
				{/each}
			</div>
		</div>
	</Popover>

	<!-- Phone Number Input Field -->
	<input
		id={effectiveId}
		name={effectiveName}
		type="tel"
		bind:value
		oninput={handleInput}
		{placeholder}
		{disabled}
		{required}
		aria-label={effectiveAriaLabel}
		aria-invalid={ariaInvalid || undefined}
		aria-describedby={ariaDescribedBy}
		class="h-10 w-full bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
	/>
</div>
