import type { EndpointLike, EndpointMap } from './types';

/**
 * Route & Endpoint Registry for OpenAPI discovery and introspection.
 */
export class ApiRegistry {
	private endpoints: EndpointMap = {};

	/**
	 * Registers endpoints for a given path.
	 * @param path SvelteKit route path (e.g. '/api/projects' or '/api/projects/[id]')
	 * @param methods Map of HTTP methods to handlers or yaxaEndpoint configs
	 */
	register(path: string, methods: Record<string, EndpointLike>): this {
		const normalizedPath = this.normalizePath(path);
		if (!this.endpoints[normalizedPath]) {
			this.endpoints[normalizedPath] = {};
		}

		for (const [method, handler] of Object.entries(methods)) {
			this.endpoints[normalizedPath][method.toUpperCase()] = handler;
		}

		return this;
	}

	/**
	 * Retrieves all registered endpoints.
	 */
	getEndpoints(): EndpointMap {
		return this.endpoints;
	}

	/**
	 * Clears registered endpoints (useful in testing).
	 */
	clear(): void {
		this.endpoints = {};
	}

	/**
	 * Normalizes SvelteKit path parameters to OpenAPI format:
	 * '/api/projects/[id]' -> '/api/projects/{id}'
	 * '/api/teams/[orgSlug]/members/[userId]' -> '/api/teams/{orgSlug}/members/{userId}'
	 */
	normalizePath(path: string): string {
		return path.replace(/\[\.\.\.(\w+)\]/g, '{$1}').replace(/\[(\w+)\]/g, '{$1}');
	}
}

/**
 * Global singleton API registry for zero-config route registration.
 */
export const globalApiRegistry = new ApiRegistry();

/**
 * Creates a new isolated API registry instance.
 */
export function createApiRegistry(): ApiRegistry {
	return new ApiRegistry();
}
