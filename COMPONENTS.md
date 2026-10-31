# Yaxa UI - Architectural & Component Specification

> **A Next-Generation UI & SaaS Architecture Primitive Library for Svelte 5 and SvelteKit 2 & 3**

---

## 1. System Architecture & Philosophy

Yaxa UI is built exclusively on **Svelte 5 runes**, **Tailwind CSS v4 `@theme` tokens**, and **uncompromising accessible ergonomics** (WAI-ARIA). Every component is engineered for production-grade web applications and enterprise SaaS platforms.

### Core Tenets

1. **Zero-Boilerplate Context Propagation**: Form controls automatically discover their parent `<FormField>` and `<Form>` context via Svelte Context API (`form-context.ts`) to wire up `name`, `id`, `aria-describedby`, error states, disabled states, and validation messages without manual prop drilling.
2. **Svelte 5 Native Runes Only**: No legacy Svelte 4 `export let`, `$:`, `<slot />`, or `createEventDispatcher`. All reactivity is driven by `$state`, `$derived`, `$props`, and `$bindable`, with `<Snippet>` composition.
3. **Physics-Driven Interactions**: Spring dynamics (`svelte/motion`) and smooth spring tilts (`springTilt`) replace linear CSS transitions for tactile, native-app feel.
4. **Zero Heavy External Dependencies**: Code highlighters, syntax tokenizers, LCS diff algorithms, SVG sparklines, and WebAuthn handlers are self-contained, light, and tree-shakeable.
5. **Turnkey Full-Stack SaaS Ready**: Built-in polymorphic authentication flows (`<AuthCard>`), passkey biometric registration (`<PasskeyUI>`), two-factor authentication (`<TwoFactorModal>`), and Polar.sh / Stripe pricing matrices (`<PricingTable>`).

---

## 2. Design Tokens & Styling (Tailwind CSS v4)

Components map directly to Tailwind CSS v4 `@theme` custom properties and dynamic runtime CSS variables defined in `yaxa-svelte/theme.css`:

```css
@theme {
	/* Dynamic Primary Accent Scale (bridged to runtime CSS variable, defaults to Svelte Flame #ff3e00) */
	--color-primary-50: var(--yaxa-primary-50, #fff7ed);
	--color-primary-500: var(--yaxa-primary-500, #ff3e00);
	--color-primary-600: var(--yaxa-primary-600, #ea3400);
	--color-primary-700: var(--yaxa-primary-700, #c22b00);
	--color-primary-950: var(--yaxa-primary-950, #430d02);

	/* Neutral Base Scale (zinc, slate, stone, or neutral) */
	--color-neutral-50: var(--yaxa-neutral-50, #fafafa);
	--color-neutral-900: var(--yaxa-neutral-900, #18181b);
	--color-neutral-950: var(--yaxa-neutral-950, #121212);

	/* Harmonic Radius Multiplier Scale (calculated from single base --yaxa-radius) */
	--radius-xs: calc(var(--yaxa-radius, 0.5rem) * 0.25);
	--radius-sm: calc(var(--yaxa-radius, 0.5rem) * 0.5);
	--radius-md: var(--yaxa-radius, 0.5rem);
	--radius-lg: calc(var(--yaxa-radius, 0.5rem) * 1.5);
	--radius-xl: calc(var(--yaxa-radius, 0.5rem) * 2);
	--radius-2xl: calc(var(--yaxa-radius, 0.5rem) * 2.5);
	--radius-3xl: calc(var(--yaxa-radius, 0.5rem) * 3);
	--radius-4xl: calc(var(--yaxa-radius, 0.5rem) * 4);
	--radius-full: 9999px;

	/* Theme-Aware Chart Palette Series */
	--color-chart-1: var(--yaxa-chart-1, var(--color-primary-500));
	--color-chart-2: var(--yaxa-chart-2, #3b82f6);
	--color-chart-3: var(--yaxa-chart-3, #10b981);
	--color-chart-4: var(--yaxa-chart-4, #f59e0b);
	--color-chart-5: var(--yaxa-chart-5, #8b5cf6);
}
```

