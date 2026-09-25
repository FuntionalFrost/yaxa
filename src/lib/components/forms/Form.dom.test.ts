import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import Form from './Form.svelte';
import FormField from './FormField.svelte';

describe('Form & FormField Components with Context Auto-Wiring', () => {
	it('renders form and field with automatic id and label association', () => {
		const { target, cleanup } = renderComponent(FormField, {
			name: 'username',
			label: 'Username',
			hint: 'Required for login'
		});

		const label = target.querySelector('label');
		expect(label).toBeDefined();
		expect(label?.textContent).toContain('Username');
		expect(label?.getAttribute('for')).toBe('yaxa-field-username');
		expect(target.textContent).toContain('Required for login');

		cleanup();
	});

	it('renders error message and applies error styling', () => {
		const { target, cleanup } = renderComponent(FormField, {
			name: 'email',
			label: 'Email',
			error: 'Invalid email address'
		});

		const errorP = target.querySelector('p');
		expect(errorP).toBeDefined();
		expect(errorP?.textContent).toContain('Invalid email address');

		cleanup();
	});

	it('auto-wires FormField with Superforms contract mock', () => {
		const mockSuperform = {
			errors: {
				subscribe(fn: any) {
					fn({ email: ['Email already taken'] });
					return () => {};
				}
			},
			constraints: {
				subscribe(fn: any) {
					fn({ email: { required: true } });
					return () => {};
				}
			},
			tainted: {
				subscribe(fn: any) {
					fn({ email: true });
					return () => {};
				}
			}
		};

		const { target, cleanup } = renderComponent(Form, {
			superform: mockSuperform,
			errorSummary: true
		});

		// Summary alert should display superform error
		expect(target.textContent).toContain('Email already taken');

		cleanup();
	});
});
