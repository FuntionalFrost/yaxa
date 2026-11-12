import { describe, it, expect } from 'vitest';
import * as rootExports from './index';
import fs from 'node:fs';
import path from 'node:path';

describe('Root Entry Point Purity (yaxa-svelte)', () => {
	const FORBIDDEN_EXPORTS = [
		// Better-Auth client cards & composables (strictly yaxa-svelte/auth)
		'useAuth',
		'AuthCard',
		'SignInCard',
		'SignUpCard',
		'ResetPasswordCard',
		'PasskeyUI',
		'TwoFactorModal',
		'createYaxaAuth',
		// Database & ORM (strictly yaxa-svelte/db)
		'getDb',
		'schemaPg',
		'schemaSqlite',
		// Server endpoints & pipeline (strictly yaxa-svelte/server)
		'yaxaEndpoint',
		'requireAuth',
		'requireRole',
		'createAiStreamHandler',
		'createApiDocsHandler',
		'yaxaSSE',
		'broadcast',
		'enqueueJob',
		'defineWorker',
		'createJobRunner',
		// Admin (strictly yaxa-svelte/admin)
		'createYaxaAdminHook',
		'createDrizzleAdmin',
		'AdminDashboard',
		// Polar billing (strictly yaxa-svelte/polar)
		'createPolarCheckout',
		'createPolarWebhookHandler',
		// Resend emails (strictly yaxa-svelte/email)
		'sendMagicLinkEmail',
		'sendWelcomeEmail',
		// Storage uploads (strictly yaxa-svelte/storage)
		'createPresignedUploadUrl'
	];

	it('must NOT export any Better-Auth, database, or server backend primitives', () => {
		for (const name of FORBIDDEN_EXPORTS) {
			expect(
				(rootExports as Record<string, unknown>)[name],
				`Accidental re-export of '${name}' in root 'yaxa-svelte'! Must be in appropriate subpath ('yaxa-svelte/auth', 'yaxa-svelte/server', etc.)`
			).toBeUndefined();
		}
	});

	it('src/lib/index.ts source must not reference restricted subpaths or heavy backend peer dependencies', () => {
		const indexPath = path.resolve('src/lib/index.ts');
		const source = fs.readFileSync(indexPath, 'utf-8');

		const FORBIDDEN_SUBPATHS = [
			'./auth',
			'./server',
			'./db',
			'./polar',
			'./email',
			'./storage',
			'./admin',
			'better-auth',
			'drizzle-orm',
			'@polar-sh/sdk',
			'resend',
			'@aws-sdk'
		];

		for (const forbidden of FORBIDDEN_SUBPATHS) {
			expect(
				source.includes(forbidden),
				`src/lib/index.ts contains forbidden reference: '${forbidden}'`
			).toBe(false);
		}
	});

	it('src/lib/index.ts must not re-export auth card components', () => {
		const indexPath = path.resolve('src/lib/index.ts');
		const source = fs.readFileSync(indexPath, 'utf-8');

		const FORBIDDEN_AUTH_CARDS = [
			'AuthCard',
			'SignInCard',
			'SignUpCard',
			'ResetPasswordCard',
			'PasskeyUI',
			'TwoFactorModal',
			'useAuth'
		];

		for (const card of FORBIDDEN_AUTH_CARDS) {
			const regex = new RegExp(`\\b${card}\\b`);
			expect(
				regex.test(source),
				`src/lib/index.ts contains forbidden auth component: '${card}'`
			).toBe(false);
		}
	});

	it('root entry point successfully evaluates without throwing runtime errors', () => {
		expect(rootExports).toBeDefined();
		expect(typeof rootExports.Button).toBe('function');
		expect(typeof rootExports.Modal).toBe('function');
		expect(typeof rootExports.Gate).toBe('function');
		expect(typeof rootExports.UserMenu).toBe('function');
		expect(typeof rootExports.useGate).toBe('function');
		expect(typeof rootExports.useYaxa).toBe('function');
	});
});
