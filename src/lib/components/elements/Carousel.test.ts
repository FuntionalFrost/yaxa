import { describe, it, expect } from 'vitest';
import { carouselVariants } from './Carousel.svelte';

describe('Carousel', () => {
	it('generates correct carousel slot classes', () => {
		const slots = carouselVariants();
		expect(slots.root()).toContain('relative w-full overflow-hidden');
		expect(slots.viewport()).toContain('relative flex w-full overflow-hidden');
		expect(slots.controls()).toContain('pointer-events-none');
		expect(slots.arrowBtn()).toContain('rounded-full');
	});
});
