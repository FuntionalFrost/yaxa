import { describe, it, expect, vi } from 'vitest';
import { renderComponent } from '#lib/testing/index.js';
import Toast, { toastVariants } from './Toast.svelte';
import Toaster from './Toaster.svelte';
import { toast } from '#lib/composables/useToast.svelte.js';

describe('Toast & Toaster Components', () => {
	it('computes correct variant and color classes via toastVariants', () => {
		expect(toastVariants({ variant: 'soft', color: 'success' })).toContain('bg-emerald-50/90');
		expect(toastVariants({ variant: 'soft', color: 'error' })).toContain('bg-rose-50/90');
		expect(toastVariants({ variant: 'soft', color: 'warning' })).toContain('bg-amber-50/90');
		expect(toastVariants({ variant: 'soft', color: 'info' })).toContain('bg-sky-50/90');
		expect(toastVariants({ variant: 'solid', color: 'primary' })).toContain('bg-primary-600');
		expect(toastVariants({ variant: 'outline', color: 'neutral' })).toContain('border-neutral-300');
	});

	it('renders Toast with title, description, and accessibility attributes', () => {
		const { cleanup } = renderComponent(Toast, {
			item: {
				id: 't-1',
				title: 'Project Created',
				description: 'Your project is ready to deploy',
				color: 'success',
				variant: 'soft',
				duration: 4000,
				remaining: 4000,
				paused: false,
				createdAt: Date.now(),
				startedAt: Date.now(),
				closable: true
			}
		});

		expect(document.body.textContent).toContain('Project Created');
		expect(document.body.textContent).toContain('Your project is ready to deploy');

		const toastEl = document.querySelector('[role="status"]');
		expect(toastEl).not.toBeNull();
		expect(toastEl?.getAttribute('aria-live')).toBe('polite');

		cleanup();
	});

	it('renders alert role for error and warning toasts', () => {
		const { cleanup } = renderComponent(Toast, {
			item: {
				id: 't-err',
				title: 'Database unreachable',
				color: 'error',
				variant: 'soft',
				duration: 4000,
				remaining: 4000,
				paused: false,
				createdAt: Date.now(),
				startedAt: Date.now(),
				closable: true
			}
		});

		const alertEl = document.querySelector('[role="alert"]');
		expect(alertEl).not.toBeNull();
		expect(alertEl?.getAttribute('aria-live')).toBe('assertive');

		cleanup();
	});

	it('renders action buttons and handles click events', () => {
		const onActionClick = vi.fn();
		const onClose = vi.fn();

		const { cleanup } = renderComponent(Toast, {
			item: {
				id: 't-action',
				title: 'Email Sent',
				color: 'info',
				variant: 'soft',
				duration: 4000,
				remaining: 4000,
				paused: false,
				createdAt: Date.now(),
				startedAt: Date.now(),
				closable: true,
				actions: [{ label: 'Undo', onClick: onActionClick }]
			},
			onclose: onClose
		});

		const undoButton = document.querySelector('button') as HTMLButtonElement;
		expect(document.body.textContent).toContain('Undo');

		undoButton.click();
		expect(onActionClick).toHaveBeenCalledOnce();
		expect(onClose).toHaveBeenCalledWith('t-action');

		cleanup();
	});

	it('renders close button and triggers onclose callback', () => {
		const onClose = vi.fn();

		const { cleanup } = renderComponent(Toast, {
			item: {
				id: 't-close',
				title: 'Notice',
				color: 'neutral',
				variant: 'soft',
				duration: 4000,
				remaining: 4000,
				paused: false,
				createdAt: Date.now(),
				startedAt: Date.now(),
				closable: true
			},
			onclose: onClose
		});

		const closeButton = document.querySelector(
			'button[aria-label="Close notification"]'
		) as HTMLButtonElement;
		expect(closeButton).not.toBeNull();

		closeButton.click();
		expect(onClose).toHaveBeenCalledWith('t-close');

		cleanup();
	});

	it('renders Toaster viewport container with active toasts from toast store', () => {
		toast.clear();
		toast.success('Live Notification 1');
		toast.info('Live Notification 2');

		const { cleanup } = renderComponent(Toaster, {
			position: 'top-right',
			maxToasts: 5
		});

		const toasterEl = document.querySelector('.yaxa-toaster');
		expect(toasterEl).not.toBeNull();
		expect(document.body.textContent).toContain('Live Notification 1');
		expect(document.body.textContent).toContain('Live Notification 2');

		cleanup();
		toast.clear();
	});
});
