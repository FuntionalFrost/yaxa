import { describe, it, expect } from 'vitest';
import { stepperVariants } from './Stepper.svelte';

describe('Stepper Component', () => {
	it('generates horizontal orientation classes by default', () => {
		const classes = stepperVariants();
		expect(classes).toContain('flex-row');
		expect(classes).toContain('items-center');
	});

	it('supports vertical orientation', () => {
		const classes = stepperVariants({ orientation: 'vertical' });
		expect(classes).toContain('flex-col');
		expect(classes).toContain('space-y-6');
	});
});
