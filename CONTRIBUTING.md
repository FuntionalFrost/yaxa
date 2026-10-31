# Contributing to Yaxa

Thank you for your interest in contributing to **Yaxa**! Yaxa is an idiomatic Svelte 5 and SvelteKit 2 & 3 UI and solo SaaS architecture library designed for production applications.

Please take a moment to review these guidelines before submitting issues or pull requests.

---

## 🛠️ Development Setup

Yaxa uses **pnpm** as its package manager.

```bash
# 1. Clone the repository
git clone https://github.com/FuntionalFrost/yaxa.git
cd yaxa

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm dev
```

The documentation and showcase application will be available at `http://localhost:5173`.

---

## 📐 Core Architecture & Conventions

### 1. Svelte 5 Runes Exclusively

Yaxa is built strictly on Svelte 5. **Do not use legacy Svelte 4 patterns.**

- ✅ **Use**: `$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`, and `{#snippet}` / `{@render}`.
- ❌ **Do NOT use**: `export let`, `$: reactive declarations`, `<slot />`, `$$props`, or `createEventDispatcher`.

### 2. Subpath Module Architecture (Zero Bundle Tax)

To ensure client bundles remain lightweight, full-stack features are isolated into discrete subpath exports:

- `yaxa-svelte`: Core UI primitives, layout, icons, charts, composables.
- `yaxa-svelte/server`: Server hooks and SEO endpoints (`createYaxaHook`).
- `yaxa-svelte/auth`: Better-Auth integration and multi-tenant session hooks.
- `yaxa-svelte/db`: Multi-dialect Drizzle ORM factory (Neon PostgreSQL & Turso SQLite).
- `yaxa-svelte/polar`: Polar.sh billing, checkout, and webhook sync.
- `yaxa-svelte/email`: Resend email templates and dispatchers.
- `yaxa-svelte/storage`: AWS S3 & Cloudflare R2 presigned upload handlers.
- `yaxa-svelte/testing`: Mocks, session factories, and test helpers.

_Never import server-only libraries (`better-auth`, `drizzle-orm`, `@polar-sh/sdk`, `resend`) inside the core `yaxa-svelte` client bundle._

### 3. Styling via `tailwind-variants`

- All component variants are declared inside `<script module lang="ts">` using `tv()` imported from `#lib/utils/cn.js` (or `../../utils/cn`).
- Do not import `tailwind-variants` directly in component files; always use the centralized `src/lib/utils/cn.ts` module.
- Design tokens align with **Tailwind CSS v4** `@theme` variables (`--color-primary-*`, `--radius-*`, etc.).

### 4. Testing Standard (Vitest + jsdom)

- All automated tests run headlessly in-memory using **Vitest**.
- Place unit and DOM interaction tests alongside components (e.g. `Button.test.ts`, `Modal.dom.test.ts`).
- Tests must pass deterministically without launching real browser processes.

---

## 🧪 Verification Commands

Before opening a pull request, ensure all local verification gates pass cleanly:

```bash
# 1. Lint and code formatting
pnpm lint

# 2. Workspace-wide TypeScript validation (must report 0 errors)
pnpm check

# 3. Complete Vitest test suite
pnpm test

# 4. Production build verification
pnpm build
```

---

## 🔀 Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names like `feat/accordion-multi-expand`, `fix/combobox-keyboard-nav`, or `docs/saas-guide`.
2. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New component, rune, or feature
   - `fix:` Bug fix
   - `docs:` Documentation additions or updates
   - `test:` Test additions or test suite refactoring
   - `chore:` Dependency bumps, tooling, or build scripts
3. **Documentation**: If adding or altering component props or behaviors, update the corresponding documentation section in `src/routes/docs/_sections/` and `COMPONENTS.md`.

Thank you for helping make Yaxa the best UI engine for the Svelte ecosystem!
