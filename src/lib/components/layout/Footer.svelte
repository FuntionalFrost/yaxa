<script lang="ts">
	import type { Snippet } from 'svelte';
	import { computeProjectBadge, type SiteConfig } from '$lib/site/config';
	import Container from './Container.svelte';
	import Icon from '../elements/Icon.svelte';
	import Logo from '../elements/Logo.svelte';
	import { getSiteConfigGetter } from '$lib/site/context';

	interface Props {
		config?: SiteConfig;
		newsletter?: Snippet;
		class?: string;
	}

	let { config, newsletter, class: className = '' }: Props = $props();

	const getContextConfig = getSiteConfigGetter();
	let currentConfig = $derived(config || getContextConfig());
	let currentYear = new Date().getFullYear();

	let company = $derived(currentConfig.company);
	let legal = $derived(currentConfig.legal);
	let legalLinks = $derived(legal?.links);
	let entityName = $derived(company?.legalName || currentConfig.author?.name || currentConfig.name);
	let projectBadge = $derived(
		currentConfig.project ? computeProjectBadge(currentConfig.project) : null
	);

	let hasLegalLinks = $derived(
		Boolean(
			legalLinks?.privacy || legalLinks?.terms || legalLinks?.refunds || legalLinks?.impressum
		)
	);
</script>

<footer
	class="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 {className}"
>
	<Container size="lg" class="py-12 md:py-16">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
			<!-- Brand Info -->
			<div class="space-y-4 md:col-span-2 lg:col-span-2">
				<div class="flex items-center gap-3">
					<a href="/" class="inline-flex items-center gap-2.5 font-bold tracking-tight">
						<Logo size="sm" showText text={currentConfig.name} />
					</a>
					{#if projectBadge}
						<span
							class="inline-flex items-center rounded-full border border-primary-200/50 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/60 dark:text-primary-400"
						>
							{projectBadge}
						</span>
					{/if}
				</div>
				<p class="max-w-sm text-base text-neutral-600 dark:text-neutral-400">
					{currentConfig.description}
				</p>
				{#if currentConfig.email}
					<p class="text-xs text-neutral-500 dark:text-neutral-400">
						Contact:
						<a
							href="mailto:{currentConfig.email}"
							class="font-medium text-neutral-700 hover:underline dark:text-neutral-300"
						>
							{currentConfig.email}
						</a>
					</p>
				{/if}
				{#if legal?.morNotice}
					<p class="text-xs text-neutral-500 dark:text-neutral-500">
						{legal.morNotice}
					</p>
				{/if}
			</div>

			<!-- Quick Links -->
			<div>
				<h3 class="text-base font-semibold text-neutral-900 dark:text-white">Navigation</h3>
				<ul class="mt-4 space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
					{#each currentConfig.nav || [] as item}
						<li>
							<a
								href={item.href}
								class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Legal Links -->
			{#if hasLegalLinks}
				<div>
					<h3 class="text-base font-semibold text-neutral-900 dark:text-white">
						Legal & Compliance
					</h3>
					<ul class="mt-4 space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
						{#if legalLinks?.privacy}
							<li>
								<a
									href={legalLinks.privacy}
									class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
								>
									Privacy Policy
								</a>
							</li>
						{/if}
						{#if legalLinks?.terms}
							<li>
								<a
									href={legalLinks.terms}
									class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
								>
									Terms of Service
								</a>
							</li>
						{/if}
						{#if legalLinks?.refunds}
							<li>
								<a
									href={legalLinks.refunds}
									class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
								>
									Cancellation & Refunds
								</a>
							</li>
						{/if}
						{#if legalLinks?.impressum}
							<li>
								<a
									href={legalLinks.impressum}
									class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
								>
									Impressum
								</a>
							</li>
						{/if}
					</ul>
				</div>
			{/if}

			<!-- Socials & Newsletter -->
			<div>
				<h3 class="text-base font-semibold text-neutral-900 dark:text-white">Community</h3>
				<div class="mt-4 flex items-center gap-3">
					{#if currentConfig.socials?.github || currentConfig.project?.repositoryUrl}
						<a
							href={currentConfig.socials?.github || currentConfig.project?.repositoryUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
							aria-label="GitHub"
						>
							<Icon name="github" size="sm" />
						</a>
					{/if}
					{#if currentConfig.socials?.npm}
						<a
							href={currentConfig.socials.npm}
							target="_blank"
							rel="noopener noreferrer"
							class="text-neutral-500 hover:text-red-500 dark:hover:text-red-400"
							aria-label="npm"
						>
							<Icon name="npm" size="sm" />
						</a>
					{/if}
					{#if currentConfig.socials?.twitter}
						<a
							href={currentConfig.socials.twitter}
							target="_blank"
							rel="noopener noreferrer"
							class="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
							aria-label="Twitter"
						>
							<Icon name="twitter" size="sm" />
						</a>
					{/if}
				</div>

				{#if newsletter}
					<div class="mt-4">
						{@render newsletter()}
					</div>
				{/if}
			</div>
		</div>

		<!-- Footer Bottom Identification Bar -->
		<div
			class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800 dark:text-neutral-400"
		>
			<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
				<span>© {currentYear} {entityName}.</span>
				{#if currentConfig.project?.license}
					<span>· {currentConfig.project.license} Licensed</span>
				{/if}
				{#if company?.address}
					<span>· {company.address}</span>
				{/if}
				{#if company?.vatNumber}
					<span>· VAT: {company.vatNumber}</span>
				{/if}
				{#if company?.registrationCourt}
					<span>· {company.registrationCourt}</span>
				{/if}
			</div>

			<div class="flex flex-wrap items-center justify-center gap-4">
				{#if legalLinks?.privacy}
					<a href={legalLinks.privacy} class="hover:underline">Privacy</a>
				{/if}
				{#if legalLinks?.terms}
					<a href={legalLinks.terms} class="hover:underline">Terms</a>
				{/if}
				{#if legalLinks?.refunds}
					<a href={legalLinks.refunds} class="hover:underline">Refunds</a>
				{/if}
				{#if legalLinks?.impressum}
					<a href={legalLinks.impressum} class="hover:underline">Impressum</a>
				{/if}
			</div>
		</div>
	</Container>
</footer>
