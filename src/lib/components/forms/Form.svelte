<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZodSchema } from 'zod';
	import Alert from '../overlays/Alert.svelte';
	import { setFormContext, type SuperFormContract } from './form-context';

	export interface FormSchema<T = any> {
		parse?: (data: unknown) => T;
		safeParse?: (data: unknown) => { success: boolean; data?: T; error?: any };
		validate?: (data: unknown) => T;
		[key: string]: any;
	}

	interface Props {
		schema?: FormSchema | ZodSchema | any;
		values?: Record<string, any>;
		superform?: SuperFormContract;
		loading?: boolean;
		errorSummary?: boolean;
		class?: string;
		onsubmit?: (e: SubmitEvent, values: Record<string, any>) => void | Promise<void>;
		children?: Snippet;
	}

	let {
		schema,
		values = {},
		superform,
		loading = false,
		errorSummary = false,
		class: className = '',
		onsubmit,
		children
	}: Props = $props();

	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);

	// Safe store/getter reader
	function getVal(target: any) {
		if (!target) return undefined;
		if (typeof target === 'function') {
			try {
				return target();
			} catch {
				return undefined;
			}
		}
		if (typeof target === 'object' && 'subscribe' in target) {
			let val: any;
			const unsub = target.subscribe((v: any) => {
				val = v;
			});
			unsub?.();
			return val;
		}
		return target.value ?? target;
	}

	let sfErrors = $derived(getVal(superform?.errors) || {});
	let sfConstraints = $derived(getVal(superform?.constraints) || {});
	let sfTainted = $derived(getVal(superform?.tainted) || {});
	let sfSubmitting = $derived(Boolean(getVal(superform?.submitting) || getVal(superform?.delayed)));

	let isBusy = $derived(loading || isSubmitting || sfSubmitting);

	function getFieldError(name: string): string | undefined {
		if (errors[name]) return errors[name];
		const sfErr = sfErrors[name];
		if (!sfErr) return undefined;
		if (Array.isArray(sfErr)) return sfErr[0];
		if (typeof sfErr === 'string') return sfErr;
		if (typeof sfErr === 'object' && sfErr._errors && Array.isArray(sfErr._errors)) {
			return sfErr._errors[0];
		}
		return String(sfErr);
	}

	function getFieldConstraint(name: string): Record<string, any> | undefined {
		return sfConstraints[name];
	}

	function isFieldTainted(name: string): boolean {
		return Boolean(sfTainted[name]);
	}

	setFormContext({
		get superform() {
			return superform;
		},
		get errors() {
			return errors;
		},
		getFieldError,
		getFieldConstraint,
		isFieldTainted,
		get isSubmitting() {
			return isBusy;
		}
	});

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
		if (superform?.enhance) {
			// Superforms enhance handles submission
			return;
		}

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

	function enhanceAction(node: HTMLFormElement) {
		if (superform?.enhance && typeof superform.enhance === 'function') {
			return superform.enhance(node);
		}
	}

	let summaryErrors = $derived.by(() => {
		const list: string[] = [];
		for (const k of Object.keys(errors)) {
			if (errors[k]) list.push(errors[k]);
		}
		for (const k of Object.keys(sfErrors)) {
			const val = sfErrors[k];
			if (Array.isArray(val) && val.length > 0) list.push(val[0]);
			else if (typeof val === 'string') list.push(val);
		}
		return list;
	});
</script>

<form
	use:enhanceAction
	onsubmit={handleSubmit}
	aria-busy={isBusy}
	class="space-y-4 {className} {isBusy ? 'pointer-events-none opacity-80' : ''}"
	novalidate
>
	{#if errorSummary && summaryErrors.length > 0}
		<Alert
			color="error"
			title="Please correct the following errors:"
			description={summaryErrors.join(' · ')}
		/>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</form>
