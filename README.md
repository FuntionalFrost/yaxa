<div align="center">

# Yaxa

**The Intuitive Svelte UI & Solo SaaS Library**  
_Nuxt UI v4 & Nuxt UI Pro Equivalent for SvelteKit 2 & 3 & Svelte 5 with Built-in SEO & SaaS Parity._

[![npm version](https://img.shields.io/npm/v/yaxa-svelte.svg?color=CB3837&logo=npm)](https://www.npmjs.com/package/yaxa-svelte)
[![npm downloads](https://img.shields.io/npm/dm/yaxa-svelte.svg?color=blue)](https://www.npmjs.com/package/yaxa-svelte)
[![Svelte 5](https://img.shields.io/badge/Svelte-5.0+-FF3E00?style=flat&logo=svelte&logoColor=white)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2_%26_3-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Bits UI](https://img.shields.io/badge/Bits_UI-v2.0-18181b?style=flat)](https://bits-ui.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](SECURITY.md)
[![Contributing](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**Live Documentation & Playground →**](https://yaxa.vercel.app)

</div>

---

## 🌟 Overview

**Yaxa** brings the full developer experience, visual elegance, and full-stack toolkit of **Nuxt UI** and the **Nuxt SEO + SaaS ecosystem** to **SvelteKit 2 & 3** and **Svelte 5**.

- 🎨 **Tailwind CSS v4 Native Tokens**: Styled with `@theme` variables; harmonic radius scale (`--radius-xs` to `--radius-4xl`), chart palette tokens (`--color-chart-1` to `--color-chart-5`), atmospheric utilities (`yaxa-grain` & `yaxa-mesh-glow`), and auto-adaptive scrollbars.
- 🎛️ **Visual Web Theme Studio**: Interactive runtime palette designer (`/theme` and `<ThemeStudio />`) with live sandbox preview and 1-click token export.
- 🤖 **AI-Native Primitives**: Drop-in `<AiChat>`, `<PromptBar>`, `<AiThought>`, and `<AiToolCall>` for conversational interfaces and agentic workflows.
- 📊 **Zero-Dependency SVG Charts**: Pure Svelte 5 `<LineChart>`, `<BarChart>`, and `<DonutChart>` with responsive tooltips, curved splines, and theme-palette synchronisation.
- ⚡ **Pure Svelte 5 Runes**: Built using `$state`, `$derived`, `$props`, and `$bindable` — zero Virtual DOM overhead.
- ♿ **Accessible by Default**: Headless primitives powered by **Bits UI**.
- 🚀 **100% DRY SEO Parity**: Automate dynamic Open Graph cards (`/api/og`), environment-aware `robots.txt`, XML sitemaps with human-readable `sitemap.xsl` stylesheets, PWA manifests, and Schema.org JSON-LD from a single `src/site.config.ts`.
- 🔐 **Batteries-Included SaaS Suite**: Pre-integrated **Better-Auth**, multi-dialect **Drizzle ORM** (Neon PostgreSQL & Turso LibSQL/SQLite), **Polar.sh** payments & webhook sync, and **Resend** transactional emails.
- 🧩 **50+ Production Components**: Elements, compound `<Skeleton recipe="...">` layouts, AI primitives, charts, advanced forms (`<RichTextEditor>`, `<PhoneInput>`, `<CreditCardInput>`), layout, overlays, sliding segmented `<Tabs>`, native `<Toast>` / `<Toaster>`, and drop-in SaaS widgets (`<AuthCard>`, `<UserMenu>`, `<PricingTable>`, `<SubscriptionCard>`).
- 🛠️ **Composable Runes**: `useAuth`, `useShortcuts`, `useClipboard`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`, `useIdle`, `useGate`.

---

## 📦 Quickstart

### 1. Install Dependencies

Install `yaxa-svelte` along with Tailwind CSS v4:

```bash
# Core package & icons
pnpm add yaxa-svelte @lucide/svelte

# Tailwind CSS v4 (Dev Dependencies)
pnpm add -D tailwindcss @tailwindcss/vite @tailwindcss/typography
```

_(Optional full-stack SaaS features: `pnpm add better-auth drizzle-orm @polar-sh/sdk resend`)_

---

### 2. Configure `vite.config.ts`

Add Tailwind CSS and the `yaxa()` plugin to your Vite plugins:

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { yaxa } from 'yaxa-svelte/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), yaxa()]
});
```

---

### 3. Define Your Site Configuration

Create `src/site.config.ts` — your single source of truth for branding, metadata, licensing, and SEO:

```ts
// src/site.config.ts
import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
	name: 'My Indie SaaS',
	title: 'My Indie SaaS — Build Fast with SvelteKit',
	description: 'Fast, beautiful, accessible web applications.',
	url: 'https://my-app.com',
	// Single-email mode: Solo devs can set one email for contact, support & DPO
	email: 'hello@my-app.com',
	project: {
		license: 'MIT',
		type: 'open-source',
		repositoryUrl: 'https://github.com/my-org/my-app'
	},
	theme: {
		accent: 'svelte', // 'svelte' | 'emerald' | 'amber' | 'sky' | 'violet' | 'rose' | 'indigo'
		neutral: 'zinc', // 'zinc' | 'slate' | 'stone' | 'neutral'
		defaultMode: 'dark'
	},
	socials: {
		github: 'https://github.com/my-org/my-app'
	}
});
```

---

### 4. Import CSS & Wrap Root Layout

**Option A: Turnkey Zero-Config** (Default)
Import `yaxa-svelte/yaxa.css` and wrap your app in `<YaxaApp>`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import 'yaxa-svelte/yaxa.css';
	import { YaxaApp } from 'yaxa-svelte';
	import { siteConfig } from '../site.config'; // or $lib/site.config

	let { data, children } = $props();
</script>

<YaxaApp config={siteConfig} user={data?.user}>
	{@render children()}
</YaxaApp>
```

**Option B: Optimized Tailwind CSS v4 Pipeline** (Maximum build performance & deduplication)
If your project already imports Tailwind in `src/app.css`, simply import the standalone theme tokens (Tailwind v4 automatically scans Yaxa's components via `@source` embedded in `theme.css`):

```css
/* src/app.css */
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@import 'yaxa-svelte/theme.css';
```

Then in `src/routes/+layout.svelte`, simply import `../app.css` instead of `yaxa.css`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { YaxaApp } from 'yaxa-svelte';
	import { siteConfig } from '../site.config';

	let { data, children } = $props();
</script>

<YaxaApp config={siteConfig} user={data?.user}>
	{@render children()}
</YaxaApp>
```

---

## 🛡️ 1-Line Server SEO & Auth Automation

Handle **all 5 SEO endpoints** and **Better-Auth session parsing** in `src/hooks.server.ts`:

```ts
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { createYaxaHook } from 'yaxa-svelte/server';
import { createYaxaAuth, createYaxaAuthHook } from 'yaxa-svelte/auth';
import { siteConfig } from './site.config';

const yaxaHook = createYaxaHook(siteConfig);
const auth = createYaxaAuth();
const authHook = createYaxaAuthHook({
	auth,
	protectedPaths: ['/dashboard', '/settings', '/billing'],
	loginPath: '/login'
});

export const handle = sequence(yaxaHook, authHook);
```

---

## 🛡️ Declarative Feature Gating (`<Gate />` & `useGate()`)

Declarative and programmatic subscription tier and RBAC gating with automatic Svelte 5 context fallback:

```svelte
<script lang="ts">
	import { Gate, useGate } from 'yaxa-svelte';

	const gate = useGate();
</script>

<!-- 0 props needed when wrapped in <YaxaApp user={data.user}> -->
<Gate requiredPlan="pro" preview={true}>
	<AdvancedAnalyticsWidget />
</Gate>
```

---

## 🗄️ Drizzle Admin & Introspection Suite (`yaxa-svelte/admin`)

Dual-mode Drizzle ORM administration and introspection suite with live CRUD table editor, developer sandbox, and user impersonation:

```ts
// Approach A (Zero-File Route Interceptor in src/hooks.server.ts)
import { sequence } from '@sveltejs/kit/hooks';
import { createYaxaAdminHook } from 'yaxa-svelte/admin';
import { db, schemaPg as schema } from 'yaxa-svelte/db'; // or your project's $lib/server/db

export const handle = sequence(createYaxaAdminHook({ db, schema, path: '/admin' }));
```

---

## ☁️ Cloud Storage (`useUpload()` & Presigned S3/R2 Uploads)

```svelte
<!-- Client Upload with Progress Tracking -->
<script lang="ts">
	import { useUpload } from 'yaxa-svelte';
	const uploader = useUpload({ endpoint: '/api/upload' });
</script>

<input type="file" onchange={(e) => uploader.upload(e.currentTarget.files[0])} />
```

---

## 💳 Polar.sh Payments & Webhook Synchronization

Create a webhook endpoint in `src/routes/api/webhooks/polar/+server.ts`:

```ts
// src/routes/api/webhooks/polar/+server.ts
import { createPolarWebhookHandler } from 'yaxa-svelte/polar';

export const POST = createPolarWebhookHandler();
```

---

## ⚡ Type-Safe Endpoint Pipeline (`yaxaEndpoint` & Declarative Guards)

Eliminate endpoint boilerplate in `+server.ts` with declarative auth guards, sliding-window rate limiting, multi-engine validation (Zod, Valibot, Standard Schema), and RFC 7807 Problem Details:

```ts
// src/routes/api/projects/+server.ts
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
```

---

## 📜 Auto-Generated OpenAPI 3.1 & Interactive Docs (`/api/docs`)

Instantly generate an OpenAPI 3.1 specification and host interactive documentation ([Scalar](https://scalar.com/), Swagger UI, or Redoc) directly from your `yaxaEndpoint` routes:

```ts
// src/routes/api/docs/+server.ts
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
```

- **Interactive Reference UI:** Open `/api/docs` in your browser (supports `?theme=scalar` (default), `?theme=swagger`, or `?theme=redoc`).
- **Live Demo:** Try it live on [yaxa.vercel.app/api/docs](https://yaxa.vercel.app/api/docs).
- **Raw OpenAPI 3.1 JSON:** Request `/api/docs?format=json` or send `Accept: application/json` for SDK generation.

---

## ⏱️ Embedded Background Workflows & Persistent Job Queue

Persistent, zero-infrastructure background task processing backed by your existing Drizzle database (Postgres or SQLite/Turso). Features atomic row leasing, exponential retry backoff with jitter, Dead-Letter Queue (DLQ), and dual execution models (Serverless Cron or long-running worker):

```ts
import { enqueueJob, defineWorker, createJobRunner, eventBus } from 'yaxa-svelte/server';

// 1. Decoupled domain events
eventBus.on('user.created', async ({ userId, email }) => {
	// 2. Enqueue background job (optionally pass active transaction { tx } for transactional outbox)
	await enqueueJob(
		'send-welcome-email',
		{ userId, email },
		{
			delay: '5m', // '30s', '5m', '2h', or ms
			priority: 10,
			maxAttempts: 5
		}
	);
});

// 3. Define worker
const emailWorker = defineWorker({
	name: 'send-welcome-email',
	handler: async (payload, { attempt, log }) => {
		log(`Sending welcome email (attempt ${attempt})`);
		await sendEmail(payload.email);
	}
});

// 4. Run in Serverless Cron (Vercel Cron) or background container
export const runner = createJobRunner({
	workers: [emailWorker],
	batchSize: 10
});

// In src/routes/api/cron/jobs/+server.ts:
export const GET = async () => {
	const result = await runner.processNextBatch();
	return Response.json(result);
};
```

---

## 📦 Subpath Exports Architecture

| Subpath                 | Description                                                                                                                                                                                |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yaxa-svelte`           | Core UI Primitives, SEO Components, `<Gate />`, Theme System & Composables (`useGate`, `useUpload`, `useToast`, `useClipboard`, etc.)                                                      |
| `yaxa-svelte/admin`     | Drizzle ORM Schema Introspection, `<AdminDashboard />`, `createYaxaAdminHook`, `createDrizzleAdmin`, `<DevSandbox />`, `<RecordDrawer />`                                                  |
| `yaxa-svelte/server`    | `yaxaEndpoint` Pipeline, Declarative Guards, OpenAPI 3.1 & Scalar Docs, RFC 7807, Background Jobs (`enqueueJob`, `createJobRunner`), `eventBus`, Server Hooks, Drizzle DB, Storage & Email |
| `yaxa-svelte/auth`      | Better-Auth client & server integration (`useAuth`, `<AuthCard />`, `<PasskeyUI />`, `<TwoFactorModal />`, `createYaxaAuth`)                                                               |
| `yaxa-svelte/db`        | Multi-dialect Drizzle ORM clients & schemas for Neon (PostgreSQL) and Turso (SQLite/LibSQL)                                                                                                |
| `yaxa-svelte/polar`     | Polar.sh billing, customer portal sessions, and webhook synchronization                                                                                                                    |
| `yaxa-svelte/email`     | Resend transactional email templates with automatic development console fallback                                                                                                           |
| `yaxa-svelte/storage`   | AWS S3 and Cloudflare R2 presigned upload URL generators                                                                                                                                   |
| `yaxa-svelte/testing`   | Test mocks & utilities (`createMockSiteConfig`, `createMockUser`, `createTestWrapperProps`)                                                                                                |
| `yaxa-svelte/vite`      | Turnkey Vite plugin (`yaxa()`)                                                                                                                                                             |
| `yaxa-svelte/yaxa.css`  | Standalone turnkey Tailwind CSS v4 stylesheet with base styling, `@theme`, and scrollbars                                                                                                  |
| `yaxa-svelte/theme.css` | Pure Tailwind CSS v4 design tokens, `:root` variables, and harmonic radius scale without `@import 'tailwindcss'`                                                                           |

---

## 🧩 Component Library

| Category               | Components                                                                                                                                                                                                                                                                                                               |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Theming & Studio**   | `<ThemeStudio>`, `theme`, `ACCENT_PALETTES`, `NEUTRAL_PALETTES`, `RADIUS_PRESETS`, Harmonic Radius Multiplier Scale, Chart Palette Series Tokens                                                                                                                                                                         |
| **AI Primitives**      | `<AiChat>`, `<PromptBar>`, `<AiThought>`, `<AiToolCall>`                                                                                                                                                                                                                                                                 |
| **Charts (Pure SVG)**  | `<LineChart>`, `<BarChart>`, `<DonutChart>` (0 external charting dependencies, auto-responsive, dark/light theme aware)                                                                                                                                                                                                  |
| **SaaS & Auth Suite**  | `<PasskeyUI>` (WebAuthn), `<TwoFactorModal>` (TOTP), `<AuthCard>` (Polymorphic), `<Gate>`, `<UserMenu>`, `<OrgSwitcher>`, `<PricingCard>`, `<PricingTable>`, `<SubscriptionCard>`, `useAuth`, `useGate`, `useUpload`                                                                                                     |
| **Admin Suite**        | `<AdminDashboard>`, `<RecordDrawer>`, `<DevSandbox>`, `<ImpersonationBanner>`, `createYaxaAdminHook`, `createDrizzleAdmin`                                                                                                                                                                                               |
| **Elements & Code**    | `<CodeDiff>` (Interactive Diff & Changelog), `<CodeBlock>`, `<DataTable>` (Client & Server Modes), `Button`, `ButtonGroup`, `Badge`, `Avatar`, `AvatarGroup`, `Chip`, `Meter`, `MetricCard`, `Kbd`, `Icon`, `Spinner`, `Progress`, `Skeleton`, `Link`, `Logo`, `Tree`, `Timeline`, `Terminal`, `VirtualList`, `Carousel` |
| **Forms (Auto-Wired)** | `<Form>`, `<FormField>`, `Input`, `InputOTP`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Combobox`, `MultiSelect`, `NumberInput`, `PhoneInput`, `CreditCardInput`, `RadioGroup`, `Slider`, `ColorPicker`, `ToggleGroup`, `DatePicker`, `DateRangePicker`, `Dropzone`, `<RichTextEditor>`                               |
| **Layout & Blocks**    | `Container`, `Header`, `Footer`, `Section`, `Card`, `Divider`, `YaxaApp`, `DashboardShell` (with independent sidebar tokens), `ResizablePanels`, Page Blocks (`Hero`, `SaaS Metrics`, `FAQ`, `Testimonials`, `FeatureGrid`)                                                                                              |
| **Overlays & Nav**     | `Tabs`, `Breadcrumb`, `Pagination`, `CommandPalette` (`⌘K`), `DropdownMenu`, `ContextMenu`, `Modal`, `Drawer`, `Slideover`, `Popover`, `Tooltip` (with `arrow={false}` & `unstyled`), `Alert`, `Accordion`, `NotificationCenter`, `Stepper`                                                                              |
| **Motion & Actions**   | `springTilt`, `smoothSlide`, `staggerFly`, `autosize`, `clickOutside`, `portal`, `sortableItem`, `infiniteScrollAction`                                                                                                                                                                                                  |
| **Composables**        | `useAuth`, `useGate`, `useUpload`, `useClipboard`, `useShortcuts`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`, `useIdle`, `useInfiniteScroll`, `useSortable`, `useDataTable`, `useLocale`                                                                                                                |

---

## 🎨 Interactive Live Themes

Yaxa includes first-class support for instant dynamic CSS accent and neutral variables via `theme`:

```ts
import { theme } from 'yaxa-svelte';

// Change theme accent dynamically at runtime:
theme.setAccent('svelte'); // Svelte Flame (#ff3e00)
theme.setAccent('emerald'); // Emerald Mint (#10b981)
theme.setAccent('sky'); // Sky Cyan (#0ea5e9)
```

---

## 🤝 Contributing

Contributions are always welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Security Policy](SECURITY.md) before submitting pull requests.

1. Fork the repository: `git clone https://github.com/FuntionalFrost/yaxa.git`
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Run verification gates: `pnpm lint && pnpm check && pnpm test && pnpm build`

---

## 📄 License

[MIT License](LICENSE) © 2026 Yaxa Contributors.
