import { describe, it, expect } from 'vitest';
import { createMockRequestEvent } from '$lib/testing';
import { createS3UploadHandler } from './index';

describe('Server S3 Storage Upload Handler', () => {
	it('returns 400 Bad Request when filename is missing', async () => {
		const handler = createS3UploadHandler();
		const event = createMockRequestEvent({
			method: 'POST',
			body: { contentType: 'image/png' }
		});

		const response = await handler(event);
		expect(response.status).toBe(400);

		const data = await response.json();
		expect(data.error).toBe('Filename is required');
	});

	it('returns 400 Bad Request when file size exceeds maxFileSize', async () => {
		const handler = createS3UploadHandler({
			maxFileSize: 1024 * 1024 // 1 MB limit
		});

		const event = createMockRequestEvent({
			method: 'POST',
			body: {
				filename: 'video.mp4',
				contentType: 'video/mp4',
				size: 5 * 1024 * 1024 // 5 MB
			}
		});

		const response = await handler(event);
		expect(response.status).toBe(400);

		const data = await response.json();
		expect(data.error).toContain('File size exceeds maximum allowed');
	});

	it('returns 400 Bad Request when contentType is not in allowedTypes', async () => {
		const handler = createS3UploadHandler({
			allowedTypes: ['image/*']
		});

		const event = createMockRequestEvent({
			method: 'POST',
			body: {
				filename: 'executable.exe',
				contentType: 'application/x-msdownload'
			}
		});

		const response = await handler(event);
		expect(response.status).toBe(400);

		const data = await response.json();
		expect(data.error).toContain("File type 'application/x-msdownload' not allowed");
	});

	it('returns 401 Unauthorized when requireAuth check returns false', async () => {
		const handler = createS3UploadHandler({
			requireAuth: () => false
		});

		const event = createMockRequestEvent({
			method: 'POST',
			body: { filename: 'avatar.png' }
		});

		const response = await handler(event);
		expect(response.status).toBe(401);

		const data = await response.json();
		expect(data.error).toBe('Unauthorized');
	});
});
