import { describe, it, expect } from 'vitest';
import { terminalVariants } from './Terminal.svelte';

describe('Terminal Component', () => {
	it('generates default variant classes', () => {
		const classes = terminalVariants();
		expect(classes).toContain('rounded-xl');
		expect(classes).toContain('bg-neutral-950');
		expect(classes).toContain('font-mono');
	});
});
