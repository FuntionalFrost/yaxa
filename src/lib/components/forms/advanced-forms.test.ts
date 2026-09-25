import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import RichTextEditor from './RichTextEditor.svelte';
import PhoneInput, { COUNTRIES } from './PhoneInput.svelte';
import CreditCardInput, { detectCardBrand } from './CreditCardInput.svelte';

describe('Advanced Form Input Components', () => {
	it('should export all advanced form component definitions', () => {
		expect(RichTextEditor).toBeDefined();
		expect(PhoneInput).toBeDefined();
		expect(CreditCardInput).toBeDefined();
	});

	it('should correctly detect card brands from number prefix', () => {
		expect(detectCardBrand('4242 4242 4242 4242')).toBe('visa');
		expect(detectCardBrand('5500 0000 0000 0000')).toBe('mastercard');
		expect(detectCardBrand('3782 822463 10005')).toBe('amex');
		expect(detectCardBrand('6011 0000 0000 0000')).toBe('discover');
		expect(detectCardBrand('9999 0000 0000 0000')).toBe('generic');
	});

	it('should provide default international countries list', () => {
		expect(COUNTRIES.length).toBeGreaterThan(5);
		const us = COUNTRIES.find((c) => c.code === 'US');
		expect(us?.dialCode).toBe('+1');
	});

	it('should render PhoneInput and CreditCardInput properly with DOM bindings', () => {
		const { target: phoneTarget, cleanup: phoneCleanup } = renderComponent(PhoneInput, {
			name: 'userPhone',
			value: '1234567890'
		});
		const phoneInput = phoneTarget.querySelector('input[type="tel"]') as HTMLInputElement;
		expect(phoneInput).toBeDefined();
		expect(phoneInput.value).toBe('1234567890');
		expect(phoneInput.name).toBe('userPhone');
		phoneCleanup();

		const { target: cardTarget, cleanup: cardCleanup } = renderComponent(CreditCardInput, {
			name: 'billingCard',
			cardNumber: '4242 4242 4242 4242'
		});
		const cardInput = cardTarget.querySelector('input[name="billingCard"]') as HTMLInputElement;
		expect(cardInput).toBeDefined();
		expect(cardInput.value).toBe('4242 4242 4242 4242');
		expect(cardTarget.textContent).toContain('VISA');
		cardCleanup();
	});
});
