import { describe, it, expect } from 'vitest';
import { switchVariants, thumbVariants } from './Switch.svelte';

describe('Switch Component', () => {
	it('generates default switch track classes', () => {
		const classes = switchVariants();
		expect(classes).toContain('rounded-full');
		expect(classes).toContain('h-6');
		expect(classes).toContain('w-11');
		expect(classes).toContain('data-[state=checked]:bg-primary-600');
	});

	it('supports size variations for track and thumb', () => {
		const smTrack = switchVariants({ size: 'sm' });
		expect(smTrack).toContain('h-5');
		expect(smTrack).toContain('w-9');

		const smThumb = thumbVariants({ size: 'sm' });
		expect(smThumb).toContain('h-4');
		expect(smThumb).toContain('w-4');
		expect(smThumb).toContain('data-[state=checked]:translate-x-4');

		const lgTrack = switchVariants({ size: 'lg' });
		expect(lgTrack).toContain('h-7');
		expect(lgTrack).toContain('w-14');

		const lgThumb = thumbVariants({ size: 'lg' });
		expect(lgThumb).toContain('h-6');
		expect(lgThumb).toContain('w-6');
		expect(lgThumb).toContain('data-[state=checked]:translate-x-7');
	});
});
