import type { ClientResponse, ProblemDetails } from './types';

export type MutationFn<TData = any, TVariables = any> = (
	variables: TVariables
) => Promise<ClientResponse<TData> | TData>;

export interface CreateMutationOptions<
	TData = any,
	TVariables = any,
	TError = ProblemDetails | Error,
	TContext = unknown
> {
	/**
	 * Callback fired immediately before the mutation runs.
	 * Ideal for optimistic updates; returned context will be passed to onError and onSettled.
	 */
	onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
	/**
	 * Callback fired when mutation succeeds.
	 */
	onSuccess?: (
		data: TData,
		variables: TVariables,
		context: TContext | undefined
	) => Promise<void> | void;
	/**
	 * Callback fired when mutation fails.
	 */
	onError?: (
		error: TError,
		variables: TVariables,
		context: TContext | undefined
	) => Promise<void> | void;
	/**
	 * Callback fired when mutation completes (either success or error).
	 */
	onSettled?: (
		data: TData | null,
		error: TError | null,
		variables: TVariables,
		context: TContext | undefined
	) => Promise<void> | void;
}

export interface CreateMutationResult<
	TData = any,
	TVariables = any,
	TError = ProblemDetails | Error
> {
	readonly data: TData | null;
	readonly error: TError | null;
	readonly status: 'idle' | 'pending' | 'success' | 'error';
	readonly isPending: boolean;
	readonly isSuccess: boolean;
	readonly isError: boolean;
	readonly isIdle: boolean;
	mutate: (variables: TVariables) => Promise<TData>;
	reset: () => void;
}

/**
 * Checks if a response is a Yaxa ClientResponse.
 */
function isClientResponse<T>(res: unknown): res is ClientResponse<T> {
	return (
		typeof res === 'object' &&
		res !== null &&
		'ok' in res &&
		'status' in res &&
		('data' in res || 'error' in res)
	);
}

/**
 * Idiomatic Svelte 5 Runes Mutation Composable.
 * Features optimistic rollbacks, lifecycle callbacks, and RFC 7807 problem details unwrapping.
 */
export function createMutation<
	TData = any,
	TVariables = void,
	TError = ProblemDetails | Error,
	TContext = unknown
>(
	mutationFn: MutationFn<TData, TVariables>,
	options: CreateMutationOptions<TData, TVariables, TError, TContext> = {}
): CreateMutationResult<TData, TVariables, TError> {
	let data = $state<TData | null>(null);
	let error = $state<TError | null>(null);
	let status = $state<'idle' | 'pending' | 'success' | 'error'>('idle');

	const isPending = $derived(status === 'pending');
	const isSuccess = $derived(status === 'success');
	const isError = $derived(status === 'error');
	const isIdle = $derived(status === 'idle');

	async function mutate(variables: TVariables): Promise<TData> {
		status = 'pending';
		error = null;

		let context: TContext | undefined;
		try {
			if (options.onMutate) {
				context = await options.onMutate(variables);
			}

			const result = await mutationFn(variables);

			let finalData: TData;
			if (isClientResponse<TData>(result)) {
				if (!result.ok) {
					throw result.error;
				}
				finalData = result.data;
			} else {
				finalData = result as TData;
			}

			data = finalData;
			status = 'success';

			await options.onSuccess?.(finalData, variables, context);
			await options.onSettled?.(finalData, null, variables, context);

			return finalData;
		} catch (err: any) {
			const errPayload = err as TError;
			error = errPayload;
			status = 'error';

			await options.onError?.(errPayload, variables, context);
			await options.onSettled?.(null, errPayload, variables, context);

			throw err;
		}
	}

	function reset(): void {
		data = null;
		error = null;
		status = 'idle';
	}

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get status() {
			return status;
		},
		get isPending() {
			return isPending;
		},
		get isSuccess() {
			return isSuccess;
		},
		get isError() {
			return isError;
		},
		get isIdle() {
			return isIdle;
		},
		mutate,
		reset
	};
}
