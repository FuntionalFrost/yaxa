<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export const resizablePanelsVariants = tv({
		slots: {
			root: 'relative flex h-full w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
			handle:
				'group relative flex items-center justify-center bg-neutral-100 transition-colors hover:bg-primary-500/20 active:bg-primary-500/30 dark:bg-neutral-800 dark:hover:bg-primary-500/30 outline-none',
			grip: 'rounded-full bg-neutral-400 transition-colors group-hover:bg-primary-600 dark:bg-neutral-600 dark:group-hover:bg-primary-400'
		},
		variants: {
			direction: {
				horizontal: {
					root: 'flex-row',
					handle: 'w-2 cursor-col-resize select-none',
					grip: 'h-6 w-1'
				},
				vertical: {
					root: 'flex-col',
					handle: 'h-2 cursor-row-resize select-none',
					grip: 'h-1 w-6'
				}
			}
		},
		defaultVariants: {
			direction: 'horizontal'
		}
	});

	export type ResizablePanelsProps = VariantProps<typeof resizablePanelsVariants> & {
		direction?: 'horizontal' | 'vertical';
		defaultSize?: number;
		minSize?: number;
		maxSize?: number;
		storageKey?: string;
		first?: Snippet;
		second?: Snippet;
		handle?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	let {
		direction = 'horizontal',
		defaultSize = 50,
		minSize = 10,
		maxSize = 90,
		storageKey,
		first,
		second,
		handle,
		class: className = ''
	}: ResizablePanelsProps = $props();

	let containerRef = $state<HTMLElement | null>(null);
	let size = $state<number | null>(null);
	let isDragging = $state(false);

	const currentSize = $derived(size ?? defaultSize);
	const slots = $derived(resizablePanelsVariants({ direction }));

	// Initialize from storageKey
	$effect(() => {
		if (storageKey && typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem(`yaxa_panel_${storageKey}`);
				if (saved !== null) {
					const parsed = Number.parseFloat(saved);
					if (!isNaN(parsed) && parsed >= minSize && parsed <= maxSize) {
						size = parsed;
					}
				}
			} catch (e) {
				void e;
			}
		}
	});

	function saveSize(newSize: number) {
		const clamped = Math.max(minSize, Math.min(maxSize, newSize));
		size = clamped;
		if (storageKey && typeof window !== 'undefined') {
			try {
				localStorage.setItem(`yaxa_panel_${storageKey}`, String(clamped));
			} catch (e) {
				void e;
			}
		}
	}

	let rafId: number | null = null;

	function startDrag(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		isDragging = true;

		function onMove(moveEvent: MouseEvent | TouchEvent) {
			if (!containerRef) return;
			const isTouch = 'touches' in moveEvent;
			const clientX =
				isTouch && moveEvent.touches.length > 0
					? moveEvent.touches[0].clientX
					: (moveEvent as MouseEvent).clientX;
			const clientY =
				isTouch && moveEvent.touches.length > 0
					? moveEvent.touches[0].clientY
					: (moveEvent as MouseEvent).clientY;

			if (rafId !== null) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				if (!containerRef) return;
				const rect = containerRef.getBoundingClientRect();
				let newPercent: number;

				if (direction === 'horizontal') {
					newPercent = ((clientX - rect.left) / rect.width) * 100;
				} else {
					newPercent = ((clientY - rect.top) / rect.height) * 100;
				}

				saveSize(newPercent);
			});
		}

		function onEnd() {
			isDragging = false;
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onEnd);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onEnd);
		}

		window.addEventListener('mousemove', onMove, { passive: true });
		window.addEventListener('mouseup', onEnd);
		window.addEventListener('touchmove', onMove, { passive: true });
		window.addEventListener('touchend', onEnd);
	}

	function handleKeydown(e: KeyboardEvent) {
		const step = 5;
		if (direction === 'horizontal') {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				saveSize(currentSize - step);
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				saveSize(currentSize + step);
			}
		} else {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				saveSize(currentSize - step);
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				saveSize(currentSize + step);
			}
		}

		if (e.key === 'Home') {
			e.preventDefault();
			saveSize(minSize);
		} else if (e.key === 'End') {
			e.preventDefault();
			saveSize(maxSize);
		}
	}
</script>

<div
	bind:this={containerRef}
	class="{slots.root()} {className}"
	style="user-select: {isDragging ? 'none' : 'auto'};"
>
	<!-- First Panel -->
	<div class="overflow-auto transition-[flex-basis]" style="flex: 0 0 {currentSize}%;">
		{#if first}
			{@render first()}
		{/if}
	</div>

	<!-- Splitter Handle -->
	<button
		type="button"
		class={slots.handle()}
		onmousedown={startDrag}
		ontouchstart={startDrag}
		onkeydown={handleKeydown}
		ondblclick={() => saveSize(defaultSize)}
		aria-label="Resize panel divider"
	>
		{#if handle}
			{@render handle()}
		{:else}
			<div class={slots.grip()}></div>
		{/if}
	</button>

	<!-- Second Panel -->
	<div class="flex-1 overflow-auto">
		{#if second}
			{@render second()}
		{/if}
	</div>
</div>
