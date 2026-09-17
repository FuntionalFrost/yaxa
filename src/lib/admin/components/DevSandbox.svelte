<script lang="ts">
	import Card from '../../components/layout/Card.svelte';
	import Button from '../../components/elements/Button.svelte';
	import Badge from '../../components/elements/Badge.svelte';
	import Icon from '../../components/elements/Icon.svelte';
	import Progress from '../../components/elements/Progress.svelte';
	import { useUpload } from '../../composables/useUpload.svelte';
	import { getAuthUserContextGetter } from '../../site/context';

	interface Props {
		apiPrefix?: string;
		class?: string;
	}

	let { apiPrefix = '/admin/api', class: className = '' }: Props = $props();

	// Auth & Context info
	const getContextUser = getAuthUserContextGetter();
	const user = $derived(getContextUser());

	// Email Sandbox State
	let emailTo = $state('developer@example.com');
	let emailTemplate = $state<'magic_link' | 'welcome'>('magic_link');
	let isSendingEmail = $state(false);
	let emailResponse = $state<string | null>(null);
	let emailSuccess = $state<boolean | null>(null);

	// Storage Upload Sandbox
	const uploader = useUpload();
	let selectedFile = $state<File | null>(null);

	async function handleSendTestEmail() {
		isSendingEmail = true;
		emailResponse = null;
		emailSuccess = null;

		try {
			const res = await fetch(`${apiPrefix}/test-email`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to: emailTo,
					template: emailTemplate
				})
			});

			const data = await res.json();
			if (res.ok && data.success) {
				emailSuccess = true;
				emailResponse = data.message || `Email sent successfully! (ID: ${data.id || 'ok'})`;
			} else {
				emailSuccess = false;
				emailResponse = data.error || 'Failed to dispatch email';
			}
		} catch (err: unknown) {
			emailSuccess = false;
			emailResponse = err instanceof Error ? err.message : 'Network error';
		} finally {
			isSendingEmail = false;
		}
	}

	async function handleUploadFile() {
		if (!selectedFile) return;
		await uploader.upload(selectedFile, `${apiPrefix}/test-upload`);
	}
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 {className}">
	<!-- 1. Email Sandbox (Resend) -->
	<Card class="space-y-5 border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
		<div
			class="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
				>
					<Icon name="sparkles" class="h-4 w-4" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
						Transactional Email Sandbox
					</h3>
					<p class="text-xs text-neutral-500">
						Test Resend transactional email delivery & templates
					</p>
				</div>
			</div>
			<Badge color="neutral" variant="subtle" size="xs">Resend.com</Badge>
		</div>

		<div class="space-y-4 text-xs">
			<div class="space-y-1">
				<label for="email-to" class="font-medium text-neutral-700 dark:text-neutral-300"
					>Recipient Email</label
				>
				<input
					id="email-to"
					type="email"
					bind:value={emailTo}
					placeholder="you@example.com"
					class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
				/>
			</div>

			<div class="space-y-1">
				<label for="email-template" class="font-medium text-neutral-700 dark:text-neutral-300"
					>Template Type</label
				>
				<select
					id="email-template"
					bind:value={emailTemplate}
					class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
				>
					<option value="magic_link">Magic Link Sign-In Email</option>
					<option value="welcome">Welcome Onboarding Email</option>
				</select>
			</div>

			<Button
				variant="solid"
				color="primary"
				size="sm"
				loading={isSendingEmail}
				onclick={handleSendTestEmail}
				class="w-full gap-1.5 font-medium"
			>
				<Icon name="sparkles" class="h-3.5 w-3.5" />
				<span>Send Test Email</span>
			</Button>

			{#if emailResponse}
				<div
					class="rounded-lg border p-3 text-xs {emailSuccess
						? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
						: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'}"
				>
					<p class="font-semibold">{emailSuccess ? '✓ Success' : '✗ Dispatch Failed'}</p>
					<p class="mt-0.5">{emailResponse}</p>
				</div>
			{/if}
		</div>
	</Card>

	<!-- 2. S3 / Cloudflare R2 Upload Sandbox -->
	<Card class="space-y-5 border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
		<div
			class="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
				>
					<Icon name="computer" class="h-4 w-4" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
						Cloud Storage Sandbox
					</h3>
					<p class="text-xs text-neutral-500">
						Test presigned file uploads to AWS S3 / Cloudflare R2
					</p>
				</div>
			</div>
			<Badge color="info" variant="subtle" size="xs">S3 / R2</Badge>
		</div>

		<div class="space-y-4 text-xs">
			<div class="space-y-1">
				<label for="storage-file" class="font-medium text-neutral-700 dark:text-neutral-300"
					>Select File</label
				>
				<input
					id="storage-file"
					type="file"
					onchange={(e) => {
						const files = e.currentTarget.files;
						if (files && files.length > 0) selectedFile = files[0];
					}}
					class="w-full text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:file:text-neutral-300"
				/>
			</div>

			{#if uploader.isUploading}
				<div class="space-y-1.5">
					<div
						class="flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400"
					>
						<span>Uploading...</span>
						<span>{uploader.progress}%</span>
					</div>
					<Progress value={uploader.progress} size="sm" color="primary" />
				</div>
			{/if}

			<Button
				variant="outline"
				size="sm"
				disabled={!selectedFile || uploader.isUploading}
				loading={uploader.isUploading}
				onclick={handleUploadFile}
				class="w-full gap-1.5 font-medium"
			>
				<Icon name="sparkles" class="h-3.5 w-3.5" />
				<span>Upload to Storage</span>
			</Button>

			{#if uploader.url}
				<div
					class="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900"
				>
					<span class="font-semibold text-emerald-600 dark:text-emerald-400"
						>✓ Upload Successful</span
					>
					<div class="flex items-center justify-between gap-2 overflow-hidden text-xs">
						<span class="truncate font-mono text-neutral-600 dark:text-neutral-400"
							>{uploader.url}</span
						>
						<a
							href={uploader.url}
							target="_blank"
							rel="noopener noreferrer"
							class="shrink-0 text-primary-600 hover:underline dark:text-primary-400"
						>
							View
						</a>
					</div>
				</div>
			{:else if uploader.error}
				<div
					class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
				>
					<strong>Error:</strong>
					{uploader.error}
				</div>
			{/if}
		</div>
	</Card>

	<!-- 3. Auth & RBAC State Inspection -->
	<Card class="space-y-4 border-neutral-200 p-6 shadow-xs lg:col-span-2 dark:border-neutral-800">
		<div
			class="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
				>
					<Icon name="lock" class="h-4 w-4" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
						Active Authentication & Permissions
					</h3>
					<p class="text-xs text-neutral-500">Current session context parsed by `yaxa-svelte`</p>
				</div>
			</div>
			<Badge color={user ? 'success' : 'neutral'} variant="subtle" size="xs">
				{user ? 'Authenticated' : 'Anonymous'}
			</Badge>
		</div>

		<div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
			<div class="space-y-1">
				<span class="font-medium text-neutral-500">User Email</span>
				<p class="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
					{user?.email || 'N/A'}
				</p>
			</div>
			<div class="space-y-1">
				<span class="font-medium text-neutral-500">Role</span>
				<p class="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
					{user?.role || 'user'}
				</p>
			</div>
			<div class="space-y-1">
				<span class="font-medium text-neutral-500">Plan Tier</span>
				<p class="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
					{user?.plan || user?.tier || 'free'}
				</p>
			</div>
		</div>
	</Card>
</div>
