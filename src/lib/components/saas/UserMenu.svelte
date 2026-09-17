<script lang="ts">
	import Avatar from '../elements/Avatar.svelte';
	import Badge from '../elements/Badge.svelte';
	import Icon from '../elements/Icon.svelte';
	import DropdownMenu, { type MenuItem } from '../navigation/DropdownMenu.svelte';
	import { useYaxa, type AuthUserContext } from '../../site/context';

	interface Props {
		user?: AuthUserContext | null;
		tier?: string;
		dashboardUrl?: string;
		settingsUrl?: string;
		billingUrl?: string;
		class?: string;
		onsignout?: () => void | Promise<void>;
	}

	let {
		user: propUser,
		tier = 'Free',
		dashboardUrl = '/dashboard',
		settingsUrl = '/settings',
		billingUrl = '/billing',
		class: className = '',
		onsignout
	}: Props = $props();

	const yaxa = useYaxa();

	const currentUser = $derived(
		propUser !== undefined
			? propUser
			: yaxa.user || {
					name: 'Solo Developer',
					email: 'dev@yaxa.dev',
					image: null,
					tier
				}
	);

	const initials = $derived.by(() => {
		const name = currentUser?.name || currentUser?.email || 'U';
		return name
			.split(' ')
			.map((n: string) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	});

	const menuItems: MenuItem[] = $derived([
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'home',
			onSelect: () => {
				if (typeof window !== 'undefined') window.location.href = dashboardUrl;
			}
		},
		{
			id: 'settings',
			label: 'Settings',
			icon: 'settings',
			onSelect: () => {
				if (typeof window !== 'undefined') window.location.href = settingsUrl;
			}
		},
		{
			id: 'billing',
			label: 'Billing & Plan',
			icon: 'credit-card',
			onSelect: () => {
				if (typeof window !== 'undefined') window.location.href = billingUrl;
			}
		},
		{
			id: 'sep',
			label: '',
			separator: true
		},
		{
			id: 'logout',
			label: 'Sign Out',
			icon: 'log-out',
			destructive: true,
			onSelect: async () => {
				if (onsignout) {
					await onsignout();
				} else if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}
		}
	]);
</script>

{#snippet customTrigger()}
	<button
		type="button"
		class="group flex items-center gap-3 rounded-full p-1 transition-all hover:bg-zinc-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-zinc-800"
		aria-label="User navigation menu"
	>
		<Avatar
			src={currentUser?.image || undefined}
			alt={currentUser?.name || 'User'}
			fallback={initials}
			size="sm"
			class="border border-zinc-200 shadow-xs dark:border-zinc-700"
		/>
		<div class="hidden text-left sm:block">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
					{currentUser?.name || 'User'}
				</span>
				<Badge color="primary" variant="subtle" size="xs">
					{tier.toUpperCase()}
				</Badge>
			</div>
			<span class="block max-w-[140px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
				{currentUser?.email || ''}
			</span>
		</div>
		<Icon
			name="chevron-down"
			class="hidden h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:text-zinc-600 sm:block dark:group-hover:text-zinc-200"
		/>
	</button>
{/snippet}

<div class="relative inline-flex items-center {className}">
	<DropdownMenu items={menuItems} trigger={customTrigger} />
</div>
