<script module lang="ts">
	import type { AuthCardProps } from './AuthCard.svelte';

	export type ResetPasswordCardProps = Omit<AuthCardProps, 'mode'>;
</script>

<script lang="ts">
	import AuthCard from './AuthCard.svelte';

	let props: ResetPasswordCardProps = $props();
</script>

<AuthCard mode="reset-password" {...props} />
