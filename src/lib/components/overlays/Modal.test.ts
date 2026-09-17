import { describe, it, expect } from 'vitest';
import { modalVariants } from './Modal.svelte';

describe('Modal Component', () => {
	it('generates default modal dialog classes', () => {
		const classes = modalVariants();
		expect(classes).toContain('fixed');
		expect(classes).toContain('left-1/2');
		expect(classes).toContain('top-1/2');
		expect(classes).toContain('max-w-lg');
		expect(classes).toContain('rounded-2xl');
		expect(classes).toContain('shadow-2xl');
	});

	it('supports size variations (sm, md, lg, xl, full)', () => {
		const sm = modalVariants({ size: 'sm' });
		expect(sm).toContain('max-w-sm');

		const lg = modalVariants({ size: 'lg' });
		expect(lg).toContain('max-w-2xl');

		const xl = modalVariants({ size: 'xl' });
		expect(xl).toContain('max-w-4xl');

		const full = modalVariants({ size: 'full' });
		expect(full).toContain('max-w-[calc(100vw-2rem)]');
	});
});
