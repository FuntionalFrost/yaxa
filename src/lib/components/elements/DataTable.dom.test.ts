import { describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import { renderComponent } from '$lib/testing';
import DataTable, { type Column } from './DataTable.svelte';

interface TestItem extends Record<string, any> {
	id: string;
	name: string;
	role: string;
	score: number;
}

const testData: TestItem[] = [
	{ id: '1', name: 'Alice Smith', role: 'Engineer', score: 95 },
	{ id: '2', name: 'Bob Jones', role: 'Designer', score: 82 },
	{ id: '3', name: 'Charlie Brown', role: 'Manager', score: 88 }
];

const testColumns: Column[] = [
	{ key: 'name', label: 'Full Name', sortable: true },
	{ key: 'role', label: 'Job Role', sortable: true },
	{ key: 'score', label: 'Performance Score', sortable: true }
];

describe('DataTable Component (DOM & Interactions)', () => {
	it('renders table headers and rows accurately', () => {
		const { target, cleanup } = renderComponent(DataTable, {
			data: testData,
			columns: testColumns
		});

		const thElements = target.querySelectorAll('thead th');
		expect(thElements.length).toBe(3);
		expect(thElements[0].textContent).toContain('Full Name');
		expect(thElements[1].textContent).toContain('Job Role');

		const trElements = target.querySelectorAll('tbody tr');
		expect(trElements.length).toBe(3);
		expect(trElements[0].textContent).toContain('Alice Smith');
		expect(trElements[1].textContent).toContain('Bob Jones');

		cleanup();
	});

	it('filters rows according to searchQuery in client mode', () => {
		const { target, cleanup } = renderComponent(DataTable, {
			data: testData,
			columns: testColumns,
			searchQuery: 'Designer'
		});

		const trElements = target.querySelectorAll('tbody tr');
		expect(trElements.length).toBe(1);
		expect(trElements[0].textContent).toContain('Bob Jones');
		expect(trElements[0].textContent).toContain('Designer');

		cleanup();
	});

	it('displays custom emptyText when no matching rows are found', () => {
		const { target, cleanup } = renderComponent(DataTable, {
			data: testData,
			columns: testColumns,
			searchQuery: 'NonExistentQueryXYZ',
			emptyText: 'No members found'
		});

		const trElements = target.querySelectorAll('tbody tr');
		expect(trElements.length).toBe(1);
		expect(trElements[0].textContent).toContain('No members found');

		cleanup();
	});

	it('sorts rows when clicking on sortable column headers', () => {
		const { target, cleanup } = renderComponent(DataTable, {
			data: testData,
			columns: testColumns
		});

		const sortButton = target.querySelector('thead th button') as HTMLButtonElement;
		expect(sortButton).toBeDefined();

		// Click to sort by name (ascending)
		sortButton.click();
		flushSync();
		let firstRowName = target.querySelector('tbody tr td')?.textContent;
		expect(firstRowName).toContain('Alice Smith');

		// Click again to sort by name (descending)
		sortButton.click();
		flushSync();
		firstRowName = target.querySelector('tbody tr td')?.textContent;
		expect(firstRowName).toContain('Charlie Brown');

		cleanup();
	});

	it('supports server mode pagination and event triggers', () => {
		const onpaginate = vi.fn();
		const onsort = vi.fn();

		const { target, cleanup } = renderComponent(DataTable, {
			data: testData.slice(0, 2),
			columns: testColumns,
			mode: 'server',
			totalRows: 10,
			pagination: true,
			pageSize: 2,
			page: 1,
			onpaginate,
			onsort
		});

		const paginationFooter = target.textContent;
		expect(paginationFooter).toContain('Page 1 of 5');
		expect(paginationFooter).toContain('Showing 1–2 of 10');

		// Click next page button
		const nextBtn = target.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
		expect(nextBtn).toBeDefined();
		nextBtn.click();
		flushSync();

		expect(onpaginate).toHaveBeenCalledWith(
			expect.objectContaining({
				page: 2,
				pageSize: 2
			})
		);

		cleanup();
	});
});
