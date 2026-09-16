import { describe, it, expect } from 'vitest';
import { orgSwitcherVariants } from './OrgSwitcher.svelte';

describe('OrgSwitcher Component', () => {
	it('generates default variant classes', () => {
		const classes = orgSwitcherVariants();
		expect(classes).toContain('inline-flex');
	});
});
