<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const carouselVariants = tv({
		slots: {
			root: 'relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
			viewport: 'relative flex w-full overflow-hidden',
			slide: 'min-w-full transition-transform duration-500 ease-out',
			controls: 'absolute inset-0 flex items-center justify-between pointer-events-none p-4',
			arrowBtn:
				'pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105 active:scale-95 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100',
			dots: 'absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none',
			dotBtn: 'pointer-events-auto h-2 rounded-full transition-all duration-300'
		}
	});

	export type CarouselProps<T> = VariantProps<typeof carouselVariants> & {
		items: T[];
		currentIndex?: number;
		autoplay?: boolean;
		interval?: number;
		loop?: boolean;
		showDots?: boolean;
		showArrows?: boolean;
		pauseOnHover?: boolean;
		item?: Snippet<[T, number]>;
		empty?: Snippet;
		class?: string;
	};
</script>

<script lang="ts" generics="T">
	import Icon from './Icon.svelte';

	let {
		items = [],
		currentIndex = $bindable(0),
		autoplay = false,
		interval = 4000,
		loop = true,
		showDots = true,
		showArrows = true,
		pauseOnHover = true,
		item,
		empty,
		class: className = ''
	}: CarouselProps<T> = $props();

	let isHovered = $state(false);
	let touchStartX = $state(0);

	const slots = $derived(carouselVariants());

	function next() {
		if (items.length === 0) return;
		if (currentIndex < items.length - 1) {
			currentIndex += 1;
		} else if (loop) {
			currentIndex = 0;
		}
	}

	function prev() {
		if (items.length === 0) return;
		if (currentIndex > 0) {
			currentIndex -= 1;
		} else if (loop) {
			currentIndex = items.length - 1;
		}
	}

	function goTo(index: number) {
		if (index >= 0 && index < items.length) {
			currentIndex = index;
		}
	}

	// Autoplay timer
	$effect(() => {
		if (!autoplay || items.length <= 1) return;
		if (pauseOnHover && isHovered) return;

		const timer = setInterval(() => {
			next();
		}, interval);

		return () => clearInterval(timer);
	});

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e: TouchEvent) {
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > 40) {
			if (diff > 0) {
				next();
			} else {
				prev();
			}
		}
	}
</script>

<div
	class="{slots.root()} {className}"
	role="region"
	aria-roledescription="carousel"
	aria-label="Image and Card Slider"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	{#if items.length === 0}
		<div
			class="flex min-h-64 items-center justify-center p-8 text-neutral-500 dark:text-neutral-400"
		>
			{#if empty}
				{@render empty()}
			{:else}
				<p class="text-sm">No carousel slides available.</p>
			{/if}
		</div>
	{:else}
		<!-- Viewport -->
		<div class={slots.viewport()}>
			<div
				class="flex w-full transition-transform duration-500 ease-out"
				style="transform: translateX(-{currentIndex * 100}%);"
			>
				{#each items as slide, index}
					<div
						class="min-w-full flex-shrink-0"
						role="group"
						aria-roledescription="slide"
						aria-label="Slide {index + 1} of {items.length}"
					>
						{#if item}
							{@render item(slide, index)}
						{:else}
							<div class="flex min-h-64 items-center justify-center p-8">
								{String(slide)}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Navigation Arrows -->
		{#if showArrows && items.length > 1}
			<div class={slots.controls()}>
				<button
					type="button"
					onclick={prev}
					class={slots.arrowBtn()}
					aria-label="Previous slide"
					disabled={!loop && currentIndex === 0}
				>
					<Icon name="chevron-left" size="sm" />
				</button>

				<button
					type="button"
					onclick={next}
					class={slots.arrowBtn()}
					aria-label="Next slide"
					disabled={!loop && currentIndex === items.length - 1}
				>
					<Icon name="chevron-right" size="sm" />
				</button>
			</div>
		{/if}

		<!-- Indicator Dots -->
		{#if showDots && items.length > 1}
			<div class={slots.dots()}>
				{#each items as slide, index (index)}
					<button
						type="button"
						onclick={() => goTo(index)}
						class="{slots.dotBtn()} {currentIndex === index
							? 'w-6 bg-primary-600 dark:bg-primary-400'
							: 'w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600'}"
						aria-label="Go to slide {index + 1}: {typeof slide === 'object' &&
						slide &&
						'title' in slide
							? String(slide.title)
							: index + 1}"
						aria-current={currentIndex === index ? 'true' : 'false'}
					></button>
				{/each}
			</div>
		{/if}
	{/if}
</div>
