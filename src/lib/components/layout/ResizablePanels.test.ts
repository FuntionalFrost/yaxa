import { describe, it, expect } from 'vitest';
import { resizablePanelsVariants } from './ResizablePanels.svelte';

describe('ResizablePanels', () => {
	it('generates horizontal split classes by default', () => {
		const slots = resizablePanelsVariants({ direction: 'horizontal' });
		expect(slots.root()).toContain('flex-row');
		expect(slots.handle()).toContain('cursor-col-resize');
	});

	it('generates vertical split classes when specified', () => {
		const slots = resizablePanelsVariants({ direction: 'vertical' });
		expect(slots.root()).toContain('flex-col');
		expect(slots.handle()).toContain('cursor-row-resize');
	});
});
