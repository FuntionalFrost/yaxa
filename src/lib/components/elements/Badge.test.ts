import { describe, it, expect } from 'vitest';
import { badgeVariants } from './Badge.svelte';

describe('Badge Component', () => {
	it('generates solid primary badge classes by default', () => {
		const classes = badgeVariants({ variant: 'solid', color: 'primary' });
		expect(classes).toContain('bg-primary-600');
		expect(classes).toContain('inline-flex');
		expect(classes).toContain('font-medium');
	});

	it('supports multiple variants: outline, soft, subtle', () => {
		const outline = badgeVariants({ variant: 'outline', color: 'success' });
		expect(outline).toContain('border');
		expect(outline).toContain('bg-transparent');

		const soft = badgeVariants({ variant: 'soft', color: 'warning' });
		expect(soft).toContain('inline-flex');

		const subtle = badgeVariants({ variant: 'subtle', color: 'error' });
		expect(subtle).toContain('border');
	});

	it('supports size scales (xs, sm, md, lg)', () => {
		const xs = badgeVariants({ size: 'xs' });
		expect(xs).toContain('text-[10px]');
		expect(xs).toContain('px-1.5');

		const lg = badgeVariants({ size: 'lg' });
		expect(lg).toContain('text-sm');
		expect(lg).toContain('px-3');
	});
});