### 2.1 Semantic Variants Standard

- **`solid`**: High-emphasis background with contrasting text.
- **`outline`**: Transparent background with 1px border.
- **`soft`**: Low-opacity tinted background with semantic text.
- **`subtle`**: Very low-opacity tinted background with border.
- **`ghost`**: Transparent default; shows hover fill on interaction.
- **`link`**: Underlined text trigger with zero button chrome.

### 2.2 Compound `ui` Prop & Semantic `data-slot`

All composite components (`Card`, `Modal`, `Drawer`, `Tabs`, `Accordion`, `Alert`, `Breadcrumb`, `Tooltip`, `Input`, `Checkbox`, `Switch`, `CommandPalette`) implement:

1. **Typed `ui` Prop**: `ui?: Partial<Record<SlotKey, string>>` for type-safe granular slot class overrides.
2. **Semantic `data-slot="..."` DOM Attributes**: Enables parent or global CSS targeting (e.g., `class="[&_[data-slot=header]]:border-b"`).
3. **Elevated Surfaces**: Elevated overlays leverage `.yaxa-surface-elevated` for subtle 1px inner rim lighting and depth in dark mode.

---

## 3. Svelte 5 Coding Conventions

### 3.1 Component Interface Pattern

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
		color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		loading?: boolean;
		leading?: Snippet;
		trailing?: Snippet;
		children?: Snippet;
	}

	let {
		variant = 'solid',
		color = 'primary',
		size = 'md',
		loading = false,
		leading,
		trailing,
		children,
		class: className = '',
		...restProps
	}: Props = $props();
</script>
```

### 3.2 Keyed `#each` Iterations

Always key every loop to ensure optimal DOM diffing and transition lifecycle:

```svelte
{#each items as item, index (item.id ?? index)}
	<div>{item.name}</div>
{/each}
```

---

## 4. Zero-Boilerplate Form Context Architecture

### 4.1 Architecture Diagram

```
<Form bind:values bind:errors onsubmit={...}>
  └── <FormField label="Work Email" name="email" required hint="We never spam.">
        └── <Input placeholder="alex@acme.com" />
            <!-- Automatically inherits:
                 - id="field-email-1"
                 - name="email"
                 - aria-describedby="field-email-1-hint"
                 - error="Invalid email address" (if triggered)
                 - disabled (if Form or FormField is disabled)
            -->
  </FormField>
</Form>
```

### 4.2 Form Context Consumer Contract

All form elements implement `getFormFieldContext()`:

```typescript
import { getFormFieldContext } from 'yaxa-svelte';

const fieldContext = getFormFieldContext();

const fieldId = $derived(
	id ?? fieldContext?.id ?? `field-${Math.random().toString(36).slice(2, 7)}`
);
const fieldName = $derived(name ?? fieldContext?.name);
const isInvalid = $derived(Boolean(error ?? fieldContext?.error));
const isDisabled = $derived(Boolean(disabled ?? fieldContext?.disabled));
```

Supported Form Inputs:

- `<Input>` & `<Textarea>`
- `<Select>` & `<Combobox>` (Searchable autocomplete dropdown)
- `<MultiSelect>` (Multi-tag selector with search)
- `<Checkbox>` & `<Switch>` (Boolean toggles with spring animation)
- `<NumberInput>` (Step buttons, min/max clamps)
- `<PhoneInput>` (E.164 country flags, formatters, and validation)
- `<CreditCardInput>` (Luhn algorithm verification, card brand recognition)
- `<InputOTP>` & `<InputPin>` (Masked/unmasked multi-digit PIN input with paste support)
- `<Slider>` & `<RadioGroup>`

---

## 5. SaaS, Authentication & Billing Primitives

