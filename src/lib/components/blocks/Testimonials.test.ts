import { describe, it, expect } from 'vitest';
import { testimonialsVariants } from './Testimonials.svelte';

describe('Testimonials Block', () => {
	it('generates default variant classes', () => {
		const classes = testimonialsVariants();
		expect(classes).toContain('w-full');
		expect(classes).toContain('py-12');
	});
});
