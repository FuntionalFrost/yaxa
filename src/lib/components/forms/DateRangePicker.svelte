<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import { cn } from '$lib/utils/cn';

	export interface DateRange {
		start?: string | Date;
		end?: string | Date;
	}

	export interface DateRangePreset {
		label: string;
		getRange: () => { start: Date; end: Date };
	}

	interface Props {
		value?: DateRange;
		placeholder?: string;
		min?: string | Date;
		max?: string | Date;
		disabled?: boolean;
		presets?: DateRangePreset[];
		class?: string;
		onchange?: (range: { start: Date | null; end: Date | null }) => void;
	}

	let {
		value = $bindable({}),
		placeholder = 'Select date range',
		min,
		max,
		disabled = false,
		presets,
		class: className = '',
		onchange
	}: Props = $props();

	let open = $state(false);

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

	let startDate = $derived(toDate(value?.start));
	let endDate = $derived(toDate(value?.end));

	let viewDate = $state(new Date());

	$effect(() => {
		if (startDate) {
			viewDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
		}
	});

	let viewYear = $derived(viewDate.getFullYear());
	let viewMonth = $derived(viewDate.getMonth());

	let selectingStart = $state(true);
	let tempStart = $state<Date | null>(null);

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

	const defaultPresets: DateRangePreset[] = [
		{
			label: 'Today',
			getRange: () => {
				const now = new Date();
				return { start: now, end: now };
			}
		},
		{
			label: 'Last 7 Days',
			getRange: () => {
				const end = new Date();
				const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
				return { start, end };
			}
		},
		{
			label: 'Last 30 Days',
			getRange: () => {
				const end = new Date();
				const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
				return { start, end };
			}
		},
		{
			label: 'This Month',
			getRange: () => {
				const now = new Date();
				const start = new Date(now.getFullYear(), now.getMonth(), 1);
				const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				return { start, end };
			}
		}
	];

	let activePresets = $derived(presets || defaultPresets);

	let calendarDays = $derived.by(() => {
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
		const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

		const cells: Array<{
			day: number;
			monthOffset: number;
			date: Date;
			isStart: boolean;
			isEnd: boolean;
			isInRange: boolean;
			isToday: boolean;
			isDisabled: boolean;
		}> = [];

		const minDate = toDate(min);
		const maxDate = toDate(max);
		const today = new Date();

		const activeStart = tempStart || startDate;
		const activeEnd = tempStart ? null : endDate;

		function evaluate(d: Date) {
			const iso = formatDateIso(d);
			const startIso = activeStart ? formatDateIso(activeStart) : null;
			const endIso = activeEnd ? formatDateIso(activeEnd) : null;

			const isStart = Boolean(startIso && iso === startIso);
			const isEnd = Boolean(endIso && iso === endIso);
			const isInRange = Boolean(activeStart && activeEnd && d > activeStart && d < activeEnd);
			const isToday = iso === formatDateIso(today);
			const isDisabled = Boolean((minDate && d < minDate) || (maxDate && d > maxDate));

			return { isStart, isEnd, isInRange, isToday, isDisabled };
		}

		// Prev month padding
		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const day = prevMonthDays - i;
			const d = new Date(viewYear, viewMonth - 1, day);
			cells.push({ day, monthOffset: -1, date: d, ...evaluate(d) });
		}

		// Current month
		for (let day = 1; day <= daysInMonth; day++) {
			const d = new Date(viewYear, viewMonth, day);
			cells.push({ day, monthOffset: 0, date: d, ...evaluate(d) });
		}

		// Next month padding
		const remaining = (7 - (cells.length % 7)) % 7;
		for (let day = 1; day <= remaining; day++) {
			const d = new Date(viewYear, viewMonth + 1, day);
			cells.push({ day, monthOffset: 1, date: d, ...evaluate(d) });
		}

		return cells;
	});

	function prevMonth() {
		viewDate = new Date(viewYear, viewMonth - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(viewYear, viewMonth + 1, 1);
	}

	function handleDayClick(date: Date) {
		if (selectingStart || !tempStart) {
			tempStart = date;
			selectingStart = false;
		} else {
			let start = tempStart;
			let end = date;
			if (end < start) {
				const swap = start;
				start = end;
				end = swap;
			}
			value = {
				start: value?.start instanceof Date ? start : formatDateIso(start),
				end: value?.end instanceof Date ? end : formatDateIso(end)
			};
			tempStart = null;
			selectingStart = true;
			onchange?.({ start, end });
			open = false;
		}
	}

	function applyPreset(preset: DateRangePreset) {
		const range = preset.getRange();
		value = {
			start: value?.start instanceof Date ? range.start : formatDateIso(range.start),
			end: value?.end instanceof Date ? range.end : formatDateIso(range.end)
		};
		tempStart = null;
		selectingStart = true;
		onchange?.(range);
		open = false;
	}

	function clearRange() {
		value = {};
		tempStart = null;
		selectingStart = true;
		onchange?.({ start: null, end: null });
		open = false;
	}

	let displayLabel = $derived.by(() => {
		if (startDate && endDate) {
			return `${formatDisplay(startDate)} – ${formatDisplay(endDate)}`;
		}
		if (startDate) {
			return `${formatDisplay(startDate)} – …`;
		}
		return placeholder;
	});
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
				class={startDate
					? 'font-semibold text-neutral-900 dark:text-neutral-100'
					: 'text-neutral-500 dark:text-neutral-400'}
			>
				{displayLabel}
			</span>
		</div>
		<Icon name="chevron-down" size="xs" class="shrink-0 text-neutral-400 dark:text-neutral-500" />
	</Popover.Trigger>

	<Popover.Portal>
		<Popover.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-80 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xl duration-150 outline-none dark:border-neutral-800 dark:bg-neutral-900"
			sideOffset={6}
		>
			<!-- Quick Presets -->
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
			<div class="mt-2 grid grid-cols-7 gap-0 text-center">
				{#each WEEKDAYS as day}
					<span class="py-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
						{day}
					</span>
				{/each}
			</div>

			<!-- Calendar Matrix -->
			<div class="mt-1 grid grid-cols-7 gap-y-1">
				{#each calendarDays as cell}
					<div
						class={cn(
							'flex h-8 items-center justify-center',
							cell.isInRange ? 'bg-primary-50 dark:bg-primary-950/40' : '',
							cell.isStart && (endDate || tempStart)
								? 'rounded-l-lg bg-primary-50 dark:bg-primary-950/40'
								: '',
							cell.isEnd ? 'rounded-r-lg bg-primary-50 dark:bg-primary-950/40' : ''
						)}
					>
						<button
							type="button"
							disabled={cell.isDisabled}
							onclick={() => handleDayClick(cell.date)}
							class={cn(
								'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-100',
								cell.monthOffset !== 0
									? 'text-neutral-400 dark:text-neutral-600'
									: 'text-neutral-900 dark:text-neutral-100',
								cell.isStart || cell.isEnd
									? 'bg-primary-600 font-bold text-white shadow-xs hover:bg-primary-500 dark:bg-primary-500'
									: cell.isInRange
										? 'rounded-none font-medium text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-900/40'
										: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
								cell.isToday && !cell.isStart && !cell.isEnd && !cell.isInRange
									? 'border border-primary-500 font-bold text-primary-600 dark:text-primary-400'
									: '',
								cell.isDisabled
									? 'cursor-not-allowed opacity-30 hover:bg-transparent'
									: 'cursor-pointer'
							)}
						>
							{cell.day}
						</button>
					</div>
				{/each}
			</div>

			<!-- Footer info & Clear -->
			<div
				class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800"
			>
				<button
					type="button"
					onclick={clearRange}
					class="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
				>
					Clear
				</button>
				<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
					{tempStart
						? 'Select end date'
						: startDate && endDate
							? 'Range selected'
							: 'Select start date'}
				</span>
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
