import { describe, it, expect } from 'vitest';
import AuthCard from './AuthCard.svelte';
import SignInCard from './SignInCard.svelte';
import SignUpCard from './SignUpCard.svelte';
import ResetPasswordCard from './ResetPasswordCard.svelte';
import { renderComponent } from '#lib/testing/index.js';

describe('Turnkey Auth Suite Components', () => {
	it('exports all auth card component definitions', () => {
		expect(AuthCard).toBeDefined();
		expect(SignInCard).toBeDefined();
		expect(SignUpCard).toBeDefined();
		expect(ResetPasswordCard).toBeDefined();
	});

	it('renders SignInCard with sign-in fields and action buttons', () => {
		const { cleanup, target } = renderComponent(SignInCard, {
			title: 'Welcome Back',
			showSocial: true
		});

		expect(target.textContent).toContain('Welcome Back');
		expect(target.textContent).toContain('Sign in');
		expect(target.textContent).toContain('GitHub');
		expect(target.textContent).toContain('Google');

		cleanup();
	});

	it('renders SignUpCard with sign-up heading and register button', () => {
		const { cleanup, target } = renderComponent(SignUpCard, {
			title: 'Create Your Account'
		});

		expect(target.textContent).toContain('Create Your Account');
		expect(target.textContent).toContain('Create Account');

		cleanup();
	});

	it('renders ResetPasswordCard with password recovery UI', () => {
		const { cleanup, target } = renderComponent(ResetPasswordCard, {
			title: 'Reset Password',
			resetToken: 'test-token-123'
		});

		expect(target.textContent).toContain('Reset Password');
		expect(target.textContent).toContain('Confirm New Password');

		cleanup();
	});
});
