import { describe, it, expect } from 'vitest';
import { renderComponent } from '../../testing/index.js';
import Icon from './Icon.svelte';

describe('Icon Component', () => {
	it('renders built-in SVG icons by string name', () => {
		const { target, cleanup } = renderComponent(Icon, {
			name: 'check'
		});

		const svg = target.querySelector('svg');
		expect(svg).toBeDefined();
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(svg?.innerHTML).toContain('<path');
		expect(svg?.getAttribute('class')).toContain('w-5 h-5');
		cleanup();
	});

	it('resolves icon aliases correctly', () => {
		const { target: t1, cleanup: c1 } = renderComponent(Icon, {
			name: 'close'
		});
		expect(t1.querySelector('svg')?.innerHTML).toContain('18 6L6 18');
		c1();

		const { target: t2, cleanup: c2 } = renderComponent(Icon, {
			name: 'zap'
		});
		expect(t2.querySelector('svg')?.innerHTML).toContain('13 2L3 14');
		c2();
	});

	it('renders newly added common icons: bell, home, settings, credit-card, fingerprint, key, swatch, paint-brush', () => {
		const names = [
			'bell',
			'home',
			'settings',
			'credit-card',
			'fingerprint',
			'key',
			'mail',
			'inbox',
			'palette',
			'shield',
			'swatch',
			'swatches',
			'paint-brush',
			'paintbrush',
			'layers'
		];
		for (const name of names) {
			const { target, cleanup } = renderComponent(Icon, { name });
			const svg = target.querySelector('svg');
			expect(svg).toBeDefined();
			expect(svg?.innerHTML).not.toContain('stroke-dasharray="4 4"');
			cleanup();
		}
	});

	it('renders fallback dashed circle for unknown icon name', () => {
		const { target, cleanup } = renderComponent(Icon, {
			name: 'non-existent-icon-xyz'
		});

		const svg = target.querySelector('svg');
		expect(svg).toBeDefined();
		expect(svg?.innerHTML).toContain('stroke-dasharray="4 4"');
		cleanup();
	});

	it('supports all size variants and custom numeric size', () => {
		const sizeMap: Record<string, string> = {
			xs: 'w-3.5 h-3.5',
			sm: 'w-4 h-4',
			md: 'w-5 h-5',
			lg: 'w-6 h-6',
			xl: 'w-8 h-8'
		};

		for (const [size, expectedClass] of Object.entries(sizeMap)) {
			const { target, cleanup } = renderComponent(Icon, {
				name: 'sparkles',
				size: size as any
			});
			const svg = target.querySelector('svg');
			expect(svg?.getAttribute('class')).toContain(expectedClass);
			cleanup();
		}
	});

	it('merges custom classes', () => {
		const { target, cleanup } = renderComponent(Icon, {
			name: 'sparkles',
			class: 'text-primary-500 animate-spin'
		});

		const svg = target.querySelector('svg');
		expect(svg?.getAttribute('class')).toContain('text-primary-500');
		expect(svg?.getAttribute('class')).toContain('animate-spin');
		cleanup();
	});
});
