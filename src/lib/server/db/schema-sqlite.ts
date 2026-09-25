import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// Better-Auth Core Tables (SQLite / Turso)
// ---------------------------------------------------------------------------

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	role: text('role').default('user'),
	banned: integer('banned', { mode: 'boolean' }).default(false),
	banReason: text('ban_reason'),
	banExpires: integer('ban_expires', { mode: 'timestamp' }),
	twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).default(false)
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	activeOrganizationId: text('active_organization_id')
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// ---------------------------------------------------------------------------
// Better-Auth Passkey (WebAuthn) & Two-Factor (2FA) Tables (SQLite / Turso)
// ---------------------------------------------------------------------------

export const passkey = sqliteTable('passkey', {
	id: text('id').primaryKey(),
	name: text('name'),
	publicKey: text('public_key').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	credentialID: text('credential_id').notNull(),
	counter: integer('counter').notNull().default(0),
	deviceType: text('device_type').notNull().default('singleDevice'),
	backedUp: integer('backed_up', { mode: 'boolean' }).notNull().default(false),
	transports: text('transports'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const twoFactor = sqliteTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

// ---------------------------------------------------------------------------
// Better-Auth Multi-Tenant Organization Tables (SQLite / Turso)
// ---------------------------------------------------------------------------

export const organization = sqliteTable('organization', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	logo: text('logo'),
	metadata: text('metadata'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const member = sqliteTable('member', {
	id: text('id').primaryKey(),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organization.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	role: text('role').notNull().default('member'), // 'owner' | 'admin' | 'member'
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const invitation = sqliteTable('invitation', {
	id: text('id').primaryKey(),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organization.id, { onDelete: 'cascade' }),
	email: text('email').notNull(),
	role: text('role').default('member'),
	status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'rejected' | 'canceled'
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	inviterId: text('inviter_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// ---------------------------------------------------------------------------
// Polar.sh Billing & Subscription Tables (SQLite / Turso)
// ---------------------------------------------------------------------------

export const customer = sqliteTable('customer', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	polarCustomerId: text('polar_customer_id').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const subscription = sqliteTable('subscription', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	polarId: text('polar_id').unique(),
	status: text('status').notNull().default('incomplete'), // 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
	priceId: text('price_id'),
	productId: text('product_id'),
	tier: text('tier').notNull().default('free'), // e.g. 'free' | 'pro' | 'enterprise'
	interval: text('interval'), // 'month' | 'year'
	currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
	cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});
