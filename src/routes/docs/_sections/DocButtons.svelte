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
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Send } from '@lucide/svelte';

	let loading = $state(false);

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
</script>

<DocHeader
	title="Buttons, ButtonGroups & Badges"
	description="Accessible action triggers, button groups, status chips, pulsing radar chips, spinners, and skeletons with 6 visual variants."
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
