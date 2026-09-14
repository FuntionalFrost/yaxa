<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import { cn } from '$lib/utils/cn';

	export interface DatePreset {
		label: string;
		getValue: () => Date;
	}

	interface Props {
		value?: string | Date;
		placeholder?: string;
		min?: string | Date;
		max?: string | Date;
		disabled?: boolean;
		presets?: DatePreset[];
		class?: string;
		onchange?: (date: Date | null, dateString: string) => void;
	}

	let {
		value = $bindable(),
		placeholder = 'Select date',
		min,
		max,
		disabled = false,
		presets,
		class: className = '',
		onchange
	}: Props = $props();

	let open = $state(false);

	// Parse input date
	function toDate(d: string | Date | undefined): Date | null {
		if (!d) return null;
		if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
		const parsed = new Date(d);
		return isNaN(parsed.getTime()) ? null : parsed;
	}

	function formatDateIso(d: Date): string {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatDisplay(d: Date | null): string {
		if (!d) return '';
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	let selectedDate = $derived(toDate(value));
	let viewDate = $state(new Date());

	$effect(() => {
		if (selectedDate) {
			viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
		}
	});

	let viewYear = $derived(viewDate.getFullYear());
	let viewMonth = $derived(viewDate.getMonth());

	const MONTH_NAMES = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	const defaultPresets: DatePreset[] = [
		{ label: 'Today', getValue: () => new Date() },
		{
			label: 'Tomorrow',
			getValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
		},
		{
			label: '+7 Days',
			getValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
		}
	];

	let activePresets = $derived(presets || defaultPresets);

	let calendarDays = $derived.by(() => {
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
		const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

		const cells: Array<{
			day: number;
			monthOffset: number; // -1: prev, 0: current, 1: next
			date: Date;
			isSelected: boolean;
			isToday: boolean;
			isDisabled: boolean;
		}> = [];

		const minDate = toDate(min);
		const maxDate = toDate(max);
		const today = new Date();

		// Prev month padding
		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const day = prevMonthDays - i;
			const d = new Date(viewYear, viewMonth - 1, day);
			cells.push({
				day,
				monthOffset: -1,
				date: d,
				isSelected: Boolean(selectedDate && formatDateIso(d) === formatDateIso(selectedDate)),
				isToday: formatDateIso(d) === formatDateIso(today),
				isDisabled: Boolean((minDate && d < minDate) || (maxDate && d > maxDate))
			});
		}

		// Current month
		for (let day = 1; day <= daysInMonth; day++) {
			const d = new Date(viewYear, viewMonth, day);
			cells.push({
				day,
				monthOffset: 0,
				date: d,
				isSelected: Boolean(selectedDate && formatDateIso(d) === formatDateIso(selectedDate)),
				isToday: formatDateIso(d) === formatDateIso(today),
				isDisabled: Boolean((minDate && d < minDate) || (maxDate && d > maxDate))
			});
		}

		// Next month padding to fill complete weeks
		const remaining = (7 - (cells.length % 7)) % 7;
		for (let day = 1; day <= remaining; day++) {
			const d = new Date(viewYear, viewMonth + 1, day);
			cells.push({
				day,
				monthOffset: 1,
				date: d,
				isSelected: Boolean(selectedDate && formatDateIso(d) === formatDateIso(selectedDate)),
				isToday: formatDateIso(d) === formatDateIso(today),
				isDisabled: Boolean((minDate && d < minDate) || (maxDate && d > maxDate))
			});
		}

		return cells;
	});

	function prevMonth() {
		viewDate = new Date(viewYear, viewMonth - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(viewYear, viewMonth + 1, 1);
	}

	function selectDay(date: Date) {
		const iso = formatDateIso(date);
		if (value instanceof Date) {
			value = date;
		} else {
			value = iso;
		}
		onchange?.(date, iso);
		open = false;
	}

	function applyPreset(preset: DatePreset) {
		const date = preset.getValue();
		viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
		selectDay(date);
	}

	function clearDate() {
		value = undefined;
		onchange?.(null, '');
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		{disabled}
		class={cn(
			'inline-flex items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-150 outline-none',
			'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
			'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600 dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
			disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
			className
		)}
	>
		<div class="inline-flex items-center gap-2 truncate">
			<Icon name="calendar" size="sm" class="shrink-0 text-neutral-500 dark:text-neutral-400" />
			<span
				class={selectedDate
					? 'font-semibold text-neutral-900 dark:text-neutral-100'
					: 'text-neutral-500 dark:text-neutral-400'}
			>
				{selectedDate ? formatDisplay(selectedDate) : placeholder}
			</span>
		</div>
		<Icon name="chevron-down" size="xs" class="shrink-0 text-neutral-400 dark:text-neutral-500" />
	</Popover.Trigger>

	<Popover.Portal>
		<Popover.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl duration-150 outline-none dark:border-neutral-800 dark:bg-neutral-900"
			sideOffset={6}
		>
			<!-- Presets Bar -->
			{#if activePresets.length > 0}
				<div
					class="mb-3 flex flex-wrap gap-1 border-b border-neutral-100 pb-2.5 dark:border-neutral-800"
				>
					{#each activePresets as preset}
						<button
							type="button"
							onclick={() => applyPreset(preset)}
							class="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
						>
							{preset.label}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Month / Year Navigation -->
			<div class="flex items-center justify-between px-1 py-1">
				<button
					type="button"
					onclick={prevMonth}
					class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
					aria-label="Previous month"
				>
					<Icon name="chevron-left" size="sm" />
				</button>
				<span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
					{MONTH_NAMES[viewMonth]}
					{viewYear}
				</span>
				<button
					type="button"
					onclick={nextMonth}
					class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
					aria-label="Next month"
				>
					<Icon name="chevron-right" size="sm" />
				</button>
			</div>

			<!-- Weekday Headers -->
			<div class="mt-2 grid grid-cols-7 gap-1 text-center">
				{#each WEEKDAYS as day}
					<span class="py-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
						{day}
					</span>
				{/each}
			</div>

			<!-- Calendar Matrix -->
			<div class="mt-1 grid grid-cols-7 gap-1">
				{#each calendarDays as cell}
					<button
						type="button"
						disabled={cell.isDisabled}
						onclick={() => selectDay(cell.date)}
						class={cn(
							'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-100',
							cell.monthOffset !== 0
								? 'text-neutral-400 dark:text-neutral-600'
								: 'text-neutral-900 dark:text-neutral-100',
							cell.isToday && !cell.isSelected
								? 'border border-primary-500 font-bold text-primary-600 dark:text-primary-400'
								: '',
							cell.isSelected
								? 'bg-primary-600 font-bold text-white shadow-xs hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400'
								: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
							cell.isDisabled
								? 'cursor-not-allowed opacity-30 hover:bg-transparent'
								: 'cursor-pointer'
						)}
					>
						{cell.day}
					</button>
				{/each}
			</div>

			<!-- Footer -->
			{#if selectedDate}
				<div
					class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800"
				>
					<button
						type="button"
						onclick={clearDate}
						class="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
					>
						Clear
					</button>
					<span class="text-xs text-neutral-500 dark:text-neutral-400">
						{formatDisplay(selectedDate)}
					</span>
				</div>
			{/if}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
