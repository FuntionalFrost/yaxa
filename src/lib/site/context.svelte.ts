import { createContext } from 'svelte';
import { type SiteConfig, DEFAULT_SITE_CONFIG } from './config';

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

/**
 * SSR-safe, reactive state container for site configuration and authenticated user.
 */
export class YaxaState {
	#configGetter: () => SiteConfig;
	#userGetter: () => AuthUserContext | null;

	constructor(
		configGetter: () => SiteConfig = () => DEFAULT_SITE_CONFIG,
		userGetter: () => AuthUserContext | null = () => null
	) {
		this.#configGetter = configGetter;
		this.#userGetter = userGetter;
	}

	get config(): SiteConfig {
		return this.#configGetter() ?? DEFAULT_SITE_CONFIG;
	}

	get user(): AuthUserContext | null {
		return this.#userGetter() ?? null;
	}
}

const [getYaxaContext, setYaxaContext] = createContext<YaxaState>();

/**
 * Initializes and binds the reactive YaxaState instance to the current Svelte component tree context.
 * Typically invoked at root inside <YaxaApp />.
 */
export function initYaxaState(
	configGetter: () => SiteConfig = () => DEFAULT_SITE_CONFIG,
	userGetter: () => AuthUserContext | null = () => null
): YaxaState {
	const state = new YaxaState(configGetter, userGetter);
	setYaxaContext(state);
	return state;
}

/**
 * Accesses the reactive YaxaState from context in any descendant Svelte 5 component.
 */
export function useYaxa(): YaxaState {
	try {
		return getYaxaContext() ?? new YaxaState();
	} catch {
		return new YaxaState();
	}
}

/**
 * Convenience rune composable to directly access the current reactive SiteConfig.
 */
export function useSiteConfig(): SiteConfig {
	return useYaxa().config;
}

/**
 * Convenience rune composable to directly access the current authenticated user.
 */
export function useAuthUser(): AuthUserContext | null {
	return useYaxa().user;
}
