import { describe, it, expect } from 'vitest';
import { renderComponent, createMockRequestEvent } from '#lib/testing/index.js';
import HomePage from './+page.svelte';
import SaasPage from './saas/+page.svelte';
import AdminPage from './admin/+page.svelte';
import { GET as getApiDocs } from './api/docs/+server.js';
import { GET as getProjects, POST as createProject } from './api/projects/+server.js';

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

	it('serves live /api/docs OpenAPI documentation and JSON spec', async () => {
		// Test HTML rendering
		const htmlEvent = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs'
		});
		const htmlRes = await getApiDocs(htmlEvent);
		expect(htmlRes.status).toBe(200);
		expect(htmlRes.headers.get('content-type')).toContain('text/html');
		const htmlText = await htmlRes.text();
		expect(htmlText).toContain('Yaxa Interactive API Reference');
		expect(htmlText).toContain('@scalar/api-reference');

		// Test OpenAPI 3.1 JSON format
		const jsonEvent = createMockRequestEvent({
			url: 'http://localhost:5173/api/docs?format=json'
		});
		const jsonRes = await getApiDocs(jsonEvent);
		expect(jsonRes.status).toBe(200);
		expect(jsonRes.headers.get('content-type')).toContain('application/json');
		const spec = await jsonRes.json();
		expect(spec.openapi).toBe('3.1.0');
		expect(spec.paths['/api/projects']).toBeDefined();
		expect(spec.paths['/api/projects'].get).toBeDefined();
		expect(spec.paths['/api/projects'].post).toBeDefined();
		expect(spec.paths['/api/cron/jobs']).toBeDefined();
	});

	it('handles /api/projects GET and POST endpoints', async () => {
		const getEvent = createMockRequestEvent({
			url: 'http://localhost:5173/api/projects'
		});
		const getRes = await getProjects(getEvent);
		expect(getRes.status).toBe(200);
		const list = await getRes.json();
		expect(Array.isArray(list)).toBe(true);
		expect(list.length).toBeGreaterThan(0);

		const postEvent = createMockRequestEvent({
			url: 'http://localhost:5173/api/projects',
			method: 'POST',
			body: {
				name: 'New Space Project',
				description: 'Orbital tracking dashboard',
				tags: ['space', 'satellite']
			}
		});
		const postRes = await createProject(postEvent);
		expect(postRes.status).toBe(201);
		const created = await postRes.json();
		expect(created.name).toBe('New Space Project');
		expect(created.id).toBeDefined();
	});
});
