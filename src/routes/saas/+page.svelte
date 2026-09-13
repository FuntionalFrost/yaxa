<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Card from '$lib/components/layout/Card.svelte';
	import Tabs from '$lib/components/navigation/Tabs.svelte';
	import Seo from '$lib/components/seo/Seo.svelte';
	import AuthCard from '$lib/components/saas/AuthCard.svelte';
	import UserMenu from '$lib/components/saas/UserMenu.svelte';
	import PricingTable from '$lib/components/saas/PricingTable.svelte';
	import SubscriptionCard from '$lib/components/saas/SubscriptionCard.svelte';
	import { useToast } from '$lib/composables/useToast';
	import type { SubscriptionStatus } from '$lib/server/db/types';
	import { siteConfig } from '../../site.config';

	const toast = useToast();

	let activeTab = $state('overview');
	let mockUserTier = $state('Pro');
	let mockSubscriptionStatus = $state<SubscriptionStatus>('active');
	let mockInterval = $state<'month' | 'year'>('month');

	const showcaseTabs = [
		{ value: 'overview', label: 'Complete SaaS Flow' },
		{ value: 'auth', label: 'Auth & Onboarding' },
		{ value: 'pricing', label: 'Pricing & Checkout' },
		{ value: 'billing', label: 'Customer Billing Portal' }
	];
</script>

<Seo
	title="Solo SaaS Suite Showcase"
	description="Experience the batteries-included Svelte 5 SaaS stack: Better-Auth, Drizzle ORM, Polar.sh payments, and drop-in SaaS components."
/>

<div class="flex min-h-screen flex-col justify-between bg-zinc-50 dark:bg-zinc-950">
	<div>
		<!-- Navigation Header with SaaS User Menu Demo -->
		<header
			class="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80"
		>
			<Container size="2xl">
				<div class="flex h-16 items-center justify-between">
					<div class="flex items-center gap-6">
						<a
							href="/"
							class="flex items-center gap-2.5 text-lg font-bold text-zinc-900 dark:text-zinc-50"
						>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white shadow-sm"
							>
								Y
							</div>
							<span>Yaxa <span class="text-primary-600 dark:text-primary-400">SaaS</span></span>
						</a>

						<nav
							class="hidden items-center gap-4 text-xs font-medium text-zinc-600 md:flex dark:text-zinc-400"
						>
							<a href="/docs/saas-suite" class="hover:text-primary-600 dark:hover:text-primary-400"
								>SaaS Docs</a
							>
							<a href="/docs/intro" class="hover:text-primary-600 dark:hover:text-primary-400"
								>UI Docs</a
							>
							<a href="/" class="hover:text-primary-600 dark:hover:text-primary-400">Home</a>
						</nav>
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
					</div>
				</div>
			</Container>
		</header>

		<!-- Hero Section -->
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
						ORM (<strong>Neon & Turso</strong>), payments & webhooks (<strong>Polar.sh</strong>),
						and transactional emails (<strong>Resend</strong>).
					</p>

					<div class="flex flex-wrap justify-center gap-3 pt-4">
						<Tabs items={showcaseTabs} bind:value={activeTab} />
					</div>
				</div>
			</Container>
		</section>

		<!-- Interactive Tab Content -->
		<section class="py-12">
			<Container size="2xl">
				{#if activeTab === 'overview' || activeTab === 'auth'}
					<div class="space-y-12">
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
				{/if}

				{#if activeTab === 'overview' || activeTab === 'pricing'}
					<div class="mt-16 space-y-12 border-t border-zinc-200 pt-16 dark:border-zinc-800">
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
				{/if}

				{#if activeTab === 'overview' || activeTab === 'billing'}
					<div class="mt-16 space-y-12 border-t border-zinc-200 pt-16 dark:border-zinc-800">
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
							<!-- Interactive Simulation Bar -->
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
				{/if}
			</Container>
		</section>
	</div>

	<!-- Footer -->
	<Footer config={siteConfig} />
</div>
