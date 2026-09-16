import { describe, it, expect } from 'vitest';
import { treeVariants } from './Tree.svelte';

describe('Tree Component', () => {
	it('generates default variant classes', () => {
		const classes = treeVariants();
		expect(classes).toContain('w-full');
		expect(classes).toContain('text-xs');
	});

	it('supports size variants', () => {
		const mdClasses = treeVariants({ size: 'md' });
		expect(mdClasses).toContain('text-sm');
	});
});
