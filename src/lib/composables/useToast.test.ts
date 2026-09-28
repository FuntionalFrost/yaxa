import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toast, useToast, ToastStore } from './useToast.svelte';

describe('useToast & ToastStore (Native Svelte 5 Runes)', () => {
	beforeEach(() => {
		toast.clear();
	});

	it('provides a reactive toast store and useToast composable', () => {
		const toastService = useToast();
		expect(toastService).toBe(toast);
		expect(toastService.toasts).toEqual([]);
	});

	it('adds simple string toast and object toasts with custom colors', () => {
		toast.add('Hello world');
		expect(toast.toasts.length).toBe(1);
		expect(toast.toasts[0].title).toBe('Hello world');
		expect(toast.toasts[0].color).toBe('neutral');

		const id = toast.add({
			title: 'Custom Title',
			description: 'Custom Description',
			color: 'success',
			duration: 5000
		});

		expect(toast.toasts.length).toBe(2);
		expect(toast.toasts[1].id).toBe(id);
		expect(toast.toasts[1].title).toBe('Custom Title');
		expect(toast.toasts[1].description).toBe('Custom Description');
		expect(toast.toasts[1].color).toBe('success');
		expect(toast.toasts[1].duration).toBe(5000);
	});

	it('supports helper methods for success, error, warning, info, and loading', () => {
		toast.success('Operation succeeded', 'All items synced');
		toast.error('Operation failed', { description: 'Network timeout', duration: 6000 });
		toast.warning('Disk space low');
		toast.info('New update available');
		toast.loading('Processing payment...');

		expect(toast.toasts.length).toBe(5);
		expect(toast.toasts[0].color).toBe('success');
		expect(toast.toasts[0].description).toBe('All items synced');

		expect(toast.toasts[1].color).toBe('error');
		expect(toast.toasts[1].duration).toBe(6000);

		expect(toast.toasts[2].color).toBe('warning');
		expect(toast.toasts[3].color).toBe('info');

		expect(toast.toasts[4].color).toBe('loading');
		expect(toast.toasts[4].duration).toBe(0);
		expect(toast.toasts[4].closable).toBe(false);
	});

	it('updates existing toast in-place', () => {
		const id = toast.loading('Exporting CSV...');
		expect(toast.toasts[0].color).toBe('loading');

		toast.update(id, {
			title: 'CSV Exported',
			description: 'Downloaded 250 rows',
			color: 'success',
			duration: 4000,
			closable: true
		});

		expect(toast.toasts.length).toBe(1);
		expect(toast.toasts[0].title).toBe('CSV Exported');
		expect(toast.toasts[0].color).toBe('success');
		expect(toast.toasts[0].closable).toBe(true);
	});

	it('handles single dismiss and clear all with onDismiss callbacks', () => {
		const onDismiss1 = vi.fn();
		const onDismiss2 = vi.fn();

		const id1 = toast.add({ title: 'Toast 1', onDismiss: onDismiss1 });
		const id2 = toast.add({ title: 'Toast 2', onDismiss: onDismiss2 });

		expect(toast.toasts.length).toBe(2);

		toast.dismiss(id1);
		expect(toast.toasts.length).toBe(1);
		expect(toast.toasts[0].id).toBe(id2);
		expect(onDismiss1).toHaveBeenCalledOnce();
		expect(onDismiss2).not.toHaveBeenCalled();

		toast.clear();
		expect(toast.toasts.length).toBe(0);
		expect(onDismiss2).toHaveBeenCalledOnce();
	});

	it('supports pause and resume timer calculations', () => {
		const id = toast.add({ title: 'Timed Toast', duration: 4000 });
		const item = toast.toasts[0];

		expect(item.paused).toBe(false);
		toast.pause(id);
		expect(item.paused).toBe(true);

		toast.resume(id);
		expect(item.paused).toBe(false);
	});

	it('handles promise() resolution seamlessly', async () => {
		const asyncOp = Promise.resolve({ count: 42 });

		const result = await toast.promise(asyncOp, {
			loading: 'Counting items...',
			success: (data) => `Counted ${data.count} items!`,
			error: 'Count failed'
		});

		expect(result).toEqual({ count: 42 });
		expect(toast.toasts.length).toBe(1);
		expect(toast.toasts[0].color).toBe('success');
		expect(toast.toasts[0].title).toBe('Counted 42 items!');
	});

	it('handles promise() rejection properly', async () => {
		const failedOp = Promise.reject(new Error('Server unavailable'));

		await expect(
			toast.promise(failedOp, {
				loading: 'Connecting...',
				success: 'Connected!',
				error: (err) => `Failed: ${err.message}`
			})
		).rejects.toThrow('Server unavailable');

		expect(toast.toasts.length).toBe(1);
		expect(toast.toasts[0].color).toBe('error');
		expect(toast.toasts[0].title).toBe('Failed: Server unavailable');
	});

	it('creates independent ToastStore instances when needed', () => {
		const customStore = new ToastStore();
		customStore.add('Isolated toast');
		expect(customStore.toasts.length).toBe(1);
		expect(toast.toasts.length).toBe(0);
	});
});
