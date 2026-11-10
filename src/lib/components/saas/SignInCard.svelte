<script module lang="ts">
	import type { AuthCardProps } from './AuthCard.svelte';

	export type SignInCardProps = Omit<AuthCardProps, 'mode'>;
</script>

<script lang="ts">
	import AuthCard from './AuthCard.svelte';

	let props: SignInCardProps = $props();
</script>

<AuthCard mode="signin" {...props} />
