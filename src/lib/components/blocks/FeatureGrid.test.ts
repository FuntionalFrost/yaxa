import { describe, it, expect } from 'vitest';
import { featureGridVariants } from './FeatureGrid.svelte';

describe('FeatureGrid Block', () => {
	it('generates default variant classes', () => {
		const classes = featureGridVariants();
		expect(classes).toContain('w-full');
		expect(classes).toContain('py-12');
	});
});
