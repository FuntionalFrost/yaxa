import type { HandleServerError } from '@sveltejs/kit/hooks';
import { createYaxaHook } from '#lib/site/hook.js';
import { siteConfig } from './site.config';

/**
 * Compose the yaxa all-in-one hook (handles /robots.txt, /sitemap.xml,
 * /sitemap.xsl, /site.webmanifest, /api/og) with the root handle export.
 */
export const handle = createYaxaHook(siteConfig);

/**
 * Catch-all server error handler.
 * Logs the full error internally while returning a safe generic message
 * to the client so stack traces are never exposed in production.
 */
export const handleError: HandleServerError = ({ error, event, kind }) => {
	const status =
		kind === 'framework' || kind === 'validation' ? error.status : (error as any)?.status || 500;
	// Log the full error server-side (picked up by Vercel log drain / console)
	console.error(`[handleError] [${kind}] ${status} on ${event.url.pathname}:`, error);

	// Never surface raw error details to the client
	return {
		message:
			status === 404 ? 'Page not found.' : 'An unexpected error occurred. Please try again later.',
		status
	};
};
