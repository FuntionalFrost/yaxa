<script lang="ts">
	import Badge from '$lib/components/elements/Badge.svelte';
	import Card from '$lib/components/layout/Card.svelte';
	import DevSandbox from '$lib/admin/components/DevSandbox.svelte';
	import ImpersonationBanner from '$lib/admin/components/ImpersonationBanner.svelte';
	import CodeBlock from '$lib/components/elements/CodeBlock.svelte';

	let isImpersonatingDemo = $state(true);

	const approachACode = `// src/hooks.server.ts (Zero-File Approach A)
import { sequence } from '@sveltejs/kit/hooks';
import { createYaxaAdminHook } from 'yaxa-svelte/admin';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema-pg';

export const handle = sequence(
  createYaxaAdminHook({
    db,
    schema,
    path: '/admin',
    requireAuth: async (event) => {
      // Return true if admin session is present
      return event.locals.user?.role === 'admin';
    }
  })
);
`;

	const approachBServerCode = `// src/routes/admin/+page.server.ts (Custom Route Approach B)
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema-pg';
import { createDrizzleAdmin } from 'yaxa-svelte/admin';

export const { load, actions } = createDrizzleAdmin({
  db,
  schema,
  requireAuth: async (event) => event.locals.user?.role === 'admin'
});
`;

	const approachBPageCode =
		`<!-- src/routes/admin/+page.svelte -->
<` +
		`script lang="ts">
  import { AdminDashboard } from 'yaxa-svelte/admin';
  let { data } = $props();
</` +
		`script>

<AdminDashboard data={data.adminData} />
`;
</script>

<div class="space-y-12">
	<!-- Impersonation demo banner -->
	{#if isImpersonatingDemo}
		<ImpersonationBanner
			impersonatedUser={{ name: 'Alex Johnson', email: 'alex@example.com' }}
			onstop={() => {
				isImpersonatingDemo = false;
			}}
		/>
	{/if}

	<!-- Header -->
	<div class="space-y-4">
		<div class="flex items-center gap-2">
			<Badge color="primary" variant="subtle" size="sm">yaxa-svelte/admin</Badge>
			<Badge color="success" variant="outline" size="sm">Dual-Mode Ready</Badge>
		</div>
		<h1
			class="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50"
		>
			Drizzle Admin & Introspection Suite
		</h1>
		<p class="text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
			An all-in-one database introspection engine, live CRUD table editor, developer sandbox, and
			user impersonation system built specifically for SvelteKit and Drizzle ORM.
		</p>
	</div>

	<!-- Approach A vs Approach B Cards -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Approach A Card -->
		<Card class="space-y-4 border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
			<div class="flex items-center justify-between">
				<Badge color="primary" variant="solid" size="xs">Recommended</Badge>
				<span class="text-xs font-semibold text-neutral-500">Zero-File Interception</span>
			</div>
			<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
				Approach A: 1-Line Server Hook
			</h3>
			<p class="text-xs text-neutral-600 dark:text-neutral-400">
				Intercepts <code
					class="text-2xs rounded bg-neutral-100 px-1 py-0.5 font-mono dark:bg-neutral-800"
					>/admin</code
				>
				directly in
				<code class="text-2xs rounded bg-neutral-100 px-1 py-0.5 font-mono dark:bg-neutral-800"
					>src/hooks.server.ts</code
				>. No route files required.
			</p>
			<CodeBlock
				code={approachACode}
				language="typescript"
				filename="src/hooks.server.ts"
				showLineNumbers={true}
			/>
		</Card>

		<!-- Approach B Card -->
		<Card class="space-y-4 border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
			<div class="flex items-center justify-between">
				<Badge color="neutral" variant="outline" size="xs">Customizable</Badge>
				<span class="text-xs font-semibold text-neutral-500">Custom Route Page</span>
			</div>
			<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
				Approach B: Turnkey Svelte Route
			</h3>
			<p class="text-xs text-neutral-600 dark:text-neutral-400">
				Use <code class="text-2xs rounded bg-neutral-100 px-1 py-0.5 font-mono dark:bg-neutral-800"
					>createDrizzleAdmin</code
				>
				in
				<code class="text-2xs rounded bg-neutral-100 px-1 py-0.5 font-mono dark:bg-neutral-800"
					>+page.server.ts</code
				>
				with the
				<code class="text-2xs rounded bg-neutral-100 px-1 py-0.5 font-mono dark:bg-neutral-800"
					>&lt;AdminDashboard /&gt;</code
				> component.
			</p>
			<CodeBlock
				code={approachBServerCode}
				language="typescript"
				filename="src/routes/admin/+page.server.ts"
				showLineNumbers={true}
			/>
			<CodeBlock
				code={approachBPageCode}
				language="svelte"
				filename="src/routes/admin/+page.svelte"
				showLineNumbers={true}
			/>
		</Card>
	</div>

	<!-- Live Developer Sandbox Preview -->
	<div class="space-y-4">
		<h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
			Live Developer Sandbox & Storage Preview
		</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Embedded live sandbox for testing transactional email templates and S3/R2 direct uploads:
		</p>
		<DevSandbox />
	</div>
</div>
