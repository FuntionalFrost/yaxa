<script module lang="ts">
	import type { AuthCardProps } from './AuthCard.svelte';

	export type SignUpCardProps = Omit<AuthCardProps, 'mode'>;
</script>

<script lang="ts">
	import AuthCard from './AuthCard.svelte';

	let props: SignUpCardProps = $props();
</script>

<AuthCard mode="signup" {...props} />