### 5.1 `<AuthCard>` Polymorphic State Machine

Supports turnkey switching between authentication modes without page reloads:

- `mode="login"`: Email/password or OAuth SSO triggers.
- `mode="signup"`: Account creation with password strength meter.
- `mode="magic-link"`: Passwordless email dispatch.
- `mode="forgot-password"`: Reset link request.
- `mode="reset-password"`: New password confirmation.
- `mode="verify-email"`: Verification code prompt.

### 5.2 `<PasskeyUI>` WebAuthn Biometric Management

- **1-Click Registration**: Calls `navigator.credentials.create()` to generate hardware-backed WebAuthn credentials (Apple TouchID/FaceID, Windows Hello, YubiKey).
- **Passkey List Card**: Displays registered keys with device icons, creation dates, last-used timestamps, and deletion triggers.
- **Login Trigger**: One-touch `navigator.credentials.get()` authentication.

### 5.3 `<TwoFactorModal>` TOTP Turnkey Flow

- Step 1: Displays TOTP Authenticator QR code with manual secret key backup.
- Step 2: Verification step using `<InputOTP>`.
- Step 3: Generates download/copy-ready emergency recovery backup codes.

### 5.4 `<PricingTable>` & Subscription Feature Gating

- Interactive monthly/annual billing cycle toggle with discount badges.
- Highlighted "Popular" tier with visual glow elevation.
- Feature comparison checklist with tooltips and CTA triggers compatible with Polar.sh and Stripe Checkout.

---

## 6. Data & Table Primitives (`<DataTable>`)

### Client & Server Modes

`<DataTable>` supports both local dataset manipulation and server-driven queries:

```svelte
<!-- Server-Driven Mode with API Pagination & Filtering -->
<DataTable
	columns={[
		{ key: 'name', header: 'Customer', sortable: true },
		{ key: 'status', header: 'Status' },
		{ key: 'spent', header: 'Total Spent', sortable: true }
	]}
	data={apiData.items}
	mode="server"
	totalRows={apiData.totalCount}
	page={apiData.currentPage}
	pageSize={20}
	loading={isLoading}
	onpagechange={(p) => fetchPage(p)}
	onsortchange={(s) => fetchSorted(s)}
	exportable
/>
```

Features:

- Multi-column sort with ascending/descending/cleared cycles.
- Global search & column-level filtering.
- Checkbox row selection (single or batch actions).
- CSV & JSON dataset export triggers.
- Column pinning (left / right).

---

## 7. Developer Experience & Elements

### 7.1 `<CodeBlock>`

Zero-dependency, zero-WASM syntax highlighter with multi-line state preservation supporting:

- **Python (2.7, 3.0 up to 3.13+)**: PEP 695 type parameter syntax (`type Point[T] = ...`), PEP 696 type defaults, PEP 742 `TypeIs` / `TypeGuard` narrowing, `Self`, decorators (`@\w+`), docstrings (`"""..."""`, `'''...'''`), walrus (`:=`), return arrows (`->`), pattern matching (`match`/`case`), built-in types, and numeric separators (`1_000_000`).
- **Svelte 5**: Native runes (`$state`, `$state.raw`, `$derived`, `$derived.by`, `$effect`, `$props`, `$bindable`, `$inspect`, `$host`), control-flow blocks (`{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{#await}`, `{#snippet}`, `{@render}`, `{@const}`, `{@html}`), and `<!-- -->` comments.
- **Modern JavaScript & TypeScript**: Full support for ES2026 (ES17) proposals and TypeScript 6, including `using`/`await using`, `defer` imports, auto-accessors (`accessor`), `override`, `declare`, `asserts`, `is`, utility types (`Record`, `Partial`, `Pick`, `Omit`, `Awaited`, etc.), BigInts (`n`), and numeric separators.
- **Tailwind CSS v4 & CSS**: Directives (`@theme`, `@utility`, `@custom-variant`, `@source`, `@plugin`, `@apply`, `@keyframes`, etc.), custom properties (`--color-*`), hex colors, and property declarations.
- **Bash / Shell**: Variables (`$VAR`, `${VAR}`), flags (`-f`, `--output`), and utilities (`curl`, `docker`, `pnpm`, etc.).
- **JSON**: Differentiates object keys from string values.
- **YAML / YML**: Bare and quoted keys, document markers (`---`, `...`), anchors (`&anchor`), aliases (`*alias`), tags (`!tag`), block scalars (`|`, `>`), booleans (`true`/`false`/`yes`/`no`/`on`/`off`), nulls, and ISO timestamps.
- **TOML**: Table headers (`[table]`, `[[array]]`), bare and quoted key-value pairs (`key = value`), boolean constants, float specials (`inf`, `nan`), ISO datetimes, and triple-quoted multi-line strings (`"""..."""`, `'''...'''`).
- **Markdown & GFM**: Headings, blockquotes, task lists (`- [x]`), fenced code blocks, and horizontal rules.
- **Rust, Go, SQL, GraphQL, Vue, JSX/TSX, and LaTeX Math**.

