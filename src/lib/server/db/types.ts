export type DbDriver = 'neon' | 'turso' | 'sqlite';

export interface SaasUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export type OrgRole = 'owner' | 'admin' | 'member';

export interface SaasOrganization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	metadata?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface SaasMember {
	id: string;
	organizationId: string;
	userId: string;
	role: OrgRole | string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SaasInvitation {
	id: string;
	organizationId: string;
	email: string;
	role?: OrgRole | string | null;
	status: 'pending' | 'accepted' | 'rejected' | 'canceled';
	expiresAt: Date;
	inviterId: string;
	createdAt: Date;
}

export type SubscriptionStatus =
	'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid';

export interface SaasSubscription {
	id: string;
	userId: string;
	polarId?: string | null;
	status: SubscriptionStatus;
	priceId?: string | null;
	productId?: string | null;
	tier: string;
	interval?: 'month' | 'year' | null;
	currentPeriodEnd?: Date | null;
	cancelAtPeriodEnd: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PricingFeature {
	name: string;
	included: boolean;
	hint?: string;
}

export interface PricingTier {
	id: string;
	name: string;
	description: string;
	priceMonthly: number;
	priceYearly: number;
	productIdMonthly?: string;
	productIdYearly?: string;
	popular?: boolean;
	badge?: string;
	buttonText?: string;
	features: (string | PricingFeature)[];
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface YaxaJob<TPayload = any> {
	id: string;
	queue: string;
	name: string;
	payload: TPayload;
	status: JobStatus;
	priority: number;
	attempts: number;
	maxAttempts: number;
	runAt: Date;
	lockedAt?: Date | null;
	lockedBy?: string | null;
	failedReason?: string | null;
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date | null;
}
