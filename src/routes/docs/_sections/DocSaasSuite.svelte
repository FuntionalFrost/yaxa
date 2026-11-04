<script lang="ts">
	import Badge from '#lib/components/elements/Badge.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Button from '#lib/components/elements/Button.svelte';
	import Tabs from '#lib/components/navigation/Tabs.svelte';
	import AuthCard from '#lib/components/saas/AuthCard.svelte';
	import PasskeyUI from '#lib/components/saas/PasskeyUI.svelte';
	import TwoFactorModal from '#lib/components/saas/TwoFactorModal.svelte';
	import UserMenu from '#lib/components/saas/UserMenu.svelte';
	import PricingTable from '#lib/components/saas/PricingTable.svelte';
	import SubscriptionCard from '#lib/components/saas/SubscriptionCard.svelte';
	import OrgSwitcher, { type OrgItem } from '#lib/components/saas/OrgSwitcher.svelte';
	import NotificationCenter, {
		type NotificationItem
	} from '#lib/components/overlays/NotificationCenter.svelte';
	import CodeBlock from '#lib/components/elements/CodeBlock.svelte';

	let activeDemo = $state('auth');
	let show2FAModal = $state(false);

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
		{ value: 'passkey', label: 'Passkeys' },
		{ value: 'two-factor', label: '2FA Modal' },
		{ value: 'org-switcher', label: 'Org Switcher' },
		{ value: 'notifications', label: 'Notifications' },
		{ value: 'pricing', label: 'Pricing Table' },
		{ value: 'subscription', label: 'Subscription' },
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
const auth = createYaxaAuth({
  passkey: { enabled: true },
  twoFactor: { enabled: true, issuer: 'My SaaS' }
});

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
import { Button, Modal, UserMenu, useToast, useColorMode, springTilt } from 'yaxa-svelte';

// 2. Full-Stack Client Auth (Passkeys, 2FA, & Polymorphic AuthCards)
import { useAuth, AuthCard, PasskeyUI, TwoFactorModal } from 'yaxa-svelte/auth';

// 3. SvelteKit Server Hooks, Auth Factory, yaxaEndpoint Pipeline & SEO Handlers
import { yaxaEndpoint, requireAuth, requireRole, rateLimit, createYaxaHook, createYaxaAuth } from 'yaxa-svelte/server';

// 4. Drizzle ORM Database Schema & Client
import { getDb, schemaPg, schemaSqlite } from 'yaxa-svelte/db';

// 5. Polar.sh Billing & Webhooks
import { createPolarCheckout, createPolarWebhookHandler } from 'yaxa-svelte/polar';

// 6. S3 / Cloudflare R2 Presigned Uploads
import { createPresignedUploadUrl } from 'yaxa-svelte/storage';
`;

	const endpointSnippet = `// src/routes/api/projects/+server.ts
import { yaxaEndpoint, requireAuth, requireRole, rateLimit } from 'yaxa-svelte/server';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional()
});

export const POST = yaxaEndpoint({
  status: 201,
  guards: [
    requireAuth(),
    requireRole(['admin', 'owner']),
    rateLimit({ points: 20, windowSeconds: 60 })
  ],
  schema: {
    body: CreateProjectSchema
  },
  handle: async ({ body, user, orgId }) => {
    // Guaranteed type-safe body, authenticated user, and active orgId
    return { id: 'proj_123', name: body.name, orgId };
  }
});
`;

	const docsSnippet = `// src/routes/api/docs/+server.ts
import { createApiDocsHandler } from 'yaxa-svelte/server';
import { POST as createProject } from '../projects/+server';

export const GET = createApiDocsHandler({
  title: 'Acme SaaS API',
  version: '1.0.0',
  theme: 'scalar', // 'scalar' (default) | 'swagger' | 'redoc'
  endpoints: {
    '/api/projects': {
      POST: createProject
    }
  }
});
`;

	const jobsSnippet = `// 1. Enqueue job (with optional transactional outbox)
import { enqueueJob } from 'yaxa-svelte/server';

await enqueueJob('send-welcome-email', {
  userId: 'usr_123',
  email: 'founder@example.com'
}, {
  delay: '5m',       // Human delay: '30s', '5m', '2h', or ms
  priority: 10,      // Higher numbers run first
  maxAttempts: 5     // Exponential backoff retries with jitter
});

// 2. Define worker handler
import { defineWorker, createJobRunner } from 'yaxa-svelte/server';

