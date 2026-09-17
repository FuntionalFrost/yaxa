<script lang="ts">
	import type { SiteConfig } from '$lib/site/config';
	import { useYaxa } from '$lib/site/context';

	interface Props {
		title?: string;
		description?: string;
		badge?: string;
		theme?: 'dark' | 'light';
		config?: SiteConfig;
		class?: string;
	}

	let {
		title,
		description,
		badge,
		theme = 'dark',
		config,
		class: className = ''
	}: Props = $props();

	const yaxa = useYaxa();
	let currentConfig = $derived(config || yaxa.config);

	let ogUrl = $derived.by(() => {
		const pairs: string[] = [];
		if (title) pairs.push(`title=${encodeURIComponent(title)}`);
		if (description) pairs.push(`description=${encodeURIComponent(description)}`);
		if (badge) pairs.push(`badge=${encodeURIComponent(badge)}`);
		if (theme) pairs.push(`theme=${encodeURIComponent(theme)}`);
		if (currentConfig.name) pairs.push(`site=${encodeURIComponent(currentConfig.name)}`);
		return `/api/og?${pairs.join('&')}`;
	});
</script>

<div
	class="relative overflow-hidden rounded-xl border border-neutral-200 shadow-xl dark:border-neutral-800 {className}"
>
	<div
		class="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
	>
		<span class="flex items-center gap-1.5">
			<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
			Live OpenGraph Preview (1200 × 630)
		</span>
		<a
			href={ogUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="font-mono underline hover:text-primary-500"
		>
			Open SVG ↗
		</a>
	</div>
	<img
		src={ogUrl}
		alt="Open Graph preview for {title || currentConfig.title}"
		class="aspect-[1200/630] h-auto w-full bg-neutral-950 object-cover"
		loading="lazy"
	/>
</div>
