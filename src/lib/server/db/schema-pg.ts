import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Better-Auth Core Tables (PostgreSQL)
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
	role: text('role').default('user'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires', { mode: 'date' }),
	twoFactorEnabled: boolean('two_factor_enabled').default(false)
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	activeOrganizationId: text('active_organization_id')
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'date' }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'date' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }),
	updatedAt: timestamp('updated_at', { mode: 'date' })
});

// ---------------------------------------------------------------------------
// Better-Auth Passkey (WebAuthn) & Two-Factor (2FA) Tables (PostgreSQL)
// ---------------------------------------------------------------------------

export const passkey = pgTable('passkey', {
	id: text('id').primaryKey(),
	name: text('name'),
	publicKey: text('public_key').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	credentialID: text('credential_id').notNull(),
	counter: integer('counter').notNull().default(0),
	deviceType: text('device_type').notNull().default('singleDevice'),
	backedUp: boolean('backed_up').notNull().default(false),
	transports: text('transports'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull()
});

export const twoFactor = pgTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

// ---------------------------------------------------------------------------
// Better-Auth Multi-Tenant Organization Tables (PostgreSQL)
// ---------------------------------------------------------------------------

export const organization = pgTable('organization', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	logo: text('logo'),
	metadata: text('metadata'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});

export const member = pgTable('member', {
	id: text('id').primaryKey(),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organization.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	role: text('role').notNull().default('member'), // 'owner' | 'admin' | 'member'
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});

export const invitation = pgTable('invitation', {
	id: text('id').primaryKey(),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organization.id, { onDelete: 'cascade' }),
	email: text('email').notNull(),
	role: text('role').default('member'),
	status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'rejected' | 'canceled'
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	inviterId: text('inviter_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull()
});

// ---------------------------------------------------------------------------
// Polar.sh Billing & Subscription Tables (PostgreSQL)
// ---------------------------------------------------------------------------

export const customer = pgTable('customer', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	polarCustomerId: text('polar_customer_id').notNull().unique(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});

export const subscription = pgTable('subscription', {
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
	currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
	cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});
