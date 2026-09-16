import { describe, it, expect } from 'vitest';
import { faqVariants } from './FAQ.svelte';

describe('FAQ Block', () => {
	it('generates default variant classes', () => {
		const classes = faqVariants();
		expect(classes).toContain('w-full');
		expect(classes).toContain('max-w-3xl');
	});
});
