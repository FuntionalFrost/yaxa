<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Card from '$lib/components/layout/Card.svelte';
	import Tabs from '$lib/components/navigation/Tabs.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import AuthCard from '$lib/components/saas/AuthCard.svelte';
	import UserMenu from '$lib/components/saas/UserMenu.svelte';
	import PricingTable from '$lib/components/saas/PricingTable.svelte';
	import SubscriptionCard from '$lib/components/saas/SubscriptionCard.svelte';
	import Gate from '$lib/components/saas/Gate.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import { useToast } from '$lib/composables/useToast';
	import type { SubscriptionStatus } from '$lib/server/db/types';

	const toast = useToast();

	let activeTab = $state('overview');
	let mockUserTier = $state('Pro');
	let mockSubscriptionStatus = $state<SubscriptionStatus>('active');
	let mockInterval = $state<'month' | 'year'>('month');

	const showcaseTabs = [
		{ value: 'overview', label: 'Complete SaaS Flow' },
		{ value: 'auth', label: 'Auth & Onboarding' },
		{ value: 'pricing', label: 'Pricing & Checkout' },
		{ value: 'billing', label: 'Customer Billing' },
		{ value: 'gating', label: 'Feature Gating (<Gate />)' }
	];
</script>

<Seo
	title="Solo SaaS Suite Showcase"
	description="Experience the batteries-included Svelte 5 SaaS stack: Better-Auth, Drizzle ORM, Polar.sh payments, and drop-in SaaS components."
/>

