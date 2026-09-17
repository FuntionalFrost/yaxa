<script module lang="ts">
	export interface RadioOption {
		value: string;
		label: string;
		description?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	interface Props {
		value?: string;
		options?: RadioOption[];
		name?: string;
		orientation?: 'horizontal' | 'vertical';
		card?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		options = [],
		name = 'radio-group',
		orientation = 'vertical',
		card = false,
		class: className = ''
	}: Props = $props();
</script>

<div
	class="flex {orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'} {className}"
	role="radiogroup"
>
	{#each options as opt}
		{@const isSelected = value === opt.value}
		<label
			class="relative flex items-start gap-3 select-none {opt.disabled
				? 'cursor-not-allowed opacity-50'
				: 'cursor-pointer'} {card
				? `rounded-xl border p-4 transition-all ${
						isSelected
							? 'border-primary-500 bg-primary-50/30 dark:border-primary-500 dark:bg-primary-950/20'
							: 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
					}`
				: ''}"
		>
			<input
				id={`${name}-${opt.value}`}
				type="radio"
				{name}
				value={opt.value}
				disabled={opt.disabled}
				checked={isSelected}
				aria-label={opt.label}
				onchange={() => (value = opt.value)}
				class="sr-only"
			/>
			<div
				class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all {isSelected
					? 'border-primary-600 bg-primary-600 text-white'
					: 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'}"
			>
				{#if isSelected}
					<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
				{/if}
			</div>

			<div class="text-sm leading-5">
				<span class="font-medium text-neutral-800 dark:text-neutral-200">{opt.label}</span>
				{#if opt.description}
					<p class="text-sm text-neutral-500 dark:text-neutral-400">{opt.description}</p>
				{/if}
			</div>
		</label>
	{/each}
</div>
