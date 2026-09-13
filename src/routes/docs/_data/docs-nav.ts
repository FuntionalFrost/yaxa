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
				badge: 'v1.0'
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
				id: 'static-sites',
				label: 'Static Sites (SSG)',
				href: '/docs/static-sites',
				title: 'Static Site Generation (SSG) & Deployments',
				description:
					'Deploy pure static HTML/CSS/JS websites with zero server overhead using @sveltejs/adapter-static.',
				category: 'Getting Started',
				badge: 'SSG'
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
					'Batteries-included Auth (Better-Auth), Database ORM (Drizzle with Neon & Turso), Billing (Polar.sh), Resend email, and drop-in Svelte 5 components.',
				category: 'Solo SaaS Suite',
				badge: 'Full-Stack'
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
				id: 'comp-buttons',
				label: 'Buttons & Badges',
				href: '/docs/comp-buttons',
				title: 'Buttons, ButtonGroups & Badges',
				description:
					'Accessible action triggers, button groups, status chips, pulsing radar chips, spinners, and skeletons with 6 visual variants.',
				category: 'Components',
				source: 'src/lib/components/elements/Button.svelte',
				badge: 'Elements'
			},
			{
				id: 'comp-forms',
				label: 'Forms & Inputs',
				href: '/docs/comp-forms',
				title: 'Forms, Inputs & FormFields',
				description:
					'Typed FormFields with validation states, character counters, switches, checkboxes, sliders, radio cards, and color pickers.',
				category: 'Components',
				source: 'src/lib/components/forms/FormField.svelte',
				badge: 'Forms'
			},
			{
				id: 'comp-overlays',
				label: 'Modals, Overlays & Tables',
				href: '/docs/comp-overlays',
				title: 'Modals, Slideover Drawers, Toasts & DataTables',
				description:
					'Accessible dialog overlays, slideover sheets, popovers, dropdown menus, context menus, alert banners, and reactive data tables.',
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
