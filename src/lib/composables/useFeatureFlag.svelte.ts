import { SvelteMap } from 'svelte/reactivity';
import type { AuthUserContext } from '../site/context';

export interface FeatureFlagConfig {
	/**
	 * Master enable switch for this flag.
	 * @default true when targeting rules are present, otherwise false
	 */
	enabled?: boolean;
	/**
	 * Default state when no override or targeting rule matches.
	 * @default false
	 */
	defaultValue?: boolean;
	/**
	 * Human-readable description shown in `<DevSandbox />`.
	 */
	description?: string;
	/**
	 * Deterministic percentage rollout (`0` to `100`) hashed against `user.id` or `user.email`.
	 */
	rolloutPercentage?: number;
	/**
	 * Enable automatically for specific subscription plans (e.g. `['pro', 'enterprise']`).
	 */
	allowedPlans?: string[];
	/**
	 * Enable automatically for specific roles (e.g. `['admin', 'beta']`).
	 */
	allowedRoles?: string[];
	/**
	 * Enable automatically for specific user IDs or emails.
	 */
	allowedUsers?: string[];
}

export type FeatureFlagInput = boolean | FeatureFlagConfig;

const STORAGE_KEY = 'yaxa-feature-flags';

const flagRegistry = new SvelteMap<string, FeatureFlagConfig>();
const flagOverrides = new SvelteMap<string, boolean>();

let hydratedFromStorage = false;

function hydrateOverridesOnce() {
	if (hydratedFromStorage || typeof window === 'undefined') return;
	hydratedFromStorage = true;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			for (const [k, v] of Object.entries(parsed)) {
				if (typeof v === 'boolean') {
					flagOverrides.set(k, v);
				}
			}
		}
	} catch {
		// Ignore storage access errors
	}
}

function persistOverrides() {
	if (typeof window === 'undefined') return;
	try {
		const obj: Record<string, boolean> = {};
		for (const [k, v] of flagOverrides.entries()) {
			obj[k] = v;
		}
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	} catch {
		// Ignore storage errors
	}
}

/**
 * Deterministic 32-bit FNV-1a hash returning a bucket from `0` to `99` inclusive.
 */
export function computeRolloutBucket(flagKey: string, identifier: string): number {
	const input = `${flagKey}:${identifier}`;
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0) % 100;
}

/**
 * Evaluates a feature flag given its key, optional user context, and registered config.
 */
export function evaluateFeatureFlag(
	key: string,
	user?: AuthUserContext | null,
	fallbackDefault = false
): boolean {
	hydrateOverridesOnce();

	if (flagOverrides.has(key)) {
		return Boolean(flagOverrides.get(key));
	}

	const config = flagRegistry.get(key);
	if (!config) {
		return fallbackDefault;
	}

	if (config.enabled === false) {
		return false;
	}

	if (user && config.allowedUsers && config.allowedUsers.length > 0) {
		const idMatch = Boolean(user.id && config.allowedUsers.includes(user.id));
		const emailMatch = Boolean(user.email && config.allowedUsers.includes(user.email));
		if (idMatch || emailMatch) return true;
	}

	const hasRoleRule = Boolean(config.allowedRoles && config.allowedRoles.length > 0);
	const hasPlanRule = Boolean(config.allowedPlans && config.allowedPlans.length > 0);

	if (hasRoleRule || hasPlanRule) {
		if (!user) return false;

		if (hasRoleRule && config.allowedRoles) {
			const lowerRole = (user.role ?? '').toLowerCase();
			if (!lowerRole || !config.allowedRoles.some((r) => r.toLowerCase() === lowerRole)) {
				return false;
			}
		}

		if (hasPlanRule && config.allowedPlans) {
			const userPlan = ((user.plan as string) ?? (user.tier as string) ?? '').toLowerCase();
			if (!userPlan || !config.allowedPlans.some((p) => p.toLowerCase() === userPlan)) {
				return false;
			}
		}

		if (typeof config.rolloutPercentage !== 'number') {
			return config.enabled ?? config.defaultValue ?? true;
		}
	} else if (config.allowedUsers && config.allowedUsers.length > 0) {
		// Had allowedUsers rule but user didn't match it
		if (typeof config.rolloutPercentage !== 'number') {
			return config.defaultValue ?? fallbackDefault;
		}
	}

	if (typeof config.rolloutPercentage === 'number') {
		if (config.rolloutPercentage <= 0) return false;
		if (config.rolloutPercentage >= 100) return true;
		const identifier = user?.id || user?.email || 'anonymous';
		const bucket = computeRolloutBucket(key, identifier);
		return bucket < config.rolloutPercentage;
	}

	return config.enabled ?? config.defaultValue ?? fallbackDefault;
}

