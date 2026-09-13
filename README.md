<div align="center">

# Yaxa

**The Intuitive Svelte UI & Solo SaaS Library**  
_Nuxt UI v4 & Nuxt UI Pro Equivalent for SvelteKit 2.7+ & Svelte 5 with Built-in SEO & SaaS Parity._

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

- 🎨 **Tailwind CSS v4 Native Tokens**: Styled with `@theme` variables; customize any color or token directly.
- ⚡ **Pure Svelte 5 Runes**: Built using `$state`, `$derived`, `$props`, and `$bindable` — zero Virtual DOM overhead.
- ♿ **Accessible by Default**: Headless primitives powered by **Bits UI**.
- 🚀 **100% DRY SEO Parity**: Automate dynamic Open Graph cards (`/api/og`), environment-aware `robots.txt`, XML sitemaps with human-readable `sitemap.xsl` stylesheets, PWA manifests, and Schema.org JSON-LD from a single `src/site.config.ts`.
- 🔐 **Batteries-Included SaaS Suite**: Pre-integrated **Better-Auth**, multi-dialect **Drizzle ORM** (Neon PostgreSQL & Turso LibSQL/SQLite), **Polar.sh** payments & webhook sync, and **Resend** transactional emails.
- 🧩 **35+ Production Components**: Elements, forms, layout, overlays, and drop-in SaaS widgets (`<AuthCard>`, `<UserMenu>`, `<PricingTable>`, `<SubscriptionCard>`).
- 🛠️ **Composable Runes**: `useAuth`, `useShortcuts`, `useClipboard`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`.

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

Add Tailwind CSS to your Vite plugins:

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

---

### 3. Define Your Site Configuration

Create `src/site.config.ts` — your single source of truth for branding, metadata, and SEO:

```ts
// src/site.config.ts
import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
	name: 'My Indie SaaS',
	title: 'My Indie SaaS — Build Fast with SvelteKit',
	description: 'Fast, beautiful, accessible web applications.',
	url: 'https://my-app.com',
	theme: {
		accent: 'svelte', // 'svelte' | 'emerald' | 'amber' | 'sky' | 'violet' | 'rose' | 'indigo'
		neutral: 'zinc', // 'zinc' | 'slate' | 'stone' | 'neutral'
		defaultMode: 'dark'
	},
	socials: {
		github: 'https://github.com/my-org/my-app',
		twitter: '@my_app'
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

## 💳 Polar.sh Payments & Webhook Synchronization

Create a webhook endpoint in `src/routes/api/webhooks/polar/+server.ts`:

```ts
// src/routes/api/webhooks/polar/+server.ts
import { createPolarWebhookHandler } from 'yaxa-svelte/polar';

export const POST = createPolarWebhookHandler();
```

---

## 🧩 Component Library

| Category           | Components                                                                                                                                                   |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SaaS Suite**     | `AuthCard`, `UserMenu`, `PricingCard`, `PricingTable`, `SubscriptionCard`, `useAuth`                                                                         |
| **Elements**       | `Button`, `ButtonGroup`, `Badge`, `Avatar`, `AvatarGroup`, `DataTable`, `Chip`, `Meter`, `Kbd`, `Icon`, `Spinner`, `Progress`, `Skeleton`, `Link`, `Logo`    |
| **Forms**          | `Form`, `FormField`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `RadioGroup`, `Slider`, `ColorPicker`                                              |
| **Layout**         | `Container`, `Header`, `Footer`, `Section`, `Card`, `Divider`, `YaxaApp`                                                                                     |
| **Overlays & Nav** | `Tabs`, `Breadcrumb`, `Pagination`, `CommandPalette` (`⌘K`), `DropdownMenu`, `ContextMenu`, `Modal`, `Slideover`, `Popover`, `Tooltip`, `Alert`, `Accordion` |
| **Composables**    | `useAuth`, `useClipboard`, `useShortcuts`, `useColorMode`, `useToast`, `useMediaQuery`, `useDebounce`                                                        |

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