Features:

- Multi-line state preservation across line breaks for docstrings, template literals, and block comments.
- Automatic copy-to-clipboard button with toast feedback.
- Optional line numbers, line highlighting (`highlightLines={[2, 3]}`), wrap toggle, and filename header.

### 7.2 `<CodeDiff>`

Visual code diff and changelog comparison viewer.

- **Algorithm**: Longest Common Subsequence (LCS) line diff engine (`computeDiff`).
- **Modes**: Split (side-by-side 2-column) and Unified (stacked 1-column).
- **Statistics**: Additions badge (`+N`), deletions badge (`-N`), and filename badge.
- **Syntax**: Tokenized syntax coloring for added/removed/unchanged lines.

---

## 8. Motion & Physics Engine

Yaxa UI includes custom Svelte actions for tactile, high-performance physical UI:

| Action        | Description                                           | Usage                                    |
| :------------ | :---------------------------------------------------- | :--------------------------------------- |
| `springTilt`  | 3D perspective mouse tilt with spring physics         | `<div use:springTilt={{ maxTilt: 12 }}>` |
| `smoothSlide` | Spring-interpolated expand/collapse height transition | `<div use:smoothSlide={{ open }}>`       |
| `staggerFly`  | Staggered entrance animation for lists and grids      | `<div use:staggerFly={{ delay: 50 }}>`   |

---

## 9. Testing & Quality Assurance Standards

All components must comply with:

1. **Vitest Unit Tests (`*.test.ts`)**: DOM rendering, interaction events, snippet slot fallbacks, and prop state verification using `@testing-library/svelte`.
2. **Type Safety (`svelte-check`)**: 100% clean TypeScript validation.
3. **Linting (`eslint`)**: Zero warnings and zero errors.
4. **WAI-ARIA Accessibility**: Semantic landmarks, keyboard navigation (`Enter`, `Space`, `ArrowKeys`, `Escape`), focus traps for modals, and proper `aria-*` state mappings.

---

## 10. AI Agent & Contributor Quick-Start

When modifying or contributing to Yaxa UI:

1. **Never use Svelte 4 legacy syntax**. Runes (`$state`, `$derived`, `$props`, `$bindable`, `$effect`) are mandatory.
2. **Never hardcode styles outside Tailwind `@theme`**. Use semantic tokens (`primary`, `neutral`, `error`, etc.).
3. **Always key `#each` loops** (`{#each list as item, idx (item.id ?? idx)}`).
4. **Escape template script tags** in strings (`\${'<'}/script>`) to prevent parser conflicts.
5. **Run tests & linters** before submitting:
   ```bash
   pnpm test
   pnpm check
   pnpm lint
   ```
