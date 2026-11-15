import { describe, it, expect } from 'vitest';
import * as serverExports from './index';
import fs from 'node:fs';
import path from 'node:path';

describe('Server Entry Point Purity (yaxa-svelte/server)', () => {
	const FORBIDDEN_SDK_EXPORTS = [
		// Better-Auth factory (strictly yaxa-svelte/auth)
		'createYaxaAuth',
		// Drizzle & DB drivers (strictly yaxa-svelte/db)
		'getDb',
		'schemaPg',
		'schemaSqlite',
		// Polar.sh SDK (strictly yaxa-svelte/polar)
		'getPolarClient',
		'createPolarCheckout',
		'createPolarCustomerPortalSession',
		'createPolarWebhookHandler',
		// Resend SDK (strictly yaxa-svelte/email)
		'getResendClient',
		'sendMagicLinkEmail',
		'sendWelcomeEmail',
		// AWS S3 / R2 SDK (strictly yaxa-svelte/storage)
		'getS3Client',
		'createPresignedUploadUrl',
		'createS3UploadHandler'
	];

	const FORBIDDEN_PEER_PACKAGES = [
		'better-auth',
		'drizzle-orm',
		'@neondatabase/serverless',
		'@libsql/client',
		'@polar-sh/sdk',
		'resend',
		'@aws-sdk/client-s3',
		'@aws-sdk/s3-request-presigner'
	];

	it('must NOT export third-party SDK factories that belong in dedicated subpaths', () => {
		for (const name of FORBIDDEN_SDK_EXPORTS) {
			expect(
				(serverExports as Record<string, unknown>)[name],
				`Accidental re-export of '${name}' in 'yaxa-svelte/server'! Must live strictly in its dedicated SDK subpath (auth, db, polar, email, storage).`
			).toBeUndefined();
		}
	});

	it('src/lib/server/index.ts must not reference optional SDK subpaths or peer dependencies', () => {
		const indexPath = path.resolve('src/lib/server/index.ts');
		const source = fs.readFileSync(indexPath, 'utf-8');

		const FORBIDDEN_REFS = [
			'./db/index',
			'./auth/index',
			'./polar',
			'./email',
			'./storage',
			...FORBIDDEN_PEER_PACKAGES
		];

		for (const forbidden of FORBIDDEN_REFS) {
			// Ignore comments when checking source
			const codeWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
			expect(
				codeWithoutComments.includes(forbidden),
				`src/lib/server/index.ts contains forbidden reference: '${forbidden}'`
			).toBe(false);
		}
	});

	it('no module reachable via static imports from src/lib/server/index.ts may statically import optional peer dependencies', () => {
		const visited = new Set<string>();

		function resolveLocalFile(fromFile: string, specifier: string): string | null {
			if (!specifier.startsWith('.')) return null;
			const base = path.resolve(path.dirname(fromFile), specifier);
			const candidates = [
				base,
				`${base}.ts`,
				`${base}.js`,
				path.join(base, 'index.ts'),
				path.join(base, 'index.js')
			];
			for (const candidate of candidates) {
				if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
					return candidate;
				}
			}
			return null;
		}

		function checkFileRecursively(filePath: string) {
			if (visited.has(filePath)) return;
			visited.add(filePath);

			const raw = fs.readFileSync(filePath, 'utf-8');
			const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

			// Match static value imports/exports (excluding `import type` and `export type`)
			const staticImportRegex =
				/(?:^|\n)\s*(?:import|export)\s+(?!type\b)(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;

			let match: RegExpExecArray | null;
			while ((match = staticImportRegex.exec(code)) !== null) {
				const specifier = match[1];

				for (const peer of FORBIDDEN_PEER_PACKAGES) {
					expect(
						specifier === peer || specifier.startsWith(`${peer}/`),
						`File ${path.relative(process.cwd(), filePath)} has a top-level static import of optional peer dependency '${specifier}'. This breaks 'yaxa-svelte/server' when '${peer}' is not installed.`
					).toBe(false);
				}

				const resolved = resolveLocalFile(filePath, specifier);
				if (resolved) {
					checkFileRecursively(resolved);
				}
			}
		}

		checkFileRecursively(path.resolve('src/lib/server/index.ts'));
		expect(visited.size).toBeGreaterThan(5);
	});

	it('exports all zero-dependency server primitives cleanly', () => {
		expect(typeof serverExports.yaxaEndpoint).toBe('function');
		expect(typeof serverExports.requireAuth).toBe('function');
		expect(typeof serverExports.requireRole).toBe('function');
		expect(typeof serverExports.rateLimit).toBe('function');
		expect(typeof serverExports.generateOpenApiSpec).toBe('function');
		expect(typeof serverExports.createApiDocsHandler).toBe('function');
		expect(typeof serverExports.yaxaSSE).toBe('function');
		expect(typeof serverExports.broadcast).toBe('function');
		expect(typeof serverExports.enqueueJob).toBe('function');
		expect(typeof serverExports.defineWorker).toBe('function');
		expect(typeof serverExports.createJobRunner).toBe('function');
		expect(typeof serverExports.createAiStreamHandler).toBe('function');
		expect(typeof serverExports.createRequestLogger).toBe('function');
		expect(typeof serverExports.createServerTiming).toBe('function');
		expect(typeof serverExports.resolveTraceContext).toBe('function');
		expect(typeof serverExports.parseTraceparent).toBe('function');
		expect(typeof serverExports.parseDataTableQuery).toBe('function');
		expect(typeof serverExports.createYaxaHook).toBe('function');
		expect(typeof serverExports.createYaxaAuthHook).toBe('function');
		expect(typeof serverExports.csrfGuard).toBe('function');
		expect(typeof serverExports.buildSecurityHeaders).toBe('function');
		expect(typeof serverExports.createSecurityHeadersHook).toBe('function');
		expect(typeof serverExports.verifyWebhookSignature).toBe('function');
		expect(typeof serverExports.createWebhookHandler).toBe('function');
	});
});
