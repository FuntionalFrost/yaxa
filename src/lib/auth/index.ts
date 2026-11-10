// Yaxa SaaS Auth Suite (Better-Auth integration for Svelte 5 & SvelteKit)
export { default as AuthCard } from '../components/saas/AuthCard.svelte';
export type { AuthCardProps, AuthCardMode } from '../components/saas/AuthCard.svelte';
export { default as SignInCard } from '../components/saas/SignInCard.svelte';
export type { SignInCardProps } from '../components/saas/SignInCard.svelte';
export { default as SignUpCard } from '../components/saas/SignUpCard.svelte';
export type { SignUpCardProps } from '../components/saas/SignUpCard.svelte';
export { default as ResetPasswordCard } from '../components/saas/ResetPasswordCard.svelte';
export type { ResetPasswordCardProps } from '../components/saas/ResetPasswordCard.svelte';
export { default as PasskeyUI, passkeyUiVariants } from '../components/saas/PasskeyUI.svelte';
export type { PasskeyUiProps } from '../components/saas/PasskeyUI.svelte';
export { default as TwoFactorModal } from '../components/saas/TwoFactorModal.svelte';
export { useAuth } from '../composables/useAuth.svelte';
export type { UseAuthOptions, SocialProvider, PasskeyInfo } from '../composables/useAuth.svelte';
