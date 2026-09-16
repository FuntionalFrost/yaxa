<script lang="ts">
	import Badge from '$lib/components/elements/Badge.svelte';
	import Card from '$lib/components/layout/Card.svelte';
	import Tabs from '$lib/components/navigation/Tabs.svelte';
	import AuthCard from '$lib/components/saas/AuthCard.svelte';
	import UserMenu from '$lib/components/saas/UserMenu.svelte';
	import PricingTable from '$lib/components/saas/PricingTable.svelte';
	import SubscriptionCard from '$lib/components/saas/SubscriptionCard.svelte';
	import OrgSwitcher, { type OrgItem } from '$lib/components/saas/OrgSwitcher.svelte';
	import NotificationCenter, {
		type NotificationItem
	} from '$lib/components/overlays/NotificationCenter.svelte';

	let activeDemo = $state('auth');

	let demoOrgId = $state('org-1');
	const demoOrgs: OrgItem[] = [
		{ id: 'org-1', name: 'Acme SaaS Corp', role: 'Owner', plan: 'Enterprise' },
		{ id: 'org-2', name: 'Starlight Labs', role: 'Admin', plan: 'Pro' },
		{ id: 'org-3', name: 'Personal Workspace', role: 'Member', plan: 'Free' }
	];

	let demoNotifs = $state<NotificationItem[]>([
		{
			id: '1',
			title: 'Payment received ($29.00)',
			description: 'Invoice #INV-4982 settled via Polar.',
			timestamp: '5m ago',
			read: false
		},
		{
			id: '2',
			title: 'Database schema migration',
			description: 'Schema successfully synced with Neon Postgres.',
			timestamp: '1h ago',
			read: false
		},
		{
			id: '3',
			title: 'SSL Certificate Auto-Renewed',
			description: 'Wildcard TLS certificate issued for api.yaxa.dev.',
			timestamp: '1d ago',
			read: true
		}
	]);

	const demoTabs = [
		{ value: 'auth', label: 'Auth Card' },
		{ value: 'org-switcher', label: 'Org Switcher' },
		{ value: 'notifications', label: 'Notifications' },
		{ value: 'pricing', label: 'Pricing Table' },
		{ value: 'subscription', label: 'Subscription Widget' },
		{ value: 'user-menu', label: 'User Menu' }
	];

	const envCodeSnippet = `# .env
# For Neon PostgreSQL:
DATABASE_DRIVER="neon"
DATABASE_URL="postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require"

# OR For Turso SQLite:
# DATABASE_DRIVER="turso"
# DATABASE_URL="libsql://your-db-org.turso.io"
# DATABASE_AUTH_TOKEN="your-turso-token"
`;

	const hookCodeSnippet = `// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { createYaxaHook, createYaxaAuth, createYaxaAuthHook } from 'yaxa-svelte/server';
import { siteConfig } from './site.config';

const yaxaHook = createYaxaHook(siteConfig);
const auth = createYaxaAuth();
const authHook = createYaxaAuthHook({
  auth,
  protectedPaths: ['/dashboard', '/settings', '/billing'],
  loginPath: '/login'
});

export const handle = sequence(yaxaHook, authHook);
`;

	const webhookCodeSnippet = `// src/routes/api/webhooks/polar/+server.ts
import { createPolarWebhookHandler } from 'yaxa-svelte/polar';

export const POST = createPolarWebhookHandler({
  onSubscriptionCreated: async (event) => {
    console.log('New paid subscription created!', event.data.id);
  }
});
`;

	const subpathsSnippet = `// 1. Core UI Components & Headless Actions (Zero Backend Overhead)
import { Button, Modal, UserMenu, useToast, useColorMode } from 'yaxa-svelte';

// 2. Full-Stack Client Auth (Better-Auth Runes & Cards)
import { useAuth, AuthCard } from 'yaxa-svelte/auth';

// 3. SvelteKit Server Hooks, Auth Factory & SEO Handlers
import { createYaxaHook, createYaxaAuth, createYaxaAuthHook } from 'yaxa-svelte/server';

// 4. Drizzle ORM Database Schema & Client
import { getDb, schemaPg, schemaSqlite } from 'yaxa-svelte/db';

// 5. Polar.sh Billing & Webhooks
import { createPolarCheckout, createPolarWebhookHandler } from 'yaxa-svelte/polar';

// 6. S3 / Cloudflare R2 Presigned Uploads
import { createPresignedUploadUrl } from 'yaxa-svelte/storage';
`;
</script>

