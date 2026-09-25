import { describe, it, expect } from 'vitest';
import { parseDataTableQuery, createDataTableResponse } from './pagination';

describe('DataTable Server Pagination Helpers', () => {
	it('parses default query parameters when none are supplied', () => {
		const url = new URL('https://example.com/api/users');
		const result = parseDataTableQuery(url);

		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(10);
		expect(result.limit).toBe(10);
		expect(result.offset).toBe(0);
		expect(result.sortKey).toBeUndefined();
		expect(result.sortOrder).toBe('asc');
		expect(result.searchQuery).toBeUndefined();
	});

	it('parses custom query params accurately', () => {
		const url = new URL(
			'https://example.com/api/users?page=3&pageSize=25&sort=createdAt&order=desc&q=john'
		);
		const result = parseDataTableQuery(url);

		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
		expect(result.limit).toBe(25);
		expect(result.offset).toBe(50); // (3 - 1) * 25
		expect(result.sortKey).toBe('createdAt');
		expect(result.sortOrder).toBe('desc');
		expect(result.searchQuery).toBe('john');
	});

	it('clamps page size to maxPageSize', () => {
		const url = new URL('https://example.com/api/users?page=1&pageSize=500');
		const result = parseDataTableQuery(url, { maxPageSize: 50 });

		expect(result.pageSize).toBe(50);
		expect(result.limit).toBe(50);
	});

	it('creates structured response with correct total pages calculation', () => {
		const items = [{ id: '1' }, { id: '2' }];
		const response = createDataTableResponse(items, 100, { page: 2, pageSize: 10 });

		expect(response.data).toEqual(items);
		expect(response.total).toBe(100);
		expect(response.page).toBe(2);
		expect(response.pageSize).toBe(10);
		expect(response.pageCount).toBe(10);
	});
});
