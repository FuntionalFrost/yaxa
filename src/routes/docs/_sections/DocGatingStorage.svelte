<script lang="ts">
	import Badge from '$lib/components/elements/Badge.svelte';
	import Card from '$lib/components/layout/Card.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import Gate from '$lib/components/saas/Gate.svelte';
	import { useGate } from '$lib/composables/useGate.svelte';

	// Simulated user state for interactive live playground
	let simPlan = $state<'free' | 'starter' | 'pro' | 'enterprise'>('free');
	let simRole = $state<'user' | 'admin'>('user');

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
	<Card class="space-y-6 border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
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
				<div class="flex rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
					{#each ['free', 'starter', 'pro', 'enterprise'] as plan}
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
			class="space-y-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-950/40"
		>
			<Gate
				requiredPlan="pro"
				userPlan={simPlan}
				userRole={simRole}
				preview={true}
				upgradeTitle="Pro Tier Feature"
				upgradeMessage="Exporting automated daily reports requires an active Pro or Enterprise plan."
			>
				<div
					class="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
				>
					<div class="flex items-center justify-between">
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
						class="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800"
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
			<pre
				class="text-2xs overflow-x-auto rounded-lg bg-neutral-900 p-3.5 font-mono text-neutral-100 dark:bg-neutral-950"><code
					>{gateSnippet}</code
				></pre>
		</div>

		<div class="space-y-3">
			<h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
				2. Programmatic useGate() Composable
			</h3>
			<pre
				class="text-2xs overflow-x-auto rounded-lg bg-neutral-900 p-3.5 font-mono text-neutral-100 dark:bg-neutral-950"><code
					>{useGateSnippet}</code
				></pre>
		</div>
	</div>

	<!-- Storage Uploads -->
	<div class="space-y-4">
		<h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
			Cloud Storage (AWS S3 & Cloudflare R2 Presigned Uploads)
		</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Seamless direct-to-bucket presigned uploads with reactive progress tracking and turnkey
			RequestHandler endpoints:
		</p>
		<pre
			class="overflow-x-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-100 dark:bg-neutral-950"><code
				>{uploadSnippet}</code
			></pre>
	</div>
</div>
