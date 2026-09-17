<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { SiteConfig } from '$lib/site/config';

	export type LegalDocumentType = 'privacy' | 'terms' | 'refunds' | 'impressum';

	export interface LegalClause {
		id: string;
		title: string;
		content?: string;
	}

	export interface LegalDocumentProps {
		type: LegalDocumentType;
		config?: SiteConfig;
		lastUpdated?: string;
		title?: string;
		description?: string;
		customClauses?: LegalClause[];
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { getSiteConfigGetter } from '$lib/site/context';
	import Container from '../layout/Container.svelte';
	import Badge from '../elements/Badge.svelte';
	import Icon from '../elements/Icon.svelte';

	let {
		type,
		config,
		lastUpdated = 'September 2026',
		title,
		description,
		customClauses = [],
		class: className = '',
		children
	}: LegalDocumentProps = $props();

	const getContextConfig = getSiteConfigGetter();
	let currentConfig = $derived(config || getContextConfig());
	let company = $derived(currentConfig.company);
	let legal = $derived(currentConfig.legal);

	let entityName = $derived(company?.legalName || currentConfig.name);
	let contactEmail = $derived(
		company?.contactEmail ||
			(currentConfig.url ? `support@${new URL(currentConfig.url).hostname}` : 'support@example.com')
	);
	let dpoEmail = $derived(legal?.dpoEmail || contactEmail);
	let refundDays = $derived(legal?.refundDays ?? 14);
	let processor = $derived(legal?.paymentProcessor ?? 'polar');
	let isEthicalAds = $derived(legal?.adNetwork === 'ethicalads');
	let isEu = $derived(legal?.jurisdiction?.toUpperCase() === 'EU');

	let docTitle = $derived.by(() => {
		if (title) return title;
		switch (type) {
			case 'privacy':
				return 'Privacy Policy';
			case 'terms':
				return 'Terms of Service';
			case 'refunds':
				return 'Cancellation & Refund Policy';
			case 'impressum':
				return 'Impressum / Legal Notice';
		}
	});

	let docDescription = $derived.by(() => {
		if (description) return description;
		switch (type) {
			case 'privacy':
				return `How ${entityName} handles, secures, and protects your personal data in full compliance with GDPR and global privacy standards.`;
			case 'terms':
				return `The terms and conditions governing your access to and use of ${currentConfig.name}.`;
			case 'refunds':
				return `Our transparent ${refundDays}-day refund policy, self-serve cancellation terms, and EU statutory withdrawal rights.`;
			case 'impressum':
				return `Provider identification and mandatory legal disclosure pursuant to EU E-Commerce regulations (§ 5 TMG / DDG).`;
		}
	});

	// Default sections by type
	let defaultSections = $derived.by(() => {
		if (type === 'privacy') {
			return [
				{
					id: 'overview',
					title: '1. Overview & Data Controller',
					content: `This Privacy Policy outlines how **${entityName}** ("we", "us", or "our"), operating **${currentConfig.name}** at [${currentConfig.url}](${currentConfig.url}), collects, processes, and protects your personal data. We are dedicated to respecting your privacy and strictly upholding the European Union General Data Protection Regulation (GDPR), the UK GDPR, and applicable global data privacy regulations.`
				},
				{
					id: 'data-collected',
					title: '2. Information We Collect',
					content: `We collect minimal personal information essential for delivering our service:\n\n- **Account & Identity Data**: When registering via our authentication system, we store your name, email address, and avatar image.\n- **Authentication Logs**: Cryptographically secure session tokens, sign-in timestamps, and anonymized security identifiers to prevent unauthorized access.\n- **Communications**: Inquiries or support requests sent directly to **${contactEmail}**.`
				},
				{
					id: 'payments',
					title: '3. Payments & Merchant of Record',
					content:
						processor === 'polar'
							? `All payments, recurring billing, and European Union VAT / sales tax calculations are handled by **Polar Payments Inc. ("Polar.sh")** acting as Merchant of Record.\n\nWe never receive, store, or process your credit card numbers or raw banking credentials on our local servers. Polar processes transaction data under strict PCI-DSS Level 1 compliance.`
							: processor === 'lemonsqueezy'
								? `Payments and VAT compliance are processed securely by **Lemon Squeezy, LLC** acting as Merchant of Record. We never collect or store your payment card details.`
								: `Payment transactions are securely processed by our authorized payment gateway. We do not store sensitive payment card details on our infrastructure.`
				},
				{
					id: 'advertising',
					title: '4. Privacy-First Advertising (Zero-Tracking)',
					content: isEthicalAds
						? `We proudly utilize **EthicalAds** to serve privacy-respecting developer advertisements.\n\n- **Zero Tracking Cookies**: EthicalAds does not set behavioral tracking cookies or device fingerprints.\n- **No Personal Data Profiling**: Ads are displayed strictly based on page context and high-level geolocation (country level), without tracking you across the web.\n- **No Cookie Banner Required**: Because EthicalAds processes no personal identifiers and stores no invasive cookies, your browsing experience remains free of consent interruptions.`
						: `We do not sell your personal information or engage in invasive third-party cross-site advertising networks.`
				},
				{
					id: 'cookies',
					title: '5. Cookies & Local Storage',
					content: `Our website minimizes local device storage. We utilize client-side \`localStorage\` solely to preserve essential functional user preferences (such as your chosen dark/light color mode and theme accent).\n\nWe do not use persistent advertising trackers or third-party behavioral profiling cookies.`
				},
				{
					id: 'gdpr-rights',
					title: '6. Your Rights Under GDPR / Data Protection Laws',
					content: `Under the GDPR and equivalent data protection frameworks, you are entitled to the following rights:\n\n- **Right of Access**: Request a full copy of the personal data we hold about you.\n- **Right to Rectification**: Correct any inaccurate or incomplete personal information.\n- **Right to Erasure ("Right to be Forgotten")**: Request permanent deletion of your account and personal data.\n- **Right to Restriction & Object**: Restrict or object to specific processing of your information.\n- **Right to Data Portability**: Receive your data in a structured, machine-readable format.\n- **Right to Lodge a Complaint**: File a complaint with your competent national data protection supervisory authority.\n\nTo exercise any of these rights, contact us at [${dpoEmail}](mailto:${dpoEmail}).`
				},
				{
					id: 'contact',
					title: '7. Contact & Data Protection',
					content: `If you have any questions or data requests regarding this Privacy Policy, please contact our Data Protection representative at **${dpoEmail}**.`
				}
			];
		}

		if (type === 'terms') {
			return [
				{
					id: 'acceptance',
					title: '1. Acceptance of Terms',
					content: `By accessing or using **${currentConfig.name}** ([${currentConfig.url}](${currentConfig.url})), provided by **${entityName}**, you agree to be bound by these Terms of Service. If you do not agree to all terms, do not access or use the service.`
				},
				{
					id: 'license',
					title: '2. License & Acceptable Use',
					content: `We grant you a non-exclusive, non-transferable, revocable license to use ${currentConfig.name} in accordance with your chosen subscription plan or open-source license.\n\nYou agree not to:\n- Reverse engineer, decompile, or exploit our proprietary services except as permitted by applicable law.\n- Use the service for unlawful activities, security vulnerabilities scanning, or spam distribution.\n- Interfere with or disrupt the stability of our servers and networks.`
				},
				{
					id: 'subscriptions',
					title: '3. Subscriptions, Invoicing & Taxes',
					content:
						processor === 'polar'
							? `Subscriptions and paid tiers are billed in advance on a recurring monthly or annual basis. Invoicing, payment collection, and applicable VAT / sales taxes are managed by **Polar.sh** as Merchant of Record.\n\nYou can manage or cancel your subscription at any time directly through your account dashboard or billing portal.`
							: `Paid subscription tiers are billed in advance on a recurring cycle. You may cancel your subscription at any time before your next billing cycle.`
				},
				{
					id: 'liability',
					title: '4. Limitation of Liability',
					content: `To the maximum extent permitted by applicable law, **${entityName}** shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption.`
				},
				{
					id: 'dispute-resolution',
					title: '5. Governing Law & Dispute Resolution',
					content:
						(legal?.governingLaw
							? `These terms are governed by the laws of **${legal.governingLaw}**.\n\n`
							: '') +
						(isEu
							? `The European Commission provides an Online Dispute Resolution (ODR) platform accessible at [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). We aim to resolve any disagreement directly through friendly communication at [${contactEmail}](mailto:${contactEmail}).`
							: `Any disputes arising from these Terms shall be resolved in accordance with standard arbitration and applicable local jurisdiction.`)
				}
			];
		}

		if (type === 'refunds') {
			return [
				{
					id: 'cancellation',
					title: '1. Self-Serve Cancellation',
					content: `You may cancel your active subscription at any time with immediate effect. Upon cancellation, your access will remain active through the end of your current paid billing period, and your payment method will not be charged again.`
				},
				{
					id: 'refund-policy',
					title: `2. ${refundDays}-Day Money-Back Guarantee`,
					content: `We stand behind the quality of our software. If you are not completely satisfied with your purchase, we offer a **100% money-back guarantee within ${refundDays} days** of your initial purchase.\n\nTo request a refund within the ${refundDays}-day window, simply email [${contactEmail}](mailto:${contactEmail}) with your account email or transaction ID. We process refunds promptly without unnecessary hurdles.`
				},
				{
					id: 'eu-withdrawal',
					title: '3. EU Statutory Right of Withdrawal',
					content: `If you are an EU consumer, you have the statutory right to withdraw from a purchase within 14 days without giving any reason.\n\nFor digital content or immediate SaaS access, if you explicitly consented to the immediate execution of the contract upon checkout, our generous ${refundDays}-day guarantee remains fully accessible to you regardless.`
				},
				{
					id: 'disputes',
					title: '4. Chargebacks & Friendly Resolution',
					content: `If you experience any billing issue or unexpected charge, please reach out to us at [${contactEmail}](mailto:${contactEmail}) before initiating a bank dispute or chargeback. We will gladly investigate and resolve billing discrepancies swiftly.`
				}
			];
		}

		if (type === 'impressum') {
			return [
				{
					id: 'provider',
					title: '1. Provider Identification / Angaben gemäß § 5 TMG / DDG',
					content:
						`**Entity / Legal Name:** ${company?.legalName || currentConfig.name}\n\n` +
						(company?.address ? `**Geographical Address:**\n${company.address}\n\n` : '') +
						(company?.country ? `**Country:** ${company.country}\n\n` : '') +
						(company?.representative ? `**Represented By:** ${company.representative}\n\n` : '')
				},
				{
					id: 'contact-info',
					title: '2. Contact Information / Kontaktaufnahme',
					content: `**Email:** [${contactEmail}](mailto:${contactEmail})\n\n**Website:** [${currentConfig.url}](${currentConfig.url})`
				},
				{
					id: 'register',
					title: '3. Commercial Register & Tax Information',
					content:
						(company?.registrationCourt || company?.registrationNumber
							? `**Commercial Register:** ${company?.registrationCourt || 'Commercial Registry'}\n**Registration Number:** ${company?.registrationNumber || 'N/A'}\n\n`
							: '') +
						(company?.vatNumber
							? `**VAT Identification Number (Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG):**\n${company.vatNumber}\n\n`
							: 'VAT Identification Number: Not applicable / Small business regulation.')
				},
				{
					id: 'dispute-resolution',
					title: '4. Consumer Dispute Resolution / Verbraucherstreitbeilegung',
					content: `The European Commission provides a platform for online dispute resolution (ODR): [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).\n\nWe are neither obligated nor willing to participate in dispute resolution proceedings before a consumer arbitration board.`
				}
			];
		}

		return [];
	});

	let allSections = $derived([...defaultSections, ...customClauses]);
</script>

<Container size="lg" class="py-12 md:py-20 {className}">
	<!-- Header -->
	<div class="mb-12 border-b border-neutral-200 pb-8 dark:border-neutral-800">
		<div class="mb-4 flex flex-wrap items-center gap-3">
			<Badge color="primary" variant="soft" size="sm">Legal & Compliance</Badge>
			{#if isEu}
				<Badge color="neutral" variant="outline" size="sm">EU / GDPR Compliant</Badge>
			{/if}
			{#if processor === 'polar'}
				<Badge color="neutral" variant="outline" size="sm">Polar.sh MoR</Badge>
			{/if}
			{#if isEthicalAds}
				<Badge color="success" variant="subtle" size="sm">Zero-Cookie Ad Disclosure</Badge>
			{/if}
		</div>

		<h1
			class="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
		>
			{docTitle}
		</h1>

		<p class="mt-4 max-w-3xl text-lg text-neutral-600 dark:text-neutral-300">
			{docDescription}
		</p>

		<div
			class="mt-6 flex flex-wrap items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400"
		>
			<span class="inline-flex items-center gap-1.5">
				<Icon name="info" size="xs" />
				Last Updated:
				<strong class="font-medium text-neutral-700 dark:text-neutral-200">{lastUpdated}</strong>
			</span>
			<span>•</span>
			<span
				>Entity:
				<strong class="font-medium text-neutral-700 dark:text-neutral-200">{entityName}</strong
				></span
			>
			{#if contactEmail}
				<span>•</span>
				<a
					href="mailto:{contactEmail}"
					class="text-primary-600 hover:underline dark:text-primary-400"
				>
					{contactEmail}
				</a>
			{/if}
		</div>
	</div>

	<!-- Main Grid: Sidebar Table of Contents + Document Content -->
	<div class="grid grid-cols-1 gap-12 lg:grid-cols-4">
		<!-- Table of Contents Sidebar -->
		<aside class="hidden lg:col-span-1 lg:block">
			<div
				class="sticky top-24 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<h3
					class="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400"
				>
					Table of Contents
				</h3>
				<nav class="space-y-2">
					{#each allSections as sec}
						<a
							href="#{sec.id}"
							class="block text-sm text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
						>
							{sec.title}
						</a>
					{/each}
				</nav>
			</div>
		</aside>

		<!-- Content Column -->
		<div class="space-y-12 lg:col-span-3">
			{#each allSections as sec}
				<section
					id={sec.id}
					class="scroll-mt-24 space-y-4 border-b border-neutral-100 pb-10 last:border-0 dark:border-neutral-900"
				>
					<h2 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
						{sec.title}
					</h2>
					<div
						class="prose max-w-none leading-relaxed whitespace-pre-line text-neutral-600 prose-neutral dark:text-neutral-300 dark:prose-invert"
					>
						{sec.content}
					</div>
				</section>
			{/each}

			{#if children}
				<div class="mt-8">
					{@render children()}
				</div>
			{/if}
		</div>
	</div>
</Container>
