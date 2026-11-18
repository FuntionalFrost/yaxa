<script lang="ts">
	import Badge from '#lib/components/elements/Badge.svelte';
	import Button from '#lib/components/elements/Button.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Icon from '#lib/components/elements/Icon.svelte';
	import Gate from '#lib/components/saas/Gate.svelte';
	import CodeBlock from '#lib/components/elements/CodeBlock.svelte';
	import { useGate } from '#lib/composables/useGate.svelte.js';
	import {
		defineFlags,
		useFeatureFlag,
		setFeatureFlagOverride,
		clearFeatureFlagOverrides
	} from '#lib/composables/useFeatureFlag.svelte.js';

	// Simulated user state for interactive live playground
	let simPlan = $state<'free' | 'starter' | 'pro' | 'enterprise'>('free');
	let simRole = $state<'user' | 'admin'>('user');

	const simUser = $derived({
		id: 'usr_demo_123',
		email: 'alex@example.com',
		plan: simPlan,
		role: simRole
	});

	defineFlags({
		'ai-copilot': {
			description: 'AI Copilot & Smart Suggestions (50% Pro+ Rollout)',
			enabled: true,
			allowedPlans: ['pro', 'enterprise'],
			rolloutPercentage: 50
		},
		'beta-kanban': {
			description: 'Beta Kanban Swimlanes',
			defaultValue: false
		}
	});

	const aiCopilotFlag = useFeatureFlag('ai-copilot', {
		defaultValue: false,
		description: 'AI Copilot & Smart Suggestions (50% Pro+ Rollout)'
	});
	const betaKanbanFlag = useFeatureFlag('beta-kanban', {
		defaultValue: false,
		description: 'Beta Kanban Swimlanes'
	});

	const flagsSnippet =
		`// 1. Register typed feature flags (src/lib/flags.ts)
import { defineFlags, useFeatureFlag } from 'yaxa-svelte';

export const flags = defineFlags({
  'ai-copilot': {
    description: 'AI Copilot (50% rollout for Pro & Enterprise)',
    enabled: true,
    allowedPlans: ['pro', 'enterprise'],
    rolloutPercentage: 50
  },
  'beta-kanban': {
    description: 'Beta Kanban Swimlanes',
    defaultValue: false
  }
});

// 2. Use declaratively in Svelte 5 with <Gate flag="...">
<` +
		`Gate flag="ai-copilot" preview upgradeTitle="AI Copilot Preview">
  <CopilotWorkspace />
</Gate>

// 3. Or programmatically with the useFeatureFlag() rune
const copilot = useFeatureFlag('ai-copilot');
// copilot.enabled, copilot.setOverride(true), copilot.toggle()`;

	const gate = $derived(
		useGate({
			user: {
				id: 'usr_demo_123',
				email: 'alex@example.com',
				plan: simPlan,
				role: simRole
			}
		})
	);

	const gateSnippet =
		`<!-- Declarative <Gate /> Component with Svelte 5 Context Fallback -->
<` +
		`script lang="ts">
  import { Gate } from 'yaxa-svelte';
</` +
		`script>

<!-- If wrapped in <YaxaApp user={data.user}>, user prop is 100% optional! -->
<Gate requiredPlan="pro" preview={true}>
  <div class="p-6 bg-white rounded-xl border">
    <h3 class="font-bold">Advanced Export Analytics</h3>
    <p>Export your monthly sales reports in PDF and CSV.</p>
  </div>
</Gate>
`;

	const useGateSnippet =
		`// Programmatic useGate() Composable Rune
<` +
		`script lang="ts">
  import { useGate } from 'yaxa-svelte';

  const gate = useGate();

  function handleExport() {
    if (!gate.allows('pro')) {
      alert('You must upgrade to Pro to export analytics');
      return;
    }
    // Proceed with export...
  }
</` +
		`script>
`;

	const uploadSnippet =
		`// 1. Client: useUpload() Composable Rune
<` +
		`script lang="ts">
  import { useUpload } from 'yaxa-svelte';

  const uploader = useUpload({ endpoint: '/api/upload' });

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const res = await uploader.upload(file);
      console.log('Public URL:', res?.url);
    }
  }
</` +
		`script>

// 2. Server: Turnkey Presigned URL RequestHandler
// src/routes/api/upload/+server.ts
import { createS3UploadHandler } from 'yaxa-svelte/server';

export const POST = createS3UploadHandler({
  folder: 'avatars',
  maxFileSize: 5 * 1024 * 1024 // 5MB
});
`;
</script>

