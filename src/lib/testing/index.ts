import { mount, unmount, flushSync, type Component } from 'svelte';
import type { RequestEvent } from '@sveltejs/kit';
import { defineSiteConfig, type SiteConfig } from '../site/config';
import type { AuthUserContext } from '../site/context';
import type { ThemeMode } from '../theme/theme.svelte';

export interface YaxaTestOptions {
	config?: Partial<SiteConfig>;
	user?: Partial<AuthUserContext> | null;
	theme?: ThemeMode;
}

/**
 * Creates a fully valid mocked SiteConfig for unit and integration testing.
 */
export function createMockSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
	return defineSiteConfig({
		name: overrides.name || 'Test App',
		title: overrides.title || 'Test App Title',
		description: overrides.description || 'Test App Description',
		url: overrides.url || 'https://test.local',
		email: overrides.email || 'test@local.dev',
		...overrides
	});
}

/**
 * Creates a mocked authenticated user context for unit tests.
 */
export function createMockUser(overrides: Partial<AuthUserContext> = {}): AuthUserContext {
	return {
		id: overrides.id || 'usr_test_123',
		name: overrides.name || 'Test User',
		email: overrides.email || 'testuser@local.dev',
		role: overrides.role || 'user',
		plan: overrides.plan || 'pro',
		isSubscribed: overrides.isSubscribed ?? true,
		...overrides
	};
}

/**
 * Creates a mocked Better-Auth multi-tenant session object for auth hook and server tests.
 */
