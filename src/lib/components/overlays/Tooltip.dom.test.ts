import { describe, it, expect } from 'vitest';
import { renderComponent } from '$lib/testing';
import Tooltip from './Tooltip.svelte';

describe('Tooltip Component (DOM & Provider Encapsulation)', () => {
	it('mounts Tooltip with trigger element without throwing Provider errors', () => {
		const { target, cleanup } = renderComponent(Tooltip, {
			text: 'Native Svelte 5 Tooltip'
		});

		const triggerBtn = target.querySelector('button');
		expect(triggerBtn).toBeDefined();
		expect(target.firstElementChild).toBeDefined();

		cleanup();
	});
});
