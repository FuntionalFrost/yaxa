import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import InputOTP from './InputOTP.svelte';

describe('InputOTP Component (DOM & Interactions)', () => {
	it('renders specified number of input slots with aria-labels', () => {
		const { target, cleanup } = renderComponent(InputOTP, { length: 6 });
		const inputs = target.querySelectorAll('input');
		expect(inputs.length).toBe(6);
		expect(inputs[0].getAttribute('aria-label')).toBe('Digit 1 of 6');
		expect(inputs[5].getAttribute('aria-label')).toBe('Digit 6 of 6');
		cleanup();
	});

	it('renders separator hyphen at specified index', () => {
		const { target, cleanup } = renderComponent(InputOTP, {
			length: 6,
			separator: true,
			separatorIndex: 3
		});
		const separator = target.querySelector('span');
		expect(separator).toBeDefined();
		expect(separator?.textContent).toContain('−');
		cleanup();
	});

	it('populates slots when bound value is provided', () => {
		const { target, cleanup } = renderComponent(InputOTP, {
			length: 4,
			value: '4281'
		});
		const inputs = target.querySelectorAll('input');
		expect(inputs[0].value).toBe('4');
		expect(inputs[1].value).toBe('2');
		expect(inputs[2].value).toBe('8');
		expect(inputs[3].value).toBe('1');
		cleanup();
	});

	it('handles keyboard typing and updates input slot', () => {
		let updatedCode = '';
		const { target, cleanup } = renderComponent(InputOTP, {
			length: 4,
			onchange: (code) => {
				updatedCode = code;
			}
		});

		const inputs = target.querySelectorAll('input');
		inputs[0].value = '9';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));

		expect(updatedCode).toBe('9');
		cleanup();
	});

	it('disables all input slots when disabled prop is true', () => {
		const { target, cleanup } = renderComponent(InputOTP, {
			length: 4,
			disabled: true
		});
		const inputs = target.querySelectorAll('input');
		inputs.forEach((input) => {
			expect(input.disabled).toBe(true);
		});
		cleanup();
	});
});
