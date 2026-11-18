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
		'createRequestLogger',
		'createServerTiming',
		'resolveTraceContext',
		'csrfGuard',
		'createSecurityHeadersHook',
		'createWebhookHandler',
		'verifyWebhookSignature',
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
		expect(typeof rootExports.Callout).toBe('function');
		expect(typeof rootExports.CodeGroup).toBe('function');
		expect(typeof rootExports.Steps).toBe('function');
		expect(typeof rootExports.Markdown).toBe('function');
		expect(typeof rootExports.Collapsible).toBe('function');
		expect(typeof rootExports.Sparkline).toBe('function');
		expect(typeof rootExports.ActionBar).toBe('function');
		expect(typeof rootExports.KanbanBoard).toBe('function');
		expect(typeof rootExports.Calendar).toBe('function');
		expect(typeof rootExports.defineFlags).toBe('function');
		expect(typeof rootExports.useFeatureFlag).toBe('function');
	});
});

describe('Package Exports & Svelte Condition Integrity (package.json)', () => {
	const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8')) as {
		exports: Record<string, string | { types?: string; svelte?: string; default?: string }>;
	};

	function resolveLocalModule(fromFile: string, specifier: string): string | null {
		if (!specifier.startsWith('.')) return null;
		const base = path.resolve(path.dirname(fromFile), specifier);
		const candidates = [
			base,
			`${base}.ts`,
			`${base}.svelte.ts`,
			`${base}.svelte`,
			`${base}.js`,
			path.join(base, 'index.ts'),
			path.join(base, 'index.svelte.ts'),
			path.join(base, 'index.js')
		];
		for (const candidate of candidates) {
			if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
				return candidate;
			}
		}
		return null;
	}

	function graphContainsSvelteModules(entryFile: string): boolean {
		const visited = new Set<string>();
		let foundSvelte = false;

		function walk(filePath: string) {
			if (visited.has(filePath) || foundSvelte) return;
			visited.add(filePath);

			if (filePath.endsWith('.svelte') || filePath.endsWith('.svelte.ts')) {
				foundSvelte = true;
				return;
			}

			const raw = fs.readFileSync(filePath, 'utf-8');
			const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
			const staticImportRegex =
				/(?:^|\n)\s*(?:import|export)\s+(?!type\b)(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;

			let match: RegExpExecArray | null;
			while ((match = staticImportRegex.exec(code)) !== null) {
				const specifier = match[1];
				if (specifier.endsWith('.svelte') || specifier.endsWith('.svelte.ts')) {
					foundSvelte = true;
					return;
				}
				const resolved = resolveLocalModule(filePath, specifier);
				if (resolved) {
					walk(resolved);
				}
			}
		}

		walk(entryFile);
		return foundSvelte;
	}

	it('every JS subpath in package.json maps to an existing src/lib entry and has "svelte" condition iff it exports .svelte / .svelte.ts modules', () => {
		for (const [subpath, target] of Object.entries(pkg.exports)) {
			if (typeof target === 'string') {
				// CSS exports (./yaxa.css, ./theme.css)
				const srcCss = target.replace(/^\.\/dist\//, 'src/lib/');
				expect(
					fs.existsSync(path.resolve(srcCss)),
					`CSS export '${subpath}' points to missing source file '${srcCss}'`
				).toBe(true);
				continue;
			}

			expect(target.default, `Export '${subpath}' is missing "default" condition`).toBeDefined();
			expect(target.types, `Export '${subpath}' is missing "types" condition`).toBeDefined();

			const srcEntry = path.resolve(
				target.default!.replace(/^\.\/dist\//, 'src/lib/').replace(/\.js$/, '.ts')
			);
			expect(
				fs.existsSync(srcEntry),
				`Export '${subpath}' points to missing source entry '${srcEntry}'`
			).toBe(true);

			const hasSvelteRuntime = graphContainsSvelteModules(srcEntry);
			if (hasSvelteRuntime) {
				expect(
					target.svelte,
					`Subpath '${subpath}' (${path.relative(process.cwd(), srcEntry)}) exports .svelte or .svelte.ts runtime code and MUST include "svelte": "${target.default}" in package.json#exports`
				).toBe(target.default);
			} else {
				expect(
					target.svelte,
					`Subpath '${subpath}' (${path.relative(process.cwd(), srcEntry)}) is pure .ts and should NOT include a "svelte" condition in package.json#exports`
				).toBeUndefined();
			}
		}
	});
});
