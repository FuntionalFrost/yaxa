import { getAuthUserContext, type AuthUserContext } from '$lib/site/context';

export interface UseGateOptions {
	/** Explicit user object to override Svelte context */
	user?: AuthUserContext | null;
	/** Custom tier hierarchy order */
	plansOrder?: string[];
	/** Whether users with role 'admin' automatically bypass gating (default true) */
	allowAdminBypass?: boolean;
}

/**
 * Creates a reactive Svelte 5 Rune composable for declarative or programmatic permission & plan gating.
 * Automatically falls back to user from Svelte context (<YaxaApp user={data.user} />).
 */
export function useGate(options: UseGateOptions = {}) {
	const plansOrder = options.plansOrder ?? ['free', 'starter', 'pro', 'business', 'enterprise'];
	const allowAdminBypass = options.allowAdminBypass ?? true;

	const currentUser = $derived(options.user !== undefined ? options.user : getAuthUserContext());
	const currentRole = $derived(currentUser?.role ?? null);
	const currentPlan = $derived(
		(currentUser?.plan as string) ?? (currentUser?.tier as string) ?? 'free'
	);
	const isAdmin = $derived(
		allowAdminBypass && typeof currentRole === 'string' && currentRole.toLowerCase() === 'admin'
	);

	function allowsPlan(requiredPlan: string | string[]): boolean {
		if (isAdmin) return true;
		const plan = (currentPlan ?? 'free').toLowerCase();

		if (Array.isArray(requiredPlan)) {
			return requiredPlan.map((p) => p.toLowerCase()).includes(plan);
		}

		const req = requiredPlan.toLowerCase();
		const order = plansOrder.map((p) => p.toLowerCase());
		const currentIndex = order.indexOf(plan);
		const reqIndex = order.indexOf(req);

		if (currentIndex !== -1 && reqIndex !== -1) {
			return currentIndex >= reqIndex;
		}

		return plan === req;
	}

	function hasRole(requiredRole: string | string[]): boolean {
		if (isAdmin) return true;
		const role = (currentRole ?? '').toLowerCase();

		if (Array.isArray(requiredRole)) {
			return requiredRole.map((r) => r.toLowerCase()).includes(role);
		}

		return role === requiredRole.toLowerCase();
	}

	function can(predicate: (user: AuthUserContext | null) => boolean): boolean {
		if (isAdmin) return true;
		return predicate(currentUser);
	}

	return {
		get user() {
			return currentUser;
		},
		get role() {
			return currentRole;
		},
		get plan() {
			return currentPlan;
		},
		get isAdmin() {
			return isAdmin;
		},
		allows: allowsPlan,
		allowsPlan,
		hasRole,
		can
	};
}
