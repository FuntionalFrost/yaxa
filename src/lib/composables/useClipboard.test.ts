import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClipboard } from './useClipboard.svelte';

describe('useClipboard Composable', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('initializes with default state values', () => {
		const clipboard = useClipboard();
		expect(clipboard.copied).toBe(false);
		expect(clipboard.text).toBe('');
		expect(typeof clipboard.isSupported).toBe('boolean');
		expect(typeof clipboard.copy).toBe('function');
	});

	it('handles copy operations gracefully when clipboard API is available', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, {
			clipboard: {
				writeText: writeTextMock
			}
		});

		const clipboard = useClipboard({ timeout: 500 });
		const result = await clipboard.copy('npm install yaxa-svelte');

		if (clipboard.isSupported) {
			expect(result).toBe(true);
			expect(clipboard.copied).toBe(true);
			expect(clipboard.text).toBe('npm install yaxa-svelte');
			expect(writeTextMock).toHaveBeenCalledWith('npm install yaxa-svelte');
		} else {
			expect(result).toBe(false);
		}
	});
});
