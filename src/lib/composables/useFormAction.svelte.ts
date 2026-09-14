import { toast } from 'svelte-sonner';
import type { SubmitFunction } from '@sveltejs/kit';

export interface UseFormActionOptions {
	/** Toast message to show on successful form submission */
	successToast?: string | ((data: any) => string);
	/** Toast message or prefix on failure */
	errorToast?: string | ((error: any) => string);
	/** Whether to reset form inputs on success (default: true) */
	resetOnSuccess?: boolean;
	/** Callback on successful action return */
	onSuccess?: (result: { data: any; form: HTMLFormElement }) => void;
	/** Callback on failure */
	onError?: (result: { data: any; form: HTMLFormElement }) => void;
}

/**
 * Idiomatic SvelteKit Form Action Rune wrapping `use:enhance` with automated loading states,
 * toast feedback, and auto-reset behavior.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { enhance } from '$app/forms';
 *   import { useFormAction } from '$lib';
 *
 *   const formAction = useFormAction({
 *     successToast: 'Changes saved successfully!',
 *     resetOnSuccess: false
 *   });
 * </script>
 *
 * <form method="POST" use:enhance={formAction.enhance}>
 *   <Button type="submit" loading={formAction.isSubmitting}>Submit</Button>
 * </form>
 * ```
 */
export function useFormAction(options: UseFormActionOptions = {}) {
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	const enhanceHandler: SubmitFunction = ({ formElement }) => {
		isSubmitting = true;
		errorMessage = null;

		return async ({ result, update }) => {
			try {
				if (result.type === 'success') {
					if (options.successToast) {
						const msg =
							typeof options.successToast === 'function'
								? options.successToast(result.data)
								: options.successToast;
						toast.success(msg);
					}
					if (options.onSuccess) {
						options.onSuccess({ data: result.data, form: formElement });
					}
				} else if (result.type === 'failure') {
					const errorMsg =
						result.data?.message ||
						(typeof options.errorToast === 'function'
							? options.errorToast(result.data)
							: options.errorToast) ||
						'Form submission failed';
					errorMessage = errorMsg;
					toast.error(errorMsg);

					if (options.onError) {
						options.onError({ data: result.data, form: formElement });
					}
				} else if (result.type === 'error') {
					const errorMsg = (result.error as any)?.message || 'An unexpected error occurred';
					errorMessage = errorMsg;
					toast.error(errorMsg);
				}

				await update({ reset: options.resetOnSuccess ?? true });
			} finally {
				isSubmitting = false;
			}
		};
	};

	return {
		get isSubmitting() {
			return isSubmitting;
		},
		get errorMessage() {
			return errorMessage;
		},
		enhance: enhanceHandler
	};
}
