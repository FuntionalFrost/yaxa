<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SiteConfig, NavItem } from '$lib/site/config';
	import { theme } from '$lib/theme/theme.svelte';
	import Container from './Container.svelte';
	import Button from '../elements/Button.svelte';
	import Icon from '../elements/Icon.svelte';
	import Kbd from '../elements/Kbd.svelte';
	import Link from '../elements/Link.svelte';
	import Logo from '../elements/Logo.svelte';
	import { getSiteConfigGetter } from '$lib/site/context';

	interface Props {
		config?: SiteConfig;
		links?: NavItem[];
		onOpenCommand?: () => void;
		actions?: Snippet;
		class?: string;
	}

	let { config, links, onOpenCommand, actions, class: className = '' }: Props = $props();

	const getContextConfig = getSiteConfigGetter();
	let currentConfig = $derived(config || getContextConfig());
	let resolvedLinks = $derived(links || currentConfig.nav || []);

	let mobileMenuOpen = $state(false);
	let isScrolled = $state(false);
</script>

<svelte:window
	onscroll={() => {
		if (typeof window !== 'undefined') {
			isScrolled = window.scrollY > 15;
		}
	}}
/>

<header
	class="sticky top-0 z-40 w-full transition-all duration-200 {isScrolled
		? 'border-b border-neutral-200/80 bg-white/95 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#121212]/95'
		: 'border-b border-transparent bg-white/60 backdrop-blur-sm dark:border-transparent dark:bg-[#121212]/60'} {className}"
>
	<Container size="2xl">
		<div class="flex h-16 items-center justify-between gap-4">
			<!-- Logo, Brand & Version Pill -->
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-2.5">
					<a
						href="/"
						class="flex items-center gap-2.5 font-bold tracking-tight text-neutral-900 transition-opacity hover:opacity-90 dark:text-white"
					>
						<Logo size="sm" />
						<span class="text-base font-extrabold tracking-tight">{currentConfig.name}</span>
					</a>
				</div>

				<!-- Desktop Navigation Links -->
				<nav class="hidden items-center gap-1 md:flex">
					{#each resolvedLinks as item (item.href)}
						<Link
							href={item.href}
							class="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
							activeClass="text-primary-600 dark:text-primary-400 font-semibold"
						>
							{#if item.icon}
								<Icon name={item.icon} size="xs" />
							{/if}
							{item.label}
							{#if item.badge}
								<span
									class="ml-1 rounded bg-primary-100 px-1.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
								>
									{item.badge}
								</span>
							{/if}
						</Link>
					{/each}
				</nav>
			</div>

			<!-- Right Section: Search, Theme Toggle, Actions, Socials -->
			<div class="flex items-center gap-2">
				{#if onOpenCommand}
					<button
						onclick={onOpenCommand}
						type="button"
						class="hidden items-center gap-2 rounded-lg border border-neutral-200/80 bg-neutral-100/60 px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 sm:flex dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
						aria-label="Search or run command"
					>
						<Icon name="search" size="xs" />
						<span>Search documentation...</span>
						<Kbd value="CTRL K" size="xs" class="ml-3" />
					</button>
				{/if}

				<!-- Theme Mode Switcher -->
				<Button
					variant="ghost"
					color="neutral"
					square
					size="sm"
					onclick={() => theme.toggle()}
					aria-label="Toggle color mode"
				>
					{#if theme.resolvedTheme === 'dark'}
						<Icon name="sun" size="sm" class="text-amber-400" />
					{:else}
						<Icon name="moon" size="sm" class="text-neutral-600" />
					{/if}
				</Button>

				<!-- GitHub Link -->
				{#if currentConfig.socials?.github}
					<Button
						href={currentConfig.socials.github}
						variant="ghost"
						color="neutral"
						square
						size="sm"
						aria-label="GitHub Repository"
					>
						<Icon name="github" size="sm" />
					</Button>
				{/if}

				<!-- npm Link -->
				{#if currentConfig.socials?.npm}
					<Button
						href={currentConfig.socials.npm}
						variant="ghost"
						color="neutral"
						square
						size="sm"
						aria-label="npm Package"
					>
						<Icon name="npm" size="sm" />
					</Button>
				{/if}

				{#if actions}
					{@render actions()}
				{/if}

				<!-- Mobile menu button -->
				<div class="flex md:hidden">
					<Button
						variant="ghost"
						color="neutral"
						square
						size="sm"
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						aria-label="Toggle navigation menu"
					>
						{#if mobileMenuOpen}
							<Icon name="cross" size="sm" />
						{:else}
							<svg
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						{/if}
					</Button>
				</div>
			</div>
		</div>

		<!-- Mobile Navigation Dropdown -->
		{#if mobileMenuOpen}
			<div class="border-t border-neutral-200 py-4 md:hidden dark:border-neutral-800">
				<div class="flex flex-col space-y-2">
					{#each resolvedLinks as item (item.href)}
						<a
							href={item.href}
							onclick={() => (mobileMenuOpen = false)}
							class="rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
						>
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</Container>
</header>
