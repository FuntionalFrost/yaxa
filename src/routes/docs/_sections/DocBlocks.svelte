<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import EmptyState from '$lib/components/elements/EmptyState.svelte';
	import Stepper, { type StepItem } from '$lib/components/navigation/Stepper.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import ToggleGroup from '$lib/components/forms/ToggleGroup.svelte';
	import InputOTP from '$lib/components/forms/InputOTP.svelte';
	import Card from '$lib/components/layout/Card.svelte';

	let dashboardInterval = $state('30d');
	let otpValue = $state('739201');
	let currentStep = $state(1);

	const onboardingSteps: StepItem[] = [
		{ id: 'details', title: 'Project Details', description: 'Name and repository setup' },
		{ id: 'auth', title: 'Database & Auth', description: 'Neon PostgreSQL & Better-Auth' },
		{ id: 'billing', title: 'Billing & Polar', description: 'Connect subscription tiers' },
		{ id: 'deploy', title: 'Edge Deployment', description: 'Vercel / Cloudflare edge rollout' }
	];

	const stepperSnippet = `<Stepper
  steps={[
    { id: 'details', title: 'Project Details', description: 'Name and repository setup' },
    { id: 'auth', title: 'Database & Auth', description: 'Neon PostgreSQL & Better-Auth' },
    { id: 'billing', title: 'Billing & Polar', description: 'Connect subscription tiers' },
    { id: 'deploy', title: 'Edge Deployment', description: 'Vercel / Cloudflare rollout' }
  ]}
  bind:currentStep={currentStep}
/>`;

	const emptyStateSnippet = `<EmptyState
  icon="database"
  title="No database migrations found"
  description="Run drizzle-kit generate or sv-utils db:push to synchronize your Neon PostgreSQL schema."
>
  {#snippet actions()}
    <Button size="sm" icon="lightning">Run First Migration</Button>
    <Button size="sm" variant="outline">Read Documentation</Button>
  {/snippet}
</EmptyState>`;

	const metricSnippet = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <MetricCard
    title="Monthly Recurring Revenue"
    value="$18,420"
    change={16.4}
    changePeriod="vs last month"
    sparkline={[12000, 13400, 14200, 13900, 15800, 17200, 18420]}
    sparklineColor="success"
  />
  <MetricCard
    title="Active Subscribers"
    value="1,248"
    change={8.2}
    changePeriod="vs last month"
    sparkline={[900, 960, 1020, 1090, 1150, 1200, 1248]}
    sparklineColor="primary"
  />
  <MetricCard
    title="Churn Rate"
    value="1.8%"
    change={-0.4}
    changePeriod="vs last month"
    sparkline={[2.8, 2.5, 2.3, 2.1, 2.0, 1.9, 1.8]}
    sparklineColor="success"
  />
</div>`;

	const heroSnippet = `<section class="relative overflow-hidden py-16 text-center">
  <div class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/60 px-3 py-1 text-xs font-semibold text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/40 dark:text-primary-300 mb-6">
    <span class="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
    Yaxa v1.3 • Ready for SvelteKit 2.7+
  </div>

  <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl mx-auto">
    Ship your next SaaS in days, not months.
  </h1>

  <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
    Batteries-included UI primitives, zero-config automated SEO, and turnkey billing.
  </p>

  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <Button size="lg" icon="lightning" class="yaxa-press shadow-lg shadow-primary-500/20">
      Get Started Free
    </Button>
    <Button size="lg" variant="outline" icon="github" class="yaxa-press">
      Star on GitHub
    </Button>
  </div>