export function createMockAuthSession(
	overrides: {
		userId?: string;
		email?: string;
		name?: string;
		role?: string;
		orgId?: string;
		orgName?: string;
		plan?: string;
	} = {}
) {
	const user = {
		id: overrides.userId || 'usr_test_123',
		name: overrides.name || 'Test User',
		email: overrides.email || 'testuser@local.dev',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const session = {
		id: 'sess_test_123',
		userId: user.id,
		expiresAt: new Date(Date.now() + 86400000 * 7),
		token: 'tok_test_mock_123',
		createdAt: new Date(),
		updatedAt: new Date(),
		ipAddress: '127.0.0.1',
		userAgent: 'Mozilla/5.0 (Test Browser)',
		activeOrganizationId: overrides.orgId || 'org_test_123'
	};

	const activeOrganization = overrides.orgId
		? {
				id: overrides.orgId,
				name: overrides.orgName || 'Acme Corp',
				slug: (overrides.orgName || 'Acme Corp').toLowerCase().replace(/\s+/g, '-'),
				plan: overrides.plan || 'enterprise',
				role: overrides.role || 'admin'
			}
		: null;

	return {
		user,
		session,
		activeOrganization
	};
}

/**
 * Prepares default mock contexts and props for testing Yaxa-wrapped components.
 */
export function createTestWrapperProps(options: YaxaTestOptions = {}) {
	const config = createMockSiteConfig(options.config);
	const user = options.user ? createMockUser(options.user) : null;
	const theme = options.theme || 'dark';

	return {
		config,
		user,
		theme
	};
}

export interface RenderComponentOptions {
	target?: HTMLElement;
	context?: Map<any, any>;
}

export interface RenderResult<I extends Record<string, any>> {
	target: HTMLElement;
	instance: I;
	cleanup: () => void;
}

/**
 * Idiomatic native Svelte 5 DOM component renderer.
 * Mounts the component, flushes microtasks, and provides a teardown cleanup function.
 */
export function renderComponent<
	P extends Record<string, any>,
	I extends Record<string, any> = Record<string, any>
>(ComponentClass: Component<P>, props?: P, options: RenderComponentOptions = {}): RenderResult<I> {
	const target = options.target ?? document.createElement('div');
	if (!target.parentElement && typeof document !== 'undefined') {
		document.body.appendChild(target);
	}

	const instance = mount(ComponentClass as any, {
		target,
		props: (props || {}) as any,
		context: options.context
	}) as unknown as I;

	flushSync();

	return {
		target,
		instance,
		cleanup: () => {
			unmount(instance as any);
			if (target.parentElement) {
				target.remove();
			}
		}
	};
}

export interface MockRequestEventOptions {
	url?: string | URL;
	method?: string;
	headers?: Record<string, string>;
	body?: any;
	params?: Record<string, string>;
	locals?: Record<string, any>;
	cookies?: Record<string, string>;
}

/**
 * Creates a mocked typed SvelteKit RequestEvent for unit testing endpoints and server hooks.
 */
export function createMockRequestEvent(options: MockRequestEventOptions = {}): RequestEvent {
	const rawUrl = options.url || 'http://localhost:5173/';
	const url = typeof rawUrl === 'string' ? new URL(rawUrl) : rawUrl;
	const method = options.method || 'GET';
	const headers = new Headers(options.headers || {});

	let bodyContent: BodyInit | null = null;
	if (options.body !== undefined && options.body !== null) {
		if (typeof options.body === 'string') {
			bodyContent = options.body;
		} else {
			bodyContent = JSON.stringify(options.body);
			if (!headers.has('content-type')) {
				headers.set('content-type', 'application/json');
			}
		}
	}

	const request = new Request(url.toString(), {
		method,
		headers,
		body: method !== 'GET' && method !== 'HEAD' ? bodyContent : undefined
	});

	const cookieStore = new Map<string, string>(Object.entries(options.cookies || {}));

	const cookies = {
		get: (name: string) => cookieStore.get(name),
		getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
		set: (name: string, value: string) => {
			cookieStore.set(name, value);
		},
		delete: (name: string) => {
			cookieStore.delete(name);
		},
		serialize: (name: string, value: string) => `${name}=${value}; Path=/`
	};

	const locals = (options.locals || {}) as App.Locals;
	const params = options.params || {};

	return {
		cookies: cookies as any,
		fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
		getClientAddress: () => '127.0.0.1',
		locals,
		params,
		platform: undefined,
		request,
		route: { id: url.pathname as any },
		setHeaders: (newHeaders: Record<string, string>) => {
			for (const [k, v] of Object.entries(newHeaders)) {
				headers.set(k, v);
			}
		},
		url,
		isDataRequest: false,
		isSubRequest: false
	} as unknown as RequestEvent;
}

/**
 * In-memory Mock Resend Email Client for testing email workflows offline.
 */
export function createMockResend() {
	const sentEmails: Array<{
		from: string;
		to: string | string[];
		subject: string;
		html?: string;
		text?: string;
	}> = [];

	return {
		sentEmails,
		emails: {
			send: async (payload: {
				from: string;
				to: string | string[];
				subject: string;
				html?: string;
				text?: string;
			}) => {
				sentEmails.push(payload);
				return {
					data: { id: `mock_resend_${Date.now()}_${sentEmails.length}` },
					error: null
				};
			}
		},
		clear: () => {
			sentEmails.length = 0;
		}
	};
}

/**
 * In-memory Mock Polar Client for testing subscription and billing flows offline.
 */
export function createMockPolarClient() {
	const createdCheckouts: any[] = [];

	return {
		createdCheckouts,
		checkouts: {
			custom: {
				create: async (params: any) => {
					const checkout = {
						id: `chk_mock_${Date.now()}`,
						url: `https://polar.sh/checkout/mock_${Date.now()}`,
						...params
					};
					createdCheckouts.push(checkout);
					return checkout;
				}
			}
		},
		customerSessions: {
			create: async (params: any) => {
				return {
					id: `cs_mock_${Date.now()}`,
					customerPortalUrl: `https://polar.sh/portal/mock_${params.customerId || 'cust_123'}`
				};
			}
		}
	};
}

/**
 * In-memory Mock Toast tracker for testing UI notification feedback.
 */
export function createMockToast() {
	const logs: Array<{ type: string; title: string; description?: string }> = [];

	return {
		logs,
		success: (title: string, description?: string) =>
			logs.push({ type: 'success', title, description }),
		error: (title: string, description?: string) =>
			logs.push({ type: 'error', title, description }),
		info: (title: string, description?: string) => logs.push({ type: 'info', title, description }),
		warning: (title: string, description?: string) =>
			logs.push({ type: 'warning', title, description }),
		clear: () => {
			logs.length = 0;
		}
	};
}

/**
 * In-memory Mock Clipboard for headless testing.
 */
export function createMockClipboard() {
	let clipboardText = '';

	return {
		copy: async (text: string) => {
			clipboardText = text;
			return true;
		},
		getText: () => clipboardText,
		clear: () => {
			clipboardText = '';
		}
	};
}
