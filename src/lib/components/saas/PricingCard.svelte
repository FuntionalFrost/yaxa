<script lang="ts">
	import Card from '../layout/Card.svelte';
	import Button from '../elements/Button.svelte';
	import Badge from '../elements/Badge.svelte';
	import Icon from '../elements/Icon.svelte';
	import type { PricingFeature } from '../../server/db/types';

	interface Props {
		name: string;
		description: string;
		price: number;
		interval?: 'month' | 'year';
		yearlyDiscount?: number;
		features: (string | PricingFeature)[];
		productId?: string;
		popular?: boolean;
		badge?: string;
		buttonText?: string;
		loading?: boolean;
		class?: string;
		oncheckout?: (productId?: string) => void | Promise<void>;
	}

	let {
		name,
		description,
		price,
		interval = 'month',
		yearlyDiscount = 0,
		features = [],
		productId,
		popular = false,
		badge,
		buttonText,
		loading = false,
		class: className = '',
		oncheckout
	}: Props = $props();

	let isSubmitting = $state(false);

	async function handleCheckout() {
		if (oncheckout) {
			isSubmitting = true;
			try {
				await oncheckout(productId);
			} finally {
				isSubmitting = false;
			}
			return;
		}

		if (!productId) return;

		isSubmitting = true;
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId })
			});
			const data = await res.json();
			if (data.url && typeof window !== 'undefined') {
				window.location.href = data.url;
			}
		} catch (err) {
			console.error('Checkout error:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Card
	class="relative flex flex-col justify-between overflow-visible p-6 transition-all duration-200 sm:p-8 {popular
		? 'border-2 border-primary-500 shadow-xl ring-1 ring-primary-500/20 dark:border-primary-500'
		: 'border-zinc-200 shadow-md dark:border-zinc-800'} {className}"
>
	<!-- Popular Banner / Badge -->
	{#if popular || badge}
		<div class="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
			<Badge
				color="primary"
				variant="solid"
				size="sm"
				class="px-3 py-0.5 text-[11px] font-semibold tracking-wider uppercase shadow-md"
			>
				{badge || 'Most Popular'}
			</Badge>
		</div>
	{/if}

	<div class="space-y-6">
		<!-- Tier Title & Description -->
		<div class="space-y-2">
			<h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{name}</h3>
			<p class="min-h-[40px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
				{description}
			</p>
		</div>

		<!-- Price -->
		<div class="flex items-baseline gap-1">
			<span class="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
				${price}
			</span>
			<span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
				/{interval === 'year' ? 'yr' : 'mo'}
			</span>
			{#if interval === 'year' && yearlyDiscount > 0}
				<Badge color="success" variant="subtle" size="xs" class="ml-2">
					Save {yearlyDiscount}%
				</Badge>
			{/if}
		</div>

		<hr class="border-zinc-200 dark:border-zinc-800" />

		<!-- Features List -->
		<div class="space-y-3">
			<span class="text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
				Included features:
			</span>
			<ul class="space-y-2.5 text-sm">
				{#each features as feat}
					{@const isObj = typeof feat === 'object'}
					{@const featName = isObj ? feat.name : feat}
					{@const included = isObj ? feat.included !== false : true}
					<li
						class="flex items-center gap-2.5 {included
							? 'text-zinc-700 dark:text-zinc-200'
							: 'text-zinc-400 line-through dark:text-zinc-600'}"
					>
						{#if included}
							<div
								class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
							>
								<Icon name="check" class="h-3.5 w-3.5" />
							</div>
						{:else}
							<div
								class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
							>
								<Icon name="close" class="h-3.5 w-3.5" />
							</div>
						{/if}
						<span>{featName}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- CTA Button -->
	<div class="pt-8">
		<Button
			variant={popular ? 'solid' : 'outline'}
			color={popular ? 'primary' : 'neutral'}
			class="w-full justify-center py-2.5 font-semibold shadow-xs"
			loading={loading || isSubmitting}
			onclick={handleCheckout}
		>
			{buttonText || (price === 0 ? 'Get Started Free' : 'Upgrade Plan')}
		</Button>
	</div>
</Card>
