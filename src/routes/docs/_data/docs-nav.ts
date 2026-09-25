export interface DocNavItem {
	id: string;
	label: string;
	href: string;
	badge?: string;
	title: string;
	description: string;
	category: string;
	source?: string;
}

export interface DocNavGroup {
	category: string;
	title: string;
	items: DocNavItem[];
}

export const DOC_NAV_GROUPS: DocNavGroup[] = [
	{
		category: 'getting-started',
		title: 'Getting Started',
		items: [
			{
				id: 'intro',
				label: 'Introduction',
				href: '/docs/intro',
				title: 'Introduction to Yaxa',
				description:
					'The intuitive, production-grade UI component and automated SEO library for SvelteKit 2.7+ and Svelte 5 Runes. Full Nuxt UI & Nuxt SEO parity.',
				category: 'Getting Started',
				badge: 'Runes'
			},
			{
				id: 'install',
				label: 'Creating a project',
				href: '/docs/install',
				title: 'Creating a Project & Installation',
				description:
					'Fast 4-step setup guide for integrating Yaxa and Tailwind CSS v4 into your existing or new SvelteKit project.',
				category: 'Getting Started',
				badge: 'Quickstart'
			},
			{
				id: 'config',
				label: 'Site configuration',
				href: '/docs/config',
				title: 'Site Configuration (site.config.ts)',
				description:
					'The 100% DRY single source of truth for your branding, metadata, color themes, navigation, social links, and Svelte 5 context.',
				category: 'Getting Started',
				badge: '100% DRY'
			},
			{
				id: 'theming',
				label: 'Theme Studio & Tokens',
				href: '/docs/theming',
				title: 'Theme Studio & Dynamic Tokens',
				description:
					'Interactive multi-palette customizer, harmonic radius scale, typography presets, and auto-adaptive scrollbar tokens.',
				category: 'Getting Started',
				badge: 'Interactive'
			},
			{
				id: 'static-sites',
				label: 'Static Sites (SSG)',
				href: '/docs/static-sites',
				title: 'Static Site Generation (SSG) & Deployments',
				description:
					'Deploy pure static HTML/CSS/JS websites with zero server overhead using @sveltejs/adapter-static.',
				category: 'Getting Started',
				badge: 'SSG'
			},
			{
				id: 'blocks',
				label: 'Page Blocks',
				href: '/docs/blocks',
				title: 'Pre-Built Page Blocks for Solo Devs',
				description:
					'Copy-paste responsive hero sections, SaaS metrics dashboard cards, 2FA security cards, and pricing grids.',
				category: 'Getting Started',
				badge: 'New'
			}
		]
	},
	{
		category: 'seo',
		title: 'Site & SEO Kit',
		items: [
			{
				id: 'seo-og',
				label: 'Dynamic OG Generator',
				href: '/docs/seo-og',
				title: 'Dynamic Open Graph Image Generator (/api/og)',
				description:
					'Zero-dependency runtime SVG Open Graph image generator. Automatically creates branded 1200x630 social share cards with dark & light mode support.',
				category: 'Site & SEO Kit',
				badge: 'Automated'
			},
			{
				id: 'seo-robots',
				label: 'Robots, Sitemaps & PWA',
				href: '/docs/seo-robots',
				title: 'Robots, Sitemaps & Webmanifest Engine',
				description:
					'Automated environment-gated robots.txt, XML sitemaps with human-readable XSL stylesheets, and PWA site.webmanifest generation.',
				category: 'Site & SEO Kit',
				badge: 'SEO Suite'
			}
		]
	},
	{
		category: 'saas',
		title: 'Solo SaaS Suite',
		items: [
			{
				id: 'saas-suite',
				label: 'SaaS Toolkit & DB',
				href: '/docs/saas-suite',
				title: 'Full-Stack Solo SaaS Toolkit',
				description:
					'Batteries-included Auth (Better-Auth, Passkey WebAuthn <PasskeyUI>, 2FA <TwoFactorModal>), Database ORM (Drizzle with Neon & Turso), Billing (Polar.sh), Resend email, and drop-in Svelte 5 components.',
				category: 'Solo SaaS Suite',
				badge: 'Full-Stack'
			},
			{
				id: 'gating-storage',
				label: 'Gating & Cloud Storage',
				href: '/docs/gating-storage',
				title: 'Feature Gating (<Gate />) & Cloud Storage (useUpload)',
				description:
					'Declarative tier/role gating with Svelte 5 context fallback, useGate composable rune, and S3/R2 presigned upload workflows.',
				category: 'Solo SaaS Suite',
				badge: 'Runes'
			},
			{
				id: 'admin-suite',
				label: 'Admin & Introspection',
				href: '/docs/admin-suite',
				title: 'Drizzle Admin & Introspection Suite',
				description:
					'Subpath suite with 1-line route interception, schema introspection, CRUD table inspector, Dev Sandbox, and S3/R2 storage.',
				category: 'Solo SaaS Suite',
				badge: 'Subpath'
			},
			{
				id: 'legal-suite',
				label: 'Legal & Impressum',
				href: '/docs/legal-suite',
				title: 'Legal Suite & EU Impressum',
				description:
					'Turnkey GDPR Privacy Policies, Polar.sh Merchant of Record terms, EthicalAds zero-cookie disclosures, and EU Impressum provider identification.',
				category: 'Solo SaaS Suite',
				badge: 'Zero-Boilerplate'
			}
		]
	},
	{
		category: 'components',
		title: 'Components',
		items: [
			{
				id: 'ai-primitives',
				label: 'AI & Chat Primitives',
				href: '/docs/ai-primitives',
				title: 'AI Chat, Prompts & Reasoning Tools',
				description:
					'Interactive chat threads, auto-expanding prompt bars with attachments & voice, collapsible reasoning thoughts, and tool execution cards.',
				category: 'Components',
				source: 'src/lib/components/ai/AiChat.svelte',
				badge: 'AI Suite'
			},
			{
				id: 'charts',
				label: 'Native SVG Charts',
				href: '/docs/charts',
				title: 'Native SVG Theme-Aware Charts',
				description:
					'Zero-dependency Bézier line charts, grouped and stacked bar charts, and donut KPI charts with live theme adaptation.',
				category: 'Components',
				source: 'src/lib/components/charts/LineChart.svelte',
				badge: 'Charts'
			},
			{
				id: 'comp-buttons',
				label: 'Buttons & Elements',
				href: '/docs/comp-buttons',
				title: 'Buttons, Badges & Visual Elements',
				description:
					'Accessible action triggers, button groups, code diff viewers (<CodeDiff />), hierarchical trees, avatars, presence indicators, status chips, spinners, and progress meters.',
				category: 'Components',
				source: 'src/lib/components/elements/Button.svelte',
				badge: 'Elements'
			},
			{
				id: 'comp-forms',
				label: 'Forms & Pickers',
				href: '/docs/comp-forms',
				title: 'Forms, Inputs & Pickers',
				description:
					'Typed FormFields with validation states, character counters, OTP/2FA code inputs, ToggleGroups, DatePickers, switches, checkboxes, and sliders.',
				category: 'Components',
				source: 'src/lib/components/forms/FormField.svelte',
				badge: 'Forms'
			},
			{
				id: 'advanced-forms',
				label: 'Rich Text & Advanced Forms',
				href: '/docs/advanced-forms',
				title: 'Markdown WYSIWYG & Specialized Inputs',
				description:
					'Accessible markdown and rich text editor with live split preview, international phone numbers with country flags, and credit card inputs.',
				category: 'Components',
				source: 'src/lib/components/forms/RichTextEditor.svelte',
				badge: 'New'
			},
			{
				id: 'comp-overlays',
				label: 'Overlays & Navigation',
				href: '/docs/comp-overlays',
				title: 'Modals, Overlays, Navigation & DataTables',
				description:
					'Accessible dialog overlays, slideover sheets, popovers, context menus, accordion FAQ panels, breadcrumbs, pagination, alert banners, and enhanced DataTables.',
				category: 'Components',
				source: 'src/lib/components/overlays/Modal.svelte',
				badge: 'Overlays'
			}
		]
	}
];

export const ALL_DOC_ITEMS: DocNavItem[] = DOC_NAV_GROUPS.flatMap((g) => g.items);

export function getDocItemBySlug(slug: string): DocNavItem | undefined {
	return ALL_DOC_ITEMS.find((item) => item.id === slug);
}
