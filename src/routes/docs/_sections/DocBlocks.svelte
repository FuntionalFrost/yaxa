<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import EmptyState from '$lib/components/elements/EmptyState.svelte';
	import Stepper, { type StepItem } from '$lib/components/navigation/Stepper.svelte';
	import Terminal from '$lib/components/elements/Terminal.svelte';
	import Timeline, { type TimelineItem } from '$lib/components/elements/Timeline.svelte';
	import Testimonials, { type TestimonialItem } from '$lib/components/blocks/Testimonials.svelte';
	import FAQ, { type FAQItem } from '$lib/components/blocks/FAQ.svelte';
	import FeatureGrid, { type FeatureItem } from '$lib/components/blocks/FeatureGrid.svelte';
	import Carousel from '$lib/components/elements/Carousel.svelte';
	import VirtualList from '$lib/components/elements/VirtualList.svelte';
	import ResizablePanels from '$lib/components/layout/ResizablePanels.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import ToggleGroup from '$lib/components/forms/ToggleGroup.svelte';

	let dashboardInterval = $state('30d');
	let currentStep = $state(1);

	const onboardingSteps: StepItem[] = [
		{ id: 'details', title: 'Project Details', description: 'Name and repository setup' },
		{ id: 'auth', title: 'Database & Auth', description: 'Neon PostgreSQL & Better-Auth' },
		{ id: 'billing', title: 'Billing & Polar', description: 'Connect subscription tiers' },
		{ id: 'deploy', title: 'Edge Deployment', description: 'Vercel / Cloudflare edge rollout' }
	];

	const terminalLines = [
		{ comment: 'Create modern full-stack SvelteKit 2 + Svelte 5 app' },
		{ command: 'pnpm create yaxa-app my-saas' },
		{
			output:
				'✔ Template scaffolding complete\n✔ Tailwind CSS v4 configured\n✔ Drizzle ORM + Better-Auth wired'
		},
		{ comment: 'Start lightning-fast dev server' },
		{ command: 'cd my-saas && pnpm dev' }
	];

	const changelogTimeline: TimelineItem[] = [
		{
			id: '1',
			title: 'v1.7 Release: SaaS Layouts & Virtualization',
			description:
				'Added DashboardShell, VirtualList, ResizablePanels, Carousel, and Multi-Tenant Org Schemas.',
			timestamp: 'Just now',
			color: 'success',
			tag: 'Latest'
		},
		{
			id: '2',
			title: 'v1.6 Release: Tier 2 SaaS Blocks & Composables',
			description:
				'Added Terminal, Timeline, Tree, OrgSwitcher, Testimonials, FAQ, and FeatureGrid.',
			timestamp: '1 hour ago',
			color: 'primary',
			tag: 'Minor'
		},
		{
			id: '3',
			title: 'v1.5 Security Patch & Public Agent Endpoint',
			description: 'Hardened Polar HMAC validation and deployed public /skills.md.',
			timestamp: 'Yesterday',
			color: 'info'
		}
	];

	const demoTestimonials: TestimonialItem[] = [
		{
			id: '1',
			quote: 'Yaxa allowed us to ship our SaaS product in 4 days instead of 2 months.',
			author: 'Sarah Chen',
			role: 'Founder & CTO',
			company: 'CloudFlow',
			rating: 5
		},
		{
			id: '2',
			quote: 'The Svelte 5 runes architecture is exceptionally clean and blazing fast.',
			author: 'Marcus Vance',
			role: 'Lead Architect',
			company: 'NovaStack',
			rating: 5
		},
		{
			id: '3',
			quote: 'Automated SEO & dynamic OG images out-of-the-box saved us weeks of boilerplate.',
			author: 'Elena Rostova',
			role: 'Head of Growth',
			company: 'ScaleDev',
			rating: 5
		}
	];

	const demoFAQ: FAQItem[] = [
		{
			id: '1',
			question: 'Is Yaxa compatible with Svelte 5 and SvelteKit 2.7+?',
			answer:
				'Yes, 100%. Yaxa is built from the ground up using native Svelte 5 Runes ($state, $derived, $props, $bindable, snippets).',
			category: 'General'
		},
		{
			id: '2',
			question: 'How does Better-Auth multi-tenancy work in Yaxa?',
			answer:
				'Yaxa includes pre-configured Drizzle schemas for organizations, members, and invitations, plus automatic server hook session resolution on event.locals.org.',
			category: 'Authentication'
		},
		{
			id: '3',
			question: 'Can I use VirtualList with 10,000+ items?',
			answer:
				'Yes! VirtualList uses zero-dependency Svelte 5 runes windowing to only mount the DOM nodes currently within the scroll viewport.',
			category: 'Performance'
		}
	];

	const demoFeatures: FeatureItem[] = [
		{
			id: 'f1',
			icon: 'zap',
			title: 'Instant Svelte 5 Runes',
			description:
				'Built entirely with reactive $state, $derived, and snippets for sub-millisecond updates.',
			tag: 'Reactive'
		},
		{
			id: 'f2',
			icon: 'shield-check',
			title: 'Enterprise Multi-Tenancy',
			description:
				'First-class organization switching, role-based access control, and team invitations.',
			tag: 'Auth'
		},
		{
			id: 'f3',
			icon: 'chart-bar',
			title: 'High-Density Windowing',
			description:
				'Render tens of thousands of event logs, orders, and records smoothly with VirtualList.',
			tag: 'Performance'
		}
	];

	const carouselSlides = [
		{
			title: 'Enterprise Multi-Tenancy & Org Switcher',
			desc: 'Seamlessly switch teams, assign roles (Owner, Admin, Member), and manage invitations with Better-Auth.',
			icon: 'building-office-2',
			color: 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
		},
		{
			title: 'High-Performance Windowing with VirtualList',
			desc: 'Render 10,000+ rows of audit logs with zero dropped frames using reactive Svelte 5 slice calculation.',
			icon: 'bolt',
			color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
		},
		{
			title: 'Draggable Split-Panes & ResizablePanels',
			desc: 'Create IDE-style split layouts, markdown previewers, and collapsible consoles with smooth mouse and touch dragging.',
			icon: 'square-3-stack-3d',
			color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
		}
	];

	const virtualLogData = Array.from({ length: 500 }, (_, i) => ({
		id: `EVT-${1000 + i}`,
		name: `System Webhook Event #${1000 + i}`,
		status: i % 4 === 0 ? 'Failed' : i % 2 === 0 ? 'Delivered' : 'Retrying',
		latency: `${Math.floor(20 + ((i * 7) % 80))}ms`,
		time: `${Math.floor(i / 10) + 1}m ago`
	}));

	const terminalSnippet = `<Terminal\n  title="zsh / yaxa-scaffold"\n  lines={[\n    { comment: 'Scaffold full-stack SvelteKit 2 + Svelte 5 app' },\n    { command: 'pnpm create yaxa-app my-saas' }\n  ]}\n  copyable={true}\n/>`;
