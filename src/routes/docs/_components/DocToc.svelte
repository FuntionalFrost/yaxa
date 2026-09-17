<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import Icon from '$lib/components/elements/Icon.svelte';

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	let headings = $state<TocItem[]>([]);
	let activeId = $state<string>('');

	const repoBaseUrl = 'https://github.com/FuntionalFrost/yaxa';

	let editUrl = $derived.by(() => {
		const pathname = page.url.pathname;
		const slug = pathname.replace(/^\/docs\/?/, '').replace(/\/$/, '');
		if (!slug || slug === 'intro') {
			return `${repoBaseUrl}/blob/main/src/routes/docs/_sections/DocIntro.svelte`;
		}
		const normalized = slug.replace(/^comp-/, '').replace(/-suite$/, '');
		const pascal = normalized
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('');
		return `${repoBaseUrl}/blob/main/src/routes/docs/_sections/Doc${pascal}.svelte`;
	});

	let issueUrl = $derived.by(() => {
		const pathname = page.url.pathname;
		return `${repoBaseUrl}/issues/new?title=${encodeURIComponent(`[Docs] Feedback on ${pathname}`)}&labels=documentation`;
	});

	function scanHeadings() {
		if (!browser) return;
		const main = document.querySelector('main');
		if (!main) return;

		const elements = main.querySelectorAll('h2, h3');
		const items: TocItem[] = [];
		const seenIds = new SvelteSet<string>();

		elements.forEach((el, index) => {
			const text = el.textContent?.replace(/#/g, '').trim() || '';
			if (!text) return;

			let id = el.id;
			if (!id) {
				id =
					text
						.toLowerCase()
						.replace(/[^\w\s-]/g, '')
						.trim()
						.replace(/\s+/g, '-') || `heading-${index}`;
				el.id = id;
			}

			if (!seenIds.has(id)) {
				seenIds.add(id);
				items.push({
					id,
					text,
					level: el.tagName === 'H2' ? 2 : 3
				});
			}
		});

		headings = items;
	}

	$effect(() => {
		// Track pathname changes
		void page.url.pathname;
		if (!browser) return;

		scanHeadings();

		// Check multiple frames in case async dynamic components hydrate
		const t1 = setTimeout(scanHeadings, 50);
		const t2 = setTimeout(scanHeadings, 200);

		const main = document.querySelector('main');
		let observer: MutationObserver | null = null;
		if (main) {
			observer = new MutationObserver(() => {
				scanHeadings();
			});
			observer.observe(main, { childList: true, subtree: true });
		}

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			if (observer) observer.disconnect();
		};
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

<div class="space-y-4 text-xs">
	{#if headings.length > 0}
		<div
			class="flex items-center gap-1.5 font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
		>
			<Icon name="list" class="h-3.5 w-3.5" />
			<span>On this page</span>
		</div>

		<nav class="space-y-1">
			{#each headings as heading (heading.id)}
				{@const active = activeId === heading.id}
				<button
					type="button"
					onclick={() => scrollToHeading(heading.id)}
					class="block w-full truncate text-left transition-colors {heading.level === 3
						? 'pl-3 text-[11px]'
						: 'font-medium'} {active
						? 'font-semibold text-primary-600 dark:text-primary-400'
						: 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}"
					title={heading.text}
				>
					{heading.text}
				</button>
			{/each}
		</nav>
	{/if}

	<!-- GitHub and Community Feedback Links -->
	<div
		class="space-y-2 {headings.length > 0
			? 'border-t border-zinc-200 pt-4 dark:border-zinc-800'
			: ''}"
	>
		<a
			href={editUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-1.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
		>
			<Icon name="github" class="h-3.5 w-3.5" />
			<span>Edit page on GitHub</span>
		</a>
		<a
			href={issueUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-1.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
		>
			<Icon name="help-circle" class="h-3.5 w-3.5" />
			<span>Report an issue</span>
		</a>
	</div>
</div>
