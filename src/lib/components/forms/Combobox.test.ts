import { describe, it, expect } from 'vitest';
import { comboboxVariants } from './Combobox.svelte';

describe('Combobox Component', () => {
	it('generates default variant classes', () => {
		const classes = comboboxVariants();
		expect(classes).toContain('h-10');
		expect(classes).toContain('border-neutral-300');
	});

	it('supports different sizes and error status', () => {
		const smClasses = comboboxVariants({ size: 'sm', status: 'error' });
		expect(smClasses).toContain('h-9');
		expect(smClasses).toContain('border-rose-500');

		const lgClasses = comboboxVariants({ size: 'lg' });
		expect(lgClasses).toContain('h-12');
	});
});