<div class="space-y-12">
	<!-- Header -->
	<div class="space-y-4">
		<div class="flex items-center gap-2">
			<Badge color="primary" variant="subtle" size="sm">Solo SaaS Suite</Badge>
			<Badge color="neutral" variant="outline" size="sm">Batteries-Included</Badge>
		</div>
		<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
			Full-Stack Solo SaaS Toolkit
		</h1>
		<p class="text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
			Everything a solo developer needs to ship a paid SaaS in record time: <strong
				>Better-Auth</strong
			>
			authentication, switchable <strong>Drizzle ORM</strong> (Neon PostgreSQL or Turso LibSQL),
			<strong>Polar.sh</strong>
			payments & subscriptions, <strong>Resend</strong> transactional emails, and drop-in Svelte 5 runes
			components.
		</p>
	</div>

	<!-- Interactive SaaS Live Preview -->
	<Card class="space-y-6 border-zinc-200 p-6 shadow-md sm:p-8 dark:border-zinc-800">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">
					Live Component Playground
				</h3>
				<p class="text-xs text-zinc-500 dark:text-zinc-400">
					Interact with real Svelte 5 SaaS components rendered below.
				</p>
			</div>
			<div class="w-full sm:w-auto">
				<Tabs items={demoTabs} bind:value={activeDemo} />
			</div>
		</div>

		<div
			class="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/40"
		>
			{#if activeDemo === 'auth'}
				<div class="w-full max-w-md">
					<AuthCard showSocial={true} showMagicLinkToggle={true} />
				</div>
			{:else if activeDemo === 'org-switcher'}
				<div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
					<div class="text-xs text-neutral-500 dark:text-neutral-400">
						Switch between personal and multi-tenant workspaces
					</div>
					<OrgSwitcher
						organizations={demoOrgs}
						bind:currentOrgId={demoOrgId}
						oncreate={() => alert('Create organization modal trigger')}
					/>
				</div>
			{:else if activeDemo === 'notifications'}
				<div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
					<div class="text-xs text-neutral-500 dark:text-neutral-400">
						Real-time notification drawer with unread counter chip
					</div>
					<NotificationCenter
						notifications={demoNotifs}
						onmarkallread={() => (demoNotifs = demoNotifs.map((n) => ({ ...n, read: true })))}
						onselect={(n) => alert('Selected notification: ' + n.title)}
					/>
				</div>
			{:else if activeDemo === 'pricing'}
				<div class="w-full">
					<PricingTable />
				</div>
			{:else if activeDemo === 'subscription'}
				<div class="w-full max-w-2xl">
					<SubscriptionCard tierName="Pro Solo Plan" amount={29} status="active" interval="month" />
				</div>
			{:else if activeDemo === 'user-menu'}
				<div class="flex justify-center p-8">
					<UserMenu
						user={{
							name: 'Yaxa Creator',
							email: 'founder@yaxa.dev',
							image: null,
							role: 'Owner'
						}}
						tier="PRO"
					/>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Architecture Breakdown -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			1. Database Configuration (Neon vs. Turso)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Choose between serverless PostgreSQL (Neon) or edge LibSQL/SQLite (Turso) by setting <code
				class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800"
				>DATABASE_DRIVER</code
			>
			in your
			<code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">.env</code
			>:
		</p>
		<pre
			class="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs text-zinc-100 dark:border-zinc-800"><code
				>{envCodeSnippet}</code
			></pre>
	</div>

	<!-- Better-Auth Setup -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			2. Authentication in 1 Hook (`src/hooks.server.ts`)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Attach Better-Auth session validation and protected dashboard route guards with <code
				class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800"
				>createYaxaAuthHook</code
			>:
		</p>
		<pre
			class="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs text-zinc-100 dark:border-zinc-800"><code
				>{hookCodeSnippet}</code
			></pre>
	</div>

	<!-- Polar.sh Payments -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			3. Polar.sh Payments & Webhooks
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Create instant checkout endpoints and handle webhooks with automatic Drizzle database
			synchronization:
		</p>
		<pre
			class="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs text-zinc-100 dark:border-zinc-800"><code
				>{webhookCodeSnippet}</code
			></pre>
	</div>

	<!-- Subpath Module Architecture -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			4. Subpath Module Architecture (Zero-Bundle Tax)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Yaxa isolates full-stack dependencies via dedicated subpath exports, ensuring pure client and
			static documentation projects don't download or bundle unused backend libraries:
		</p>
		<pre
			class="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs text-zinc-100 dark:border-zinc-800"><code
				>{subpathsSnippet}</code
			></pre>
	</div>
</div>
