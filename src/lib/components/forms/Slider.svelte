<script lang="ts">
	interface Props {
		id?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		name?: string;
		label?: string;
		'aria-label'?: string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		id,
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		name = 'slider',
		label,
		'aria-label': ariaLabelAttr,
		ariaLabel,
		class: className = ''
	}: Props = $props();

	let percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="relative flex w-full touch-none items-center select-none {className}">
	<input
		id={id || name}
		type="range"
		bind:value
		{min}
		{max}
		{step}
		{disabled}
		{name}
		aria-label={ariaLabelAttr || ariaLabel || label || 'Slider'}
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800"
		style="background: linear-gradient(to right, rgb(37 99 235) {percentage}%, rgb(228 228 231) {percentage}%);"
	/>
</div>
