import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';

export const YAXA_FORM_KEY = Symbol('yaxa-form');
export const YAXA_FORM_FIELD_KEY = Symbol('yaxa-form-field');

export interface SuperFormContract<T extends Record<string, any> = Record<string, any>> {
	form?: Readable<T> | { value: T } | any;
	errors?: Readable<Record<string, string[] | string | undefined>> | any;
	constraints?: Readable<Record<string, Record<string, any> | undefined>> | any;
	tainted?: Readable<Record<string, boolean | undefined> | undefined> | any;
	submitting?: Readable<boolean> | any;
	delayed?: Readable<boolean> | any;
	timeout?: Readable<boolean> | any;
	message?: Readable<any> | any;
	enhance?: any;
	[key: string]: any;
}

export interface FormContextValue {
	superform?: SuperFormContract;
	errors?: Record<string, string>;
	getFieldError?: (name: string) => string | undefined;
	getFieldConstraint?: (name: string) => Record<string, any> | undefined;
	isFieldTainted?: (name: string) => boolean;
	isSubmitting?: boolean;
}

export interface FormFieldContextValue {
	id?: string;
	name?: string;
	required?: boolean;
	error?: string;
	status?: 'default' | 'error' | 'success';
	descriptionId?: string;
	errorId?: string;
}

export function setFormContext(value: FormContextValue) {
	setContext(YAXA_FORM_KEY, value);
}

export function getFormContext(): FormContextValue | undefined {
	return getContext<FormContextValue>(YAXA_FORM_KEY);
}

export function setFormFieldContext(value: FormFieldContextValue) {
	setContext(YAXA_FORM_FIELD_KEY, value);
}

export function getFormFieldContext(): FormFieldContextValue | undefined {
	return getContext<FormFieldContextValue>(YAXA_FORM_FIELD_KEY);
}
