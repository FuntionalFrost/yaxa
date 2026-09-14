<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import DocPropsTable from '../_components/DocPropsTable.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import ButtonGroup from '$lib/components/elements/ButtonGroup.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Chip from '$lib/components/elements/Chip.svelte';
	import Spinner from '$lib/components/elements/Spinner.svelte';
	import Skeleton from '$lib/components/elements/Skeleton.svelte';
	import Avatar from '$lib/components/elements/Avatar.svelte';
	import AvatarGroup from '$lib/components/elements/AvatarGroup.svelte';
	import Kbd from '$lib/components/elements/Kbd.svelte';
	import Progress from '$lib/components/elements/Progress.svelte';
	import Meter from '$lib/components/elements/Meter.svelte';
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Send } from '@lucide/svelte';

	let loading = $state(false);
	let progressVal = $state(68);

	function triggerLoading() {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 2000);
	}

	const buttonSnippet = `<Button variant="solid" color="primary">Solid</Button>
<Button variant="outline">Outline</Button>
<Button variant="soft">Soft</Button>
<Button variant="subtle">Subtle</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`;

	const chipSnippet = `<Chip color="primary" pulse>Live Updates</Chip>
<Chip color="success" pulse>Systems Operational</Chip>
<Chip color="warning">Maintenance</Chip>`;

	const avatarSnippet = `<!-- Avatars with Presence & Fallbacks -->
<Avatar alt="Sarah Connor" presence="online" size="md" />
<Avatar text="Alex Doe" presence="busy" size="md" />

<!-- Avatar Group Stack -->
<AvatarGroup>
  <Avatar alt="Elena Rostova" size="sm" />
  <Avatar alt="Marcus Vance" size="sm" />
  <Avatar alt="Chen Wei" size="sm" />
</AvatarGroup>`;

	const kbdSnippet = `<div class="flex items-center gap-1.5">
  <Kbd value="⌘" />
  <Kbd value="K" />
</div>`;
</script>

<DocHeader
	title="Buttons, Badges & Visual Elements"
	description="Accessible action triggers, button groups, avatars, presence indicators, keyboard shortcuts, status chips, spinners, progress meters, and skeletons."
	badge="Elements"
	source="src/lib/components/elements/Button.svelte"
	category="Components"
/>

