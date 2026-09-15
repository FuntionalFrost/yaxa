<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZodSchema } from 'zod';
	import Alert from '../overlays/Alert.svelte';

	export interface FormSchema<T = any> {
		parse?: (data: unknown) => T;
		safeParse?: (data: unknown) => { success: boolean; data?: T; error?: any };
		validate?: (data: unknown) => T;
		[key: string]: any;
	}

	interface Props {
		schema?: FormSchema | ZodSchema | any;
		values?: Record<string, any>;
		loading?: boolean;
		errorSummary?: boolean;
		class?: string;
		onsubmit?: (e: SubmitEvent, values: Record<string, any>) => void | Promise<void>;
		children?: Snippet;
	}

	let {
		schema,
		values = {},
		loading = false,
		errorSummary = false,
		class: className = '',
		onsubmit,
		children
	}: Props = $props();

	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);
	let isBusy = $derived(loading || isSubmitting);

	function validate() {
		if (!schema) return true;
		try {
			if (typeof schema.safeParse === 'function') {
				const res = schema.safeParse(values);
				if (!res.success) {
					const fieldErrors: Record<string, string> = {};
					const issues = res.error?.issues || res.error?.errors || [];
					for (const e of issues) {
						const field = Array.isArray(e.path) ? e.path.join('.') : String(e.path || 'form');
						if (!fieldErrors[field]) {
							fieldErrors[field] = e.message;
						}
					}
					errors = fieldErrors;
					return false;
				}
				errors = {};
				return true;
			} else if (typeof schema.parse === 'function') {
				schema.parse(values);
				errors = {};
				return true;
			}
			return true;
		} catch (err: any) {
			const fieldErrors: Record<string, string> = {};
			const issues = err?.issues || err?.errors || [];
			for (const e of issues) {
				const field = Array.isArray(e.path) ? e.path.join('.') : String(e.path || 'form');
				if (!fieldErrors[field]) {
					fieldErrors[field] = e.message;
				}
			}
			errors = fieldErrors;
			return false;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) {
			return;
		}

		if (onsubmit) {
			isSubmitting = true;
			try {
				await onsubmit(e, values);
			} finally {
				isSubmitting = false;
			}
		}
	}
</script>

<form
	onsubmit={handleSubmit}
	aria-busy={isBusy}
	class="space-y-4 {className} {isBusy ? 'pointer-events-none opacity-80' : ''}"
	novalidate
>
	{#if errorSummary && Object.keys(errors).length > 0}
		<Alert
			color="error"
			title="Please correct the following errors:"
			description={Object.values(errors).join(' · ')}
		/>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</form>
