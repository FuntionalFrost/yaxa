<script module lang="ts">
	import { tv, type VariantProps } from '$lib/utils/cn';

	export const passkeyUiVariants = tv({
		base: 'w-full'
	});

	export type PasskeyUiProps = VariantProps<typeof passkeyUiVariants> & {
		mode?: 'trigger' | 'card' | 'manage';
		title?: string;
		description?: string;
		class?: string;
		onsuccess?: () => void;
		onerror?: (err: string) => void;
	};
</script>

<script lang="ts">
	import Button from '../elements/Button.svelte';
	import Card from '../layout/Card.svelte';
	import Icon from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import Alert from '../overlays/Alert.svelte';
	import Modal from '../overlays/Modal.svelte';
	import Input from '../forms/Input.svelte';
	import FormField from '../forms/FormField.svelte';
	import { useAuth, type PasskeyInfo } from '../../composables/useAuth.svelte';

	let {
		mode = 'trigger',
		title = 'Passkeys & Biometrics',
		description = 'Sign in securely using FaceID, TouchID, Windows Hello, or a security key.',
		class: className = '',
		onsuccess,
		onerror
	}: PasskeyUiProps = $props();

	const auth = useAuth();

	let passkeys = $state<PasskeyInfo[]>([]);
	let isLoadingKeys = $state(false);
	let isAddingPasskey = $state(false);
	let newPasskeyName = $state('');
	let showAddModal = $state(false);
	let localError = $state<string | null>(null);

	async function loadPasskeys() {
		if (mode === 'trigger') return;
		isLoadingKeys = true;
		try {
			passkeys = await auth.listPasskeys();
		} finally {
			isLoadingKeys = false;
		}
	}

	$effect(() => {
		if (mode !== 'trigger') {
			loadPasskeys();
		}
	});

	async function handlePasskeySignIn() {
		localError = null;
		const ok = await auth.signInWithPasskey();
		if (ok) {
			onsuccess?.();
		} else {
			localError = auth.error || 'Biometric authentication failed';
			onerror?.(localError);
		}
	}

	async function handleAddPasskey(e: SubmitEvent) {
		e.preventDefault();
		localError = null;
		isAddingPasskey = true;
		try {
			const ok = await auth.addPasskey(newPasskeyName || 'Biometric Key');
			if (ok) {
				showAddModal = false;
				newPasskeyName = '';
				await loadPasskeys();
				onsuccess?.();
			} else {
				localError = auth.error || 'Failed to register passkey';
				onerror?.(localError);
			}
		} finally {
			isAddingPasskey = false;
		}
	}

	async function handleDelete(id: string) {
		localError = null;
		const ok = await auth.deletePasskey(id);
		if (ok) {
			await loadPasskeys();
		} else {
			localError = auth.error || 'Could not delete passkey';
			onerror?.(localError);
		}
	}
</script>

{#if mode === 'trigger'}
	<Button
		variant="outline"
		class="w-full justify-center gap-2.5 border-neutral-300 font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 {className}"
		loading={auth.isLoading}
		onclick={handlePasskeySignIn}
	>
		<Icon name="fingerprint" size="sm" class="text-primary-600 dark:text-primary-400" />
		<span>Sign in with Passkey / FaceID</span>
	</Button>
{:else}
	<Card class="w-full space-y-5 border-neutral-200 p-6 dark:border-neutral-800 {className}">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<Icon name="fingerprint" size="md" class="text-primary-600 dark:text-primary-400" />
					<h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
				</div>
				<p class="max-w-md text-xs text-neutral-500 dark:text-neutral-400">
					{description}
				</p>
			</div>

			<Button
				variant="solid"
				color="primary"
				size="sm"
				class="gap-1.5"
				onclick={() => {
					localError = null;
					showAddModal = true;
				}}
			>
				<Icon name="plus" size="xs" />
				Register Passkey
			</Button>
		</div>

		{#if localError || auth.error}
			<Alert color="error" title="Passkey Error" description={localError || auth.error || ''} />
		{/if}

		<!-- Passkeys List -->
		<div
			class="divide-y divide-neutral-200 rounded-xl border border-neutral-200/80 bg-neutral-50/50 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/40"
		>
			{#if isLoadingKeys}
				<div class="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
					Loading registered devices...
				</div>
			{:else if passkeys.length === 0}
				<div class="flex flex-col items-center justify-center p-8 text-center">
					<Icon name="key" size="lg" class="mb-2 text-neutral-400 opacity-50" />
					<p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
						No passkeys configured
					</p>
					<p class="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
						Add FaceID, TouchID, or a hardware key for instantaneous passwordless access.
					</p>
				</div>
			{:else}
				{#each passkeys as key (key.id)}
					<div class="flex items-center justify-between p-3.5 px-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100/60 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
							>
								<Icon name="fingerprint" size="sm" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
										{key.name || 'Biometric Credential'}
									</span>
									{#if key.deviceType}
										<Badge size="xs" variant="subtle" color="neutral">
											{key.deviceType}
										</Badge>
									{/if}
								</div>
								<div class="text-[11px] text-neutral-500 dark:text-neutral-400">
									Added {new Date(key.createdAt).toLocaleDateString()}
								</div>
							</div>
						</div>

						<Button
							variant="ghost"
							size="xs"
							color="neutral"
							class="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400"
							onclick={() => handleDelete(key.id)}
							aria-label="Delete passkey"
						>
							<Icon name="trash" size="xs" />
						</Button>
					</div>
				{/each}
			{/if}
		</div>
	</Card>

	<!-- Add Passkey Modal -->
	<Modal bind:open={showAddModal} title="Register New Passkey">
		<form onsubmit={handleAddPasskey} class="space-y-4 py-2">
			<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
				Your browser will prompt you to verify your biometric identity (FaceID, TouchID, or Windows
				Hello) or insert your hardware security key.
			</p>

			<FormField label="Passkey Nickname" hint="e.g. MacBook Pro TouchID">
				<Input
					type="text"
					placeholder="My MacBook Fingerprint"
					bind:value={newPasskeyName}
					required
				/>
			</FormField>

			<div class="flex justify-end gap-2 pt-2">
				<Button type="button" variant="ghost" size="sm" onclick={() => (showAddModal = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="solid" color="primary" size="sm" loading={isAddingPasskey}>
					Continue with Biometrics
				</Button>
			</div>
		</form>
	</Modal>
{/if}
