<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';
	import type { IconSource } from '../elements/Icon.svelte';

	export interface NotificationItem {
		id: string;
		title: string;
		description?: string;
		timestamp?: string;
		read?: boolean;
		icon?: IconSource;
		href?: string;
	}

	export const notificationCenterVariants = tv({
		base: 'inline-flex'
	});

	export type NotificationCenterProps = VariantProps<typeof notificationCenterVariants> & {
		notifications?: NotificationItem[];
		unreadCount?: number;
		onmarkallread?: () => void;
		onselect?: (notification: NotificationItem) => void;
		class?: string;
	};
</script>

<script lang="ts">
	import { Popover } from 'bits-ui';
	import Icon from '../elements/Icon.svelte';
	import Chip from '../elements/Chip.svelte';

	let {
		notifications = [],
		unreadCount,
		onmarkallread,
		onselect,
		class: className = ''
	}: NotificationCenterProps = $props();

	let open = $state(false);

	let calculatedUnread = $derived(
		unreadCount !== undefined ? unreadCount : notifications.filter((n) => !n.read).length
	);

	function handleItemClick(notif: NotificationItem) {
		open = false;
		onselect?.(notif);
	}

	function handleMarkAllRead() {
		onmarkallread?.();
	}
</script>

<div class={notificationCenterVariants({ class: className })}>
	<Popover.Root bind:open>
		<Popover.Trigger
			class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-xs transition-colors hover:bg-neutral-50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
			aria-label="Notifications"
		>
			<Icon name="bell" size="sm" />
			{#if calculatedUnread > 0}
				<Chip
					text={calculatedUnread > 99 ? '99+' : calculatedUnread}
					color="error"
					size="xs"
					position="top-right"
				/>
			{/if}
		</Popover.Trigger>

		<Popover.Portal>
			<Popover.Content
				sideOffset={6}
				align="end"
				class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
			>
				<!-- Header -->
				<div
					class="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800"
				>
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold text-neutral-900 dark:text-white"> Notifications </span>
						{#if calculatedUnread > 0}
							<span
								class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
							>
								{calculatedUnread} unread
							</span>
						{/if}
					</div>

					{#if onmarkallread && calculatedUnread > 0}
						<button
							type="button"
							onclick={handleMarkAllRead}
							class="text-[11px] font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
						>
							Mark all read
						</button>
					{/if}
				</div>

				<!-- Notifications List -->
				<div
					class="max-h-80 divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800/60"
				>
					{#if notifications.length === 0}
						<div class="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
							<Icon
								name="bell"
								size="md"
								class="mx-auto mb-2 text-neutral-300 dark:text-neutral-600"
							/>
							No notifications at this time
						</div>
					{:else}
						{#each notifications as notif (notif.id)}
							<button
								type="button"
								onclick={() => handleItemClick(notif)}
								class="flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 {!notif.read
									? 'bg-primary-50/40 dark:bg-primary-950/20'
									: ''}"
							>
								<div
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
								>
									<Icon name={notif.icon || 'bell'} size="xs" />
								</div>

								<div class="min-w-0 flex-1">
									<div class="flex items-center justify-between gap-1">
										<span
											class="truncate text-xs font-semibold text-neutral-900 dark:text-white {!notif.read
												? 'font-bold'
												: ''}"
										>
											{notif.title}
										</span>
										{#if notif.timestamp}
											<time class="shrink-0 text-[10px] text-neutral-400">
												{notif.timestamp}
											</time>
										{/if}
									</div>

									{#if notif.description}
										<p class="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
											{notif.description}
										</p>
									{/if}
								</div>
							</button>
						{/each}
					{/if}
				</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
</div>
