<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import Icon from '$lib/components/elements/Icon.svelte';

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	let headings = $state<TocItem[]>([]);
	let activeId = $state<string>('');

	function scanHeadings() {
		if (!browser) return;
		const main = document.querySelector('main');
		if (!main) return;

		const elements = main.querySelectorAll('h2, h3');
		const items: TocItem[] = [];

		elements.forEach((el, index) => {
			if (!el.id) {
				el.id =
					el.textContent
						?.toLowerCase()
						.trim()
						.replace(/[^\w\s-]/g, '')
						.replace(/\s+/g, '-') || `heading-${index}`;
			}

			items.push({
				id: el.id,
				text: el.textContent?.replace(/#/g, '').trim() || '',
				level: el.tagName === 'H2' ? 2 : 3
			});
		});

		headings = items;
	}

	$effect(() => {
		// Re-scan when pathname changes
		void page.url.pathname;
		setTimeout(() => {
			scanHeadings();
		}, 100);
	});

	$effect(() => {
		if (!browser || headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				});
			},
			{
				rootMargin: '-80px 0% -60% 0%',
				threshold: 0
			}
		);

		headings.forEach((h) => {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	});

	function scrollToHeading(id: string) {
		const el = document.getElementById(id);
		if (el) {
			const yOffset = -90;
			const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: 'smooth' });
			activeId = id;
		}
	}
</script>

{#if headings.length > 1}
	<div class="space-y-4 text-xs">
		<div
			class="flex items-center gap-1.5 font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
		>
			<Icon name="list" class="h-3.5 w-3.5" />
			<span>On this page</span>
		</div>

		<nav class="space-y-1">
			{#each headings as heading}
				{@const active = activeId === heading.id}
				<button
					type="button"
					onclick={() => scrollToHeading(heading.id)}
					class="block w-full truncate text-left transition-colors {heading.level === 3
						? 'pl-3 text-[11px]'
						: 'font-medium'} {active
						? 'font-semibold text-primary-600 dark:text-primary-400'
						: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}"
				>
					{heading.text}
				</button>
			{/each}
		</nav>

		<!-- GitHub and Feedback Community links -->
		<div class="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
			<a
				href="https://github.com/FuntionalFrost/yaxa"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
			>
				<Icon name="github" class="h-3.5 w-3.5" />
				<span>Edit page on GitHub</span>
			</a>
			<a
				href="https://github.com/FuntionalFrost/yaxa/issues"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
			>
				<Icon name="help-circle" class="h-3.5 w-3.5" />
				<span>Report an issue</span>
			</a>
		</div>
	</div>
{/if}