</section>`;
</script>

<DocHeader
	title="Pre-Built Page Blocks & Wizards"
	description="Ready-to-copy responsive page block templates, multi-step wizards, and empty state placeholders built specifically for solo developers launching modern SaaS applications."
	badge="Page Blocks"
	source="src/lib/components/elements/MetricCard.svelte"
	category="Getting Started"
	importStatement={"import { Card, MetricCard, Stepper, EmptyState, Button, Badge } from 'yaxa-svelte';"}
/>

<div class="space-y-10">
	<!-- Multi-Step Stepper Wizard Block -->
	<DocSandbox title="Interactive Step Wizard (<Stepper />)" code={stepperSnippet}>
		<div class="w-full space-y-6">
			<Stepper steps={onboardingSteps} bind:currentStep />

			<div
				class="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<div class="text-xs text-neutral-500">
					Current step: <span class="font-bold text-neutral-900 dark:text-white"
						>{onboardingSteps[currentStep].title}</span
					>
					({currentStep + 1} of {onboardingSteps.length})
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentStep === 0}
						onclick={() => (currentStep = Math.max(0, currentStep - 1))}
					>
						Previous Step
					</Button>
					<Button
						variant="solid"
						size="sm"
						disabled={currentStep === onboardingSteps.length - 1}
						onclick={() => (currentStep = Math.min(onboardingSteps.length - 1, currentStep + 1))}
					>
						Next Step
					</Button>
				</div>
			</div>
		</div>
	</DocSandbox>

	<!-- EmptyState Placeholder Sandbox -->
	<DocSandbox title="Zero-State Placeholder (<EmptyState />)" code={emptyStateSnippet}>
		<div class="w-full">
			<EmptyState
				icon="database"
				title="No database migrations found"
				description="Run drizzle-kit generate or sv-utils db:push to synchronize your Neon PostgreSQL schema."
			>
				{#snippet actions()}
					<Button size="sm" icon="lightning" class="yaxa-press">Run First Migration</Button>
					<Button size="sm" variant="outline" class="yaxa-press">Read Documentation</Button>
				{/snippet}
			</EmptyState>
		</div>
	</DocSandbox>

	<!-- SaaS Metrics Dashboard Block -->
	<DocSandbox title="SaaS Metrics Dashboard Block" code={metricSnippet}>
		<div class="w-full space-y-4">
			<div class="flex flex-col justify-between gap-3 pb-2 sm:flex-row sm:items-center">
				<div>
					<h3 class="text-base font-bold text-neutral-900 dark:text-white">Performance Overview</h3>
					<p class="text-xs text-neutral-500">Live revenue and subscriber metrics</p>
				</div>
				<ToggleGroup
					items={[
						{ value: '7d', label: '7D' },
						{ value: '30d', label: '30D' },
						{ value: '90d', label: '90D' }
					]}
					bind:value={dashboardInterval}
					size="sm"
					variant="subtle"
				/>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<MetricCard
					title="Monthly Recurring Revenue"
					value="$18,420"
					change={16.4}
					changePeriod="vs last month"
					sparkline={[12000, 13400, 14200, 13900, 15800, 17200, 18420]}
					sparklineColor="success"
					icon="lightning"
				/>
				<MetricCard
					title="Active Subscribers"
					value="1,248"
					change={8.2}
					changePeriod="vs last month"
					sparkline={[900, 960, 1020, 1090, 1150, 1200, 1248]}
					sparklineColor="primary"
					icon="users"
				/>
				<MetricCard
					title="Churn Rate"
					value="1.8%"
					change={-0.4}
					changePeriod="vs last month"
					sparkline={[2.8, 2.5, 2.3, 2.1, 2.0, 1.9, 1.8]}
					sparklineColor="success"
					icon="check"
				/>
			</div>
		</div>
	</DocSandbox>

	<!-- Solo Dev Hero Section Block -->
	<DocSandbox title="Solo SaaS Hero Section Block" code={heroSnippet}>
		<div
			class="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/40"
		>
			<div
				class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/50 dark:text-primary-300"
			>
				<span class="flex h-2 w-2 animate-pulse rounded-full bg-primary-500"></span>
				Yaxa v1.3 • Solo Dev Optimized
			</div>

			<h2
				class="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
			>
				Ship your next SaaS in days, not months.
			</h2>

			<p class="mx-auto mt-3 max-w-lg text-sm text-neutral-600 dark:text-neutral-400">
				Atomic Svelte 5 runes, zero-dependency SVG sparklines, single-email license presets, and
				turnkey Polar.sh billing.
			</p>

			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="md" icon="lightning" class="yaxa-press shadow-md shadow-primary-500/20">
					Start Building Now
				</Button>
				<Button size="md" variant="outline" icon="github" class="yaxa-press">View Source</Button>
			</div>
		</div>
	</DocSandbox>

	<!-- 2FA & Auth Security Block -->
	<DocSandbox title="Two-Factor Security Verification Block">
		<div class="mx-auto w-full max-w-md">
			<Card class="space-y-4 p-6 text-center">
				<div
					class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
				>
					<Icon name="key" size="md" />
				</div>
				<div>
					<h3 class="text-base font-bold text-neutral-900 dark:text-white">Verify your identity</h3>
					<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
						Enter the 6-digit authentication code sent to your email or authenticator app.
					</p>
				</div>
				<div class="flex justify-center py-2">
					<InputOTP bind:value={otpValue} length={6} size="md" />
				</div>
				<Button block class="yaxa-press">Confirm Code</Button>
			</Card>
		</div>
	</DocSandbox>
</div>
