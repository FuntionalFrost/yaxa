<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	export const calendarVariants = tv({
		slots: {
			root: 'w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900',
			header:
				'flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800',
			title: 'text-base font-bold text-neutral-900 dark:text-neutral-100',
			navGroup: 'flex items-center gap-1.5',
			weekdayRow:
				'grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/70 text-center text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400',
			weekdayCell: 'py-2',
			grid: 'grid grid-cols-7 divide-x divide-y divide-neutral-200/80 dark:divide-neutral-800/80',
			dayCell:
				'group relative flex min-h-[92px] flex-col p-1.5 text-left transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40',
			dayNumber:
				'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300',
			eventList: 'mt-1 flex flex-col gap-1',
			eventPill:
				'flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-85'
		}
	});

	export type CalendarVariants = VariantProps<typeof calendarVariants>;
	export type CalendarSlots = keyof typeof calendarVariants.slots;

	export type CalendarEventColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

	export interface CalendarEvent {
		id: string;
		title: string;
		/**
		 * ISO date string in `YYYY-MM-DD` format.
		 */
		date: string;
		/**
		 * Optional display time (e.g. `'10:30 AM'`).
		 */
		time?: string;
		/**
		 * Pill color theme.
		 * @default 'primary'
		 */
		color?: CalendarEventColor;
		[key: string]: any;
	}

	export interface CalendarProps extends HTMLAttributes<HTMLDivElement> {
		/**
		 * Events rendered across the calendar grid.
		 */
		events?: CalendarEvent[];
		/**
		 * Active calendar display mode.
		 * @default 'month'
		 */
		view?: 'month' | 'week';
		/**
		 * Reference ISO date (`YYYY-MM-DD`) determining the visible month/week.
		 */
		currentDate?: string;
		/**
		 * Currently selected ISO date (`YYYY-MM-DD`).
		 */
		selectedDate?: string;
		/**
		 * Max events displayed per day before collapsing into `+N more`.
		 * @default 3
		 */
		maxEventsPerDay?: number;
		/**
		 * Callback invoked when a day cell is clicked.
		 */
		ondateclick?: (dateIso: string) => void;
		/**
		 * Callback invoked when an event pill is clicked.
		 */
		oneventclick?: (event: CalendarEvent) => void;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<CalendarSlots, string>>;
	}

	export function formatIsoDate(date: Date): string {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	export function parseIsoDate(iso: string): Date {
		const [y, m, d] = iso.split('-').map(Number);
		if (!y || !m || !d) return new Date();
		return new Date(y, m - 1, d);
	}
</script>

<script lang="ts">
	import { cn } from '../../utils/cn';

	const todayIso = formatIsoDate(new Date());

	let {
		events = [],
		view = $bindable<'month' | 'week'>('month'),
		currentDate = $bindable(todayIso),
		selectedDate = $bindable(todayIso),
		maxEventsPerDay = 3,
		ondateclick,
		oneventclick,
		ui,
		class: className = '',
		...restProps
	}: CalendarProps = $props();

	const slots = $derived(calendarVariants());

	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const EVENT_COLOR_CLASSES: Record<CalendarEventColor, string> = {
		primary: 'bg-primary-100/90 text-primary-800 dark:bg-primary-950/80 dark:text-primary-200',
		success: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200',
		warning: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200',
		error: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200',
		info: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-200',
		neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
	};

	const activeDateObj = $derived(parseIsoDate(currentDate));

	const headerTitle = $derived(
		activeDateObj.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		})
	);

	const eventsByDate = $derived.by(() => {
		const map: Record<string, CalendarEvent[]> = {};
		for (const ev of events) {
			const list = map[ev.date] ?? [];
			list.push(ev);
			map[ev.date] = list;
		}
		return map;
	});

	interface CalendarCell {
		iso: string;
		dayNumber: number;
		inCurrentMonth: boolean;
		isToday: boolean;
		isSelected: boolean;
		events: CalendarEvent[];
	}

	const visibleCells = $derived.by((): CalendarCell[] => {
		const year = activeDateObj.getFullYear();
		const month = activeDateObj.getMonth();

		if (view === 'week') {
			const dayOfWeek = (activeDateObj.getDay() + 6) % 7; // Monday = 0
			const monday = new Date(year, month, activeDateObj.getDate() - dayOfWeek);
			return Array.from({ length: 7 }, (_, i) => {
				const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
				const iso = formatIsoDate(d);
				return {
					iso,
					dayNumber: d.getDate(),
					inCurrentMonth: d.getMonth() === month,
					isToday: iso === todayIso,
					isSelected: iso === selectedDate,
					events: eventsByDate[iso] ?? []
				};
			});
		}

		// Month view (42 cells / 6 weeks starting Monday)
		const firstOfMonth = new Date(year, month, 1);
		const startOffset = (firstOfMonth.getDay() + 6) % 7;
		const gridStart = new Date(year, month, 1 - startOffset);

		return Array.from({ length: 42 }, (_, i) => {
			const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
			const iso = formatIsoDate(d);
			return {
				iso,
				dayNumber: d.getDate(),
				inCurrentMonth: d.getMonth() === month,
				isToday: iso === todayIso,
				isSelected: iso === selectedDate,
				events: eventsByDate[iso] ?? []
			};
		});
	});

	function navigatePeriod(delta: number) {
		const d = parseIsoDate(currentDate);
		if (view === 'week') {
			d.setDate(d.getDate() + delta * 7);
		} else {
			d.setMonth(d.getMonth() + delta);
		}
		currentDate = formatIsoDate(d);
	}

	function goToToday() {
		currentDate = todayIso;
		selectedDate = todayIso;
	}
