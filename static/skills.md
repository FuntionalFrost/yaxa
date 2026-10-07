---
name: yaxa-ui-guide
description: Architectural and composition guide for Yaxa (Nuxt UI v4 equivalent for SvelteKit 2 & 3 & Svelte 5). MUST be used whenever writing, building, or modifying pages with Yaxa UI components, SaaS feature gating, SEO metadata, or server hooks.
---

# Yaxa UI Architecture Guide

**Yaxa** is the idiomatic Svelte 5 and SvelteKit 2 & 3 equivalent of Nuxt UI v4 / Nuxt UI Pro, styled with Tailwind CSS v4 design tokens and headless primitives powered by Bits UI.

---

## 1. Single Sources of Truth (DRY Principle)

Never hallucinate or rely on outdated prop assumptions. Yaxa strictly maintains two canonical inspection entry points:

1. **Public API & Export Index**: [`src/lib/index.ts`](file:///src/lib/index.ts)
   * The definitive index of every exported component, type definition, action, composable rune, and SEO utility.
2. **Component Catalog & Categorized Index**: [`src/routes/docs/_data/docs-nav.ts`](file:///src/routes/docs/_data/docs-nav.ts)
   * Contains all 50+ components organized by category (`theming`, `ai`, `charts`, `elements`, `forms`, `layout`, `overlays`, `saas`, `seo`) with direct source paths.
3. **Component Props & Variants**: Inspect `<script module lang="ts">` in each component file
   * Every component defines its `Props` type and `tailwind-variants` (`tv`) contract inside `<script module lang="ts">` (e.g. [Button.svelte](file:///src/lib/components/elements/Button.svelte)).

---

## 2. Subpath Import Architecture

Always import from the specific subpath corresponding to the layer:

| Subpath | Description & Key Exports |
| :--- | :--- |
| `yaxa-svelte` | **Core UI Primitives, Layouts, AI Primitives, Charts & Composables**: `Button`, `Input`, `Modal`, `Drawer`, `Toast`, `Toaster`, `DataTable`, `VirtualList`, `ResizablePanels`, `Carousel`, `DashboardShell`, `Combobox`, `MultiSelect`, `NumberInput`, `Stepper`, `Timeline`, `Tree`, `Terminal`, `OrgSwitcher`, `NotificationCenter`, `Testimonials`, `FAQ`, `FeatureGrid`, `Gate`, `YaxaApp`, `<ThemeStudio>`, `<AiChat>`, `<PromptBar>`, `<AiThought>`, `<AiToolCall>`, `<LineChart>`, `<BarChart>`, `<DonutChart>`, `<RichTextEditor>`, `<PhoneInput>`, `<CreditCardInput>`, `useIdle`, `useGate`, `useUpload`, `useToast`, `toast`, `definePageSeo`, `defineSiteConfig`, `cn`, `tv`. |
| `yaxa-svelte/yaxa.css` | **Turnkey Tailwind CSS v4 Stylesheet**: Full standalone stylesheet importing `@import 'tailwindcss'`, `@plugin '@tailwindcss/typography'`, theme variables (`@theme`), harmonic radius multiplier scale, and adaptive scrollbars. |
| `yaxa-svelte/theme.css` | **Standalone Tailwind CSS v4 Design Tokens**: Pure `@theme` variables, `:root` CSS variables, dark mode variants, and harmonic radius scale without `@import 'tailwindcss'`. Ideal for custom Tailwind pipelines using `@source`. |
| `yaxa-svelte/server` | **Server Hooks & SEO Endpoints**: `createYaxaHook` (handles `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/api/og`), `createYaxaAuthHook` (multi-tenant session resolution on `event.locals.orgId`). |
| `yaxa-svelte/auth` | **Better-Auth Integration**: `<AuthCard>`, `<PasskeyUI>`, `<TwoFactorModal>`, `useAuth`, `createYaxaAuth` (pre-wired for Drizzle & Multi-Tenant Organizations). |
| `yaxa-svelte/admin` | **Drizzle ORM Admin Suite**: `createYaxaAdminHook`, `<AdminDashboard>`, `<DevSandbox>`, `<RecordDrawer>`. |
| `yaxa-svelte/db` | **Multi-Dialect Drizzle Factory**: `getDb`, `schemaPg`, `schemaSqlite` supporting Neon (PostgreSQL) and Turso (LibSQL/SQLite) with users, sessions, subscriptions, organizations, members, and invitations. |
| `yaxa-svelte/polar` | **Polar.sh Billing Engine**: `createPolarCheckout`, `createPolarWebhookHandler` (HMAC verification). |
| `yaxa-svelte/email` | **Resend Email Dispatchers**: `sendMagicLinkEmail`, `sendWelcomeEmail`. |
| `yaxa-svelte/storage` | **Presigned Uploads**: AWS S3 & Cloudflare R2 presigned URL generators. |
| `yaxa-svelte/testing` | **Test Helpers**: `createMockSiteConfig`, `createMockUser`, `createTestWrapperProps`. |
| `yaxa-svelte/vite` | **Vite Plugin**: `yaxa()` turnkey plugin. |

---

## 3. Idiomatic Svelte 5 Component Conventions

All Yaxa components follow strict Svelte 5 runes conventions:

### A. Variant-Driven Styling via `tailwind-variants`
Elements declare variants inside `<script module>` and resolve them reactively with `$derived`:
```svelte
<!-- Example Pattern -->
<script module lang="ts">
  import { tv, type VariantProps } from '$lib/utils/cn';
  export const buttonVariants = tv({
    base: 'inline-flex items-center justify-center font-medium ...',
    variants: {
      variant: { solid: '...', outline: '...', soft: '...', ghost: '...' },
      color: { primary: '...', neutral: '...', success: '...', warning: '...', error: '...' },
      size: { xs: '...', sm: '...', md: '...', lg: '...', xl: '...' }
    }
  });
  export type ButtonProps = VariantProps<typeof buttonVariants> & { ... };
</script>

<script lang="ts">
  let { variant = 'solid', color = 'primary', size = 'md', ...restProps }: ButtonProps = $props();
  let classes = $derived(buttonVariants({ variant, color, size, class: restProps.class }));
</script>
```

### B. Svelte 5 Snippets for Slots
Never use `<slot />` or `<svelte:fragment>`. Use Svelte 5 `Snippet` props:
```svelte
<Button leading={iconSnippet} trailing={chevronSnippet}>
  {#snippet iconSnippet()}
    <Icon name="arrow-left" />
  {/snippet}
  Save Changes
</Button>
```

### C. Standard Event Handlers
Never use Svelte 4 `on:click`. Use modern HTML/runes event handlers:
* `onclick={(e) => ...}`
* `onkeydown={(e) => ...}`
* `onchange={(e) => ...}`

### D. Universal Compound `ui` Prop & Semantic `data-slot`
To achieve full Nuxt UI v4 parity, all composite components (`Card`, `Modal`, `Drawer`, `Tabs`, `Accordion`, `Alert`, `Breadcrumb`, `Tooltip`, `Input`, `Checkbox`, `Switch`, `CommandPalette`) accept a typed `ui?: Partial<Record<SlotKey, string>>` prop for type-safe slot overrides, and render semantic `data-slot="..."` attributes on internal DOM elements:
```svelte
<!-- Direct slot styling via ui prop -->
<Card ui={{ root: 'rounded-2xl', header: 'bg-neutral-50/50 p-6', body: 'space-y-4' }}>
  ...
</Card>

<!-- Or targeting via data-slot in Tailwind classes -->
<Card class="[&_[data-slot=header]]:border-b-2" />
```

### E. Platform-Adaptive Shortcuts (`<Kbd>`)
`<Kbd>` dynamically adapts modifier keys based on the user's operating system:
```svelte
<!-- Automatically displays ⌘K on macOS/iOS and Ctrl K on Windows/Linux -->
<Kbd combo={['meta', 'k']} size="xs" />
```

### F. Dark Mode Surface Elevation & Reduced Motion Compliance
* **Surface Elevation**: Elevated components (`Modal`, `Drawer`, `Card`, `CommandPalette`, active segmented `Tabs`) utilize `.yaxa-surface-elevated` for subtle inner rim lighting (`inset 0 0 0 1px rgba(255, 255, 255, 0.08)`) and high-fidelity depth in dark mode.
* **WCAG 2.2 AAA Motion**: `theme.css` enforces `@media (prefers-reduced-motion: reduce)` zero-specificity safeguards, while components support `motion-reduce:transition-none` and `motion-reduce:animate-none`.

### G. Atmospheric Utilities, Skeleton Recipes & Segmented Tabs
* **Atmospheric Utilities**: `theme.css` provides `@utility yaxa-grain` (tactile inline SVG data-URI noise texture) and `@utility yaxa-mesh-glow` (dark/light radial ambient gradient backdrops) with zero runtime bundle overhead.
* **Turnkey Skeleton Recipes**: `<Skeleton recipe="card" | "user" | "metric" | "table-row">` generates instant compound loading skeletons with circular avatars, badges, and staggered lines.
* **Segmented Sliding Tabs**: `<Tabs variant="segmented" />` features a dynamic sliding active indicator element that measures bounding box offsets and glides between tabs via CSS transitions with graceful SSR hydration fallback.

---

## 4. Context & Full-Stack SaaS Composition

### Root Layout (`<YaxaApp>`)
Wrap your application in `<YaxaApp>` inside `src/routes/+layout.svelte`. It provides dynamic theme tokens, SEO fallbacks, and auth context to descendant components:

**Option A (Turnkey Zero-Config)**:
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import 'yaxa-svelte/yaxa.css';
  import { YaxaApp } from 'yaxa-svelte';
  import { siteConfig } from '../site.config';

  let { data, children } = $props();
</script>

<YaxaApp config={siteConfig} user={data.user}>
  {@render children()}
</YaxaApp>
```

**Option B (Optimized Tailwind CSS v4 Pipeline)**:
```css
/* src/app.css */
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@import 'yaxa-svelte/theme.css';
@source "../node_modules/yaxa-svelte/dist/**/*.{js,svelte}";
```

### Feature & Plan Gating (`<Gate>` & `useGate`)
Declarative and programmatic tier and RBAC gating with automatic context fallback:
```svelte
<script lang="ts">
  import { Gate, useGate } from 'yaxa-svelte';

  const gate = useGate(); // accesses user from <YaxaApp> automatically
</script>

<!-- Declarative component gating -->
<Gate requiredPlan="pro" preview={true}>
  <ProAnalyticsDashboard />
</Gate>

<!-- Programmatic gating -->
{#if gate.allowsPlan('starter')}
  <ExportButton />
{/if}
```

### Type-Safe Page SEO (`definePageSeo`)
Return SEO definitions directly from `+page.ts` or `+page.server.ts`. `<YaxaApp>` automatically renders the meta tags, OpenGraph cards, and JSON-LD schemas:
```ts
// src/routes/dashboard/+page.ts
import { definePageSeo } from 'yaxa-svelte';

export const load = () => {
  return {
    seo: definePageSeo({
      title: 'Dashboard',
      description: 'Manage your SaaS analytics and subscription.',
      badge: 'App'
    })
  };
};
```

---

## 5. Verification Workflow for Coding Agents

When adding or refactoring code in a Yaxa project, always run the automated verification pipeline:

1. **Unit Tests**: `pnpm test` (Runs Vitest suite)
2. **Type Check**: `pnpm check` (Runs `svelte-kit sync && svelte-check`)
3. **Lint & Formatting**: `pnpm lint` (Runs ESLint and Prettier)
4. **Production Build**: `pnpm build`
