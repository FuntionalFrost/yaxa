import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { schemaPg, schemaSqlite, getDb, type AnyDb } from '../db';

export interface YaxaAuthConfig {
	db?: AnyDb;
	driver?: 'neon' | 'turso' | 'sqlite';
	secret?: string;
	baseURL?: string;
	socialProviders?: {
		github?: {
			clientId: string;
			clientSecret: string;
		};
		google?: {
			clientId: string;
			clientSecret: string;
		};
		discord?: {
			clientId: string;
			clientSecret: string;
		};
	};
	emailAndPassword?: {
		enabled: boolean;
		requireEmailVerification?: boolean;
	};
	magicLink?: {
		enabled: boolean;
		sendMagicLink?: (data: { email: string; token: string; url: string }) => Promise<void>;
	};
}

/**
 * Creates and initializes a Better-Auth instance pre-configured for Yaxa and Drizzle.
 */
export function createYaxaAuth(config: YaxaAuthConfig = {}) {
	const driver =
		config.driver ||
		(typeof process !== 'undefined'
			? (process.env.DATABASE_DRIVER as 'neon' | 'turso' | 'sqlite')
			: undefined) ||
		'neon';

	const database = config.db || getDb({ driver });

	const authOptions: BetterAuthOptions = {
		secret:
			config.secret ||
			(typeof process !== 'undefined' ? process.env.BETTER_AUTH_SECRET : undefined) ||
			'yaxa-default-super-secret-key-change-in-prod-123456789',
		baseURL:
			config.baseURL ||
			(typeof process !== 'undefined'
				? process.env.PUBLIC_APP_URL || process.env.BETTER_AUTH_URL
				: undefined) ||
			'http://localhost:5173',
		database: drizzleAdapter(database as any, {
			provider: driver === 'neon' ? 'pg' : 'sqlite',
			schema: driver === 'neon' ? schemaPg : schemaSqlite
		}),
		emailAndPassword: {
			enabled: config.emailAndPassword?.enabled ?? true,
			requireEmailVerification: config.emailAndPassword?.requireEmailVerification ?? false
		},
		socialProviders: {
			...(config.socialProviders?.github
				? {
						github: {
							clientId: config.socialProviders.github.clientId,
							clientSecret: config.socialProviders.github.clientSecret
						}
					}
				: typeof process !== 'undefined' &&
					  process.env.GITHUB_CLIENT_ID &&
					  process.env.GITHUB_CLIENT_SECRET
					? {
							github: {
								clientId: process.env.GITHUB_CLIENT_ID,
								clientSecret: process.env.GITHUB_CLIENT_SECRET
							}
						}
					: {}),
			...(config.socialProviders?.google
				? {
						google: {
							clientId: config.socialProviders.google.clientId,
							clientSecret: config.socialProviders.google.clientSecret
						}
					}
				: typeof process !== 'undefined' &&
					  process.env.GOOGLE_CLIENT_ID &&
					  process.env.GOOGLE_CLIENT_SECRET
					? {
							google: {
								clientId: process.env.GOOGLE_CLIENT_ID,
								clientSecret: process.env.GOOGLE_CLIENT_SECRET
							}
						}
					: {})
		}
	};

	return betterAuth(authOptions);
}

export type YaxaAuth = ReturnType<typeof createYaxaAuth>;
export { createYaxaAuthHook } from './hook';
export type { YaxaAuthHookOptions } from './hook';
