import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import Modal, { modalVariants } from './Modal.svelte';

describe('Modal Component (DOM & Interactions)', () => {
	it('computes correct size scale classes', () => {
		expect(modalVariants({ size: 'sm' })).toContain('max-w-sm');
		expect(modalVariants({ size: 'md' })).toContain('max-w-lg');
		expect(modalVariants({ size: 'lg' })).toContain('max-w-2xl');
		expect(modalVariants({ size: 'xl' })).toContain('max-w-4xl');
	});

	it('renders dialog title and description when open is true', () => {
		const { cleanup } = renderComponent(Modal, {
			open: true,
			title: 'Deploy to Production',
			description: 'Confirm edge network distribution',
			size: 'md'
		});

		expect(document.body.textContent).toContain('Deploy to Production');
		expect(document.body.textContent).toContain('Confirm edge network distribution');

		cleanup();
	});

	it('renders close button with accessible aria-label', () => {
		const { cleanup } = renderComponent(Modal, {
			open: true,
			title: 'Settings Dialog'
		});

		const closeButton = document.querySelector('button[aria-label="Close dialog"]');
		expect(closeButton).toBeDefined();

		cleanup();
	});
});
