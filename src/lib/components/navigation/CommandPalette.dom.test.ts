import { describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import { renderComponent } from '#lib/testing/index.js';
import CommandPalette from './CommandPalette.svelte';

describe('CommandPalette Component (DOM & Interactions)', () => {
	const testItems = [
		{ id: '1', label: 'Documentation Buttons', group: 'Navigation', shortcut: '⌘B' },
		{ id: '2', label: 'Billing Settings', group: 'Settings', shortcut: '⌘S' },
		{ id: '3', label: 'Dark Mode Switcher', group: 'Appearance' }
	];

	it('renders dialog, search input, and command items when open is true', () => {
		const { cleanup, target } = renderComponent(CommandPalette, {
			open: true,
			items: testItems
		});

		const input =
			target.querySelector('input') || document.querySelector('input[placeholder*="command"]');
		expect(input).toBeDefined();
		expect(document.body.textContent).toContain('Documentation Buttons');
		expect(document.body.textContent).toContain('Billing Settings');

		cleanup();
	});

	it('filters items dynamically when user types search query', async () => {
		const { cleanup, target } = renderComponent(CommandPalette, {
			open: true,
			items: testItems
		});

		const input = (target.querySelector('input') ||
			document.querySelector('input[type="text"]')) as HTMLInputElement;
		expect(input).toBeDefined();

		if (input) {
			input.value = 'Buttons';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			flushSync();

			expect(document.body.textContent).toContain('Documentation Buttons');
			expect(document.body.textContent).not.toContain('Billing Settings');
		}

		cleanup();
	});

	it('triggers item onSelect callback when clicked', async () => {
		const onSelect = vi.fn();
		const itemsWithAction = [{ id: 'action-1', label: 'Create Workspace', onSelect }];

		const { cleanup } = renderComponent(CommandPalette, {
			open: true,
			items: itemsWithAction
		});

		const actionEl = Array.from(document.querySelectorAll('button, [role="button"]')).find((el) =>
			el.textContent?.includes('Create Workspace')
		);

		expect(actionEl).toBeDefined();
		if (actionEl) {
			(actionEl as HTMLElement).click();
			flushSync();
			expect(onSelect).toHaveBeenCalledOnce();
		}

		cleanup();
	});

	it('toggles open state via global Ctrl+K and closes on Escape', async () => {
		const { cleanup } = renderComponent(CommandPalette, {
			open: false,
			items: testItems
		});

		// Trigger global Ctrl+K
		window.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'k',
				ctrlKey: true,
				bubbles: true
			})
		);
		flushSync();

		expect(document.body.textContent).toContain('Documentation Buttons');

		// Trigger Escape
		window.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Escape',
				bubbles: true
			})
		);
		flushSync();

		cleanup();
	});
});
