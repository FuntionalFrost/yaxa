export interface UseUploadOptions {
	/** Endpoint URL to request a presigned upload URL or handle multipart uploads (default: '/api/upload') */
	endpoint?: string;
	/** Optional headers for the presign request */
	headers?: Record<string, string>;
	/** Callback when upload completes successfully */
	onSuccess?: (result: { url: string; key?: string }) => void;
	/** Callback on error */
	onError?: (error: Error) => void;
	/** Callback on progress changes (0-100) */
	onProgress?: (progress: number) => void;
}

export interface UploadResult {
	url: string;
	key?: string;
}

/**
 * Creates a reactive Svelte 5 Rune composable for handling file uploads
 * with progress tracking, error handling, and S3 / Cloudflare R2 presigned URL support.
 */
export function useUpload(options: UseUploadOptions = {}) {
	const defaultEndpoint = options.endpoint ?? '/api/upload';

	let isUploading = $state(false);
	let progress = $state(0);
	let url = $state<string | null>(null);
	let uploadedKey = $state<string | null>(null);
	let error = $state<string | null>(null);

	function reset() {
		isUploading = false;
		progress = 0;
		url = null;
		uploadedKey = null;
		error = null;
	}

	async function upload(file: File, overrideEndpoint?: string): Promise<UploadResult | null> {
		const targetEndpoint = overrideEndpoint || defaultEndpoint;
		isUploading = true;
		progress = 0;
		error = null;

		try {
			// Step 1: Request presigned URL or direct upload instructions from backend
			const presignRes = await fetch(targetEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(options.headers || {})
				},
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type || 'application/octet-stream',
					size: file.size
				})
			});

			if (!presignRes.ok) {
				const errData = await presignRes.json().catch(() => ({}));
				throw new Error(
					errData.message || `Upload authorization failed with status ${presignRes.status}`
				);
			}

			const data = await presignRes.json();

			// Case A: Server returned a direct presigned PUT URL (S3, Cloudflare R2, GCS)
			if (data.uploadUrl) {
				await new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open('PUT', data.uploadUrl, true);
					xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

					xhr.upload.onprogress = (e) => {
						if (e.lengthComputable) {
							const pct = Math.round((e.loaded / e.total) * 100);
							progress = pct;
							options.onProgress?.(pct);
						}
					};

					xhr.onload = () => {
						if (xhr.status >= 200 && xhr.status < 300) {
							progress = 100;
							options.onProgress?.(100);
							resolve();
						} else {
							reject(new Error(`S3 upload failed with status ${xhr.status}`));
						}
					};

					xhr.onerror = () => reject(new Error('Network error during file upload'));
					xhr.ontimeout = () => reject(new Error('File upload timed out'));

					xhr.send(file);
				});

				const finalUrl = data.publicUrl || data.url || data.uploadUrl.split('?')[0];
				url = finalUrl;
				uploadedKey = data.key || null;

				const result: UploadResult = { url: finalUrl, key: data.key };
				options.onSuccess?.(result);
				return result;
			}

			// Case B: Direct file response (backend handled the storage upload directly)
			if (data.url) {
				progress = 100;
				url = data.url;
				uploadedKey = data.key || null;
				const result: UploadResult = { url: data.url, key: data.key };
				options.onSuccess?.(result);
				return result;
			}

			throw new Error('Invalid upload response from server');
		} catch (err: unknown) {
			const e = err instanceof Error ? err : new Error(String(err));
			error = e.message;
			options.onError?.(e);
			return null;
		} finally {
			isUploading = false;
		}
	}

	return {
		get isUploading() {
			return isUploading;
		},
		get progress() {
			return progress;
		},
		get url() {
			return url;
		},
		get key() {
			return uploadedKey;
		},
		get error() {
			return error;
		},
		upload,
		reset
	};
}
