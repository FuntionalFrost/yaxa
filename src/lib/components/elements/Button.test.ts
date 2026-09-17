import { describe, it, expect } from 'vitest';
import { buttonVariants } from './Button.svelte';

describe('Button Component', () => {
	it('generates solid primary button classes by default', () => {
		const classes = buttonVariants({ variant: 'solid', color: 'primary' });
		expect(classes).toContain('bg-primary-600');
		expect(classes).toContain('inline-flex');
		expect(classes).toContain('select-none');
	});

	it('supports multiple variants: outline, ghost, soft, subtle, link', () => {
		const outline = buttonVariants({ variant: 'outline', color: 'neutral' });
		expect(outline).toContain('border');
		expect(outline).toContain('bg-transparent');

		const ghost = buttonVariants({ variant: 'ghost', color: 'error' });
		expect(ghost).toContain('bg-transparent');

		const link = buttonVariants({ variant: 'link' });
		expect(link).toContain('underline-offset-4');
	});

	it('supports size scales and square/block modifiers', () => {
		const xs = buttonVariants({ size: 'xs' });
		expect(xs).toContain('text-xs');
		expect(xs).toContain('px-2');

		const xl = buttonVariants({ size: 'xl' });
		expect(xl).toContain('text-base');
		expect(xl).toContain('px-5');

		const block = buttonVariants({ block: true });
		expect(block).toContain('w-full');

		const square = buttonVariants({ square: true });
		expect(square).toContain('aspect-square');
	});

	it('applies compound color classes for success, warning, and error', () => {
		const success = buttonVariants({ variant: 'solid', color: 'success' });
		expect(success).toContain('bg-emerald-600');

		const warning = buttonVariants({ variant: 'solid', color: 'warning' });
		expect(warning).toContain('bg-amber-600');

		const error = buttonVariants({ variant: 'solid', color: 'error' });
		expect(error).toContain('bg-rose-600');
	});
});
