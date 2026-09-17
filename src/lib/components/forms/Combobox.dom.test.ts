import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import Combobox, { comboboxVariants } from './Combobox.svelte';

const testOptions = [
	{ value: 'svelte', label: 'Svelte 5' },
	{ value: 'react', label: 'React 19' },
	{ value: 'vue', label: 'Vue 3' }
];

describe('Combobox Component (DOM & Interactions)', () => {
	it('computes size and status variant classes', () => {
		expect(comboboxVariants({ size: 'sm' })).toContain('h-9');
		expect(comboboxVariants({ size: 'md' })).toContain('h-10');
		expect(comboboxVariants({ size: 'lg' })).toContain('h-12');
		expect(comboboxVariants({ status: 'error' })).toContain('border-rose-500');
	});

	it('renders placeholder when value is empty', () => {
		const { target, cleanup } = renderComponent(Combobox, {
			options: testOptions,
			placeholder: 'Choose framework...'
		});

		expect(target.textContent).toContain('Choose framework...');
		cleanup();
	});

	it('renders selected option label when bound value matches', () => {
		const { target, cleanup } = renderComponent(Combobox, {
			options: testOptions,
			value: 'svelte'
		});

		expect(target.textContent).toContain('Svelte 5');
		cleanup();
	});
});
