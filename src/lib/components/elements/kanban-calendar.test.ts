import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { renderComponent } from '#lib/testing/index.js';
import KanbanBoard, { type KanbanColumn, type KanbanMoveEvent } from './KanbanBoard.svelte';
import Calendar, { formatIsoDate, parseIsoDate, type CalendarEvent } from './Calendar.svelte';

describe('KanbanBoard & Calendar Enterprise Views', () => {
	describe('KanbanBoard', () => {
		it('renders columns, cards, WIP limits, and moves cards via accessible quick-move buttons', () => {
			const columns: KanbanColumn[] = [
				{
					id: 'todo',
					title: 'To Do',
					items: [{ id: 'c1', title: 'Write unit tests', priority: 'high', badge: 'QA' }]
				},
				{
					id: 'doing',
					title: 'In Progress',
					limit: 1,
					items: []
				}
			];

			let lastMove: KanbanMoveEvent | null = null;
			const { target, cleanup } = renderComponent(KanbanBoard, {
				columns,
				onmove: (ev: KanbanMoveEvent) => {
					lastMove = ev;
				}
			});

			expect(target.textContent).toContain('To Do');
			expect(target.textContent).toContain('In Progress');
			expect(target.textContent).toContain('Write unit tests');

			// Click the quick-move right button ("→")
			const moveRightBtn = target.querySelector(
				'button[aria-label="Move Write unit tests to In Progress"]'
			) as HTMLButtonElement | null;
			expect(moveRightBtn).not.toBeNull();
			moveRightBtn?.click();
			flushSync();

			expect(lastMove).toMatchObject({
				fromColumnId: 'todo',
				toColumnId: 'doing',
				toIndex: 0
			});
			cleanup();
		});
	});

	describe('Calendar', () => {
		it('formats and parses ISO dates accurately', () => {
			const d = parseIsoDate('2026-11-15');
			expect(formatIsoDate(d)).toBe('2026-11-15');
		});

		it('renders 42 day cells in month view, switches to 7 day cells in week view, and triggers event clicks', () => {
			const events: CalendarEvent[] = [
				{
					id: 'e1',
					title: 'Architecture Sync',
					date: '2026-11-15',
					time: '11:00 AM',
					color: 'primary'
				}
			];

			let clickedEventId = '';
			const { target, cleanup } = renderComponent(Calendar, {
				currentDate: '2026-11-15',
				selectedDate: '2026-11-15',
				view: 'month',
				events,
				oneventclick: (ev: CalendarEvent) => {
					clickedEventId = ev.id;
				}
			});

			expect(target.querySelectorAll('[data-slot="dayCell"]')).toHaveLength(42);
			expect(target.textContent).toContain('Architecture Sync');

			const pill = target.querySelector('[data-slot="eventPill"]') as HTMLButtonElement | null;
			pill?.click();
			flushSync();
			expect(clickedEventId).toBe('e1');

			// Switch to Week view
			const buttons = Array.from(target.querySelectorAll('button'));
			const weekBtn = buttons.find((b) => b.textContent?.trim() === 'Week');
			weekBtn?.click();
			flushSync();

			expect(target.querySelectorAll('[data-slot="dayCell"]')).toHaveLength(7);
			cleanup();
		});
	});
});
