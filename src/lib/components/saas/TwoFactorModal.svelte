<script lang="ts">
	import Modal from '../overlays/Modal.svelte';
	import Button from '../elements/Button.svelte';
	import Input from '../forms/Input.svelte';
	import FormField from '../forms/FormField.svelte';
	import InputOTP from '../forms/InputOTP.svelte';
	import Alert from '../overlays/Alert.svelte';
	import Icon from '../elements/Icon.svelte';
	import { useAuth } from '../../composables/useAuth.svelte';
	import { useClipboard } from '../../composables/useClipboard.svelte';

	interface Props {
		open?: boolean;
		class?: string;
		onclose?: () => void;
		onsuccess?: () => void;
	}

	let { open = $bindable(false), class: className = '', onclose, onsuccess }: Props = $props();

	const auth = useAuth();
	const clipboard = useClipboard();

	let step = $state<1 | 2 | 3>(1); // 1: password confirmation, 2: scan QR & enter code, 3: recovery codes
	let currentPassword = $state('');
	let totpCode = $state('');
	let totpURI = $state('');
	let backupCodes = $state<string[]>([]);
	let localError = $state<string | null>(null);
	let isProcessing = $state(false);

	let qrCodeUrl = $derived(
		totpURI
			? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpURI)}`
			: ''
	);

	let secretKey = $derived.by(() => {
		if (!totpURI) return '';
		try {
			const parsed = new URL(totpURI);
			return parsed.searchParams.get('secret') || '';
		} catch {
			return '';
		}
	});

	function handleModalClose() {
		open = false;
		step = 1;
		currentPassword = '';
		totpCode = '';
		localError = null;
		onclose?.();
	}

	async function handleStep1Password(e: SubmitEvent) {
		e.preventDefault();
		localError = null;
		isProcessing = true;
		try {
			const res = await auth.enable2FA(currentPassword);
			if (res) {
				totpURI = res.totpURI;
				backupCodes = res.backupCodes || [];
				step = 2;
			} else {
				localError = auth.error || 'Incorrect password. Please try again.';
			}
		} finally {
			isProcessing = false;
		}
	}

	async function handleVerifyOTP(code: string) {
		localError = null;
		isProcessing = true;
		try {
			const ok = await auth.verify2FA(code);
			if (ok) {
				step = 3;
				onsuccess?.();
			} else {
				localError = auth.error || 'Invalid 6-digit code. Please verify and retry.';
			}
		} finally {
			isProcessing = false;
		}
	}

	function downloadBackupCodes() {
		const content =
			`Yaxa Two-Factor Authentication (2FA) Backup Codes\nGenerated: ${new Date().toISOString()}\n\n` +
			backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
			'\n\nKeep these codes in a secure password manager or physical vault.';
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'yaxa-2fa-backup-codes.txt';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<Modal
	bind:open
	title={step === 3 ? '2FA Enabled Successfully!' : 'Setup Two-Factor Authentication (2FA)'}
	class="max-w-md {className}"
>
	{#if localError || auth.error}
		<div class="mb-4">
			<Alert color="error" title="Error" description={localError || auth.error || ''} />
		</div>
	{/if}

	<!-- Step 1: Confirm Password -->
	{#if step === 1}
		<form onsubmit={handleStep1Password} class="space-y-4">
			<p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
				To start setting up an authenticator app (such as Google Authenticator, 1Password, or Apple
				Passwords), please confirm your current account password.
			</p>

			<FormField label="Current Password" required>
				<Input
					type="password"
					placeholder="••••••••"
					bind:value={currentPassword}
					required
					autofocus
				/>
			</FormField>

			<div class="flex justify-end gap-2 pt-2">
				<Button type="button" variant="ghost" size="sm" onclick={handleModalClose}>Cancel</Button>
				<Button type="submit" variant="solid" color="primary" size="sm" loading={isProcessing}>
					Continue
				</Button>
			</div>
		</form>

		<!-- Step 2: Scan QR Code & Enter Verification Code -->
	{:else if step === 2}
		<div class="space-y-5">
			<p class="text-xs text-neutral-600 dark:text-neutral-400">
				Scan the QR code below with your authenticator app, or copy the setup key manually:
			</p>

			<!-- QR Code Box -->
			<div
				class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800"
			>
				{#if qrCodeUrl}
					<img src={qrCodeUrl} alt="2FA TOTP QR Code" class="h-44 w-44 rounded-lg object-contain" />
				{/if}

				{#if secretKey}
					<div class="mt-3 flex max-w-full items-center gap-2">
						<code
							class="truncate rounded bg-neutral-100 px-2 py-1 font-mono text-[11px] text-neutral-800 select-all dark:bg-neutral-800 dark:text-neutral-200"
						>
							{secretKey}
						</code>
						<Button
							variant="ghost"
							size="xs"
							onclick={() => clipboard.copy(secretKey)}
							aria-label="Copy secret key"
						>
							<Icon name={clipboard.copied ? 'check' : 'copy'} size="xs" />
						</Button>
					</div>
				{/if}
			</div>

			<!-- Input OTP -->
			<div class="space-y-2">
				<p class="block text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
					Enter the 6-digit code from your authenticator app:
				</p>
				<div class="flex justify-center">
					<InputOTP length={6} bind:value={totpCode} autofocus oncomplete={handleVerifyOTP} />
				</div>
			</div>

			<div class="flex items-center justify-between pt-2">
				<Button type="button" variant="ghost" size="sm" onclick={() => (step = 1)}>← Back</Button>
				<Button
					type="button"
					variant="solid"
					color="primary"
					size="sm"
					loading={isProcessing}
					disabled={totpCode.length !== 6}
					onclick={() => handleVerifyOTP(totpCode)}
				>
					Verify & Activate
				</Button>
			</div>
		</div>

		<!-- Step 3: Emergency Backup Codes -->
	{:else if step === 3}
		<div class="space-y-4">
			<div
				class="rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-center dark:bg-emerald-950/20"
			>
				<Icon name="check" size="md" class="mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
				<h4 class="text-xs font-bold text-neutral-900 dark:text-white">
					Two-Factor Authentication is Active
				</h4>
				<p class="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400">
					Save these one-time recovery codes in a safe place. You will need them if you lose access
					to your authenticator app.
				</p>
			</div>

			<!-- Backup Codes Grid -->
			<div
				class="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center font-mono text-xs select-all dark:border-neutral-800 dark:bg-neutral-900/80"
			>
				{#each backupCodes as code}
					<span
						class="rounded border border-neutral-200/60 bg-white p-1.5 font-semibold tracking-wider text-neutral-800 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-200"
					>
						{code}
					</span>
				{/each}
			</div>

			<div class="flex flex-wrap items-center justify-between gap-2 pt-2">
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="xs"
						class="gap-1"
						onclick={() => clipboard.copy(backupCodes.join('\n'))}
					>
						<Icon name={clipboard.copied ? 'check' : 'copy'} size="xs" />
						{clipboard.copied ? 'Copied!' : 'Copy All'}
					</Button>
					<Button variant="outline" size="xs" class="gap-1" onclick={downloadBackupCodes}>
						<Icon name="download" size="xs" />
						Download .txt
					</Button>
				</div>

				<Button variant="solid" color="primary" size="sm" onclick={handleModalClose}>Done</Button>
			</div>
		</div>
	{/if}
</Modal>
