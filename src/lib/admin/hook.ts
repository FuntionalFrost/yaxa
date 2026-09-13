import type { Handle } from '@sveltejs/kit';
import { DrizzleAdminService } from './handler';
import { sendMagicLinkEmail, sendWelcomeEmail } from '../server/email/index';
import { createPresignedUploadUrl } from '../server/storage/index';
import type { YaxaAdminHookOptions } from './types';

/**
 * Creates a SvelteKit Handle hook for zero-file route interception and automatic Drizzle admin dashboard.
 *
 * Example:
 * ```ts
 * // src/hooks.server.ts
 * import { sequence } from '@sveltejs/kit/hooks';
 * import { createYaxaAdminHook } from 'yaxa-svelte/admin';
 * import { db } from '$lib/server/db';
 * import * as schema from '$lib/server/db/schema-pg';
 *
 * export const handle = sequence(
 *   createYaxaAdminHook({ db, schema, path: '/admin' })
 * );
 * ```
 */
export function createYaxaAdminHook(options: YaxaAdminHookOptions): Handle {
	const service = new DrizzleAdminService(options);
	const adminPath = (options.path || '/admin').replace(/\/+$/, '');
	const apiPrefix = `${adminPath}/api`;
	const pageTitle = options.title || 'Yaxa Admin Dashboard';

	return async ({ event, resolve }) => {
		const pathname = event.url.pathname;

		// Check if request is directed to the admin route
		if (pathname === adminPath || pathname.startsWith(`${adminPath}/`)) {
			// Authorization Check
			if (options.requireAuth) {
				const isAuthed = await options.requireAuth(event);
				if (!isAuthed) {
					return new Response(JSON.stringify({ error: 'Unauthorized access to admin suite' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					});
				}
			}

			// 1. API: List tables
			if (pathname === `${apiPrefix}/tables` && event.request.method === 'GET') {
				const tables = service.getTableList();
				return jsonResponse({ tables });
			}

			// 2. API: Get table data
			if (pathname === `${apiPrefix}/table` && event.request.method === 'GET') {
				const tableName = event.url.searchParams.get('name') || service.getTableList()[0] || '';
				const page = parseInt(event.url.searchParams.get('page') || '1', 10);
				const search = event.url.searchParams.get('search') || '';
				const data = await service.getTableData({
					tableName,
					page,
					search,
					studioUrl: options.studioUrl || 'https://local.drizzle.studio'
				});
				return jsonResponse(data);
			}

			// 3. API: Create Record
			if (pathname === `${apiPrefix}/record` && event.request.method === 'POST') {
				try {
					const body = await event.request.json();
					const result = await service.createRecord(body.table, body.data || {});
					return jsonResponse({ success: true, result });
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : 'Create failed';
					return jsonResponse({ success: false, error: msg }, 400);
				}
			}

			// 4. API: Update Record
			if (pathname === `${apiPrefix}/record` && event.request.method === 'PUT') {
				try {
					const body = await event.request.json();
					const result = await service.updateRecord(body.table, body.pk, body.data || {});
					return jsonResponse({ success: true, result });
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : 'Update failed';
					return jsonResponse({ success: false, error: msg }, 400);
				}
			}

			// 5. API: Delete Record
			if (pathname === `${apiPrefix}/record` && event.request.method === 'DELETE') {
				try {
					const body = await event.request.json();
					await service.deleteRecord(body.table, body.pk);
					return jsonResponse({ success: true });
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : 'Delete failed';
					return jsonResponse({ success: false, error: msg }, 400);
				}
			}

			// 6. API: Test Email Sandbox
			if (pathname === `${apiPrefix}/test-email` && event.request.method === 'POST') {
				try {
					const body = await event.request.json();
					const { to, template } = body;
					if (template === 'welcome') {
						const res = await sendWelcomeEmail({ to, name: 'Admin Tester' });
						return jsonResponse({
							success: true,
							message: 'Welcome email sent successfully!',
							id: (res as any)?.data?.id
						});
					} else {
						const res = await sendMagicLinkEmail({
							to,
							url: `${event.url.origin}/auth/verify?mock=1`
						});
						return jsonResponse({
							success: true,
							message: 'Magic link email sent successfully!',
							id: (res as any)?.data?.id
						});
					}
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : 'Email dispatch failed';
					return jsonResponse({ success: false, error: msg }, 500);
				}
			}

			// 7. API: Test Upload Sandbox
			if (pathname === `${apiPrefix}/test-upload` && event.request.method === 'POST') {
				try {
					const body = await event.request.json();
					const res = await createPresignedUploadUrl({
						filename: body.filename || 'sandbox-upload.dat',
						contentType: body.contentType || 'application/octet-stream'
					});
					return jsonResponse(res);
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : 'Upload test failed';
					return jsonResponse({ error: msg }, 500);
				}
			}

			// 8. If developer has defined their own SvelteKit route at /admin/+page.svelte, let SvelteKit handle the HTML rendering
			// by checking if standard resolve can process it, or serve the turnkey standalone HTML shell:
			const response = await resolve(event);
			if (response.status !== 404) {
				return response;
			}

			// Zero-file HTML fallback: renders standalone admin UI if no SvelteKit route exists
			const currentTable = event.url.searchParams.get('table') || service.getTableList()[0] || '';
			const page = parseInt(event.url.searchParams.get('page') || '1', 10);
			const search = event.url.searchParams.get('search') || '';
			const initialData = await service.getTableData({
				tableName: currentTable,
				page,
				search,
				studioUrl: options.studioUrl || 'https://local.drizzle.studio'
			});

			return new Response(renderAdminHtml(initialData, pageTitle, adminPath), {
				status: 200,
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			});
		}

		return resolve(event);
	};
}

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function renderAdminHtml(data: any, title: string, adminPath: string): string {
	return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#fff7ed',
              500: '#f97316',
              600: '#ea580c',
              700: '#c2410c'
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-neutral-950 text-neutral-100 antialiased min-h-screen font-sans">
  <div class="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-6 backdrop-blur">
    <div class="flex items-center gap-3">
      <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 font-bold text-white text-xs">Y</div>
      <h1 class="text-sm font-bold text-white">${title}</h1>
      <span class="rounded bg-orange-950/60 px-2 py-0.5 text-xs text-orange-400 border border-orange-800/40">Zero-File Hook Mode</span>
    </div>
    <div class="flex items-center gap-3">
      <a href="${data.studioUrl || 'https://local.drizzle.studio'}" target="_blank" class="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-700 transition">
        Drizzle Studio ↗
      </a>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
    <aside class="md:col-span-3 space-y-2">
      <div class="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2 pb-2">Tables (${data.tables.length})</div>
      <div class="space-y-1">
        ${data.tables
					.map(
						(t: string) => `
          <a href="${adminPath}?table=${t}" class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
						t === data.currentTable
							? 'bg-orange-950/60 text-orange-300 border border-orange-800/50'
							: 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
					}">
            <span>${t}</span>
            ${t === data.currentTable ? '<span class="h-1.5 w-1.5 rounded-full bg-orange-500"></span>' : ''}
          </a>
        `
					)
					.join('')}
      </div>
    </aside>

    <main class="md:col-span-9 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-white">${data.currentTable}</h2>
          <p class="text-xs text-neutral-400">${data.total} total records</p>
        </div>
        <form method="GET" action="${adminPath}" class="flex gap-2">
          <input type="hidden" name="table" value="${data.currentTable}" />
          <input type="search" name="search" value="${data.search}" placeholder="Search..." class="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500" />
          <button type="submit" class="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Search</button>
        </form>
      </div>

      <div class="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
        <table class="w-full text-left text-xs text-neutral-300">
          <thead class="bg-neutral-950/60 uppercase font-semibold text-neutral-400 border-b border-neutral-800">
            <tr>
              ${data.columns
								.map(
									(c: any) =>
										`<th class="px-4 py-3 whitespace-nowrap">${c.name} ${c.primaryKey ? '<span class="text-orange-400 font-bold">[PK]</span>' : ''}</th>`
								)
								.join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-800/60">
            ${
							data.records.length === 0
								? `<tr><td colspan="${data.columns.length}" class="p-8 text-center text-neutral-500">No records found.</td></tr>`
								: data.records
										.map(
											(row: any) => `
                <tr class="hover:bg-neutral-800/50">
                  ${data.columns
										.map(
											(c: any) =>
												`<td class="px-4 py-3 font-mono truncate max-w-[200px]">${row[c.name] !== undefined && row[c.name] !== null ? escapeHtml(String(row[c.name])) : '—'}</td>`
										)
										.join('')}
                </tr>
              `
										)
										.join('')
						}
          </tbody>
        </table>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
