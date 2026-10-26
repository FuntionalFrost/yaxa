<script lang="ts">
	import Card from '../layout/Card.svelte';
	import Badge from '../elements/Badge.svelte';
	import Button from '../elements/Button.svelte';
	import Icon from '../elements/Icon.svelte';
	import type { SubscriptionStatus } from '../../server/db/types';

	interface Props {
		tierName?: string;
		status?: SubscriptionStatus;
		interval?: 'month' | 'year';
		amount?: number;
		currentPeriodEnd?: Date | string | null;
		cancelAtPeriodEnd?: boolean;
		customerId?: string;
		class?: string;
		onmanage?: () => void | Promise<void>;
		onupgrade?: () => void;
	}

	let {
		tierName = 'Pro Plan',
		status = 'active',
		interval = 'month',
		amount = 29,
		currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		cancelAtPeriodEnd = false,
		customerId,
		class: className = '',
		onmanage,
		onupgrade
	}: Props = $props();

	let isOpeningPortal = $state(false);

	const formattedDate = $derived.by(() => {
		if (!currentPeriodEnd) return null;
		const d = typeof currentPeriodEnd === 'string' ? new Date(currentPeriodEnd) : currentPeriodEnd;
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	});

	const statusColor = $derived.by(() => {
		switch (status) {
			case 'active':
				return 'success';
			case 'trialing':
				return 'info';
			case 'past_due':
			case 'unpaid':
				return 'warning';
			case 'canceled':
			default:
				return 'neutral';
		}
	});

	async function handleManageBilling() {
		if (onmanage) {
			isOpeningPortal = true;
			try {
				await onmanage();
			} finally {
				isOpeningPortal = false;
			}
			return;
		}

		if (!customerId) return;

		isOpeningPortal = true;
		try {
			const res = await fetch('/api/billing/portal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ customerId })
			});
			const data = await res.json();
			if (data.url && typeof window !== 'undefined') {
				window.location.href = data.url;
			}
		} catch (err) {
			console.error('Portal error:', err);
		} finally {
			isOpeningPortal = false;
		}
	}
</script>

<Card class="space-y-6 border-zinc-200 p-6 shadow-md sm:p-7 dark:border-zinc-800 {className}">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div class="space-y-1">
			<div class="flex items-center gap-3">
				<h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{tierName}</h3>
				<Badge color={statusColor} variant="subtle" size="sm" class="font-semibold uppercase">
					{status}
				</Badge>
			</div>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">
				${amount}/{interval === 'year' ? 'yr' : 'mo'} · Billed {interval === 'year'
					? 'annually'
					: 'monthly'}
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if onupgrade}
				<Button variant="outline" size="sm" onclick={onupgrade}>Change Plan</Button>
			{/if}
			<Button
				variant="solid"
				color="primary"
				size="sm"
				class="gap-1.5 font-medium"
				loading={isOpeningPortal}
				onclick={handleManageBilling}
			>
				<Icon name="credit-card" class="h-3.5 w-3.5" />
				<span>Manage Subscription</span>
			</Button>
		</div>
	</div>

	<hr class="border-zinc-200 dark:border-zinc-800" />

	<div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
		<div class="space-y-1">
			<span class="font-medium text-zinc-400 dark:text-zinc-500">Renewal Date</span>
			<p class="font-semibold text-zinc-800 dark:text-zinc-200">
				{#if cancelAtPeriodEnd}
					Expires on {formattedDate}
				{:else if formattedDate}
					Renews on {formattedDate}
				{:else}
					N/A
				{/if}
			</p>
		</div>

		<div class="space-y-1">
			<span class="font-medium text-zinc-400 dark:text-zinc-500">Payment Provider</span>
			<p class="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
				<span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
				Polar.sh Merchant of Record
			</p>
		</div>

		<div class="space-y-1">
			<span class="font-medium text-zinc-400 dark:text-zinc-500">Auto-Renew</span>
			<p
				class="font-semibold {cancelAtPeriodEnd
					? 'text-amber-600 dark:text-amber-400'
					: 'text-emerald-600 dark:text-emerald-400'}"
			>
				{cancelAtPeriodEnd ? 'Disabled (Cancels at end of cycle)' : 'Active (Automatic renewal)'}
			</p>
		</div>
	</div>
</Card>
