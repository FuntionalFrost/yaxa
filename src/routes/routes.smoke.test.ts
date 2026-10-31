import { describe, it, expect } from 'vitest';
import { renderComponent } from '#lib/testing/index.js';
import HomePage from './+page.svelte';
import SaasPage from './saas/+page.svelte';
import AdminPage from './admin/+page.svelte';

describe('Application Route Smoke Tests (Headless in-memory)', () => {
	it('mounts homepage and renders hero heading and documentation CTA', () => {
		const { cleanup, target } = renderComponent(HomePage);

		const h1 = target.querySelector('h1');
		expect(h1).toBeDefined();
		expect(h1?.textContent).toContain('Svelte UI Library');

		const docsLink = Array.from(target.querySelectorAll('a')).find((a) =>
			/docs|documentation/i.test(a.textContent || '')
		);
		expect(docsLink).toBeDefined();

		cleanup();
	});

	it('mounts /saas showcase and renders SaaS suite pricing heading', () => {
		const { cleanup, target } = renderComponent(SaasPage);

		const headings = Array.from(target.querySelectorAll('h1, h2')).map((h) => h.textContent || '');
		expect(headings.some((text) => /SaaS|Solo/i.test(text))).toBe(true);

		cleanup();
	});

	it('mounts /admin dashboard and renders Database Studio interface', () => {
		const mockData = {
			adminData: {
				tables: ['users', 'organizations', 'subscriptions'],
				currentTable: 'users',
				records: [],
				columns: [
					{ name: 'id', dataType: 'text', primaryKey: true, notNull: true, hasDefault: false },
					{ name: 'email', dataType: 'text', primaryKey: false, notNull: true, hasDefault: false },
					{ name: 'role', dataType: 'text', primaryKey: false, notNull: false, hasDefault: false }
				],
				primaryKey: 'id',
				total: 0,
				page: 1,
				pageSize: 10,
				search: ''
			}
		};

		const { cleanup, target } = renderComponent(AdminPage, {
			data: mockData,
			params: {},
			form: null
		});

		expect(target.textContent).toContain('Admin Introspection Suite');
		expect(target.textContent).toContain('Database Tables');
		expect(target.textContent).toContain('users');

		cleanup();
	});
});
