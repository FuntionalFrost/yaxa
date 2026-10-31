## Summary of Changes

<!-- Please provide a clear and concise description of what this PR accomplishes. -->

---

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality or component)
- [ ] 💥 Breaking change (fix or feature causing existing code not to work as expected)
- [ ] 📚 Documentation update (docs sections, examples, or guides)
- [ ] 🛠️ Tooling, dependency bump, or internal refactor

---

## Component / Subpath Affected

- [ ] `yaxa-svelte` (Core UI, Layout, AI Primitives, Charts, Composables)
- [ ] `yaxa-svelte/server` (Server Hooks & SEO Endpoints)
- [ ] `yaxa-svelte/auth` (Better-Auth integration)
- [ ] `yaxa-svelte/db` (Drizzle ORM factory & schemas)
- [ ] `yaxa-svelte/polar` (Polar.sh billing & webhooks)
- [ ] `yaxa-svelte/email` (Resend transactional emails)
- [ ] `yaxa-svelte/storage` (S3 / R2 presigned uploads)
- [ ] `yaxa-svelte/testing` (Test mocks & helpers)
- [ ] Docs / Website (`src/routes/`)

---

## Contributor Verification Checklist

- [ ] My code strictly adheres to **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$bindable`; no Svelte 4 legacy patterns).
- [ ] Component styles declare variants via `tv` in `<script module>` with Tailwind CSS v4 design tokens.
- [ ] I have added or updated tests in Vitest verifying this behavior (`pnpm test`).
- [ ] `pnpm check` passes with **0 errors and 0 warnings**.
- [ ] `pnpm lint` reports no formatting or lint issues.
- [ ] `pnpm build` succeeds cleanly for production.
- [ ] Any public prop changes are reflected in `COMPONENTS.md` and documentation pages.
