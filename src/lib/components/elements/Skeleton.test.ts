import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import Skeleton, { skeletonVariants } from './Skeleton.svelte';

describe('Skeleton Component (DOM & Variants)', () => {
	it('generates pulse animation classes by default', () => {
		const classes = skeletonVariants({ variant: 'pulse', shape: 'rectangle' });
		expect(classes).toContain('animate-pulse');
		expect(classes).toContain('rounded-lg');
	});

	it('generates shimmer sliding gradient classes for variant shimmer', () => {
		const classes = skeletonVariants({ variant: 'shimmer' });
		expect(classes).toContain('yaxa-shimmer-slide');
		expect(classes).toContain('before:bg-gradient-to-r');
	});

	it('supports shape variants: circle, pill, text', () => {
		const circle = skeletonVariants({ shape: 'circle' });
		expect(circle).toContain('rounded-full');
		expect(circle).toContain('aspect-square');

		const pill = skeletonVariants({ shape: 'pill' });
		expect(pill).toContain('rounded-full');

		const text = skeletonVariants({ shape: 'text' });
		expect(text).toContain('h-4');
	});

	it('mounts single skeleton DOM element with custom width and height', () => {
		const { target, cleanup } = renderComponent(Skeleton, {
			variant: 'shimmer',
			shape: 'circle',
			width: '48px',
			height: '48px'
		});

		const el = target.querySelector('div');
		expect(el).toBeDefined();
		expect(el?.getAttribute('aria-hidden')).toBe('true');
		expect(el?.style.width).toBe('48px');
		expect(el?.style.height).toBe('48px');
		expect(el?.className).toContain('rounded-full');
		cleanup();
	});

	it('renders multiple lines for lines prop > 1', () => {
		const { target, cleanup } = renderComponent(Skeleton, {
			lines: 4,
			variant: 'shimmer'
		});

		const container = target.querySelector('.space-y-2');
		expect(container).toBeDefined();
		expect(container?.children.length).toBe(4);
		cleanup();
	});
});
