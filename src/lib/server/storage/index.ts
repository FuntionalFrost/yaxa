import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RequestEvent } from '@sveltejs/kit';

export interface S3StorageConfig {
	bucket?: string;
	region?: string;
	endpoint?: string;
	accessKeyId?: string;
	secretAccessKey?: string;
	publicUrl?: string;
	forcePathStyle?: boolean;
}

let cachedS3Client: S3Client | null = null;

export function getS3Client(config: S3StorageConfig = {}): S3Client {
	if (cachedS3Client && !config.accessKeyId) {
		return cachedS3Client;
	}

	const region =
		config.region ||
		(typeof process !== 'undefined'
			? process.env.S3_REGION || process.env.AWS_REGION || 'auto'
			: 'auto');

	const endpoint =
		config.endpoint || (typeof process !== 'undefined' ? process.env.S3_ENDPOINT : undefined);

	const accessKeyId =
		config.accessKeyId ||
		(typeof process !== 'undefined'
			? process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
			: undefined) ||
		'';

	const secretAccessKey =
		config.secretAccessKey ||
		(typeof process !== 'undefined'
			? process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
			: undefined) ||
		'';

	const client = new S3Client({
		region,
		endpoint: endpoint || undefined,
		credentials:
			accessKeyId && secretAccessKey
				? {
						accessKeyId,
						secretAccessKey
					}
				: undefined,
		forcePathStyle: config.forcePathStyle ?? false
	});

	if (!config.accessKeyId) cachedS3Client = client;
	return client;
}

export interface PresignedUploadOptions {
	filename: string;
	contentType?: string;
	folder?: string;
	expiresIn?: number;
	config?: S3StorageConfig;
}

export interface PresignedUploadResult {
	uploadUrl: string;
	publicUrl: string;
	key: string;
}

/**
 * Generates a presigned PUT URL for direct client-to-storage uploads (AWS S3, Cloudflare R2, MinIO).
 */
export async function createPresignedUploadUrl(
	options: PresignedUploadOptions
): Promise<PresignedUploadResult> {
	const bucket =
		options.config?.bucket ||
		(typeof process !== 'undefined' ? process.env.S3_BUCKET || process.env.R2_BUCKET : undefined) ||
		'yaxa-uploads';

	const publicBaseUrl =
		options.config?.publicUrl ||
		(typeof process !== 'undefined'
			? process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL
			: undefined);

	const folder = options.folder ? `${options.folder.replace(/^\/+|\/+$/g, '')}/` : '';
	const cleanName = options.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
	const key = `${folder}${Date.now()}-${cleanName}`;

	const s3 = getS3Client(options.config);

	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentType: options.contentType || 'application/octet-stream'
	});

	const uploadUrl = await getSignedUrl(s3, command, {
		expiresIn: options.expiresIn || 600 // 10 minutes default
	});

	const publicUrl = publicBaseUrl
		? `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
		: uploadUrl.split('?')[0];

	return {
		uploadUrl,
		publicUrl,
		key
	};
}

export interface S3UploadHandlerOptions {
	config?: S3StorageConfig;
	folder?: string;
	maxFileSize?: number;
	allowedTypes?: string[];
	requireAuth?: (event: RequestEvent) => Promise<boolean> | boolean;
}

/**
 * Turnkey SvelteKit API RequestHandler to generate presigned upload URLs for `useUpload()`.
 *
 * Example:
 * ```ts
 * // src/routes/api/upload/+server.ts
 * import { createS3UploadHandler } from 'yaxa-svelte/server';
 * export const POST = createS3UploadHandler();
 * ```
 */
export function createS3UploadHandler(options: S3UploadHandlerOptions = {}) {
	return async (event: RequestEvent): Promise<Response> => {
		if (options.requireAuth) {
			const isAuthed = await options.requireAuth(event);
			if (!isAuthed) {
				return new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		try {
			const body = await event.request.json();
			const { filename, contentType, size } = body;

			if (!filename) {
				return new Response(JSON.stringify({ error: 'Filename is required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			if (options.maxFileSize && size && size > options.maxFileSize) {
				return new Response(
					JSON.stringify({
						error: `File size exceeds maximum allowed of ${options.maxFileSize} bytes`
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } }
				);
			}

			if (options.allowedTypes && contentType) {
				const isAllowed = options.allowedTypes.some((type) => {
					if (type.endsWith('/*')) {
						return contentType.startsWith(type.replace('/*', ''));
					}
					return contentType === type;
				});

				if (!isAllowed) {
					return new Response(JSON.stringify({ error: `File type '${contentType}' not allowed` }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					});
				}
			}

			const result = await createPresignedUploadUrl({
				filename,
				contentType,
				folder: options.folder,
				config: options.config
			});

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Upload generation failed';
			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	};
}
