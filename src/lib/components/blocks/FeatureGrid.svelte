<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from '../elements/Icon.svelte';

	export interface FeatureItem {
		id: string | number;
		title: string;
		description: string;
		icon?: IconSource;
		tag?: string;
		href?: string;
	}

	export const featureGridVariants = tv({
		base: 'w-full py-12'
	});

	export type FeatureGridProps = VariantProps<typeof featureGridVariants> & {
		title?: string;
		description?: string;
		badge?: string;
		features?: FeatureItem[];
		columns?: 2 | 3 | 4;
		interactive?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import Card from '../layout/Card.svelte';
	import { springTilt } from '../../actions/springTilt';
	import { staggerFly } from '../../motion/transitions';

	let {
		title = 'Everything you need to ship faster',
		description = 'Production-ready primitives and architecture designed for modern full-stack apps.',
		badge = 'Features',
		features = [],
		columns = 3,
		interactive = true,
		class: className = ''
	}: FeatureGridProps = $props();

	let gridCols = $derived(
		columns === 2
			? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
			: columns === 4
				? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
				: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
	);
</script>

<section class={featureGridVariants({ class: className })}>
	{#if title || description || badge}
		<div class="mb-12 space-y-3 text-center">
			{#if badge}
				<div class="inline-flex">
					<Badge variant="subtle" color="primary" size="sm">
						{badge}
					</Badge>
				</div>
			{/if}

			{#if title}
				<h2
					class="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
				>
					{title}
				</h2>
			{/if}

			{#if description}
				<p class="mx-auto max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
					{description}
				</p>
			{/if}
		</div>
	{/if}

	<div class="grid gap-6 {gridCols}">
		{#each features as feature, idx (feature.id)}
			<div
				in:staggerFly={{ index: idx, y: 24, duration: 320 }}
				use:springTilt={{ disabled: !interactive, max: 8, scale: 1.015 }}
				class="h-full"
			>
				<Card
					class="group relative flex h-full flex-col justify-between p-6 transition-all duration-200 hover:shadow-xl dark:hover:border-neutral-700"
				>
					<div>
						<!-- Icon & Tag Row -->
						<div class="mb-4 flex items-center justify-between">
							{#if feature.icon}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-950/60 dark:text-primary-400"
								>
									<Icon name={feature.icon} size="sm" />
								</div>
							{/if}

							{#if feature.tag}
								<Badge size="xs" variant="subtle" color="primary">
									{feature.tag}
								</Badge>
							{/if}
						</div>

						<!-- Title -->
						<h3 class="text-base font-bold text-neutral-900 dark:text-white">
							{feature.title}
						</h3>

						<!-- Description -->
						<p class="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
							{feature.description}
						</p>
					</div>

					{#if feature.href}
						<div class="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
							<a
								href={feature.href}
								class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
							>
								Learn more
								<Icon name="arrow-right" size="xs" />
							</a>
						</div>
					{/if}
				</Card>
			</div>
		{/each}
	</div>
</section>