const emailWorker = defineWorker({
  name: 'send-welcome-email',
  handler: async (payload, { attempt, log }) => {
    log(\`Sending welcome email (attempt \${attempt})\`);
    await sendEmail(payload.email, 'Welcome to Yaxa!');
  }
});

// 3. Process jobs in a Serverless Cron route or long-running worker
export const runner = createJobRunner({
  workers: [emailWorker],
  batchSize: 10
});

// In src/routes/api/cron/jobs/+server.ts (Vercel Cron / serverless):
export const GET = async () => {
  const result = await runner.processNextBatch();
  return Response.json(result);
};
`;

	const eventBusSnippet = `import { eventBus } from 'yaxa-svelte/server';

// Decouple business domains with async error-isolated event subscribers
eventBus.on('user.created', async ({ userId, email }) => {
  await enqueueJob('send-welcome-email', { userId, email });
});

// Dispatch anywhere from server endpoints, webhooks, or action handlers:
await eventBus.emit('user.created', {
  userId: 'usr_123',
  email: 'founder@example.com'
});
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
			authentication (including Passkeys/WebAuthn and TOTP 2FA), switchable
			<strong>Drizzle ORM</strong>
			(Neon PostgreSQL or Turso LibSQL),
			<strong>Polar.sh</strong>
			payments & subscriptions, <strong>Resend</strong> transactional emails, and drop-in Svelte 5 runes
			components.
		</p>
	</div>

	<!-- Interactive SaaS Live Preview -->
	<Card class="space-y-6 border-zinc-200 p-4 shadow-md sm:p-8 dark:border-zinc-800">
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
			class="flex min-h-105 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-3 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/40"
		>
			{#if activeDemo === 'auth'}
				<div class="w-full max-w-md">
					<AuthCard showSocial={true} showMagicLinkToggle={true} showPasskey={true} />
				</div>
			{:else if activeDemo === 'passkey'}
				<div class="w-full max-w-md">
					<PasskeyUI mode="card" />
				</div>
			{:else if activeDemo === 'two-factor'}
				<div class="flex flex-col items-center justify-center gap-4 p-2 text-center sm:p-8">
					<div class="text-xs text-neutral-500 dark:text-neutral-400">
						3-step Turnkey TOTP Two-Factor Enrollment Modal paired with InputOTP
					</div>
					<Button variant="solid" color="primary" onclick={() => (show2FAModal = true)}>
						Open 2FA Setup Modal
					</Button>
					<TwoFactorModal bind:open={show2FAModal} />
				</div>
			{:else if activeDemo === 'org-switcher'}
				<div class="flex flex-col items-center justify-center gap-4 p-2 text-center sm:p-8">
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
				<div class="flex flex-col items-center justify-center gap-4 p-2 text-center sm:p-8">
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
				<div class="flex justify-center p-2 sm:p-8">
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
		<CodeBlock code={envCodeSnippet} language="bash" filename=".env" showLineNumbers={true} />
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
		<CodeBlock
			code={hookCodeSnippet}
			language="typescript"
			filename="src/hooks.server.ts"
			showLineNumbers={true}
			highlightLines={[8, 9, 10]}
		/>
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
		<CodeBlock
			code={webhookCodeSnippet}
			language="typescript"
			filename="src/routes/api/webhooks/polar/+server.ts"
			showLineNumbers={true}
		/>
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
		<CodeBlock
			code={subpathsSnippet}
			language="typescript"
			filename="subpath-imports.ts"
			showLineNumbers={true}
		/>
	</div>

	<!-- Type-Safe Endpoint Pipeline -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			5. Type-Safe Endpoint Pipeline (`yaxaEndpoint`)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Eliminate endpoint boilerplate in <code
				class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800"
				>+server.ts</code
			> with declarative auth guards, sliding-window rate limiting, multi-engine validation (Zod, Valibot,
			Standard Schema), and automated RFC 7807 Problem Details error formatting:
		</p>
		<CodeBlock
			code={endpointSnippet}
			language="typescript"
			filename="src/routes/api/projects/+server.ts"
			showLineNumbers={true}
		/>
	</div>

	<!-- Auto-Generated OpenAPI & Interactive Docs -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			6. Auto-Generated OpenAPI 3.1 & Interactive Docs (`createApiDocsHandler`)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Instantly generate live interactive API documentation using <strong>Scalar</strong> (modern
			dark-mode reference), <strong>Swagger UI</strong>, or <strong>Redoc</strong> directly from your
			endpoints, with raw OpenAPI 3.1 JSON export for SDK generation:
		</p>
		<CodeBlock
			code={docsSnippet}
			language="typescript"
			filename="src/routes/api/docs/+server.ts"
			showLineNumbers={true}
		/>
		<div class="flex flex-wrap items-center gap-3 pt-2">
			<a
				href="/api/docs"
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400"
			>
				<span>Open Live Scalar Docs</span>
				<span class="opacity-75">↗</span>
			</a>
			<a
				href="/api/docs?theme=swagger"
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
			>
				<span>Swagger UI</span>
				<span class="opacity-75">↗</span>
			</a>
			<a
				href="/api/docs?format=json"
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
			>
				<span>OpenAPI 3.1 JSON</span>
				<span class="opacity-75">↗</span>
			</a>
		</div>
	</div>

	<!-- Background Workflows & Persistent Job Queue -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			7. Background Workflows & Persistent Job Queue (`enqueueJob`)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Zero-infrastructure background task execution backed by your existing Drizzle database
			(PostgreSQL or SQLite/Turso). Features atomic row leasing, exponential retry backoff with
			jitter, Dead-Letter Queue (DLQ), and dual execution models (Serverless Cron or persistent
			runner):
		</p>
		<CodeBlock
			code={jobsSnippet}
			language="typescript"
			filename="src/lib/server/jobs.ts"
			showLineNumbers={true}
			highlightLines={[4, 8, 17, 26, 33]}
		/>
	</div>

	<!-- Domain Event Bus -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
			8. Embedded Domain Events (`eventBus`)
		</h2>
		<p class="text-sm text-zinc-600 dark:text-zinc-400">
			Decouple application domains without Kafka, RabbitMQ, or external message brokers. Execute
			asynchronous subscribers with complete error isolation:
		</p>
		<CodeBlock
			code={eventBusSnippet}
			language="typescript"
			filename="src/lib/server/events.ts"
			showLineNumbers={true}
		/>
	</div>
</div>
