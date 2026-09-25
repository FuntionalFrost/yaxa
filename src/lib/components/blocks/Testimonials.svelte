<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export interface TestimonialItem {
		id: string | number;
		quote: string;
		author: string;
		role?: string;
		company?: string;
		avatar?: string;
		rating?: number;
	}

	export const testimonialsVariants = tv({
		base: 'w-full py-12'
	});

	export type TestimonialsProps = VariantProps<typeof testimonialsVariants> & {
		title?: string;
		description?: string;
		badge?: string;
		items?: TestimonialItem[];
		columns?: 1 | 2 | 3;
		interactive?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from '../elements/Icon.svelte';
	import Card from '../layout/Card.svelte';
	import Badge from '../elements/Badge.svelte';
	import Avatar from '../elements/Avatar.svelte';
	import { springTilt } from '../../actions/springTilt';
	import { staggerFly } from '../../motion/transitions';

	let {
		title = 'Loved by solo founders & engineering teams',
		description = 'See what developers and makers are building with Yaxa.',
		badge = 'Social Proof',
		items = [],
		columns = 3,
		interactive = true,
		class: className = ''
	}: TestimonialsProps = $props();

	let gridCols = $derived(
		columns === 1
			? 'grid-cols-1 max-w-2xl mx-auto'
			: columns === 2
				? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
				: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
	);
</script>

<section class={testimonialsVariants({ class: className })}>
	{#if title || description || badge}
		<div class="mb-10 space-y-3 text-center">
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
		{#each items as item, idx (item.id)}
			<div
				in:staggerFly={{ index: idx, y: 20, duration: 300 }}
				use:springTilt={{ disabled: !interactive, max: 6, scale: 1.01 }}
				class="h-full"
			>
				<Card
					class="flex h-full flex-col justify-between p-6 transition-all duration-200 hover:shadow-lg dark:hover:border-neutral-700"
				>
					<div>
						<!-- Star Rating -->
						{#if item.rating}
							<div class="mb-4 flex items-center gap-1 text-amber-400">
								{#each Array.from({ length: item.rating }, (_, i) => i) as starIndex (starIndex)}
									<Icon name="star" size="xs" />
								{/each}
							</div>
						{/if}

						<!-- Quote Text -->
						<blockquote
							class="text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300"
						>
							"{item.quote}"
						</blockquote>
					</div>

					<!-- Author Info -->
					<div
						class="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
					>
						<Avatar src={item.avatar} alt={item.author} size="sm" />

						<div class="min-w-0 flex-1">
							<div class="truncate text-xs font-semibold text-neutral-900 dark:text-white">
								{item.author}
							</div>
							{#if item.role || item.company}
								<div class="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
									{item.role}{item.role && item.company ? ' • ' : ''}{item.company}
								</div>
							{/if}
						</div>
					</div>
				</Card>
			</div>
		{/each}
	</div>
</section>
