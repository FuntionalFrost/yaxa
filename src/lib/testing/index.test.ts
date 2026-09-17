import { describe, it, expect } from 'vitest';
import {
	createMockSiteConfig,
	createMockUser,
	createMockAuthSession,
	createTestWrapperProps,
	createMockRequestEvent,
	createMockResend,
	createMockPolarClient,
	createMockToast,
	createMockClipboard,
	renderComponent
} from './index';
import Badge from '../components/elements/Badge.svelte';

describe('Yaxa Testing Utilities', () => {
	it('creates valid mock site config with defaults and overrides', () => {
		const config = createMockSiteConfig({ name: 'Custom App' });
		expect(config.name).toBe('Custom App');
		expect(config.url).toBe('https://test.local');
		expect(config.theme?.defaultMode).toBe('system');
	});

	it('creates valid mock user context', () => {
		const user = createMockUser({ role: 'admin', plan: 'enterprise' });
		expect(user.id).toBe('usr_test_123');
		expect(user.role).toBe('admin');
		expect(user.plan).toBe('enterprise');
		expect(user.isSubscribed).toBe(true);
	});

	it('creates valid mock auth session with multi-tenant org support', () => {
		const sessionData = createMockAuthSession({
			orgId: 'org_acme_456',
			orgName: 'Acme International',
			role: 'owner',
			plan: 'scale'
		});

		expect(sessionData.user.id).toBe('usr_test_123');
		expect(sessionData.session.activeOrganizationId).toBe('org_acme_456');
		expect(sessionData.activeOrganization?.name).toBe('Acme International');
		expect(sessionData.activeOrganization?.slug).toBe('acme-international');
		expect(sessionData.activeOrganization?.role).toBe('owner');
	});

	it('creates test wrapper props bundle', () => {
		const props = createTestWrapperProps({
			config: { name: 'Wrapper Test' },
			user: { email: 'admin@test.com' },
			theme: 'light'
		});

		expect(props.config.name).toBe('Wrapper Test');
		expect(props.user?.email).toBe('admin@test.com');
		expect(props.theme).toBe('light');
	});

	it('creates typed mock RequestEvent for SvelteKit server tests', async () => {
		const event = createMockRequestEvent({
			url: 'https://app.yaxa.dev/api/webhook?source=test',
			method: 'POST',
			body: { event: 'user.created', id: '123' },
			headers: { 'x-signature': 'sig_mock_abc' },
			cookies: { session_token: 'tok_xyz' }
		});

		expect(event.url.pathname).toBe('/api/webhook');
		expect(event.url.searchParams.get('source')).toBe('test');
		expect(event.request.method).toBe('POST');
		expect(event.request.headers.get('x-signature')).toBe('sig_mock_abc');
		expect(event.cookies.get('session_token')).toBe('tok_xyz');

		const body = await event.request.json();
		expect(body.event).toBe('user.created');
	});

	it('provides in-memory mock Resend email client', async () => {
		const resend = createMockResend();
		const result = await resend.emails.send({
			from: 'onboarding@yaxa.dev',
			to: 'customer@example.com',
			subject: 'Welcome to Yaxa',
			html: '<p>Welcome</p>'
		});

		expect(result.data?.id).toContain('mock_resend');
		expect(resend.sentEmails.length).toBe(1);
		expect(resend.sentEmails[0].to).toBe('customer@example.com');

		resend.clear();
		expect(resend.sentEmails.length).toBe(0);
	});

	it('provides in-memory mock Polar billing client', async () => {
		const polar = createMockPolarClient();
		const checkout = await polar.checkouts.custom.create({
			productId: 'prod_pro_plan',
			successUrl: 'https://yaxa.dev/success'
		});

		expect(checkout.id).toContain('chk_mock');
		expect(checkout.url).toContain('https://polar.sh/checkout/');
		expect(polar.createdCheckouts.length).toBe(1);

		const portal = await polar.customerSessions.create({ customerId: 'cust_999' });
		expect(portal.customerPortalUrl).toBe('https://polar.sh/portal/mock_cust_999');
	});

	it('provides in-memory mock Toast tracker', () => {
		const toast = createMockToast();
		toast.success('Saved successfully', 'Project created');
		toast.error('Failed to connect');

		expect(toast.logs.length).toBe(2);
		expect(toast.logs[0].type).toBe('success');
		expect(toast.logs[0].title).toBe('Saved successfully');
		expect(toast.logs[1].type).toBe('error');

		toast.clear();
		expect(toast.logs.length).toBe(0);
	});

	it('provides in-memory mock Clipboard', async () => {
		const clipboard = createMockClipboard();
		await clipboard.copy('npx yaxa init');
		expect(clipboard.getText()).toBe('npx yaxa init');

		clipboard.clear();
		expect(clipboard.getText()).toBe('');
	});

	it('mounts and cleans up Svelte 5 component with renderComponent', () => {
		const { target, cleanup } = renderComponent(Badge, {
			color: 'primary',
			variant: 'subtle',
			size: 'md'
		});

		const badgeElement = target.querySelector('span');
		expect(badgeElement).toBeDefined();
		expect(badgeElement?.className).toContain('bg-primary-50');

		cleanup();
		expect(target.parentElement).toBeNull();
	});
});
