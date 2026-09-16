import { describe, it, expect } from 'vitest';
import { emptyStateVariants } from './EmptyState.svelte';

describe('EmptyState Component', () => {
	it('generates default variant classes', () => {
		const classes = emptyStateVariants();
		expect(classes).toContain('border-dashed');
		expect(classes).toContain('py-10');
	});

	it('supports size and bordered variants', () => {
		const smClasses = emptyStateVariants({ size: 'sm', bordered: false });
		expect(smClasses).toContain('py-6');
		expect(smClasses).toContain('border-0');

		const lgClasses = emptyStateVariants({ size: 'lg' });
		expect(lgClasses).toContain('py-16');
	});
});
