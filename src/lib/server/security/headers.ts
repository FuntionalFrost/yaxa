import type { Handle } from '@sveltejs/kit/hooks';

export interface SecurityHeadersOptions {
	/**
	 * Value for `X-Frame-Options`. Set to `false` to disable.
	 * @default 'SAMEORIGIN'
	 */
	frameOptions?: 'DENY' | 'SAMEORIGIN' | false;
	/**
	 * Value for `X-Content-Type-Options`. Set to `false` to disable.
	 * @default 'nosniff'
	 */
	contentTypeOptions?: 'nosniff' | false;
	/**
	 * Value for `Referrer-Policy`. Set to `false` to disable.
	 * @default 'strict-origin-when-cross-origin'
	 */
	referrerPolicy?: string | false;
	/**
	 * Value for `Strict-Transport-Security` (HSTS). Set to `false` to disable.
	 * @default 'max-age=63072000; includeSubDomains; preload'
	 */
	strictTransportSecurity?: string | false;
	/**
	 * Value for `Permissions-Policy`. Set to `false` to disable.
	 * @default 'camera=(), microphone=(), geolocation=(), payment=()'
	 */
	permissionsPolicy?: string | false;
	/**
	 * Value for `Cross-Origin-Opener-Policy`. Set to `false` to disable.
	 * @default 'same-origin'
	 */
	crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none' | false;
	/**
	 * Optional `Content-Security-Policy` directive map or raw policy string.
	 */
	contentSecurityPolicy?: Record<string, string | string[]> | string | false;
	/**
	 * Additional custom headers to attach to every response.
	 */
	customHeaders?: Record<string, string>;
}

/**
 * Computes a dictionary of HTTP security headers from options.
 */
export function buildSecurityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
	const headers: Record<string, string> = {};

	const contentTypeOptions = options.contentTypeOptions ?? 'nosniff';
	if (contentTypeOptions !== false) {
		headers['x-content-type-options'] = contentTypeOptions;
	}

	const frameOptions = options.frameOptions ?? 'SAMEORIGIN';
	if (frameOptions !== false) {
		headers['x-frame-options'] = frameOptions;
	}

	const referrerPolicy = options.referrerPolicy ?? 'strict-origin-when-cross-origin';
	if (referrerPolicy !== false) {
		headers['referrer-policy'] = referrerPolicy;
	}

	const hsts = options.strictTransportSecurity ?? 'max-age=63072000; includeSubDomains; preload';
	if (hsts !== false) {
		headers['strict-transport-security'] = hsts;
	}

	const permissionsPolicy =
		options.permissionsPolicy ?? 'camera=(), microphone=(), geolocation=(), payment=()';
	if (permissionsPolicy !== false) {
		headers['permissions-policy'] = permissionsPolicy;
	}

	const coop = options.crossOriginOpenerPolicy ?? 'same-origin';
	if (coop !== false) {
		headers['cross-origin-opener-policy'] = coop;
	}

	if (options.contentSecurityPolicy) {
		if (typeof options.contentSecurityPolicy === 'string') {
			headers['content-security-policy'] = options.contentSecurityPolicy;
		} else {
			const parts: string[] = [];
			for (const [directive, value] of Object.entries(options.contentSecurityPolicy)) {
				const joined = Array.isArray(value) ? value.join(' ') : value;
				parts.push(joined ? `${directive} ${joined}` : directive);
			}
			if (parts.length > 0) {
				headers['content-security-policy'] = parts.join('; ');
			}
		}
	}

	if (options.customHeaders) {
		for (const [k, v] of Object.entries(options.customHeaders)) {
			headers[k.toLowerCase()] = v;
		}
	}

	return headers;
}

/**
 * SvelteKit `Handle` hook that attaches production-grade HTTP security headers
 * (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP)
 * to all responses. Composable via `@sveltejs/kit/hooks` `sequence()`.
 */
export function createSecurityHeadersHook(options: SecurityHeadersOptions = {}): Handle {
	const computed = buildSecurityHeaders(options);

	return async ({ event, resolve }) => {
		const response = await resolve(event);
		const headers = new Headers(response.headers);

		for (const [name, value] of Object.entries(computed)) {
			if (!headers.has(name)) {
				headers.set(name, value);
			}
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	};
}
