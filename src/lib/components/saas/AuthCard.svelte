<script lang="ts">
	import Card from '../layout/Card.svelte';
	import Button from '../elements/Button.svelte';
	import Input from '../forms/Input.svelte';
	import FormField from '../forms/FormField.svelte';
	import InputOTP from '../forms/InputOTP.svelte';
	import Divider from '../layout/Divider.svelte';
	import Alert from '../overlays/Alert.svelte';
	import Icon from '../elements/Icon.svelte';
	import { useAuth, type SocialProvider } from '../../composables/useAuth.svelte';

	export type AuthCardMode =
		| 'signin'
		| 'signup'
		| 'magic-link'
		| 'forgot-password'
		| 'reset-password'
		| '2fa-verify'
		| 'email-change';

	interface Props {
		title?: string;
		subtitle?: string;
		mode?: AuthCardMode;
		providers?: SocialProvider[];
		showSocial?: boolean;
		showPasskey?: boolean;
		showMagicLinkToggle?: boolean;
		showForgotPassword?: boolean;
		resetToken?: string;
		callbackURL?: string;
		class?: string;
		onsuccess?: () => void;
		onerror?: (err: string) => void;
	}

	let {
		title,
		subtitle,
		mode = 'signin',
		providers = ['github', 'google'],
		showSocial = true,
		showPasskey = true,
		showMagicLinkToggle = true,
		showForgotPassword = true,
		resetToken = '',
		callbackURL = '/dashboard',
		class: className = '',
		onsuccess,
		onerror
	}: Props = $props();

	const auth = useAuth();

	let customMode = $state<AuthCardMode | null>(null);
	let currentMode = $derived(customMode ?? mode);

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let totpCode = $state('');
	let newEmail = $state('');
	let useBackupCode = $state(false);

	let localError = $state<string | null>(null);
	let magicLinkSent = $state(false);
	let forgotPasswordSent = $state(false);
	let resetSuccess = $state(false);
	let emailChangeRequested = $state(false);

	async function handleSocial(provider: SocialProvider) {
		localError = null;
		await auth.signInWithSocial(provider);
	}

	async function handlePasskeyLogin() {
		localError = null;
		const ok = await auth.signInWithPasskey();
		if (ok) {
			onsuccess?.();
			if (typeof window !== 'undefined') window.location.href = callbackURL;
		} else {
			localError = auth.error || 'Biometric authentication was cancelled or failed';
			onerror?.(localError);
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		localError = null;

		if (currentMode === 'magic-link') {
			const ok = await auth.signInWithMagicLink(email);
			if (ok) {
				magicLinkSent = true;
				onsuccess?.();
			} else {
				localError = auth.error || 'Failed to send magic link';
				onerror?.(localError);
			}
			return;
		}

		if (currentMode === 'forgot-password') {
			const ok = await auth.forgetPassword(email);
			if (ok) {
				forgotPasswordSent = true;
				onsuccess?.();
			} else {
				localError = auth.error || 'Could not send password reset email';
				onerror?.(localError);
			}
			return;
		}

		if (currentMode === 'reset-password') {
			if (password !== confirmPassword) {
				localError = 'Passwords do not match';
				return;
			}
			const ok = await auth.resetPassword(password, resetToken);
			if (ok) {
				resetSuccess = true;
				onsuccess?.();
			} else {
				localError = auth.error || 'Could not reset password';
				onerror?.(localError);
			}
			return;
		}

		if (currentMode === 'email-change') {
			const ok = await auth.changeEmail(newEmail, callbackURL);
			if (ok) {
				emailChangeRequested = true;
				onsuccess?.();
			} else {
				localError = auth.error || 'Failed to request email change';
				onerror?.(localError);
			}
			return;
		}

		if (currentMode === '2fa-verify') {
			const ok = await auth.verify2FA(totpCode);
			if (ok) {
				onsuccess?.();
				if (typeof window !== 'undefined') window.location.href = callbackURL;
			} else {
				localError = auth.error || 'Invalid 2FA verification code';
				onerror?.(localError);
			}
			return;
		}

		if (currentMode === 'signup') {
			const ok = await auth.signUpWithEmail(email, password, name);
			if (ok) {
				onsuccess?.();
				if (typeof window !== 'undefined') window.location.href = callbackURL;
			} else {
				localError = auth.error || 'Could not create account';
				onerror?.(localError);
			}
			return;
		}

		// Sign In mode
		const ok = await auth.signInWithEmail(email, password);
		if (ok) {
			onsuccess?.();
			if (typeof window !== 'undefined') window.location.href = callbackURL;
		} else {
			localError = auth.error || 'Invalid email or password';
			onerror?.(localError);
		}
	}
</script>

<Card
	class="mx-auto w-full max-w-md space-y-6 border-zinc-200 p-6 shadow-xl sm:p-8 dark:border-zinc-800 {className}"
>
	<!-- Header -->
	<div class="space-y-1.5 text-center">
		<h2 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
			{#if title}
				{title}
			{:else if currentMode === 'signup'}
				Create an account
			{:else if currentMode === 'magic-link'}
				Sign in with Magic Link
			{:else if currentMode === 'forgot-password'}
				Reset your password
			{:else if currentMode === 'reset-password'}
				Set new password
			{:else if currentMode === '2fa-verify'}
				Two-Factor Verification
			{:else if currentMode === 'email-change'}
				Change Email Address
			{:else}
				Welcome back
			{/if}
		</h2>
		<p class="text-sm text-zinc-500 dark:text-zinc-400">
			{#if subtitle}
				{subtitle}
			{:else if currentMode === 'signup'}
				Start your 14-day free trial, no credit card required.
			{:else if currentMode === 'magic-link'}
				We will email you a passwordless sign-in link.
			{:else if currentMode === 'forgot-password'}
				Enter your email address and we'll send you a recovery link.
			{:else if currentMode === 'reset-password'}
				Please enter and confirm your new secure account password.
			{:else if currentMode === '2fa-verify'}
				Enter the code from your authenticator app to continue.
			{:else if currentMode === 'email-change'}
				Update your primary account email address.
			{:else}
				Sign in to access your dashboard and workspace.
			{/if}
		</p>
	</div>

	<!-- Error Alert -->
	{#if localError || auth.error}
		<Alert
			color="error"
			title="Authentication Error"
			description={localError || auth.error || ''}
		/>
	{/if}

	<!-- Magic Link Success State -->
	{#if magicLinkSent}
		<div
			class="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-center dark:bg-emerald-950/20"
		>
			<div class="flex justify-center text-emerald-600 dark:text-emerald-400">
				<Icon name="check" class="h-8 w-8" />
			</div>
			<h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Check your email</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">
				We've sent a magic link to <strong class="text-zinc-900 dark:text-zinc-100">{email}</strong
				>.
			</p>
			<Button
				variant="ghost"
				size="sm"
				class="mt-2 text-xs"
				onclick={() => {
					magicLinkSent = false;
				}}
			>
				Use a different method
			</Button>
		</div>

		<!-- Forgot Password Success State -->
	{:else if forgotPasswordSent}
		<div
			class="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-center dark:bg-emerald-950/20"
		>
			<div class="flex justify-center text-emerald-600 dark:text-emerald-400">
				<Icon name="check" class="h-8 w-8" />
			</div>
			<h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Recovery email sent</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">
				If an account exists for <strong class="text-zinc-900 dark:text-zinc-100">{email}</strong>,
				we've sent password reset instructions.
			</p>
			<Button
				variant="ghost"
				size="sm"
				class="mt-2 text-xs"
				onclick={() => {
					customMode = 'signin';
					forgotPasswordSent = false;
				}}
			>
				Back to sign in
			</Button>
		</div>

		<!-- Reset Password Success State -->
	{:else if resetSuccess}
		<div
			class="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-center dark:bg-emerald-950/20"
		>
			<div class="flex justify-center text-emerald-600 dark:text-emerald-400">
				<Icon name="check" class="h-8 w-8" />
			</div>
			<h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Password updated</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">
				Your password has been successfully reset. You may now sign in.
			</p>
			<Button
				variant="solid"
				color="primary"
				size="sm"
				class="mt-2"
				onclick={() => {
					customMode = 'signin';
					resetSuccess = false;
				}}
			>
				Sign In Now
			</Button>
		</div>

		<!-- Email Change Requested State -->
	{:else if emailChangeRequested}
		<div
			class="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-center dark:bg-emerald-950/20"
		>
			<div class="flex justify-center text-emerald-600 dark:text-emerald-400">
				<Icon name="check" class="h-8 w-8" />
			</div>
			<h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Confirmation link sent</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">
				We've sent a verification link to <strong class="text-zinc-900 dark:text-zinc-100"
					>{newEmail}</strong
				>.
			</p>
			<Button
				variant="ghost"
				size="sm"
				class="mt-2 text-xs"
				onclick={() => {
					emailChangeRequested = false;
				}}
			>
				Done
			</Button>
		</div>

		<!-- Active Auth Forms -->
	{:else}
		<!-- Passkey 1-Click Biometric Trigger (In signin mode) -->
		{#if currentMode === 'signin' && showPasskey}
			<Button
				variant="outline"
				class="w-full justify-center gap-2.5 border-neutral-300 font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
				loading={auth.isLoading}
				onclick={handlePasskeyLogin}
			>
				<Icon name="fingerprint" size="sm" class="text-primary-600 dark:text-primary-400" />
				<span>Sign in with Passkey / FaceID</span>
			</Button>

			<Divider label="or sign in with credentials" />
		{/if}

		<!-- Social Login Buttons -->
		{#if showSocial && (currentMode === 'signin' || currentMode === 'signup') && providers.length > 0}
			<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
				{#each providers as provider}
					<Button
						variant="outline"
						class="w-full justify-center gap-2 font-medium"
						loading={auth.isLoading}
						onclick={() => handleSocial(provider)}
					>
						{#if provider === 'github'}
							<Icon name="github" class="h-4 w-4" />
							<span>GitHub</span>
						{:else if provider === 'google'}
							<Icon name="external-link" class="h-4 w-4" />
							<span>Google</span>
						{:else}
							<span>{provider}</span>
						{/if}
					</Button>
				{/each}
			</div>

			<Divider label="or continue with email" />
		{/if}

		<!-- Main Form Body -->
		<form onsubmit={handleSubmit} class="space-y-4">
			{#if currentMode === 'signup'}
				<FormField label="Full Name" required>
					<Input type="text" placeholder="Alex Johnson" bind:value={name} required />
				</FormField>
			{/if}

			{#if currentMode === 'email-change'}
				<FormField label="New Email Address" required>
					<Input type="email" placeholder="new.email@company.com" bind:value={newEmail} required />
				</FormField>
			{:else if currentMode !== 'reset-password' && currentMode !== '2fa-verify'}
				<FormField label="Email address" required>
					<Input type="email" placeholder="name@company.com" bind:value={email} required />
				</FormField>
			{/if}

			{#if currentMode === 'reset-password'}
				<FormField label="New Password" required>
					<Input type="password" placeholder="••••••••" bind:value={password} required />
				</FormField>
				<FormField label="Confirm New Password" required>
					<Input type="password" placeholder="••••••••" bind:value={confirmPassword} required />
				</FormField>
			{:else if currentMode !== 'magic-link' && currentMode !== 'forgot-password' && currentMode !== '2fa-verify' && currentMode !== 'email-change'}
				<FormField label="Password" required>
					<Input type="password" placeholder="••••••••" bind:value={password} required />
				</FormField>
			{/if}

			{#if currentMode === '2fa-verify'}
				<div class="space-y-2">
					<p class="block text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
						{useBackupCode ? 'Enter Emergency Recovery Code' : 'Enter 6-Digit Authenticator Code'}
					</p>
					{#if useBackupCode}
						<Input type="text" placeholder="XXXXX-XXXXX" bind:value={totpCode} required autofocus />
					{:else}
						<div class="flex justify-center">
							<InputOTP
								length={6}
								bind:value={totpCode}
								autofocus
								oncomplete={() => {
									const mockEvt = new Event('submit') as SubmitEvent;
									handleSubmit(mockEvt);
								}}
							/>
						</div>
					{/if}

					<div class="pt-1 text-center">
						<button
							type="button"
							class="text-xs text-primary-600 hover:underline dark:text-primary-400"
							onclick={() => (useBackupCode = !useBackupCode)}
						>
							{useBackupCode
								? 'Use 6-digit authenticator app code'
								: 'Lost device? Use emergency backup code'}
						</button>
					</div>
				</div>
			{/if}

			<Button
				type="submit"
				variant="solid"
				color="primary"
				class="w-full justify-center font-semibold shadow-md"
				loading={auth.isLoading}
			>
				{#if currentMode === 'signup'}
					Create Account
				{:else if currentMode === 'magic-link'}
					Send Magic Link
				{:else if currentMode === 'forgot-password'}
					Send Reset Link
				{:else if currentMode === 'reset-password'}
					Update Password
				{:else if currentMode === '2fa-verify'}
					Verify Identity
				{:else if currentMode === 'email-change'}
					Request Email Change
				{:else}
					Sign In
				{/if}
			</Button>
		</form>

		<!-- Mode Switchers & Navigation Links -->
		<div class="flex flex-col items-center gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
			{#if currentMode === 'signin'}
				<div class="flex w-full items-center justify-between">
					{#if showForgotPassword}
						<button
							type="button"
							class="text-primary-600 hover:underline dark:text-primary-400"
							onclick={() => {
								customMode = 'forgot-password';
								localError = null;
							}}
						>
							Forgot password?
						</button>
					{/if}
					<div>
						Don't have an account?
						<button
							type="button"
							class="font-semibold text-primary-600 hover:underline dark:text-primary-400"
							onclick={() => {
								customMode = 'signup';
								localError = null;
							}}
						>
							Sign up
						</button>
					</div>
				</div>
				{#if showMagicLinkToggle}
					<button
						type="button"
						class="mt-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
						onclick={() => {
							customMode = 'magic-link';
							localError = null;
						}}
					>
						Sign in with a passwordless magic link
					</button>
				{/if}
			{:else if currentMode === 'signup'}
				<div>
					Already have an account?
					<button
						type="button"
						class="font-semibold text-primary-600 hover:underline dark:text-primary-400"
						onclick={() => {
							customMode = 'signin';
							localError = null;
						}}
					>
						Sign in
					</button>
				</div>
			{:else}
				<button
					type="button"
					class="font-semibold text-primary-600 hover:underline dark:text-primary-400"
					onclick={() => {
						customMode = 'signin';
						localError = null;
					}}
				>
					← Back to sign in
				</button>
			{/if}
		</div>
	{/if}
</Card>
