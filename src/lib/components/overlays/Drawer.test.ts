import { describe, it, expect } from 'vitest';
import { drawerVariants } from './Drawer.svelte';

describe('Drawer Component', () => {
	it('generates responsive variant classes by default', () => {
		const classes = drawerVariants();
		expect(classes).toContain('rounded-t-3xl');
		expect(classes).toContain('md:max-w-lg');
	});

	it('generates non-responsive bottom sheet classes when responsive is false', () => {
		const classes = drawerVariants({ responsive: false });
		expect(classes).toContain('rounded-t-3xl');
		expect(classes).not.toContain('md:max-w-lg');
	});
});
