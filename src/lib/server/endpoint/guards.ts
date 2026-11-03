import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { problemResponse } from './problem';
import type { Guard } from './types';

export interface RequireAuthOptions {
	/**
	 * If provided, unauthorized users are redirected with 303 instead of receiving 401 JSON.
	 * (Useful for dashboard/form routes).
	 */
	redirect?: string;
	/**
	 * Custom error message for the RFC 7807 detail.
	 */
	detail?: string;
}

/**
 * Declarative Guard: Enforces that the request has an active authenticated user in `event.locals.user`.
 */
export function requireAuth(options: RequireAuthOptions = {}): Guard {
	return (event: RequestEvent) => {
		const user = (event.locals as any)?.user;

		if (!user) {
			if (options.redirect) {
				const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
				const target = options.redirect.includes('?')
					? `${options.redirect}&returnTo=${returnTo}`
					: `${options.redirect}?returnTo=${returnTo}`;
				throw redirect(303, target);
			}

			return problemResponse({
				status: 401,
				title: 'Unauthorized',
				detail: options.detail || 'Authentication required to access this endpoint.',
				type: 'https://yaxa.dev/errors/unauthorized'
			});
		}
	};
}

export interface RequireRoleOptions {
	detail?: string;
}

/**
 * Declarative Guard: Enforces that the active user/member possesses one of the allowed roles.
 * Checks `event.locals.user.role`, `event.locals.member.role`, and `event.locals.orgRole`.
 */
export function requireRole(roles: string | string[], options: RequireRoleOptions = {}): Guard {
	const allowedRoles = Array.isArray(roles) ? roles : [roles];

	return (event: RequestEvent) => {
		const locals = event.locals as any;
		const user = locals?.user;

		if (!user) {
			return problemResponse({
				status: 401,
				title: 'Unauthorized',
				detail: 'Authentication required before role verification.'
			});
		}

		const userRole = user.role;
		const memberRole = locals.member?.role || locals.orgRole;

		const hasRole =
			(userRole && allowedRoles.includes(userRole)) ||
			(memberRole && allowedRoles.includes(memberRole));

		if (!hasRole) {
			return problemResponse({
				status: 403,
				title: 'Forbidden',
				detail:
					options.detail ||
					`Insufficient permissions. Requires one of: [${allowedRoles.join(', ')}].`,
				type: 'https://yaxa.dev/errors/forbidden',
				requiredRoles: allowedRoles
			});
		}
	};
}

export interface RateLimitOptions {
	/**
	 * Maximum allowed requests within the time window. Default: 60.
	 */
	points?: number;
	/**
	 * Window duration in seconds. Default: 60.
	 */
	windowSeconds?: number;
	/**
	 * Custom cache key generator. Defaults to IP address or authenticated user ID.
	 */
	keyGenerator?: (event: RequestEvent) => string;
	/**
	 * Custom error message.
	 */
	detail?: string;
}

interface RateLimitBucket {
	tokens: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Periodic cleanup of stale rate-limit buckets (every 5 minutes)
if (typeof setInterval !== 'undefined') {
	const timer = setInterval(
		() => {
			const now = Date.now();
			for (const [key, bucket] of rateLimitStore.entries()) {
				if (bucket.resetAt <= now) {
					rateLimitStore.delete(key);
				}
			}
		},
		5 * 60 * 1000
	);
	if (timer && typeof timer === 'object' && 'unref' in timer) {
		(timer as any).unref();
	}
}

/**
 * Declarative Guard: In-memory sliding-window rate limiter.
 * Returns 429 Too Many Requests with a `Retry-After` header when exceeded.
 */
export function rateLimit(options: RateLimitOptions = {}): Guard {
	const points = options.points ?? 60;
	const windowMs = (options.windowSeconds ?? 60) * 1000;

	return (event: RequestEvent) => {
		let key: string;
		if (options.keyGenerator) {
			key = options.keyGenerator(event);
		} else {
			const userId = (event.locals as any)?.user?.id;
			let clientIp = '127.0.0.1';
			try {
				if (typeof event.getClientAddress === 'function') {
					clientIp = event.getClientAddress();
				}
			} catch {
				// Fallback when running in environments without getClientAddress
			}
			const headerIp =
				event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
				event.request.headers.get('x-real-ip');
			const ip = headerIp || clientIp;

			key = userId ? `user:${userId}` : `ip:${ip}`;
		}

		const now = Date.now();
		let bucket = rateLimitStore.get(key);

		if (!bucket || bucket.resetAt <= now) {
			bucket = { tokens: points - 1, resetAt: now + windowMs };
			rateLimitStore.set(key, bucket);
			return;
		}

		if (bucket.tokens <= 0) {
			const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
			return problemResponse({
				status: 429,
				title: 'Too Many Requests',
				detail: options.detail || `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
				type: 'https://yaxa.dev/errors/rate-limit-exceeded',
				headers: {
					'Retry-After': String(retryAfterSeconds),
					'X-RateLimit-Limit': String(points),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000))
				}
			});
		}

		bucket.tokens -= 1;
	};
}

/**
 * Combines multiple guards into a single composite guard.
 */
export function composeGuards(...guards: Guard[]): Guard {
	return async (event: RequestEvent) => {
		for (const guard of guards) {
			const result = await guard(event);
			if (result) return result;
		}
	};
}
