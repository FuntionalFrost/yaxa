import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { YaxaAuth } from './index';

export interface YaxaAuthHookOptions {
	auth: YaxaAuth;
	protectedPaths?: string[];
	loginPath?: string;
}

/**
 * Creates an all-in-one SvelteKit Server Hook for Better-Auth with Multi-Tenant Org resolution.
 * - Automatically routes /api/auth/* to Better-Auth
 * - Parses and caches session, user, and active organization on event.locals
 * - Enforces path protection for dashboard/app routes
 */
export function createYaxaAuthHook(options: YaxaAuthHookOptions): Handle {
	const {
		auth,
		protectedPaths = ['/dashboard', '/app', '/settings'],
		loginPath = '/login'
	} = options;

	return async ({ event, resolve }) => {
		// 1. Intercept Better-Auth API routes (/api/auth/*)
		if (event.url.pathname.startsWith('/api/auth')) {
			return auth.handler(event.request);
		}

		// 2. Fetch session from cookies/headers
		try {
			const session = await auth.api.getSession({
				headers: event.request.headers
			});

			// Attach user & session to locals
			(event.locals as any).session = session?.session || null;
			(event.locals as any).user = session?.user || null;
			(event.locals as any).orgId =
				(session?.session as any)?.activeOrganizationId ||
				event.request.headers?.get?.('x-organization-id') ||
				(event.cookies?.get ? event.cookies.get('yaxa_active_org') : null) ||
				null;
		} catch {
			(event.locals as any).session = null;
			(event.locals as any).user = null;
			(event.locals as any).orgId = null;
		}

		// 3. Check protected routes
		const isProtected = protectedPaths.some((path) => event.url.pathname.startsWith(path));

		if (isProtected && !(event.locals as any).user) {
			const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
			throw redirect(303, `${loginPath}?returnTo=${returnTo}`);
		}

		return resolve(event);
	};
}
