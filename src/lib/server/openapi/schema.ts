import { z } from 'zod';

/**
 * Converts a Zod or Standard Schema validator into a compliant OpenAPI 3.1 JSON Schema.
 */
export function convertToJsonSchema(validator: any): Record<string, any> {
	if (!validator) {
		return { type: 'object' };
	}

	// 1. Zod native JSON schema converter
	if (typeof (z as any)?.toJSONSchema === 'function') {
		try {
			const jsonSchema = (z as any).toJSONSchema(validator);
			if (jsonSchema && typeof jsonSchema === 'object') {
				const cleanSchema = { ...jsonSchema };
				delete cleanSchema.$schema;
				return cleanSchema;
			}
		} catch {
			// Fall through to other strategies
		}
	}

	// 2. Check if validator has built-in jsonSchema method/property
	if (typeof validator.jsonSchema === 'function') {
		try {
			const res = validator.jsonSchema();
			const cleanSchema = { ...res };
			delete cleanSchema.$schema;
			return cleanSchema;
		} catch {
			// Fall through
		}
	}

	if (typeof validator.jsonSchema === 'object' && validator.jsonSchema !== null) {
		const cleanSchema = { ...validator.jsonSchema };
		delete cleanSchema.$schema;
		return cleanSchema;
	}

	// 3. Heuristic for common object schema shapes
	if (typeof validator === 'object' && validator !== null) {
		if ('shape' in validator && typeof validator.shape === 'object') {
			const properties: Record<string, any> = {};
			const required: string[] = [];

			for (const [key, val] of Object.entries(validator.shape)) {
				properties[key] = convertToJsonSchema(val);
				if (!(val as any)?.isOptional?.()) {
					required.push(key);
				}
			}

			return {
				type: 'object',
				properties,
				...(required.length > 0 ? { required } : {})
			};
		}
	}

	return { type: 'string' };
}
