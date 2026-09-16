import { describe, it, expect } from 'vitest';
import { virtualListVariants } from './VirtualList.svelte';

describe('VirtualList', () => {
	it('generates correct variant classes with default bordered state', () => {
		const classes = virtualListVariants({ bordered: true });
		expect(classes).toContain('relative w-full overflow-y-auto');
		expect(classes).toContain('border');
	});

	it('supports unbordered variant', () => {
		const classes = virtualListVariants({ bordered: false });
		expect(classes).toContain('border-0');
	});
});