</script>

<div data-slot="root" class={cn(slots.root({ class: ui?.root }), className)} {...restProps}>
	<!-- Calendar Header -->
	<div data-slot="header" class={slots.header({ class: ui?.header })}>
		<div class="flex items-center gap-3">
			<h3 data-slot="title" class={slots.title({ class: ui?.title })}>
				{headerTitle}
			</h3>
			<button
				type="button"
				onclick={goToToday}
				class="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				Today
			</button>
		</div>

		<div data-slot="navGroup" class={slots.navGroup({ class: ui?.navGroup })}>
			<!-- View Switcher -->
			<div
				class="mr-2 flex items-center rounded-lg bg-neutral-100 p-0.5 text-xs dark:bg-neutral-800"
			>
				<button
					type="button"
					onclick={() => (view = 'month')}
					class="rounded-md px-2.5 py-1 font-medium transition-all {view === 'month'
						? 'bg-white text-neutral-900 shadow-2xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-600 dark:text-neutral-400'}"
				>
					Month
				</button>
				<button
					type="button"
					onclick={() => (view = 'week')}
					class="rounded-md px-2.5 py-1 font-medium transition-all {view === 'week'
						? 'bg-white text-neutral-900 shadow-2xs dark:bg-neutral-700 dark:text-white'
						: 'text-neutral-600 dark:text-neutral-400'}"
				>
					Week
				</button>
			</div>

			<button
				type="button"
				aria-label="Previous {view}"
				onclick={() => navigatePeriod(-1)}
				class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				‹
			</button>
			<button
				type="button"
				aria-label="Next {view}"
				onclick={() => navigatePeriod(1)}
				class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				›
			</button>
		</div>
	</div>

	<!-- Weekday Headers -->
	<div data-slot="weekdayRow" class={slots.weekdayRow({ class: ui?.weekdayRow })}>
		{#each WEEKDAYS as day (day)}
			<div data-slot="weekdayCell" class={slots.weekdayCell({ class: ui?.weekdayCell })}>
				{day}
			</div>
		{/each}
	</div>

	<!-- Calendar Grid -->
	<div data-slot="grid" role="grid" class={slots.grid({ class: ui?.grid })}>
		{#each visibleCells as cell (cell.iso)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				data-slot="dayCell"
				data-date={cell.iso}
				role="gridcell"
				tabindex="0"
				onclick={() => {
					selectedDate = cell.iso;
					ondateclick?.(cell.iso);
				}}
				class={cn(
					slots.dayCell({ class: ui?.dayCell }),
					!cell.inCurrentMonth && 'bg-neutral-50/40 opacity-50 dark:bg-neutral-950/30',
					cell.isSelected &&
						'bg-primary-50/20 ring-1 ring-primary-500/60 ring-inset dark:bg-primary-950/20'
				)}
			>
				<div class="flex items-center justify-between">
					<span
						data-slot="dayNumber"
						class={cn(
							slots.dayNumber({ class: ui?.dayNumber }),
							cell.isToday && 'bg-primary-600 font-bold text-white dark:bg-primary-500'
						)}
					>
						{cell.dayNumber}
					</span>
				</div>

				{#if cell.events.length > 0}
					<div data-slot="eventList" class={slots.eventList({ class: ui?.eventList })}>
						{#each cell.events.slice(0, maxEventsPerDay) as ev (ev.id)}
							<button
								type="button"
								data-slot="eventPill"
								onclick={(e) => {
									e.stopPropagation();
									oneventclick?.(ev);
								}}
								class={cn(
									slots.eventPill({ class: ui?.eventPill }),
									EVENT_COLOR_CLASSES[ev.color ?? 'primary']
								)}
							>
								{#if ev.time}
									<span class="shrink-0 opacity-75">{ev.time}</span>
								{/if}
								<span class="truncate">{ev.title}</span>
							</button>
						{/each}
						{#if cell.events.length > maxEventsPerDay}
							<span class="px-1 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
								+{cell.events.length - maxEventsPerDay} more
							</span>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
