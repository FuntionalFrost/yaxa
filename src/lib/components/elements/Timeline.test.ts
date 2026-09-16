import { describe, it, expect } from 'vitest';
import { timelineVariants } from './Timeline.svelte';

describe('Timeline Component', () => {
	it('generates default variant classes', () => {
		const classes = timelineVariants();
		expect(classes).toContain('relative');
		expect(classes).toContain('space-y-6');
	});

	it('supports size variants', () => {
		const smClasses = timelineVariants({ size: 'sm' });
		expect(smClasses).toContain('text-xs');

		const lgClasses = timelineVariants({ size: 'lg' });
		expect(lgClasses).toContain('text-base');
	});
});