<div class="space-y-8">
	<!-- Variants Sandbox -->
	<DocSandbox title="Button Variants" code={buttonSnippet}>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<Button variant="solid" color="primary">Solid</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="soft">Soft</Button>
			<Button variant="subtle">Subtle</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	</DocSandbox>

	<!-- Sizes Sandbox -->
	<DocSandbox title="Button Sizes & Loading States">
		<div class="flex flex-col items-center gap-6">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<Button size="xs" color="primary">Extra Small</Button>
				<Button size="sm" color="primary">Small</Button>
				<Button size="md" color="primary">Medium</Button>
				<Button size="lg" color="primary">Large</Button>
				<Button size="xl" color="primary">Extra Large</Button>
			</div>

			<div class="flex items-center gap-4">
				<Button {loading} color="primary" onclick={triggerLoading}>
					<Icon name="bolt" class="mr-1.5 h-4 w-4" />
					{loading ? 'Submitting...' : 'Click to Load'}
				</Button>
				<span class="text-xs text-zinc-500">Triggers 2s async spinner</span>
			</div>
		</div>
	</DocSandbox>

	<!-- ButtonGroup & Icons Sandbox -->
	<DocSandbox title="ButtonGroup & @lucide/svelte Icons">
		<div class="flex flex-col items-center gap-4">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<Button color="primary" icon={Sparkles}>Generate</Button>
				<Button variant="outline" trailingIcon={ArrowRight}>Get Started</Button>
				<Button variant="soft" color="success" icon={Send}>Send Message</Button>
			</div>

			<ButtonGroup>
				<Button variant="outline" icon={ChevronLeft}>Prev</Button>
				<Button variant="outline">Today</Button>
				<Button variant="outline" trailingIcon={ChevronRight}>Next</Button>
			</ButtonGroup>
		</div>
	</DocSandbox>

	<!-- Badges & Chips Sandbox -->
	<DocSandbox title="Badges & Pulsing Radar Chips" code={chipSnippet}>
		<div class="flex flex-col items-center gap-4">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<Badge color="primary" variant="solid">Primary</Badge>
				<Badge color="success" variant="subtle">Operational</Badge>
				<Badge color="warning" variant="subtle">Degraded</Badge>
				<Badge color="error" variant="subtle">Outage</Badge>
				<Badge color="info" variant="subtle">Beta</Badge>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-3">
				<Chip color="primary" pulse>Live Deploy</Chip>
				<Chip color="success" pulse>Connected</Chip>
				<Chip color="warning" pulse>High Load</Chip>
				<Chip color="error">Offline</Chip>
			</div>
		</div>
	</DocSandbox>

	<!-- Avatars & Avatar Groups Sandbox -->
	<DocSandbox title="Avatars, Presence & AvatarGroup Stacks" code={avatarSnippet}>
		<div class="flex flex-col items-center gap-6">
			<!-- Individual Avatars with Presence -->
			<div class="flex flex-wrap items-center justify-center gap-4">
				<Avatar text="Sarah Connor" presence="online" size="md" />
				<Avatar text="Alex Doe" presence="busy" size="md" />
				<Avatar text="Marcus Vance" presence="away" size="md" />
				<Avatar text="Offline User" presence="offline" size="md" />
			</div>

			<!-- Avatar Sizes & Group Stacking -->
			<div class="flex flex-wrap items-center justify-center gap-6">
				<AvatarGroup>
					<Avatar text="Elena Rostova" size="sm" />
					<Avatar text="David Kim" size="sm" />
					<Avatar text="Sophie Martin" size="sm" />
					<Avatar text="+3" size="sm" fallback="+3" class="bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-300" />
				</AvatarGroup>

				<div class="flex items-center gap-2">
					<Avatar text="XS" size="xs" />
					<Avatar text="SM" size="sm" />
					<Avatar text="MD" size="md" />
					<Avatar text="LG" size="lg" />
				</div>
			</div>
		</div>
	</DocSandbox>

	<!-- Keyboard Key Badges (Kbd) -->
	<DocSandbox title="Keyboard Key Badges (Kbd)" code={kbdSnippet}>
		<div class="flex flex-wrap items-center justify-center gap-6">
			<div class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
				<span>Command Palette:</span>
				<div class="flex items-center gap-1">
					<Kbd value="⌘" />
					<Kbd value="K" />
				</div>
			</div>

			<div class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
				<span>Save Changes:</span>
				<div class="flex items-center gap-1">
					<Kbd value="Ctrl" />
					<Kbd value="S" />
				</div>
			</div>

			<div class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
				<span>Multi-size:</span>
				<Kbd value="XS" size="xs" />
				<Kbd value="SM" size="sm" />
				<Kbd value="MD" size="md" />
				<Kbd value="LG" size="lg" />
			</div>
		</div>
	</DocSandbox>

	<!-- Progress Bars & Meters -->
	<DocSandbox title="Progress Bars & Status Meters">
		<div class="w-full max-w-md space-y-6">
			<!-- Determinate and Animated Progress -->
			<div class="space-y-3">
				<div class="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
					<span>Storage Quota</span>
					<span class="font-mono font-bold text-neutral-900 dark:text-white">{progressVal}%</span>
				</div>
				<Progress value={progressVal} color="primary" size="md" />
				<div class="flex gap-2">
					<Button size="xs" variant="outline" onclick={() => (progressVal = Math.max(0, progressVal - 15))}>-15%</Button>
					<Button size="xs" variant="outline" onclick={() => (progressVal = Math.min(100, progressVal + 15))}>+15%</Button>
				</div>
			</div>

			<!-- Semantic Status Meter -->
			<div class="space-y-3">
				<Meter label="API Rate Limit (Requests / min)" value={84} max={100} color="warning" size="md" />
				<Meter label="System Health" value={99} max={100} color="success" size="sm" />
			</div>
		</div>
	</DocSandbox>

	<!-- Spinners & Skeletons -->
	<DocSandbox title="Spinners & Skeletons">
		<div class="flex w-full max-w-md flex-col items-center justify-center gap-8 md:flex-row">
			<div class="flex items-center gap-3">
				<Spinner size="sm" class="text-primary-500" />
				<Spinner size="md" class="text-primary-500" />
				<Spinner size="lg" class="text-primary-500" />
			</div>

			<div class="w-full flex-1 space-y-2">
				<Skeleton class="h-4 w-3/4" />
				<Skeleton class="h-4 w-full" />
				<Skeleton class="h-4 w-1/2" />
			</div>
		</div>
	</DocSandbox>

	<!-- MetricCard Stats & Zero-Dep Sparklines -->
	<DocSandbox title="MetricCard (Zero-Dep SVG Sparkline Trend Card)">
		<div class="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
			<MetricCard
				title="Total Users"
				value="8,924"
				change={12.5}
				changePeriod="vs last month"
				sparkline={[4200, 5100, 6400, 7200, 8100, 8924]}
				sparklineColor="success"
				icon="users"
			/>
			<MetricCard
				title="Conversion"
				value="3.42%"
				change={-0.8}
				changePeriod="vs last week"
				sparkline={[4.2, 4.0, 3.8, 3.9, 3.6, 3.42]}
				sparklineColor="error"
				icon="sparkles"
			/>
		</div>
	</DocSandbox>

	<!-- Props Table -->
	<DocPropsTable
		items={[
			{
				name: 'variant',
				type: "'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'",
				default: "'solid'",
				description: 'Visual style variant of the button.'
			},
			{
				name: 'size',
				type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
				default: "'md'",
				description: 'Button size and padding preset.'
			},
			{
				name: 'color',
				type: "'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'",
				default: "'primary'",
				description: 'Semantic theme color applied.'
			},
			{
				name: 'loading',
				type: 'boolean',
				default: 'false',
				description: 'Replaces lead icon with animated SVG spinner and disables click.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: 'Disables user interactions and applies opacity reduction.'
			}
		]}
	/>
</div>
