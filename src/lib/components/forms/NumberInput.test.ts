import { describe, it, expect } from 'vitest';
import { numberInputVariants } from './NumberInput.svelte';

describe('NumberInput Component', () => {
	it('generates default variant classes', () => {
		const classes = numberInputVariants();
		expect(classes).toContain('h-10');
		expect(classes).toContain('border-neutral-300');
	});

	it('supports size and status variants', () => {
		const smClasses = numberInputVariants({ size: 'sm', status: 'error' });
		expect(smClasses).toContain('h-9');
		expect(smClasses).toContain('border-rose-500');

		const lgClasses = numberInputVariants({ size: 'lg' });
		expect(lgClasses).toContain('h-12');
	});
});
