import { getContext, setContext } from 'svelte';
import { type SiteConfig, DEFAULT_SITE_CONFIG } from './config';

const YAXA_CONFIG_KEY = Symbol('YAXA_SITE_CONFIG');

/**
 * Sets the reactive site configuration in Svelte 5 context.
 * Typically called at the root inside <YaxaApp config={siteConfig} />.
 */
export function setSiteConfig(config: () => SiteConfig): void {
	setContext(YAXA_CONFIG_KEY, config);
}

/**
 * Retrieves the site configuration getter function from Svelte 5 context.
 * Must be called during component initialization (top-level <script>).
 */
export function getSiteConfigGetter(): () => SiteConfig {
	try {
		const getter = getContext<() => SiteConfig>(YAXA_CONFIG_KEY);
		return getter || (() => DEFAULT_SITE_CONFIG);
	} catch {
		return () => DEFAULT_SITE_CONFIG;
	}
}

/**
 * Retrieves the site configuration from Svelte 5 context.
 * Must be called during component initialization (top-level <script>).
 * Falls back to DEFAULT_SITE_CONFIG if called outside <YaxaApp>.
 */
export function getSiteConfig(): SiteConfig {
	return getSiteConfigGetter()();
}

export interface AuthUserContext {
	id?: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
	plan?: string | null;
	tier?: string | null;
	role?: string | null;
	[key: string]: unknown;
}

const YAXA_USER_KEY = Symbol('YAXA_AUTH_USER');

/**
 * Sets the reactive authenticated user in Svelte 5 context.
 * Typically called at the root inside <YaxaApp user={data.user} />.
 */
export function setAuthUserContext(userGetter: () => AuthUserContext | null | undefined): void {
	setContext(YAXA_USER_KEY, userGetter);
}

/**
 * Retrieves the authenticated user getter function from Svelte 5 context.
 * Must be called during component initialization (top-level <script>).
 */
export function getAuthUserContextGetter(): () => AuthUserContext | null {
	try {
		const getter = getContext<() => AuthUserContext | null | undefined>(YAXA_USER_KEY);
		return () => (getter ? (getter() ?? null) : null);
	} catch {
		return () => null;
	}
}

/**
 * Retrieves the authenticated user from Svelte 5 context.
 * Must be called during component initialization (top-level <script>).
 */
export function getAuthUserContext(): AuthUserContext | null {
	return getAuthUserContextGetter()();
}
