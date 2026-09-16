<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export interface OrgItem {
		id: string;
		name: string;
		avatar?: string;
		plan?: string;
		role?: 'Owner' | 'Admin' | 'Member' | string;
	}

	export const orgSwitcherVariants = tv({
		base: 'inline-flex'
	});

	export type OrgSwitcherProps = VariantProps<typeof orgSwitcherVariants> & {
		organizations?: OrgItem[];
		currentOrgId?: string;
		onselect?: (org: OrgItem) => void;
		oncreate?: () => void;
		createLabel?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import Avatar from '../elements/Avatar.svelte';

	let {
		organizations = [],
		currentOrgId = $bindable(''),
		onselect,
		oncreate,
		createLabel = 'Create new organization',
		class: className = ''
	}: OrgSwitcherProps = $props();

	let open = $state(false);

	let currentOrg = $derived(
		organizations.find((org) => org.id === currentOrgId) || organizations[0]
	);

	function selectOrg(org: OrgItem) {
		currentOrgId = org.id;
		open = false;
		onselect?.(org);
	}

	function handleCreate() {
		open = false;
		oncreate?.();
	}
</script>

<div class={orgSwitcherVariants({ class: className })}>
	<Popover.Root bind:open>
		<Popover.Trigger
			class="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs shadow-xs transition-colors hover:bg-neutral-50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
			aria-label="Select organization"
		>
			{#if currentOrg}
				<!-- Org Avatar / Initials -->
				<Avatar alt={currentOrg.name} src={currentOrg.avatar} size="xs" />

				<div class="flex flex-col truncate">
					<span class="truncate font-semibold text-neutral-900 dark:text-white">
						{currentOrg.name}
					</span>
				</div>

				{#if currentOrg.role}
					<Badge size="xs" variant="subtle" color="primary" class="ml-auto">
						{currentOrg.role}
					</Badge>
				{/if}
			{:else}
				<span class="text-neutral-400">Select Team...</span>
			{/if}

			<Icon
				name="chevron-down"
				size="xs"
				class="text-neutral-400 transition-transform duration-200 {open ? 'rotate-180' : ''}"
			/>
		</Popover.Trigger>

		<Popover.Portal>
			<Popover.Content
				sideOffset={6}
				align="start"
				class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div
					class="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase"
				>
					Organizations
				</div>

				<div class="space-y-0.5">
					{#each organizations as org (org.id)}
						{@const isSelected = org.id === currentOrg?.id}

						<button
							type="button"
							onclick={() => selectOrg(org)}
							class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors {isSelected
								? 'bg-primary-50 font-semibold text-primary-900 dark:bg-primary-950/60 dark:text-primary-100'
								: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'}"
						>
							<div class="flex items-center gap-2 overflow-hidden">
								<Avatar alt={org.name} src={org.avatar} size="xs" />
								<span class="truncate">{org.name}</span>
							</div>

							<div class="flex shrink-0 items-center gap-1.5">
								{#if org.plan}
									<span class="text-[10px] text-neutral-400">{org.plan}</span>
								{/if}
								{#if isSelected}
									<Icon name="check" size="xs" class="text-primary-600 dark:text-primary-400" />
								{/if}
							</div>
						</button>
					{/each}
				</div>

				{#if oncreate}
					<div class="mt-1 border-t border-neutral-100 pt-1 dark:border-neutral-800">
						<button
							type="button"
							onclick={handleCreate}
							class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/50"
						>
							<Icon name="lightning" size="xs" />
							<span>{createLabel}</span>
						</button>
					</div>
				{/if}
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
</div>
