<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import YaxaApp from '$lib/components/layout/YaxaApp.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import CommandPalette, {
		type CommandItem
	} from '$lib/components/navigation/CommandPalette.svelte';
	import { DOC_NAV_GROUPS } from './docs/_data/docs-nav';
	import { siteConfig } from '../site.config';

	let { children } = $props();

	let commandOpen = $state(false);

	const commandItems: CommandItem[] = DOC_NAV_GROUPS.flatMap((group) =>
		group.items.map((item) => ({
			id: item.id,
			label: item.label,
			description: item.description,
			group: group.title,
			href: item.href,
			onSelect: () => {
				goto(item.href);
			}
		}))
	);
</script>

<YaxaApp config={siteConfig}>
	<Header config={siteConfig} onOpenCommand={() => (commandOpen = true)} />
	<div class="flex-1">
		{@render children()}
	</div>
	<Footer config={siteConfig} />
	<CommandPalette bind:open={commandOpen} items={commandItems} />
</YaxaApp>
