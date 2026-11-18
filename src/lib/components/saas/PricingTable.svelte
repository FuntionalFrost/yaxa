<script lang="ts">
	import PricingCard from './PricingCard.svelte';
	import Badge from '../elements/Badge.svelte';
	import type { PricingTier } from '../../server/db/types';

	interface Props {
		tiers?: PricingTier[];
		yearlyDiscount?: number;
		defaultInterval?: 'month' | 'year';
		class?: string;
		oncheckout?: (tier: PricingTier, interval: 'month' | 'year') => void | Promise<void>;
	}

	const DEFAULT_TIERS: PricingTier[] = [
		{
			id: 'free',
			name: 'Hobby',
			description: 'Perfect for side projects and evaluating Yaxa.',
			priceMonthly: 0,
			priceYearly: 0,
			popular: false,
			buttonText: 'Get Started',
			features: [
				'Up to 3 projects',
				'Community support',
				'Basic analytics',
				{ name: 'Custom domains', included: false },
				{ name: 'Priority support', included: false }
			]
		},
		{
			id: 'pro',
			name: 'Pro Solo',
			description: 'Everything a solo indie hacker needs to launch & scale.',
			priceMonthly: 29,
			priceYearly: 24,
			popular: true,
			badge: 'Recommended',
			buttonText: 'Start 14-Day Free Trial',
			features: [
				'Unlimited projects',
				'Custom domains & SSL',
				'Automated SEO suite',
				'Polar.sh automated billing',
				'Better-Auth multi-tenant',
				'Email & Discord support'
			]
		},
		{
			id: 'team',
			name: 'Agency & Scale',
			description: 'Collaborate with unlimited team members and clients.',
			priceMonthly: 79,
			priceYearly: 65,
			popular: false,
			buttonText: 'Subscribe to Scale',
			features: [
				'Everything in Pro Solo',
				'Unlimited team members',
				'Multi-workspace switching',
				'Dedicated database replica',
				'99.9% uptime SLA',
				'1-on-1 architecture call'
			]
		}
	];

	let {
		tiers = DEFAULT_TIERS,
		yearlyDiscount = 20,
		defaultInterval = 'month',
		class: className = '',
		oncheckout
	}: Props = $props();

	let customInterval = $state<'month' | 'year' | null>(null);
	let interval = $derived(customInterval ?? defaultInterval);
</script>

<div class="space-y-10 {className}">
	<!-- Billing Cycle Toggle -->
	<div class="flex flex-col items-center justify-center gap-3 text-center">
		<div
			class="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80"
		>
			<button
				type="button"
				class="rounded-full px-4 py-1.5 text-xs font-semibold transition-all {interval === 'month'
					? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50'
					: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}"
				onclick={() => {
					customInterval = 'month';
				}}
			>
				Monthly billing
			</button>
			<button
				type="button"
				class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all {interval ===
				'year'
					? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50'
					: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}"
				onclick={() => {
					customInterval = 'year';
				}}
			>
				<span>Annual billing</span>
				{#if yearlyDiscount > 0}
					<Badge color="success" variant="solid" size="xs" class="px-1.5 py-0.5 text-[10px]">
						-{yearlyDiscount}%
					</Badge>
				{/if}
			</button>
		</div>
	</div>

	<!-- Pricing Grid -->
	<div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each tiers as tier, i (tier.name ?? i)}
			{@const currentPrice = interval === 'year' ? tier.priceYearly : tier.priceMonthly}
			{@const currentProductId = interval === 'year' ? tier.productIdYearly : tier.productIdMonthly}
			<PricingCard
				name={tier.name}
				description={tier.description}
				price={currentPrice}
				{interval}
				{yearlyDiscount}
				features={tier.features}
				popular={tier.popular}
				badge={tier.badge}
				buttonText={tier.buttonText}
				productId={currentProductId}
				oncheckout={() => {
					if (oncheckout) return oncheckout(tier, interval);
				}}
			/>
		{/each}
	</div>
</div>
