<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from '../elements/Icon.svelte';

	export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

	export interface StepItem {
		id: string | number;
		title: string;
		description?: string;
		icon?: IconSource;
		status?: StepStatus;
		disabled?: boolean;
	}

	export const stepperVariants = tv({
		base: 'flex w-full',
		variants: {
			orientation: {
				horizontal: 'flex-row items-center justify-between',
				vertical: 'flex-col space-y-6'
			}
		},
		defaultVariants: {
			orientation: 'horizontal'
		}
	});

	export type StepperProps = VariantProps<typeof stepperVariants> & {
		steps?: StepItem[];
		currentStep?: number;
		clickable?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';

	let {
		steps = [],
		currentStep = $bindable(0),
		orientation = 'horizontal',
		clickable = true,
		class: className = ''
	}: StepperProps = $props();

	function getStatus(index: number, step: StepItem): StepStatus {
		if (step.status) return step.status;
		if (index < currentStep) return 'completed';
		if (index === currentStep) return 'active';
		return 'pending';
	}

	function handleStepClick(index: number, step: StepItem) {
		if (!clickable || step.disabled) return;
		currentStep = index;
	}
</script>

<div class={stepperVariants({ orientation, class: className })}>
	{#each steps as step, index}
		{@const status = getStatus(index, step)}
		{@const isLast = index === steps.length - 1}

		<div
			class="flex flex-1 items-center {orientation === 'vertical' ? 'w-full' : ''} {isLast
				? 'flex-none'
				: ''}"
		>
			<button
				type="button"
				disabled={!clickable || step.disabled}
				onclick={() => handleStepClick(index, step)}
				class="group flex items-center gap-3 text-left focus:outline-none {clickable &&
				!step.disabled
					? 'cursor-pointer'
					: 'cursor-default'}"
			>
				<!-- Step Circle -->
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 {status ===
					'completed'
						? 'bg-primary-600 text-white shadow-xs dark:bg-primary-500'
						: status === 'active'
							? 'border-2 border-primary-600 bg-primary-50 text-primary-700 shadow-xs dark:border-primary-400 dark:bg-primary-950/60 dark:text-primary-300'
							: status === 'error'
								? 'bg-rose-500 text-white'
								: 'border border-neutral-300 bg-neutral-100 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'}"
				>
					{#if status === 'completed'}
						<Icon name="check" size="xs" />
					{:else if status === 'error'}
						<Icon name="cross" size="xs" />
					{:else if step.icon}
						<Icon name={step.icon} size="xs" />
					{:else}
						<span>{index + 1}</span>
					{/if}
				</div>

				<!-- Step Label -->
				<div class="hidden sm:block">
					<div
						class="text-xs font-semibold {status === 'active'
							? 'text-primary-700 dark:text-primary-400'
							: status === 'completed'
								? 'text-neutral-900 dark:text-white'
								: 'text-neutral-500 dark:text-neutral-400'}"
					>
						{step.title}
					</div>
					{#if step.description}
						<div class="text-[11px] text-neutral-400 dark:text-neutral-500">
							{step.description}
						</div>
					{/if}
				</div>
			</button>

			<!-- Connecting Progress Line -->
			{#if !isLast}
				{#if orientation === 'horizontal'}
					<div
						class="mx-3 h-0.5 flex-1 transition-colors duration-200 {index < currentStep
							? 'bg-primary-600 dark:bg-primary-500'
							: 'bg-neutral-200 dark:bg-neutral-800'}"
					></div>
				{:else}
					<div
						class="my-2 ml-4.5 h-6 w-0.5 transition-colors duration-200 {index < currentStep
							? 'bg-primary-600 dark:bg-primary-500'
							: 'bg-neutral-200 dark:bg-neutral-800'}"
					></div>
				{/if}
			{/if}
		</div>
	{/each}
</div>
