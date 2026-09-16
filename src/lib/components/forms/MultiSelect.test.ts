import { describe, it, expect } from 'vitest';
import { multiSelectVariants } from './MultiSelect.svelte';

describe('MultiSelect Component', () => {
	it('generates default variant classes', () => {
		const classes = multiSelectVariants();
		expect(classes).toContain('min-h-[40px]');
		expect(classes).toContain('border-neutral-300');
	});

	it('supports size and status variants', () => {
		const smClasses = multiSelectVariants({ size: 'sm', status: 'error' });
		expect(smClasses).toContain('min-h-[36px]');
		expect(smClasses).toContain('border-rose-500');

		const lgClasses = multiSelectVariants({ size: 'lg' });
		expect(lgClasses).toContain('min-h-[48px]');
	});
});
