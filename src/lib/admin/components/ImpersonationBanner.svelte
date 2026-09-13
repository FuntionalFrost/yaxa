<script lang="ts">
	import Button from '../../components/elements/Button.svelte';
	import Icon from '../../components/elements/Icon.svelte';

	interface Props {
		impersonatedUser?: { name?: string | null; email?: string | null; id?: string } | null;
		onstop?: () => void | Promise<void>;
		stopUrl?: string;
		class?: string;
	}

	let {
		impersonatedUser,
		onstop,
		stopUrl = '/api/admin/impersonate/stop',
		class: className = ''
	}: Props = $props();

	let isStopping = $state(false);

	async function handleStop() {
		if (onstop) {
			isStopping = true;
			try {
				await onstop();
			} finally {
				isStopping = false;
			}
			return;
		}

		if (typeof window !== 'undefined') {
			isStopping = true;
			try {
				await fetch(stopUrl, { method: 'POST' });
				window.location.reload();
			} catch (err) {
				console.error('Failed to exit impersonation', err);
			} finally {
				isStopping = false;
			}
		}
	}
</script>

{#if impersonatedUser}
	<div
		class="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-500/90 px-4 py-2 text-xs font-medium text-amber-950 shadow-xs backdrop-blur-md dark:border-amber-600/50 dark:bg-amber-600/90 dark:text-amber-50 {className}"
	>
		<div class="flex items-center gap-2">
			<Icon name="alert" class="h-4 w-4 shrink-0 text-amber-950 dark:text-amber-100" />
			<span>
				You are currently impersonating <strong
					>{impersonatedUser.name || impersonatedUser.email || impersonatedUser.id}</strong
				>.
			</span>
		</div>

		<Button
			variant="solid"
			size="xs"
			color="neutral"
			loading={isStopping}
			onclick={handleStop}
			class="gap-1 border-none bg-amber-950 text-white hover:bg-amber-900 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-white"
		>
			<Icon name="cross" class="h-3 w-3" />
			<span>Exit Impersonation</span>
		</Button>
	</div>
{/if}
