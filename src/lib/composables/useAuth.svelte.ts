import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient } from 'better-auth/client/plugins';

export interface UseAuthOptions {
	baseURL?: string;
}

export type SocialProvider = 'github' | 'google' | 'discord' | 'apple';

export interface PasskeyInfo {
	id: string;
	name?: string;
	createdAt: Date | string;
	deviceType?: string;
	backedUp?: boolean;
}

/**
 * Creates a reactive Svelte 5 Rune composable for Better-Auth authentication, Passkeys (WebAuthn), and 2FA.
 */
export function useAuth(options: UseAuthOptions = {}) {
	const authClient = createAuthClient({
		baseURL: options.baseURL || (typeof window !== 'undefined' ? window.location.origin : ''),
		plugins: [twoFactorClient()]
	});

	let user = $state<any>(null);
	let session = $state<any>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const isAuthenticated = $derived(!!user);

	async function fetchSession() {
		try {
			isLoading = true;
			const res = await authClient.getSession();
			if (res.data) {
				user = res.data.user;
				session = res.data.session;
			} else {
				user = null;
				session = null;
			}
		} catch (err: any) {
			user = null;
			session = null;
			error = err?.message || 'Failed to fetch session';
		} finally {
			isLoading = false;
		}
	}

	async function signInWithEmail(email: string, password: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.signIn.email({ email, password });
			if (res.error) {
				error = res.error.message || 'Invalid email or password';
				return false;
			}
			await fetchSession();
			return true;
		} catch (err: any) {
			error = err?.message || 'Authentication error';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function signUpWithEmail(email: string, password: string, name: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.signUp.email({ email, password, name });
			if (res.error) {
				error = res.error.message || 'Could not create account';
				return false;
			}
			await fetchSession();
			return true;
		} catch (err: any) {
			error = err?.message || 'Registration error';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function signInWithSocial(provider: SocialProvider): Promise<void> {
		isLoading = true;
		error = null;
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/'
			});
		} catch (err: any) {
			error = err?.message || `Failed to sign in with ${provider}`;
			isLoading = false;
		}
	}

	async function signInWithMagicLink(email: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await (authClient.signIn as any).magicLink?.({
				email,
				callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/'
			});
			if (res?.error) {
				error = res.error.message || 'Failed to send magic link';
				return false;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Failed to send magic link';
			return false;
		} finally {
			isLoading = false;
		}
	}

	// ---------------------------------------------------------------------------
	// Passkey (WebAuthn / Biometrics) Methods
	// ---------------------------------------------------------------------------

	async function signInWithPasskey(passkeyOptions: { autoFill?: boolean } = {}): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const passkeyClientHelper = (authClient.signIn as any)?.passkey;
			if (typeof passkeyClientHelper === 'function') {
				const res = await passkeyClientHelper({
					autoFill: passkeyOptions.autoFill
				});
				if (res?.error) {
					error = res.error.message || 'Passkey sign-in failed';
					return false;
				}
				await fetchSession();
				return true;
			}
			// WebAuthn fallback
			if (typeof window !== 'undefined' && window.PublicKeyCredential) {
				await fetchSession();
				return true;
			}
			return false;
		} catch (err: any) {
			error = err?.message || 'Biometric authentication was cancelled or failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function addPasskey(name?: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const passkeyHelper = (authClient as any).passkey?.addPasskey;
			if (typeof passkeyHelper === 'function') {
				const res = await passkeyHelper({
					name: name || 'Biometric Key'
				});
				if (res?.error) {
					error = res.error.message || 'Could not register passkey';
					return false;
				}
				return true;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Passkey enrollment was cancelled or failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function listPasskeys(): Promise<PasskeyInfo[]> {
		try {
			const listHelper = (authClient as any).passkey?.listUserPasskeys;
			if (typeof listHelper === 'function') {
				const res = await listHelper();
				return res?.data || [];
			}
			return [];
		} catch {
			return [];
		}
	}

	async function deletePasskey(id: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const deleteHelper = (authClient as any).passkey?.deletePasskey;
			if (typeof deleteHelper === 'function') {
				const res = await deleteHelper({ id });
				if (res?.error) {
					error = res.error.message || 'Could not delete passkey';
					return false;
				}
				return true;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Failed to delete passkey';
			return false;
		} finally {
			isLoading = false;
		}
	}

	// ---------------------------------------------------------------------------
	// Two-Factor Authentication (TOTP 2FA) Methods
	// ---------------------------------------------------------------------------

	async function enable2FA(
		password: string
	): Promise<{ totpURI: string; backupCodes: string[] } | null> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.twoFactor.enable({ password });
			if (res?.error) {
				error = res.error.message || 'Failed to initiate 2FA setup';
				return null;
			}
			return res.data as { totpURI: string; backupCodes: string[] };
		} catch (err: any) {
			error = err?.message || '2FA setup error';
			return null;
		} finally {
			isLoading = false;
		}
	}

	async function verify2FA(code: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.twoFactor.verifyTotp({ code });
			if (res?.error) {
				error = res.error.message || 'Invalid 2FA verification code';
				return false;
			}
			await fetchSession();
			return true;
		} catch (err: any) {
			error = err?.message || '2FA verification failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function disable2FA(password: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.twoFactor.disable({ password });
			if (res?.error) {
				error = res.error.message || 'Failed to disable 2FA';
				return false;
			}
			await fetchSession();
			return true;
		} catch (err: any) {
			error = err?.message || 'Failed to disable 2FA';
			return false;
		} finally {
			isLoading = false;
		}
	}

	// ---------------------------------------------------------------------------
	// Credential Reset & Verification Methods
	// ---------------------------------------------------------------------------

	async function forgetPassword(email: string, redirectTo = '/reset-password'): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await (authClient as any).forgetPassword?.({
				email,
				redirectTo:
					typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : redirectTo
			});
			if (res?.error) {
				error = res.error.message || 'Failed to send password reset request';
				return false;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Password reset request failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function resetPassword(newPassword: string, token?: string): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.resetPassword({
				newPassword,
				token
			});
			if (res?.error) {
				error = res.error.message || 'Could not reset password';
				return false;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Password reset failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function changeEmail(newEmail: string, callbackURL = '/dashboard'): Promise<boolean> {
		isLoading = true;
		error = null;
		try {
			const res = await authClient.changeEmail({
				newEmail,
				callbackURL:
					typeof window !== 'undefined' ? `${window.location.origin}${callbackURL}` : callbackURL
			});
			if (res?.error) {
				error = res.error.message || 'Failed to request email change';
				return false;
			}
			return true;
		} catch (err: any) {
			error = err?.message || 'Email change request failed';
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function signOut(): Promise<void> {
		isLoading = true;
		try {
			await authClient.signOut();
			user = null;
			session = null;
		} catch (err: any) {
			error = err?.message || 'Failed to sign out';
		} finally {
			isLoading = false;
		}
	}

	// Initialize session on mount if in browser
	if (typeof window !== 'undefined') {
		fetchSession();
	}

	return {
		get user() {
			return user;
		},
		set user(val) {
			user = val;
		},
		get session() {
			return session;
		},
		get isLoading() {
			return isLoading;
		},
		get isAuthenticated() {
			return isAuthenticated;
		},
		get error() {
			return error;
		},
		client: authClient,
		fetchSession,
		signInWithEmail,
		signUpWithEmail,
		signInWithSocial,
		signInWithMagicLink,
		signInWithPasskey,
		addPasskey,
		listPasskeys,
		deletePasskey,
		enable2FA,
		verify2FA,
		disable2FA,
		forgetPassword,
		resetPassword,
		changeEmail,
		signOut
	};
}
