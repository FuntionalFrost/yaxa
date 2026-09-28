import type { Snippet } from 'svelte';
import type { IconSource } from '../components/elements/Icon.svelte';

export type ToastColor =
	'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'loading';
export type ToastVariant = 'solid' | 'outline' | 'soft' | 'subtle';
export type ToastPosition =
	'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
	label: string;
	onClick?: () => void;
	color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error';
	variant?: 'solid' | 'outline' | 'ghost' | 'soft';
}

export interface ToastOptions {
	id?: string | number;
	title: string;
	description?: string;
	color?: ToastColor;
	variant?: ToastVariant;
	icon?: IconSource;
	avatar?: { src: string; alt?: string };
	duration?: number;
	actions?: ToastAction[];
	action?: ToastAction;
	closable?: boolean;
	progress?: boolean;
	snippet?: Snippet;
	onDismiss?: () => void;
}

export interface ToastItem extends ToastOptions {
	id: string | number;
	createdAt: number;
	duration: number;
	remaining: number;
	paused: boolean;
	startedAt: number;
	timeoutId?: ReturnType<typeof setTimeout> | null;
}

let toastCounter = 0;

export class ToastStore {
	toasts = $state<ToastItem[]>([]);

	private startTimer(item: ToastItem) {
		if (typeof window === 'undefined') return;
		if (item.duration <= 0 || item.duration === Infinity) return;

		item.startedAt = Date.now();
		item.paused = false;

		if (item.timeoutId) {
			clearTimeout(item.timeoutId);
		}

		item.timeoutId = setTimeout(() => {
			this.dismiss(item.id);
		}, item.remaining);
	}

	add(options: ToastOptions | string): string | number {
		const opts: ToastOptions = typeof options === 'string' ? { title: options } : options;
		const id = opts.id ?? `yaxa-toast-${Date.now()}-${++toastCounter}`;

		const existingIndex = this.toasts.findIndex((t) => t.id === id);
		const duration =
			opts.duration !== undefined ? opts.duration : opts.color === 'loading' ? 0 : 4000;

		const item: ToastItem = {
			...opts,
			id,
			color: opts.color ?? 'neutral',
			variant: opts.variant ?? 'soft',
			duration,
			remaining: duration,
			paused: false,
			startedAt: Date.now(),
			createdAt: Date.now(),
			closable: opts.closable ?? opts.color !== 'loading',
			progress: opts.progress ?? (duration > 0 && duration < Infinity),
			actions: opts.actions ?? (opts.action ? [opts.action] : undefined)
		};

		if (existingIndex !== -1) {
			const existing = this.toasts[existingIndex];
			if (existing.timeoutId) clearTimeout(existing.timeoutId);
			this.toasts[existingIndex] = item;
		} else {
			this.toasts.push(item);
		}

		this.startTimer(item);
		return id;
	}

	update(id: string | number, options: Partial<ToastOptions>): void {
		const index = this.toasts.findIndex((t) => t.id === id);
		if (index === -1) return;

		const existing = this.toasts[index];
		if (existing.timeoutId) clearTimeout(existing.timeoutId);

		const duration = options.duration !== undefined ? options.duration : existing.duration;

		const updatedItem: ToastItem = {
			...existing,
			...options,
			duration,
			remaining: duration,
			startedAt: Date.now(),
			paused: false,
			actions: options.actions ?? (options.action ? [options.action] : existing.actions)
		};

		this.toasts[index] = updatedItem;
		this.startTimer(updatedItem);
	}

	dismiss(id?: string | number): void {
		if (id === undefined) {
			this.clear();
			return;
		}

		const index = this.toasts.findIndex((t) => t.id === id);
		if (index === -1) return;

		const item = this.toasts[index];
		if (item.timeoutId) clearTimeout(item.timeoutId);
		item.onDismiss?.();

		this.toasts.splice(index, 1);
	}

	clear(): void {
		for (const item of this.toasts) {
			if (item.timeoutId) clearTimeout(item.timeoutId);
			item.onDismiss?.();
		}
		this.toasts = [];
	}

	pause(id: string | number): void {
		const item = this.toasts.find((t) => t.id === id);
		if (!item || item.paused || item.duration <= 0 || item.duration === Infinity) return;

		if (item.timeoutId) {
			clearTimeout(item.timeoutId);
			item.timeoutId = null;
		}

		const elapsed = Date.now() - item.startedAt;
		item.remaining = Math.max(0, item.remaining - elapsed);
		item.paused = true;
	}

	resume(id: string | number): void {
		const item = this.toasts.find((t) => t.id === id);
		if (!item || !item.paused || item.duration <= 0 || item.duration === Infinity) return;

		this.startTimer(item);
	}

	pauseAll(): void {
		for (const item of this.toasts) {
			this.pause(item.id);
		}
	}

	resumeAll(): void {
		for (const item of this.toasts) {
			this.resume(item.id);
		}
	}

	private normalizeOptions(
		title: string,
		optionsOrDesc?: Partial<ToastOptions> | string,
		color?: ToastColor
	): ToastOptions {
		if (typeof optionsOrDesc === 'string') {
			return { title, description: optionsOrDesc, color };
		}
		return { title, color, ...optionsOrDesc };
	}

	success(title: string, options?: Partial<ToastOptions> | string): string | number {
		return this.add(this.normalizeOptions(title, options, 'success'));
	}

	error(title: string, options?: Partial<ToastOptions> | string): string | number {
		return this.add(this.normalizeOptions(title, options, 'error'));
	}

	warning(title: string, options?: Partial<ToastOptions> | string): string | number {
		return this.add(this.normalizeOptions(title, options, 'warning'));
	}

	info(title: string, options?: Partial<ToastOptions> | string): string | number {
		return this.add(this.normalizeOptions(title, options, 'info'));
	}

	loading(title: string, options?: Partial<ToastOptions> | string): string | number {
		const opts = this.normalizeOptions(title, options, 'loading');
		return this.add({
			...opts,
			duration: opts.duration ?? 0,
			closable: opts.closable ?? false
		});
	}

	promise<T>(
		promise: Promise<T>,
		handlers: {
			loading: string | Partial<ToastOptions>;
			success: string | ((data: T) => string | Partial<ToastOptions>);
			error: string | ((err: any) => string | Partial<ToastOptions>);
		}
	): Promise<T> {
		const loadingOpts =
			typeof handlers.loading === 'string'
				? { title: handlers.loading, color: 'loading' as const, duration: 0, closable: false }
				: { color: 'loading' as const, duration: 0, closable: false, ...handlers.loading };

		const id = this.add(loadingOpts as ToastOptions);

		return promise
			.then((data) => {
				const res =
					typeof handlers.success === 'function' ? handlers.success(data) : handlers.success;
				const successOpts: Partial<ToastOptions> =
					typeof res === 'string'
						? { title: res, color: 'success', duration: 4000, closable: true }
						: { color: 'success', duration: 4000, closable: true, ...res };

				this.update(id, successOpts);
				return data;
			})
			.catch((err) => {
				const res = typeof handlers.error === 'function' ? handlers.error(err) : handlers.error;
				const errorOpts: Partial<ToastOptions> =
					typeof res === 'string'
						? { title: res, color: 'error', duration: 4000, closable: true }
						: { color: 'error', duration: 4000, closable: true, ...res };

				this.update(id, errorOpts);
				throw err;
			});
	}
}

export const toast = new ToastStore();

export function useToast() {
	return toast;
}