<div class="space-y-12 pb-16">
	<!-- Hero & Interactive Control Section -->
	<section
		class="border-b border-zinc-200 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent py-12 sm:py-16 dark:border-zinc-800"
	>
		<Container size="2xl">
			<div class="mx-auto max-w-3xl space-y-4 text-center">
				<div class="inline-flex items-center gap-2">
					<Badge color="primary" variant="subtle" size="sm">Nuxt UI Pro Equivalent</Badge>
					<Badge color="success" variant="solid" size="xs">Svelte 5 Runes Native</Badge>
				</div>

				<h1
					class="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
				>
					Zero to Paid SaaS in One Weekend
				</h1>

				<p class="text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
					Batteries-included authentication (<strong>Better-Auth</strong>), multi-dialect database
					ORM (<strong>Neon & Turso</strong>), payments & webhooks (<strong>Polar.sh</strong>), and
					transactional emails (<strong>Resend</strong>).
				</p>

				<!-- Live Simulation Header Card -->
				<div class="pt-2">
					<div
						class="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 shadow-xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80"
					>
						<div
							class="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400"
						>
							<span class="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
							<span>Live Demo Session</span>
							<Badge size="xs" color="primary">{mockUserTier} Plan</Badge>
						</div>

						<div class="flex items-center gap-3">
							<UserMenu
								user={{
									name: 'Elena Rostova',
									email: 'elena@indiesoft.io',
									image: null,
									tier: mockUserTier
								}}
								tier={mockUserTier}
								onsignout={() => {
									toast.info('Signed Out', 'Simulation: session cleared');
								}}
							/>
							<a
								href="/docs/saas-suite"
								class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
							>
								<span>Docs</span>
								<Icon name="arrow-right" class="h-3 w-3" />
							</a>
						</div>
					</div>
				</div>

				<!-- Navigation Tabs -->
				<div class="flex flex-wrap justify-center gap-3 pt-4">
					<Tabs items={showcaseTabs} bind:value={activeTab} />
				</div>
			</div>
		</Container>
	</section>

	<!-- Interactive Tab Content -->
	<section>
		<Container size="2xl">
			{#if activeTab === 'overview'}
				<!-- Complete End-to-End SaaS Pipeline Overview -->
				<div class="space-y-16">
					<!-- Step 1: Authentication -->
					<div
						class="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40"
					>
						<div
							class="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left"
						>
							<div>
								<Badge color="primary" size="xs">Step 1 of 4</Badge>
								<h2 class="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
									Drop-In Authentication
								</h2>
								<p class="text-xs text-zinc-500 dark:text-zinc-400">
									Supports social OAuth, email/password, and passwordless magic links.
								</p>
							</div>
							<Button size="xs" variant="outline" onclick={() => (activeTab = 'auth')}>
								Focus View
							</Button>
						</div>

						<div class="mx-auto max-w-md">
							<AuthCard
								showSocial={true}
								showMagicLinkToggle={true}
								onsuccess={() => {
									toast.success('Auth Simulation Success', 'User authenticated via Better-Auth');
								}}
							/>
						</div>
					</div>

					<!-- Step 2: Polar Pricing & Checkout -->
					<div
						class="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40"
					>
						<div
							class="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left"
						>
							<div>
								<Badge color="primary" size="xs">Step 2 of 4</Badge>
								<h2 class="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
									Polar.sh Pricing & Checkout
								</h2>
								<p class="text-xs text-zinc-500 dark:text-zinc-400">
									Merchant-of-record hosted checkout with monthly/annual intervals.
								</p>
							</div>
							<Button size="xs" variant="outline" onclick={() => (activeTab = 'pricing')}>
								Focus View
							</Button>
						</div>

						<PricingTable
							oncheckout={(tier, interval) => {
								toast.success(
									`Selected Plan: ${tier.name}`,
									`Initiating Polar.sh ${interval} checkout session...`
								);
							}}
						/>
					</div>

					<!-- Step 3: Billing & Subscription Management -->
					<div
						class="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40"
					>
						<div
							class="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left"
						>
							<div>
								<Badge color="primary" size="xs">Step 3 of 4</Badge>
								<h2 class="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
									Customer Subscription Management
								</h2>
								<p class="text-xs text-zinc-500 dark:text-zinc-400">
									In-dashboard status widget synced directly from Drizzle ORM.
								</p>
							</div>
							<Button size="xs" variant="outline" onclick={() => (activeTab = 'billing')}>
								Focus View
							</Button>
						</div>

						<div class="mx-auto max-w-3xl space-y-6">
							<Card
								class="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-4 text-xs dark:bg-zinc-900/80"
							>
								<span class="font-semibold text-zinc-700 dark:text-zinc-300"
									>Simulate Plan State:</span
								>
								<div class="flex items-center gap-2">
									<Button
										size="xs"
										variant={mockSubscriptionStatus === 'active' ? 'solid' : 'outline'}
										color="success"
										onclick={() => {
											mockSubscriptionStatus = 'active';
										}}
									>
										Active
									</Button>
									<Button
										size="xs"
										variant={mockSubscriptionStatus === 'trialing' ? 'solid' : 'outline'}
										color="primary"
										onclick={() => {
											mockSubscriptionStatus = 'trialing';
										}}
									>
										Trialing
									</Button>
									<Button
										size="xs"
										variant={mockSubscriptionStatus === 'canceled' ? 'solid' : 'outline'}
										color="neutral"
										onclick={() => {
											mockSubscriptionStatus = 'canceled';
										}}
									>
										Canceled
									</Button>
								</div>
							</Card>

							<SubscriptionCard
								tierName="{mockUserTier} Solo Plan"
								status={mockSubscriptionStatus}
								amount={29}
								interval={mockInterval}
								onmanage={() => {
									toast.info('Polar Customer Portal', 'Opening billing management session...');
								}}
								onupgrade={() => {
									activeTab = 'pricing';
									toast.info('Change Plan', 'Navigating to pricing table...');
								}}
							/>
						</div>
					</div>

					<!-- Step 4: Declarative Feature Gating -->
					<div
						class="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40"
					>
						<div
							class="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left"
						>
							<div>
								<Badge color="primary" size="xs">Step 4 of 4</Badge>
								<h2 class="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
									Declarative Feature Gating
								</h2>
								<p class="text-xs text-zinc-500 dark:text-zinc-400">
									Lock premium components and pages with declarative tier and role gating.
								</p>
							</div>
							<Button size="xs" variant="outline" onclick={() => (activeTab = 'gating')}>
								Focus View
							</Button>
						</div>

						<div class="mx-auto max-w-3xl space-y-6">
							<Card
								class="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-4 text-xs dark:bg-zinc-900/80"
							>
								<span class="font-semibold text-zinc-700 dark:text-zinc-300">Switch User Plan:</span
								>
								<div class="flex items-center gap-2">
									{#each ['Free', 'Starter', 'Pro', 'Enterprise'] as plan}
										<Button
											size="xs"
											variant={mockUserTier.toLowerCase() === plan.toLowerCase()
												? 'solid'
												: 'outline'}
											color={mockUserTier.toLowerCase() === plan.toLowerCase()
												? 'primary'
												: 'neutral'}
											onclick={() => {
												mockUserTier = plan;
											}}
										>
											{plan}
										</Button>
									{/each}
								</div>
							</Card>

							<Gate
								requiredPlan="pro"
								userPlan={mockUserTier.toLowerCase()}
								preview={true}
								upgradeTitle="Pro Tier Feature"
								upgradeMessage="Requires an active Pro or Enterprise subscription."
								upgradeUrl="/saas"
							>
								<div
									class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
								>
									<div class="flex items-center justify-between">
										<div>
											<h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
												Advanced Analytics & Automated Reports
											</h4>
											<p class="text-xs text-zinc-500">
												Only accessible to Pro and Enterprise customers.
											</p>
										</div>
										<Badge color="success" size="sm">Active (Unlocked)</Badge>
									</div>
								</div>
							</Gate>
						</div>
					</div>
				</div>
			{:else if activeTab === 'auth'}
				<!-- Dedicated Auth Module View -->
				<div class="space-y-8">
					<div class="space-y-1 text-center">
						<Badge color="primary" size="xs">Module 1</Badge>
						<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
							Drop-In Authentication
						</h2>
						<p class="text-sm text-zinc-500 dark:text-zinc-400">
							Supports social OAuth, email/password, and passwordless magic links.
						</p>
					</div>

					<div class="mx-auto max-w-md">
						<AuthCard
							showSocial={true}
							showMagicLinkToggle={true}
							onsuccess={() => {
								toast.success('Auth Simulation Success', 'User authenticated via Better-Auth');
							}}
						/>
					</div>
				</div>
			{:else if activeTab === 'pricing'}
				<!-- Dedicated Pricing Module View -->
				<div class="space-y-8">
					<div class="space-y-1 text-center">
						<Badge color="primary" size="xs">Module 2</Badge>
						<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
							Polar.sh Pricing & Checkout
						</h2>
						<p class="text-sm text-zinc-500 dark:text-zinc-400">
							Merchant-of-record hosted checkout with monthly/annual intervals.
						</p>
					</div>

					<PricingTable
						oncheckout={(tier, interval) => {
							toast.success(
								`Selected Plan: ${tier.name}`,
								`Initiating Polar.sh ${interval} checkout session...`
							);
						}}
					/>
				</div>
			{:else if activeTab === 'billing'}
				<!-- Dedicated Billing Module View -->
				<div class="space-y-8">
					<div class="space-y-1 text-center">
						<Badge color="primary" size="xs">Module 3</Badge>
						<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
							Customer Subscription Management
						</h2>
						<p class="text-sm text-zinc-500 dark:text-zinc-400">
							In-dashboard status widget synced directly from Drizzle ORM.
						</p>
					</div>

					<div class="mx-auto max-w-3xl space-y-6">
						<Card
							class="flex flex-wrap items-center justify-between gap-3 bg-zinc-100/70 p-4 text-xs dark:bg-zinc-900/50"
						>
							<span class="font-semibold text-zinc-700 dark:text-zinc-300"
								>Simulate Plan State:</span
							>
							<div class="flex items-center gap-2">
								<Button
									size="xs"
									variant={mockSubscriptionStatus === 'active' ? 'solid' : 'outline'}
									color="success"
									onclick={() => {
										mockSubscriptionStatus = 'active';
									}}
								>
									Active
								</Button>
								<Button
									size="xs"
									variant={mockSubscriptionStatus === 'trialing' ? 'solid' : 'outline'}
									color="primary"
									onclick={() => {
										mockSubscriptionStatus = 'trialing';
									}}
								>
									Trialing
								</Button>
								<Button
									size="xs"
									variant={mockSubscriptionStatus === 'canceled' ? 'solid' : 'outline'}
									color="neutral"
									onclick={() => {
										mockSubscriptionStatus = 'canceled';
									}}
								>
									Canceled
								</Button>
							</div>
						</Card>

						<SubscriptionCard
							tierName="{mockUserTier} Solo Plan"
							status={mockSubscriptionStatus}
							amount={29}
							interval={mockInterval}
							onmanage={() => {
								toast.info('Polar Customer Portal', 'Opening billing management session...');
							}}
							onupgrade={() => {
								activeTab = 'pricing';
								toast.info('Change Plan', 'Navigating to pricing table...');
							}}
						/>
					</div>
				</div>
			{:else if activeTab === 'gating'}
				<!-- Dedicated Gating Module View -->
				<div class="space-y-8">
					<div class="space-y-1 text-center">
						<Badge color="primary" size="xs">Module 4</Badge>
						<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
							Declarative Feature Gating
						</h2>
						<p class="text-sm text-zinc-500 dark:text-zinc-400">
							Lock premium components and pages with declarative tier and role gating.
						</p>
					</div>

					<div class="mx-auto max-w-3xl space-y-6">
						<Card
							class="flex flex-wrap items-center justify-between gap-3 bg-zinc-100/70 p-4 text-xs dark:bg-zinc-900/50"
						>
							<span class="font-semibold text-zinc-700 dark:text-zinc-300">Switch User Plan:</span>
							<div class="flex items-center gap-2">
								{#each ['Free', 'Starter', 'Pro', 'Enterprise'] as plan}
									<Button
										size="xs"
										variant={mockUserTier.toLowerCase() === plan.toLowerCase()
											? 'solid'
											: 'outline'}
										color={mockUserTier.toLowerCase() === plan.toLowerCase()
											? 'primary'
											: 'neutral'}
										onclick={() => {
											mockUserTier = plan;
										}}
									>
										{plan}
									</Button>
								{/each}
							</div>
						</Card>

						<Gate
							requiredPlan="pro"
							userPlan={mockUserTier.toLowerCase()}
							preview={true}
							upgradeTitle="Pro Tier Feature"
							upgradeMessage="Requires an active Pro or Enterprise subscription."
							upgradeUrl="/saas"
						>
							<div
								class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
							>
								<div class="flex items-center justify-between">
									<div>
										<h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
											Advanced Analytics & Automated Reports
										</h4>
										<p class="text-xs text-zinc-500">
											Only accessible to Pro and Enterprise customers.
										</p>
									</div>
									<Badge color="success" size="sm">Active (Unlocked)</Badge>
								</div>
							</div>
						</Gate>
					</div>
				</div>
			{/if}
		</Container>
	</section>
</div>
