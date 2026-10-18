import { browser } from '$app/env';

export interface UseClipboardOptions {
	timeout?: number;
}

export function useClipboard(options: UseClipboardOptions = {}) {
	const { timeout = 2000 } = options;
	let copied = $state(false);
	let text = $state('');
	const isSupported = browser && typeof navigator !== 'undefined' && 'clipboard' in navigator;

	async function copy(value: string): Promise<boolean> {
		if (!isSupported) return false;
		try {
			await navigator.clipboard.writeText(value);
			text = value;
			copied = true;
			setTimeout(() => {
				copied = false;
			}, timeout);
			return true;
		} catch {
			copied = false;
			return false;
		}
	}

	return {
		get copied() {
			return copied;
		},
		get text() {
			return text;
		},
		get isSupported() {
			return isSupported;
		},
		copy
	};
}
