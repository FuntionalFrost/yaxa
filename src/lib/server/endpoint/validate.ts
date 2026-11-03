export interface ValidationSuccess<T> {
	success: true;
	data: T;
}

export interface ValidationFailure {
	success: false;
	invalidParams: Array<{ name: string; reason: string }>;
	rawError?: any;
}

export type ValidationOutcome<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validates arbitrary input data against any supported validator:
 * 1. Standard Schema v1 (`~standard` property, e.g. Zod v3.24+, Zod v4, Valibot, ArkType)
 * 2. `.safeParse()` (Zod, Yup, etc.)
 * 3. `.parse()`
 * 4. Custom validation function: `(data) => { success, data, error }`
 */
export async function validateData<T = any>(
	validator: any,
	input: unknown,
	scopePrefix = ''
): Promise<ValidationOutcome<T>> {
	if (!validator) {
		return { success: true, data: input as T };
	}

	// 1. Standard Schema v1 (~standard specification)
	if (typeof validator === 'object' && validator !== null && '~standard' in validator) {
		try {
			const std = (validator as any)['~standard'];
			const result = await std.validate(input);

			if (
				result &&
				'issues' in result &&
				Array.isArray(result.issues) &&
				result.issues.length > 0
			) {
				const invalidParams = result.issues.map((issue: any) => {
					let pathStr = '';
					if (Array.isArray(issue.path)) {
						pathStr = issue.path
							.map((seg: any) =>
								typeof seg === 'object' && seg !== null && 'key' in seg ? seg.key : String(seg)
							)
							.join('.');
					}
					const name = scopePrefix
						? pathStr
							? `${scopePrefix}.${pathStr}`
							: scopePrefix
						: pathStr || 'value';
					return {
						name,
						reason: issue.message || 'Invalid value'
					};
				});
				return { success: false, invalidParams, rawError: result.issues };
			}

			return { success: true, data: result.value as T };
		} catch (err: any) {
			return {
				success: false,
				invalidParams: [
					{ name: scopePrefix || 'value', reason: err?.message || 'Validation failed' }
				],
				rawError: err
			};
		}
	}

	// 2. Standard .safeParse() (Zod, etc.)
	if (
		typeof validator === 'object' &&
		validator !== null &&
		typeof (validator as any).safeParse === 'function'
	) {
		const parsed = (validator as any).safeParse(input);
		if (parsed.success) {
			return { success: true, data: parsed.data as T };
		}

		// ZodError or similar
		const issues: any[] = parsed.error?.issues || parsed.error?.errors || [];
		const invalidParams =
			issues.length > 0
				? issues.map((issue: any) => {
						const pathStr = Array.isArray(issue.path) ? issue.path.join('.') : '';
						const name = scopePrefix
							? pathStr
								? `${scopePrefix}.${pathStr}`
								: scopePrefix
							: pathStr || 'value';
						return {
							name,
							reason: issue.message || 'Validation failed'
						};
					})
				: [{ name: scopePrefix || 'value', reason: parsed.error?.message || 'Validation failed' }];

		return { success: false, invalidParams, rawError: parsed.error };
	}

	// 3. Functional Validator
	if (typeof validator === 'function') {
		try {
			const res = (validator as any)(input);
			if (res && typeof res === 'object' && 'success' in res) {
				if (res.success) {
					return { success: true, data: (res.data !== undefined ? res.data : input) as T };
				}
				const reason =
					res.error?.message || (typeof res.error === 'string' ? res.error : 'Validation failed');
				return {
					success: false,
					invalidParams: [{ name: scopePrefix || 'value', reason }],
					rawError: res.error
				};
			}

			// If function returned parsed data without error
			return { success: true, data: res as T };
		} catch (err: any) {
			return {
				success: false,
				invalidParams: [
					{ name: scopePrefix || 'value', reason: err?.message || 'Validation failed' }
				],
				rawError: err
			};
		}
	}

	// 4. Standard .parse() throwing validator
	if (
		typeof validator === 'object' &&
		validator !== null &&
		typeof (validator as any).parse === 'function'
	) {
		try {
			const data = (validator as any).parse(input);
			return { success: true, data: data as T };
		} catch (err: any) {
			const issues: any[] = err?.issues || err?.errors || [];
			const invalidParams =
				issues.length > 0
					? issues.map((issue: any) => ({
							name: scopePrefix
								? `${scopePrefix}.${issue.path?.join('.')}`
								: issue.path?.join('.') || 'value',
							reason: issue.message || 'Validation failed'
						}))
					: [{ name: scopePrefix || 'value', reason: err?.message || 'Validation failed' }];

			return { success: false, invalidParams, rawError: err };
		}
	}

	return { success: true, data: input as T };
}
