import type { RequestHandler } from '@sveltejs/kit';
import type { YaxaEndpointConfig } from '../endpoint/types';

/**
 * OpenAPI 3.1 Parameter Object
 */
export interface OpenApiParameter {
	name: string;
	in: 'query' | 'header' | 'path' | 'cookie';
	description?: string;
	required?: boolean;
	deprecated?: boolean;
	schema?: Record<string, any>;
	example?: any;
}

/**
 * OpenAPI 3.1 Request Body Object
 */
export interface OpenApiRequestBody {
	description?: string;
	required?: boolean;
	content: {
		[mediaType: string]: {
			schema?: Record<string, any>;
			example?: any;
		};
	};
}

/**
 * OpenAPI 3.1 Response Object
 */
export interface OpenApiResponse {
	description: string;
	headers?: Record<string, any>;
	content?: {
		[mediaType: string]: {
			schema?: Record<string, any>;
			example?: any;
		};
	};
}

/**
 * OpenAPI 3.1 Operation Object
 */
export interface OpenApiOperation {
	summary?: string;
	description?: string;
	operationId?: string;
	tags?: string[];
	parameters?: OpenApiParameter[];
	requestBody?: OpenApiRequestBody;
	responses: Record<string, OpenApiResponse>;
	deprecated?: boolean;
	security?: Array<Record<string, string[]>>;
}

/**
 * OpenAPI 3.1 Specification Object
 */
export interface OpenApiSpec31 {
	openapi: '3.1.0';
	info: {
		title: string;
		version: string;
		description?: string;
		termsOfService?: string;
		contact?: {
			name?: string;
			url?: string;
			email?: string;
		};
		license?: {
			name: string;
			url?: string;
		};
	};
	servers?: Array<{
		url: string;
		description?: string;
	}>;
	paths: {
		[path: string]: {
			[method: string]: OpenApiOperation;
		};
	};
	components?: {
		schemas?: Record<string, any>;
		securitySchemes?: Record<string, any>;
		responses?: Record<string, OpenApiResponse>;
		parameters?: Record<string, OpenApiParameter>;
	};
	tags?: Array<{
		name: string;
		description?: string;
	}>;
}

export type EndpointLike =
	(RequestHandler & { _yaxaConfig?: YaxaEndpointConfig }) | YaxaEndpointConfig;

export type EndpointMap = Record<string, Record<string, EndpointLike>>;

export interface GenerateOpenApiOptions {
	title?: string;
	version?: string;
	description?: string;
	servers?: Array<{ url: string; description?: string }>;
	endpoints?: EndpointMap;
	registry?: any; // ApiRegistry
}

export type ApiDocsTheme = 'scalar' | 'swagger' | 'redoc';

export interface ApiDocsOptions extends GenerateOpenApiOptions {
	/**
	 * Interactive UI theme:
	 * - 'scalar' (default): Modern, dark-mode native, high contrast developer reference.
	 * - 'swagger': Classic Swagger UI with interactive Try-It-Out console.
	 * - 'redoc': Clean 3-panel technical documentation format.
	 */
	theme?: ApiDocsTheme;
	/**
	 * Mount path of documentation endpoint (default: '/api/docs').
	 */
	docsPath?: string;
	/**
	 * CDN version/URL overrides if needed.
	 */
	cdnUrl?: string;
}
