import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: [
			'dist/**',
			'.svelte-kit/**',
			'build/**',
			'coverage/**',
			'.vercel/**',
			'.output/**',
			'**/*.timestamp-*'
		]
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		},
		rules: {
			'svelte/no-at-html-tags': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-each-key': 'off'
		}
	},
	{
		files: ['src/lib/index.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'better-auth',
							message: 'Root barrel cannot import better-auth. Keep root pure UI.'
						},
						{
							name: 'better-auth/svelte',
							message: 'Root barrel cannot import better-auth/svelte. Use yaxa-svelte/auth.'
						}
					],
					patterns: [
						{
							group: [
								'**/server/**',
								'**/auth/**',
								'**/db/**',
								'**/polar/**',
								'**/email/**',
								'**/storage/**',
								'**/admin/**'
							],
							message:
								'Root entry point (yaxa-svelte) must stay 100% pure UI and cannot re-export from server, auth, db, or backend subpaths.'
						},
						{
							group: [
								'**/components/saas/AuthCard*',
								'**/components/saas/SignInCard*',
								'**/components/saas/SignUpCard*',
								'**/components/saas/ResetPasswordCard*',
								'**/components/saas/PasskeyUI*',
								'**/components/saas/TwoFactorModal*',
								'**/composables/useAuth*'
							],
							message:
								'Better-Auth components and useAuth must be exported strictly from yaxa-svelte/auth.'
						}
					]
				}
			]
		}
	}
);
