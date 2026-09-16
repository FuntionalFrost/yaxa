import { describe, it, expect } from 'vitest';
import { dashboardShellVariants } from './DashboardShell.svelte';

describe('DashboardShell', () => {
	it('generates correct slot classes with default expanded state', () => {
		const slots = dashboardShellVariants({ collapsed: false });
		expect(slots.root()).toContain('flex min-h-screen');
		expect(slots.sidebar()).toContain('w-64');
		expect(slots.topbar()).toContain('h-16');
		expect(slots.content()).toContain('overflow-y-auto');
	});

	it('generates collapsed sidebar class when collapsed is true', () => {
		const slots = dashboardShellVariants({ collapsed: true });
		expect(slots.sidebar()).toContain('w-18');
	});
});