<div class="space-y-12">
	<!-- Header -->
	<div class="space-y-4">
		<div class="flex items-center gap-2">
			<Badge color="primary" variant="subtle" size="sm">Solo SaaS Suite</Badge>
			<Badge color="neutral" variant="outline" size="sm">100% Svelte 5 Runes</Badge>
		</div>
		<h1
			class="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50"
		>
			Feature Gating & Cloud Storage
		</h1>
		<p class="text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
			Protect premium SaaS features with declarative <code
				class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800"
				>&lt;Gate /&gt;</code
			>
			components, check RBAC permissions programmatically with
			<code class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800"
				>useGate()</code
			>, and upload files directly to S3/Cloudflare R2 with
			<code class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800"
				>useUpload()</code
			>.
		</p>
	</div>

	<!-- Interactive Live Gating Demo -->
	<Card class="space-y-6 border-neutral-200 p-4 shadow-xs sm:p-6 dark:border-neutral-800">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
					Live Feature Gating Simulator
				</h3>
				<p class="text-xs text-neutral-500">
					Toggle simulated user subscription plan & role to see live reactive gating.
				</p>
			</div>

			<!-- Simulator Controls -->
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-semibold text-neutral-500">Simulate Plan:</span>
				<div class="flex flex-wrap rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
					{#each ['free', 'starter', 'pro', 'enterprise'] as plan (plan)}
						<button
							type="button"
							class="rounded px-2.5 py-1 text-xs font-medium transition-colors {simPlan === plan
								? 'bg-white font-bold text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
								: 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}"
							onclick={() => (simPlan = plan as any)}
						>
							{plan.toUpperCase()}
						</button>
					{/each}
				</div>

				<button
					type="button"
					class="rounded-lg border px-3 py-1 text-xs font-semibold transition-colors {simRole ===
					'admin'
						? 'border-primary-600 bg-primary-600 text-white'
						: 'border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'}"
					onclick={() => (simRole = simRole === 'admin' ? 'user' : 'admin')}
				>
					{simRole === 'admin' ? 'Admin Bypass ON' : 'Make Admin'}
				</button>

				<Badge color={gate.allows('pro') ? 'success' : 'neutral'} variant="subtle" size="xs">
					useGate.allows('pro'): {gate.allows('pro') ? 'true' : 'false'}
				</Badge>
			</div>
		</div>

		<!-- Gated Component Container -->
		<div
			class="space-y-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950/40"
		>
			<Gate
				requiredPlan="pro"
				userPlan={simPlan}
				userRole={simRole}
				preview={true}
				upgradeUrl="/saas"
				upgradeTitle="Pro Tier Feature"
				upgradeMessage="Exporting automated daily reports requires an active Pro or Enterprise plan."
			>
				<div
					class="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
				>
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
							>
								<Icon name="sparkles" class="h-5 w-5" />
							</div>
							<div>
								<h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
									Enterprise BI Dashboard & CSV Export
								</h4>
								<p class="text-xs text-neutral-500">
									Real-time revenue metrics, cohort retention, and raw CSV downloads.
								</p>
							</div>
						</div>
						<Badge color="success" variant="solid" size="xs">Unlocked</Badge>
					</div>

					<div
						class="grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-3 sm:gap-4 dark:border-neutral-800"
					>
						<div>
							<span class="text-2xs font-semibold text-neutral-400 uppercase">Monthly MRR</span>
							<p class="text-base font-bold text-neutral-900 dark:text-neutral-100">$24,850.00</p>
						</div>
						<div>
							<span class="text-2xs font-semibold text-neutral-400 uppercase">Active Trials</span>
							<p class="text-base font-bold text-neutral-900 dark:text-neutral-100">142 Users</p>
						</div>
						<div>
							<span class="text-2xs font-semibold text-neutral-400 uppercase">Net Churn</span>
							<p class="text-base font-bold text-emerald-600 dark:text-emerald-400">-0.4%</p>
						</div>
					</div>
				</div>
			</Gate>
		</div>
	</Card>

	<!-- Code Examples -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="space-y-3">
			<h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
				1. Declarative &lt;Gate /&gt; Usage
			</h3>
			<CodeBlock
				code={gateSnippet}
				language="svelte"
				filename="GateExample.svelte"
				showLineNumbers={true}
			/>
		</div>

		<div class="space-y-3">
			<h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
				2. Programmatic useGate() Composable
			</h3>
			<CodeBlock
				code={useGateSnippet}
				language="svelte"
				filename="useGateDemo.svelte"
				showLineNumbers={true}
			/>
		</div>
	</div>

	<!-- Feature Flags & Percentage Rollouts -->
	<Card class="space-y-6 border-neutral-200 p-4 shadow-xs sm:p-6 dark:border-neutral-800">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<div class="flex items-center gap-2">
					<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
						Feature Flags &amp; Percentage Rollouts
					</h2>
					<Badge color="primary" variant="subtle" size="xs">defineFlags</Badge>
				</div>
				<p class="mt-1 text-xs text-neutral-500">
					Deterministic FNV-1a percentage rollouts, plan/role targeting, and live localStorage
					overrides synced across <code class="font-mono">&lt;Gate flag="..." /&gt;</code>,
					<code class="font-mono">useFeatureFlag()</code>, and
					<code class="font-mono">&lt;DevSandbox /&gt;</code>.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Button
					size="xs"
					variant={aiCopilotFlag.overrideValue === true ? 'solid' : 'outline'}
					color="success"
					onclick={() => setFeatureFlagOverride('ai-copilot', true)}
				>
					Force Enable
				</Button>
				<Button
					size="xs"
					variant={aiCopilotFlag.overrideValue === false ? 'solid' : 'outline'}
					color="error"
					onclick={() => setFeatureFlagOverride('ai-copilot', false)}
				>
					Force Disable
				</Button>
				<Button
					size="xs"
					variant="ghost"
					color="neutral"
					onclick={() => clearFeatureFlagOverrides()}
				>
					Reset Auto
				</Button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div
				class="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
			>
				<div class="flex items-center justify-between gap-2">
					<code class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
						&lt;Gate flag="ai-copilot" preview /&gt;
					</code>
					<Badge
						size="xs"
						variant="subtle"
						color={aiCopilotFlag.isOverridden ? 'warning' : 'neutral'}
					>
						{aiCopilotFlag.isOverridden
							? `Override: ${aiCopilotFlag.overrideValue}`
							: 'Auto Targeting (50% Pro+)'}
					</Badge>
				</div>

				<Gate
					flag="ai-copilot"
					user={simUser}
					preview={true}
					upgradeUrl=""
					upgradeTitle="AI Copilot Locked"
					upgradeMessage="Blocked by feature flag targeting or override. Click Force Enable above or switch plan to Pro."
				>
					<div
						class="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
					>
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
							>
								<Icon name="sparkles" class="h-4 w-4" />
							</div>
							<div>
								<h4 class="text-xs font-bold text-neutral-900 dark:text-neutral-100">
									AI Copilot Active
								</h4>
								<p class="text-[11px] text-neutral-500">Streaming prompt completions unlocked.</p>
							</div>
						</div>
						<Badge color="success" variant="solid" size="xs">ON</Badge>
					</div>
				</Gate>
			</div>

			<div
				class="flex flex-col justify-between space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/60"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<code class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
							useFeatureFlag('beta-kanban')
						</code>
						<Badge
							size="xs"
							color={betaKanbanFlag.enabled ? 'success' : 'neutral'}
							variant="subtle"
						>
							{betaKanbanFlag.enabled ? 'Enabled' : 'Disabled'}
						</Badge>
					</div>
					<p class="text-xs text-neutral-500">
						Toggle runtime overrides cleanly from code or inside the built-in admin DevSandbox.
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button size="xs" variant="soft" color="primary" onclick={() => betaKanbanFlag.toggle()}>
						Toggle beta-kanban ({betaKanbanFlag.enabled ? 'ON' : 'OFF'})
					</Button>
				</div>
			</div>
		</div>

		<CodeBlock
			code={flagsSnippet}
			language="typescript"
			filename="src/lib/flags.ts"
			showLineNumbers={true}
		/>
	</Card>

	<!-- Storage Uploads -->
	<div class="space-y-4">
		<h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
			Cloud Storage (AWS S3 & Cloudflare R2 Presigned Uploads)
		</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Seamless direct-to-bucket presigned uploads with reactive progress tracking and turnkey
			RequestHandler endpoints:
		</p>
		<CodeBlock
			code={uploadSnippet}
			language="typescript"
			filename="src/routes/api/upload/+server.ts"
			showLineNumbers={true}
		/>
	</div>
</div>
