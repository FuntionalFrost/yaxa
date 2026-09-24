# Yaxa — Nuxt UI & Solo SaaS Parity for SvelteKit 2.7+ & Svelte 5

**Yaxa** delivers the full developer experience, component toolkit, and full-stack SaaS engine of **Nuxt UI v4 / Nuxt UI Pro** and the **Nuxt SEO ecosystem** to **SvelteKit 2.7+** and **Svelte 5**, with authentic Svelte flame branding (`#ff3e00` / `#121212`).

---

## ⚡ DX & Idiomatic SvelteKit Architecture

1. **Visual Web Theme Studio (`/theme` & `<ThemeStudio />`)**:
   - Live interactive theme designer for accent palettes, neutral base scales, harmonic radius scale (`--radius-xs` to `--radius-4xl`), and chart series palettes (`--color-chart-1` to `--color-chart-5`).
   - Generates production-ready Tailwind CSS v4 `@theme` tokens in 1 click.

2. **AI-Native Primitives (`<AiChat>`, `<PromptBar>`, `<AiThought>`, `<AiToolCall>`)**:
   - Conversational AI containers with auto-scroll and stream controls.
   - Expandable prompt bar with slash command suggestions, attachments, and model selector.
   - Collapsible reasoning thought inspector and structured function/tool call cards.

3. **Pure SVG Theme-Aware Charts (`<LineChart>`, `<BarChart>`, `<DonutChart>`)**:
   - Zero external charting/WASM dependencies (0 KB runtime bloat).
   - Dynamic dark/light mode palette synchronization, interactive hover crosshairs, and spline rendering.

4. **Advanced Form Controls & Specialized Inputs**:
   - `<RichTextEditor>`: Markdown WYSIWYG editor with split preview and formatting shortcuts.
   - `<PhoneInput>`: Searchable international country picker with dial codes and number formatting.
   - `<CreditCardInput>`: Automatic card brand detection (Visa, Mastercard, Amex, Discover), expiry, and CVC formatting.

5. **Enhanced `<DataTable>`**:
   - Dynamic column visibility checklist, CSV & JSON data export, pagination controls, and bulk selection toolbar.

6. **1-Line Server Hooks (`createYaxaHook` & `createYaxaAuthHook`)**:
   - Manage all 5 SEO endpoints (`/robots.txt`, `/sitemap.xml`, `/sitemap.xsl`, `/site.webmanifest`, `/api/og`) with **1 line** in `src/hooks.server.ts`:
     ```ts
     import { sequence } from '@sveltejs/kit/hooks';
     import { createYaxaHook, createYaxaAuth, createYaxaAuthHook } from 'yaxa-svelte/server';
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

7. **Multi-Dialect Database Factory (`getDb`)**:
   - Seamlessly switch between **Neon (PostgreSQL)** and **Turso (LibSQL/SQLite)** with Drizzle ORM via `DATABASE_DRIVER="neon" | "turso"`.

8. **Polar.sh Automated Billing & Webhook Synchronization**:
   - `createPolarCheckout` for instant hosted checkouts.
   - `createPolarWebhookHandler` automatically syncs subscriptions, orders, and customer status directly into the Drizzle database.

9. **Resend Transactional Email Engine**:
   - `sendMagicLinkEmail` and `sendWelcomeEmail` with responsive, branded HTML templates.

---

## 🧩 45+ Svelte 5 Components & Runes Composables

- **Theming & Studio**: `<ThemeStudio>`, `theme`, `ACCENT_PALETTES`, `NEUTRAL_PALETTES`, `RADIUS_PRESETS`, Harmonic Radius Scale, Chart Palette Tokens.
- **AI Primitives**: `<AiChat>`, `<PromptBar>`, `<AiThought>`, `<AiToolCall>`.
- **Charts (Pure SVG)**: `<LineChart>`, `<BarChart>`, `<DonutChart>`.
- **SaaS Suite**: `<Gate>`, `<AuthCard>`, `<UserMenu>`, `<OrgSwitcher>`, `<PricingCard>`, `<PricingTable>`, `<SubscriptionCard>`, `useAuth()`.
- **Elements**: `Button`, `ButtonGroup`, `Badge`, `Avatar`, `AvatarGroup`, `DataTable` (with Column Visibility & Export), `Chip`, `Meter`, `MetricCard`, `Kbd`, `Icon`, `Spinner`, `Progress`, `Skeleton`, `Link`, `Logo`, `CodeBlock` (with Svelte 5 Runes Highlighting), `Tree`, `Timeline`, `Terminal`, `VirtualList`, `Carousel`.
- **Forms**: `Form`, `FormField`, `Input`, `InputOTP`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Combobox`, `MultiSelect`, `NumberInput`, `RadioGroup`, `Slider`, `ColorPicker`, `ToggleGroup`, `DatePicker`, `DateRangePicker`, `Dropzone`, `<RichTextEditor>`, `<PhoneInput>`, `<CreditCardInput>`.
- **Layout**: `Container`, `Header`, `Footer`, `Section`, `Card`, `Divider`, `YaxaApp`, `DashboardShell` (with independent sidebar tokens), `ResizablePanels`.
- **Navigation & Overlays**: `Tabs`, `Breadcrumb`, `Pagination`, `CommandPalette` (`⌘K`), `DropdownMenu`, `ContextMenu`, `Modal`, `Drawer`, `Slideover`, `Popover`, `Tooltip` (with `arrow={false}` & `unstyled`), `Alert`, `Accordion`, `NotificationCenter`, `Stepper`.
- **Composables**: `useAuth`, `useGate`, `useUpload`, `useClipboard`, `useShortcuts`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`, `useIdle`, `useInfiniteScroll`, `useSortable`.

---

## 🚀 Live Demo & Documentation

- **Live Documentation**: [https://yaxa.vercel.app](https://yaxa.vercel.app)
- **Theme Studio**: Interactive theme customizer at [`/theme`](src/routes/theme/+page.svelte) or on [yaxa.vercel.app/theme](https://yaxa.vercel.app/theme).
- **SaaS Showcase**: Explore the interactive SaaS flow at [`/saas`](src/routes/saas/+page.svelte) or on [yaxa.vercel.app/saas](https://yaxa.vercel.app/saas).
- **SaaS Docs**: Full implementation guide in [`src/routes/docs/_sections/DocSaasSuite.svelte`](src/routes/docs/_sections/DocSaasSuite.svelte) or on [yaxa.vercel.app/docs/saas-suite](https://yaxa.vercel.app/docs/saas-suite).

---

## ✅ Verification Results

- **`pnpm check`**: **0 errors, 0 warnings**
- **`pnpm test`**: **52 test files passed, 151 unit tests passed**
- **`pnpm build`**: **Production build & SSR bundle succeeded**
- **`pnpm package`**: **Library distribution (`dist/`) generated**
- **`pnpm format`**: **All files formatted cleanly with Prettier**
