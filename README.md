<div align="center">

# Yaxa

**The Intuitive Svelte UI & Solo SaaS Library**  
_Nuxt UI v4 & Nuxt UI Pro Equivalent for SvelteKit 2.7+ & Svelte 5 with Built-in SEO & SaaS Parity._

[![npm version](https://img.shields.io/npm/v/yaxa-svelte.svg?color=CB3837&logo=npm)](https://www.npmjs.com/package/yaxa-svelte)
[![npm downloads](https://img.shields.io/npm/dm/yaxa-svelte.svg?color=blue)](https://www.npmjs.com/package/yaxa-svelte)
[![Svelte 5](https://img.shields.io/badge/Svelte-5.0+-FF3E00?style=flat&logo=svelte&logoColor=white)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.7+-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Bits UI](https://img.shields.io/badge/Bits_UI-v2.0-18181b?style=flat)](https://bits-ui.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

[**Live Documentation & Playground →**](https://yaxa.vercel.app)

</div>

---

## 🌟 Overview

**Yaxa** brings the full developer experience, visual elegance, and full-stack toolkit of **Nuxt UI** and the **Nuxt SEO + SaaS ecosystem** to **SvelteKit 2.7+** and **Svelte 5**.

- 🎨 **Tailwind CSS v4 Native Tokens**: Styled with `@theme` variables; harmonic radius scale (`--radius-xs` to `--radius-4xl`), chart palette tokens (`--color-chart-1` to `--color-chart-5`), and auto-adaptive scrollbars.
- 🎛️ **Visual Web Theme Studio**: Interactive runtime palette designer (`/theme` and `<ThemeStudio />`) with live sandbox preview and 1-click token export.
- 🤖 **AI-Native Primitives**: Drop-in `<AiChat>`, `<PromptBar>`, `<AiThought>`, and `<AiToolCall>` for conversational interfaces and agentic workflows.
- 📊 **Zero-Dependency SVG Charts**: Pure Svelte 5 `<LineChart>`, `<BarChart>`, and `<DonutChart>` with responsive tooltips, curved splines, and theme-palette synchronisation.
- ⚡ **Pure Svelte 5 Runes**: Built using `$state`, `$derived`, `$props`, and `$bindable` — zero Virtual DOM overhead.
- ♿ **Accessible by Default**: Headless primitives powered by **Bits UI**.
- 🚀 **100% DRY SEO Parity**: Automate dynamic Open Graph cards (`/api/og`), environment-aware `robots.txt`, XML sitemaps with human-readable `sitemap.xsl` stylesheets, PWA manifests, and Schema.org JSON-LD from a single `src/site.config.ts`.
- 🔐 **Batteries-Included SaaS Suite**: Pre-integrated **Better-Auth**, multi-dialect **Drizzle ORM** (Neon PostgreSQL & Turso LibSQL/SQLite), **Polar.sh** payments & webhook sync, and **Resend** transactional emails.
- 🧩 **45+ Production Components**: Elements, AI primitives, charts, advanced forms (`<RichTextEditor>`, `<PhoneInput>`, `<CreditCardInput>`), layout, overlays, and drop-in SaaS widgets (`<AuthCard>`, `<UserMenu>`, `<PricingTable>`, `<SubscriptionCard>`).
- 🛠️ **Composable Runes**: `useAuth`, `useShortcuts`, `useClipboard`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`, `useIdle`.

---

## 📦 Quickstart

### 1. Install Dependencies

Install `yaxa-svelte` along with Tailwind CSS v4 and `@lucide/svelte`:

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

Import `yaxa-svelte/yaxa.css` and wrap your app in `<YaxaApp>`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import 'yaxa-svelte/yaxa.css';
	import { YaxaApp } from 'yaxa-svelte';
	import { siteConfig } from '../site.config';

	let { children } = $props();
</script>

<YaxaApp config={siteConfig}>
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
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema-pg';

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

## 📦 Subpath Exports Architecture

| Subpath                | Description                                                                                                                               |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `yaxa-svelte`          | Core UI Primitives, SEO Components, `<Gate />`, Theme System & Composables (`useGate`, `useUpload`, `useAuth`, `useClipboard`, etc.)      |
| `yaxa-svelte/admin`    | Drizzle ORM Schema Introspection, `<AdminDashboard />`, `createYaxaAdminHook`, `createDrizzleAdmin`, `<DevSandbox />`, `<RecordDrawer />` |
| `yaxa-svelte/server`   | Universal Server Hooks, SEO endpoints, Drizzle DB drivers, Cloud Storage handlers, and Email dispatch                                     |
| `yaxa-svelte/auth`     | Better-Auth integration and protected route server guards (`createYaxaAuth`, `createYaxaAuthHook`)                                        |
| `yaxa-svelte/db`       | Multi-dialect Drizzle ORM clients & schemas for Neon (PostgreSQL) and Turso (SQLite/LibSQL)                                               |
| `yaxa-svelte/polar`    | Polar.sh billing, customer portal sessions, and webhook synchronization                                                                   |
| `yaxa-svelte/email`    | Resend transactional email templates with automatic development console fallback                                                          |
| `yaxa-svelte/storage`  | AWS S3 and Cloudflare R2 presigned upload URL generators                                                                                  |
| `yaxa-svelte/vite`     | Turnkey Vite plugin (`yaxa()`)                                                                                                            |
| `yaxa-svelte/yaxa.css` | Tailwind CSS v4 design tokens and base stylesheet                                                                                         |

---

## 🧩 Component Library

| Category              | Components                                                                                                                                                                                                                                                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Theming & Studio**  | `<ThemeStudio>`, `theme`, `ACCENT_PALETTES`, `NEUTRAL_PALETTES`, `RADIUS_PRESETS`, Harmonic Radius Multiplier Scale, Chart Palette Series Tokens                                                                                                                                                                     |
| **AI Primitives**     | `<AiChat>`, `<PromptBar>`, `<AiThought>`, `<AiToolCall>`                                                                                                                                                                                                                                                             |
| **Charts (Pure SVG)** | `<LineChart>`, `<BarChart>`, `<DonutChart>` (0 external charting dependencies, auto-responsive, dark/light theme aware)                                                                                                                                                                                              |
| **SaaS Suite**        | `<Gate>`, `<AuthCard>`, `<UserMenu>`, `<OrgSwitcher>`, `<PricingCard>`, `<PricingTable>`, `<SubscriptionCard>`, `useAuth`, `useGate`, `useUpload`                                                                                                                                                                    |
| **Admin Suite**       | `<AdminDashboard>`, `<RecordDrawer>`, `<DevSandbox>`, `<ImpersonationBanner>`, `createYaxaAdminHook`, `createDrizzleAdmin`                                                                                                                                                                                           |
| **Elements**          | `Button`, `ButtonGroup`, `Badge`, `Avatar`, `AvatarGroup`, `DataTable` (with Column Visibility & Export), `Chip`, `Meter`, `MetricCard`, `Kbd`, `Icon`, `Spinner`, `Progress`, `Skeleton`, `Link`, `Logo`, `CodeBlock` (with Svelte 5 Runes Highlighting), `Tree`, `Timeline`, `Terminal`, `VirtualList`, `Carousel` |
| **Forms**             | `Form`, `FormField`, `Input`, `InputOTP`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Combobox`, `MultiSelect`, `NumberInput`, `RadioGroup`, `Slider`, `ColorPicker`, `ToggleGroup`, `DatePicker`, `DateRangePicker`, `Dropzone`, `<RichTextEditor>`, `<PhoneInput>`, `<CreditCardInput>`                           |
| **Layout & Blocks**   | `Container`, `Header`, `Footer`, `Section`, `Card`, `Divider`, `YaxaApp`, `DashboardShell` (with independent sidebar tokens), `ResizablePanels`, Page Blocks (`Hero`, `SaaS Metrics`, `FAQ`, `Testimonials`, `FeatureGrid`)                                                                                          |
| **Overlays & Nav**    | `Tabs`, `Breadcrumb`, `Pagination`, `CommandPalette` (`⌘K`), `DropdownMenu`, `ContextMenu`, `Modal`, `Drawer`, `Slideover`, `Popover`, `Tooltip` (with `arrow={false}` & `unstyled`), `Alert`, `Accordion`, `NotificationCenter`, `Stepper`                                                                          |
| **Composables**       | `useAuth`, `useGate`, `useUpload`, `useClipboard`, `useShortcuts`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`, `useIdle`, `useInfiniteScroll`, `useSortable`                                                                                                                                         |

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

Contributions are always welcome!

1. Fork the repository: `git clone https://github.com/FuntionalFrost/yaxa.git`
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Run type checking & linting: `pnpm check && pnpm lint`

---

## 📄 License

[MIT License](LICENSE) © 2026 Yaxa Contributors.
