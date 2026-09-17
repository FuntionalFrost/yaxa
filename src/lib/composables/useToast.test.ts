import { describe, it, expect, vi } from 'vitest';
import { useToast } from './useToast';
import { toast } from 'svelte-sonner';

vi.mock('svelte-sonner', () => ({
	toast: Object.assign(vi.fn(), {
		success: vi.fn(),
		error: vi.fn(),
		warning: vi.fn(),
		info: vi.fn(),
		dismiss: vi.fn()
	})
}));

describe('useToast Composable', () => {
	it('provides helper methods for success, error, warning, info, and dismiss', () => {
		const toastService = useToast();

		toastService.success('Saved successfully', 'Changes stored');
		expect(toast.success).toHaveBeenCalledWith('Saved successfully', {
			description: 'Changes stored'
		});

		toastService.error('Failed to save');
		expect(toast.error).toHaveBeenCalledWith('Failed to save', { description: undefined });

		toastService.warning('Warning message');
		expect(toast.warning).toHaveBeenCalledWith('Warning message', { description: undefined });

		toastService.info('Information notice');
		expect(toast.info).toHaveBeenCalledWith('Information notice', { description: undefined });

		toastService.dismiss('toast-123');
		expect(toast.dismiss).toHaveBeenCalledWith('toast-123');
	});

	it('routes add() with options according to color level', () => {
		const toastService = useToast();

		toastService.add({ title: 'Payment received', color: 'success', duration: 3000 });
		expect(toast.success).toHaveBeenCalledWith('Payment received', {
			description: undefined,
			duration: 3000,
			action: undefined
		});

		toastService.add({ title: 'Network timeout', color: 'error' });
		expect(toast.error).toHaveBeenCalledWith('Network timeout', {
			description: undefined,
			duration: 4000,
			action: undefined
		});

		toastService.add('Simple text message');
		expect(toast).toHaveBeenCalledWith('Simple text message');
	});
});