</script>

<div class="space-y-12">
	<DocHeader
		title="Page & Layout Blocks"
		description="Turnkey full-stack SaaS layouts, responsive marketing sections, high-performance virtualized lists, and split-pane panels."
	/>

	<!-- Carousel Media & Card Slider -->
	<DocSandbox title="Interactive Card & Feature Slider (<Carousel />)">
		<div class="mx-auto w-full max-w-2xl">
			<Carousel
				items={carouselSlides}
				autoplay={true}
				interval={5000}
				showDots={true}
				showArrows={true}
			>
				{#snippet item(slide)}
					<div class="flex flex-col items-center justify-center p-8 text-center sm:p-12">
						<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl {slide.color}">
							<Icon name={slide.icon} size="lg" />
						</div>
						<h3 class="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
							{slide.title}
						</h3>
						<p class="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{slide.desc}</p>
					</div>
				{/snippet}
			</Carousel>
		</div>
	</DocSandbox>

	<!-- High-Performance VirtualList -->
	<DocSandbox title="High-Performance DOM Windowing (<VirtualList />)">
		<div class="w-full">
			<div class="mb-3 flex items-center justify-between">
				<div class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
					500 Virtualized Audit Records (Zero DOM Lag)
				</div>
				<Badge color="success" size="sm">Virtual Window Active</Badge>
			</div>
			<VirtualList items={virtualLogData} itemHeight={44} height={264}>
				{#snippet item(log, index)}
					<div
						class="flex h-full items-center justify-between border-b border-neutral-100 px-4 text-xs dark:border-neutral-800/60"
					>
						<div class="flex items-center gap-3">
							<span class="font-mono text-neutral-400">#{index + 1}</span>
							<span class="font-medium text-neutral-900 dark:text-neutral-200">{log.name}</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="font-mono text-neutral-400">{log.latency}</span>
							<Badge
								color={log.status === 'Delivered'
									? 'success'
									: log.status === 'Failed'
										? 'error'
										: 'warning'}
								size="sm"
							>
								{log.status}
							</Badge>
							<span class="text-neutral-400">{log.time}</span>
						</div>
					</div>
				{/snippet}
			</VirtualList>
		</div>
	</DocSandbox>

	<!-- Resizable Split Panes -->
	<DocSandbox title="Draggable Split-Panes (<ResizablePanels />)">
		<div class="h-64 w-full">
			<ResizablePanels direction="horizontal" defaultSize={50} minSize={20} maxSize={80}>
				{#snippet first()}
					<div
						class="flex h-full flex-col justify-center bg-neutral-50/50 p-6 dark:bg-neutral-900/50"
					>
						<div class="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
							<Icon name="code-bracket" size="sm" class="text-primary-500" />
							<span>Left Split Pane</span>
						</div>
						<p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
							Drag the center divider handle left or right to resize dynamically. Supports keyboard
							arrows (Left / Right) and double-click to reset.
						</p>
					</div>
				{/snippet}
				{#snippet second()}
					<div
						class="flex h-full flex-col justify-center bg-neutral-100/30 p-6 dark:bg-neutral-950/30"
					>
						<div class="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
							<Icon name="eye" size="sm" class="text-emerald-500" />
							<span>Right Preview Pane</span>
						</div>
						<p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
							Fluid percentage-based layout with local storage persistence and min/max constraints.
						</p>
					</div>
				{/snippet}
			</ResizablePanels>
		</div>
	</DocSandbox>

	<!-- SaaS Metrics Dashboard Header -->
	<DocSandbox title="SaaS KPI Metrics Grid (<MetricCard />)">
		<div class="space-y-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
						Revenue Overview
					</h2>
					<p class="text-sm text-neutral-500 dark:text-neutral-400">
						Real-time subscription metrics powered by Polar.sh.
					</p>
				</div>
				<ToggleGroup
					items={[
						{ value: '7d', label: '7 Days' },
						{ value: '30d', label: '30 Days' },
						{ value: '90d', label: '90 Days' }
					]}
					bind:value={dashboardInterval}
					size="sm"
				/>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Monthly Recurring Revenue"
					value="$24,850"
					change={14.2}
					icon="chart-bar"
				/>
				<MetricCard title="Active Subscribers" value="1,429" change={8.7} icon="users" />
				<MetricCard
					title="Average Revenue Per User"
					value="$17.39"
					change={-2.1}
					icon="receipt-percent"
				/>
				<MetricCard title="Churn Rate" value="1.8%" change={-0.4} icon="arrow-path" />
			</div>
		</div>
	</DocSandbox>

	<!-- Onboarding Wizard Stepper -->
	<DocSandbox title="Multi-Step Onboarding Stepper (<Stepper />)">
		<div class="mx-auto w-full max-w-2xl space-y-6">
			<Stepper steps={onboardingSteps} {currentStep} />
			<div class="flex justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
				<Button
					variant="outline"
					size="sm"
					disabled={currentStep === 0}
					onclick={() => (currentStep = Math.max(0, currentStep - 1))}
				>
					Previous
				</Button>
				<Button
					size="sm"
					disabled={currentStep === onboardingSteps.length - 1}
					onclick={() => (currentStep = Math.min(onboardingSteps.length - 1, currentStep + 1))}
				>
					Next Step
				</Button>
			</div>
		</div>
	</DocSandbox>

	<!-- Zero-State Empty Placeholder -->
	<DocSandbox title="Zero-State Placeholder (<EmptyState />)">
		<div class="mx-auto w-full max-w-lg">
			<EmptyState
				icon="document-magnifying-glass"
				title="No API Keys Generated"
				description="You haven't created any secret API keys for your organization yet. Create one to start authenticating webhook requests."
			>
				{#snippet actions()}
					<Button size="sm" iconLeft="plus">Create API Key</Button>
					<Button variant="outline" size="sm">Documentation</Button>
				{/snippet}
			</EmptyState>
		</div>
	</DocSandbox>

	<!-- CLI Terminal Emulator Sandbox -->
	<DocSandbox title="CLI Terminal Emulator (<Terminal />)" code={terminalSnippet}>
		<div class="mx-auto w-full max-w-xl">
			<Terminal title="zsh / yaxa-scaffold" lines={terminalLines} copyable={true} />
		</div>
	</DocSandbox>

	<!-- Activity & Changelog Timeline Sandbox -->
	<DocSandbox title="Activity & Changelog Feed (<Timeline />)">
		<div class="mx-auto w-full max-w-lg">
			<Timeline items={changelogTimeline} size="md" />
		</div>
	</DocSandbox>

	<!-- Bento Feature Showcase Grid -->
	<DocSandbox title="Bento Feature Showcase (<FeatureGrid />)">
		<div class="w-full">
			<FeatureGrid
				badge="Architecture"
				title="Engineered for Peak Velocity"
				description="Eliminate boilerplate with pre-wired authentication, database introspection, and automated SEO."
				features={demoFeatures}
				columns={3}
			/>
		</div>
	</DocSandbox>

	<!-- Social Proof Testimonials Grid -->
	<DocSandbox title="Social Proof & Quotes (<Testimonials />)">
		<div class="w-full">
			<Testimonials
				badge="Testimonials"
				title="Built for Fast-Moving Solo Founders"
				description="Discover why makers choose Yaxa to launch high-converting full-stack SaaS apps."
				items={demoTestimonials}
				columns={3}
			/>
		</div>
	</DocSandbox>

	<!-- FAQ Accordion Block -->
	<DocSandbox title="Expandable FAQ Accordion (<FAQ />)">
		<div class="w-full">
			<FAQ
				badge="Support"
				title="Frequently Asked Questions"
				description="Instant answers to questions about architecture, licensing, and edge deployments."
				items={demoFAQ}
			/>
		</div>
	</DocSandbox>
</div>
