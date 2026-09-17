<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { AuthUserContext } from '$lib/site/context';

	export interface GateProps {
		/** Required subscription plan tier or array of allowed plan tiers (e.g. 'pro', ['pro', 'enterprise']) */
		requiredPlan?: string | string[];
		/** Required user role or array of allowed roles (e.g. 'admin', ['admin', 'manager']) */
		requiredRole?: string | string[];
		/** Custom tier hierarchy order for numeric tier comparison */
		plansOrder?: string[];
		/** Explicit user plan, defaults to context user plan/tier or 'free' */
		userPlan?: string | null;
		/** Explicit user role, defaults to context user role */
		userRole?: string | null;
		/** Explicit user object overriding Svelte context */
		user?: AuthUserContext | null;
		/** Whether users with role 'admin' automatically bypass gating (default true) */
		allowAdminBypass?: boolean;
		/** Optional custom predicate function */
		customCheck?: (user: AuthUserContext | null) => boolean;
		/** If true, renders blurred children with an upgrade overlay instead of hiding completely */
		preview?: boolean;
		/** Destination URL for upgrade CTA button */
		upgradeUrl?: string;
		/** Heading title for preview overlay */
		upgradeTitle?: string;
		/** Description message for preview overlay */
		upgradeMessage?: string;
		/** Optional custom class for the preview wrapper */
		class?: string;
		/** Content to render when access is granted */
		children?: Snippet;
		/** Custom fallback content when access is denied and preview is false */
		fallback?: Snippet;
	}
</script>

<script lang="ts">
	import { getAuthUserContextGetter } from '$lib/site/context';
	import Icon from '../elements/Icon.svelte';
	import Button from '../elements/Button.svelte';

	const DEFAULT_PLANS_ORDER = ['free', 'starter', 'pro', 'business', 'enterprise'];

	let {
		requiredPlan,
		requiredRole,
		plansOrder = DEFAULT_PLANS_ORDER,
		userPlan,
		userRole,
		user,
		allowAdminBypass = true,
		customCheck,
		preview = false,
		upgradeUrl = '/pricing',
		upgradeTitle = 'Feature Locked',
		upgradeMessage = 'Upgrade your subscription to unlock this feature.',
		class: className = '',
		children,
		fallback
	}: GateProps = $props();

	const getContextUser = getAuthUserContextGetter();
	const effectiveUser = $derived(user ?? getContextUser());
	const effectiveRole = $derived(userRole !== undefined ? userRole : (effectiveUser?.role ?? null));
	const effectivePlan = $derived(
		userPlan !== undefined
			? userPlan
			: ((effectiveUser?.plan as string) ?? (effectiveUser?.tier as string) ?? 'free')
	);

	const isAdmin = $derived(
		allowAdminBypass && typeof effectiveRole === 'string' && effectiveRole.toLowerCase() === 'admin'
	);

	const isPlanAllowed = $derived.by(() => {
		if (!requiredPlan) return true;
		const current = (effectivePlan ?? 'free').toLowerCase();

		if (Array.isArray(requiredPlan)) {
			return requiredPlan.map((p) => p.toLowerCase()).includes(current);
		}

		const req = requiredPlan.toLowerCase();
		const order = plansOrder.map((p) => p.toLowerCase());
		const currentIndex = order.indexOf(current);
		const reqIndex = order.indexOf(req);

		if (currentIndex !== -1 && reqIndex !== -1) {
			return currentIndex >= reqIndex;
		}

		return current === req;
	});

	const isRoleAllowed = $derived.by(() => {
		if (!requiredRole) return true;
		const current = (effectiveRole ?? '').toLowerCase();

		if (Array.isArray(requiredRole)) {
			return requiredRole.map((r) => r.toLowerCase()).includes(current);
		}

		return current === requiredRole.toLowerCase();
	});

	const isCustomAllowed = $derived.by(() => {
		if (!customCheck) return true;
		return customCheck(effectiveUser);
	});

	const hasAccess = $derived(isAdmin || (isPlanAllowed && isRoleAllowed && isCustomAllowed));
</script>

{#if hasAccess}
	{#if children}
		{@render children()}
	{/if}
{:else if preview}
	<div
		class="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 {className}"
	>
		<!-- Blurred disabled preview of children -->
		<div
			class="pointer-events-none max-h-[380px] opacity-40 blur-[3px] transition-all select-none"
			aria-hidden="true"
			tabindex="-1"
		>
			{#if children}
				{@render children()}
			{/if}
		</div>

		<!-- Centered Upgrade Callout Overlay -->
		<div
			class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 p-6 text-center backdrop-blur-xs transition-colors dark:bg-neutral-950/75"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 shadow-xs dark:bg-primary-950/60 dark:text-primary-400"
			>
				<Icon name="lock" class="h-5 w-5" />
			</div>

			<h4 class="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
				{upgradeTitle}
			</h4>

			<p class="mt-1 max-w-sm text-xs text-neutral-600 dark:text-neutral-400">
				{upgradeMessage}
			</p>

			<div class="mt-4 flex items-center gap-3">
				{#if upgradeUrl}
					<Button
						href={upgradeUrl}
						variant="solid"
						color="primary"
						size="sm"
						class="gap-1.5 shadow-sm"
					>
						<Icon name="sparkles" class="h-3.5 w-3.5" />
						<span>Upgrade Plan</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
{:else if fallback}
	{@render fallback()}
{/if}