/**
 * Registers typed feature flags for the application and returns a reactive evaluator.
 */
export function defineFlags<T extends Record<string, FeatureFlagInput>>(definitions: T) {
	for (const [key, def] of Object.entries(definitions)) {
		const normalized: FeatureFlagConfig =
			typeof def === 'boolean' ? { defaultValue: def } : { ...def };
		flagRegistry.set(key, normalized);
	}

	return {
		definitions,
		isEnabled: (key: keyof T & string, user?: AuthUserContext | null): boolean =>
			evaluateFeatureFlag(key, user),
		setOverride: (key: keyof T & string, value: boolean | null) =>
			setFeatureFlagOverride(key, value),
		clearOverrides: () => clearFeatureFlagOverrides()
	};
}

/**
 * Sets or clears (`null`) a runtime/localStorage override for a feature flag.
 */
export function setFeatureFlagOverride(key: string, value: boolean | null): void {
	hydrateOverridesOnce();
	if (value === null) {
		flagOverrides.delete(key);
	} else {
		flagOverrides.set(key, value);
	}
	persistOverrides();
}

/**
 * Clears all local feature flag overrides.
 */
export function clearFeatureFlagOverrides(): void {
	flagOverrides.clear();
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignore
		}
	}
}

export interface RegisteredFlagSnapshot {
	key: string;
	config: FeatureFlagConfig;
	override: boolean | null;
	effective: boolean;
}

/**
 * Returns reactive snapshots of all registered feature flags (used by `<DevSandbox />`).
 */
export function getRegisteredFlags(user?: AuthUserContext | null): RegisteredFlagSnapshot[] {
	hydrateOverridesOnce();
	const keys = Array.from(flagRegistry.keys());
	for (const k of flagOverrides.keys()) {
		if (!keys.includes(k)) {
			keys.push(k);
		}
	}
	return keys.map((key) => ({
		key,
		config: flagRegistry.get(key) ?? { defaultValue: false },
		override: flagOverrides.has(key) ? Boolean(flagOverrides.get(key)) : null,
		effective: evaluateFeatureFlag(key, user)
	}));
}

export interface UseFeatureFlagOptions {
	defaultValue?: boolean;
	description?: string;
	user?: AuthUserContext | null;
}

/**
 * Reactive Svelte 5 rune composable for reading and toggling a feature flag.
 */
export function useFeatureFlag(key: string, options: UseFeatureFlagOptions = {}) {
	if (!flagRegistry.has(key) && (options.defaultValue !== undefined || options.description)) {
		flagRegistry.set(key, {
			defaultValue: options.defaultValue ?? false,
			description: options.description
		});
	}

	const enabled = $derived(evaluateFeatureFlag(key, options.user, options.defaultValue ?? false));
	const isOverridden = $derived(flagOverrides.has(key));
	const overrideValue = $derived(flagOverrides.get(key) ?? null);

	return {
		get key() {
			return key;
		},
		get enabled() {
			return enabled;
		},
		get isOverridden() {
			return isOverridden;
		},
		get overrideValue() {
			return overrideValue;
		},
		setOverride(value: boolean | null) {
			setFeatureFlagOverride(key, value);
		},
		toggle() {
			setFeatureFlagOverride(key, !enabled);
		}
	};
}
