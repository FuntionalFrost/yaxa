import { describe, it, expect, vi } from 'vitest';
import { createYaxaAuthHook } from './hook';

describe('createYaxaAuthHook', () => {
	const mockAuth = {
		handler: vi.fn(() => new Response('auth handler response')),
		api: {
			getSession: vi.fn()
		}
	};

	it('routes /api/auth/* requests directly to Better-Auth handler', async () => {
		const hook = createYaxaAuthHook({ auth: mockAuth as any });
		const event = {
			url: new URL('https://example.com/api/auth/sign-in'),
			request: new Request('https://example.com/api/auth/sign-in'),
			locals: {}
		};
		const resolve = vi.fn();

		const response = await hook({ event: event as any, resolve });
		expect(mockAuth.handler).toHaveBeenCalledWith(event.request);
		expect(await response.text()).toBe('auth handler response');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('allows public routes and resolves successfully', async () => {
		mockAuth.api.getSession.mockResolvedValueOnce(null);
		const hook = createYaxaAuthHook({ auth: mockAuth as any });
		const event = {
			url: new URL('https://example.com/'),
			request: new Request('https://example.com/'),
			locals: {}
		};
		const resolve = vi.fn().mockResolvedValue(new Response('home page'));

		const response = await hook({ event: event as any, resolve });
		expect(resolve).toHaveBeenCalledWith(event);
		expect((event.locals as any).user).toBeNull();
		expect(await response.text()).toBe('home page');
	});

	it('throws 303 redirect when unauthenticated user accesses protected path', async () => {
		mockAuth.api.getSession.mockResolvedValueOnce(null);
		const hook = createYaxaAuthHook({
			auth: mockAuth as any,
			protectedPaths: ['/dashboard'],
			loginPath: '/auth/login'
		});
		const event = {
			url: new URL('https://example.com/dashboard/billing?tab=invoices'),
			request: new Request('https://example.com/dashboard/billing?tab=invoices'),
			locals: {}
		};
		const resolve = vi.fn();

		try {
			await hook({ event: event as any, resolve });
			expect.unreachable('Should have thrown redirect');
		} catch (err: any) {
			expect(err.status).toBe(303);
			expect(err.location).toBe('/auth/login?returnTo=%2Fdashboard%2Fbilling%3Ftab%3Dinvoices');
		}
	});

	it('allows access to protected path when user is authenticated', async () => {
		const mockUser = { id: 'user-123', email: 'user@example.com' };
		const mockSession = { id: 'session-456' };
		mockAuth.api.getSession.mockResolvedValueOnce({
			user: mockUser,
			session: mockSession
		});

		const hook = createYaxaAuthHook({
			auth: mockAuth as any,
			protectedPaths: ['/dashboard']
		});
		const event = {
			url: new URL('https://example.com/dashboard'),
			request: new Request('https://example.com/dashboard'),
			locals: {}
		};
		const resolve = vi.fn().mockResolvedValue(new Response('dashboard content'));

		const response = await hook({ event: event as any, resolve });
		expect((event.locals as any).user).toEqual(mockUser);
		expect((event.locals as any).session).toEqual(mockSession);
		expect(resolve).toHaveBeenCalled();
		expect(await response.text()).toBe('dashboard content');
	});
});
