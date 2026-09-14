<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import DocPropsTable from '../_components/DocPropsTable.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import ButtonGroup from '$lib/components/elements/ButtonGroup.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';
	import Chip from '$lib/components/elements/Chip.svelte';
	import Skeleton from '$lib/components/elements/Skeleton.svelte';
	import Avatar from '$lib/components/elements/Avatar.svelte';
	import AvatarGroup from '$lib/components/elements/AvatarGroup.svelte';
	import Kbd from '$lib/components/elements/Kbd.svelte';
	import Progress from '$lib/components/elements/Progress.svelte';
	import Meter from '$lib/components/elements/Meter.svelte';
	import MetricCard from '$lib/components/elements/MetricCard.svelte';
	import CodeBlock from '$lib/components/elements/CodeBlock.svelte';
	import SortableList from '$lib/components/elements/SortableList.svelte';
	import Icon from '$lib/components/elements/Icon.svelte';
	import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Send } from '@lucide/svelte';

	let loading = $state(false);
	let progressVal = $state(68);

	let tasks = $state([
		{ id: '1', title: 'Design user onboarding flow', priority: 'High', tag: 'UI' },
		{ id: '2', title: 'Set up Polar.sh subscription webhook', priority: 'Urgent', tag: 'Billing' },
		{ id: '3', title: 'Configure Drizzle ORM migrations', priority: 'Normal', tag: 'Database' },
		{ id: '4', title: 'Deploy static site to Cloudflare Pages', priority: 'Normal', tag: 'DevOps' }
	]);

	function triggerLoading() {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 2000);
	}

	const sampleSvelteSnippet =
		`<` +
		`script lang="ts">
  import { Button, CodeBlock, useLocale } from 'yaxa-svelte';
  const { formatCurrency } = useLocale();
  let count = $state(0);
</` +
		`script>

<div class="space-y-4">
  <p>Price: {formatCurrency(49.99, 'USD')}</p>
  <Button color="primary" onclick={() => count++}>
    Clicks: {count}
  </Button>
</div>`;

	const sampleLatexSnippet = `% Euler's Identity & Gaussian Integral
\\[ e^{i\\pi} + 1 = 0 \\]
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}

% Quadratic Formula
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`;

	const sampleVueSnippet =
		'<' +
		'template>\n' +
		'  <div class="counter-card">\n' +
		'    <h2>{{ title }}</h2>\n' +
		'    <button @click="increment" :disabled="isLoading">\n' +
		'      Count: {{ count }}\n' +
		'    </button>\n' +
		'  </div>\n' +
		'<' +
		'/template>\n\n' +
		'<' +
		'script setup lang="ts">\n' +
		"import { ref } from 'vue';\n" +
		'const count = ref(0);\n' +
		'const increment = () => count.value++;\n' +
		'<' +
		'/script>';

	const sampleTsxSnippet = `import React, { useState, useEffect } from 'react';

interface MetricProps {
  label: string;
  initialValue?: number;
}

export const Metric: React.FC<MetricProps> = ({ label, initialValue = 0 }) => {
  const [val, setVal] = useState(initialValue);
  return (
    <div className="metric-pill" onClick={() => setVal(v => v + 1)}>
      <span>{label}</span>
      <strong>{val}</strong>
    </div>
  );
};`;

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
					<Avatar
						text="+3"
						size="sm"
						fallback="+3"
						class="bg-primary-100 font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
					/>
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
					<Button
						size="xs"
						variant="outline"
						onclick={() => (progressVal = Math.max(0, progressVal - 15))}>-15%</Button
					>
					<Button
						size="xs"
						variant="outline"
						onclick={() => (progressVal = Math.min(100, progressVal + 15))}>+15%</Button
					>
				</div>
			</div>

			<!-- Semantic Status Meter -->
			<div class="space-y-3">
				<Meter
					label="API Rate Limit (Requests / min)"
					value={84}
					max={100}
					color="warning"
					size="md"
				/>
				<Meter label="System Health" value={99} max={100} color="success" size="sm" />
			</div>
		</div>
	</DocSandbox>

	<!-- Enhanced Skeletons & Shimmer Animation -->
	<DocSandbox title="Enhanced Skeleton Loaders (Shimmer, Multi-Line & Shapes)">
		<div class="w-full max-w-lg space-y-6">
			<!-- Profile Card Skeleton with Shimmer -->
			<div
				class="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
			>
				<Skeleton shape="circle" width="48px" height="48px" variant="shimmer" />
				<div class="flex-1 space-y-2">
					<Skeleton width="60%" height="16px" variant="shimmer" />
					<Skeleton width="40%" height="12px" variant="shimmer" />
				</div>
				<Skeleton shape="pill" width="64px" height="24px" variant="shimmer" />
			</div>

			<!-- Multi-line Staggered Paragraph Skeleton -->
			<div class="space-y-2">
				<span class="text-xs font-semibold tracking-wider text-neutral-500 uppercase"
					>Multi-Line Paragraph Stagger</span
				>
				<Skeleton lines={3} variant="shimmer" />
			</div>
		</div>
	</DocSandbox>

	<!-- Drag & Drop Sortable List -->
	<DocSandbox title="UI Drag & Drop Reordering (<SortableList />)">
		<div class="w-full max-w-lg">
			<p class="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
				Drag items by handle to reorder, or use keyboard arrow buttons:
			</p>
			<SortableList bind:items={tasks}>
				{#snippet children(task)}
					<div class="flex items-center justify-between">
						<span class="text-xs font-medium text-neutral-800 dark:text-neutral-200"
							>{task.title}</span
						>
						<Badge
							size="xs"
							color={task.priority === 'Urgent'
								? 'error'
								: task.priority === 'High'
									? 'warning'
									: 'neutral'}
							variant="subtle"
						>
							{task.tag}
						</Badge>
					</div>
				{/snippet}
			</SortableList>
		</div>
	</DocSandbox>

	<!-- Zero-WASM CodeBlock Component (Multi-Language) -->
	<DocSandbox title="Zero-WASM Syntax-Highlighted <CodeBlock /> (Multi-Language)">
		<div class="w-full max-w-xl space-y-4">
			<!-- Svelte 5 Snippet -->
			<CodeBlock
				code={sampleSvelteSnippet}
				language="svelte"
				filename="src/routes/demo/+page.svelte"
				showLineNumbers={true}
				highlightLines={[2, 3]}
			/>

			<!-- LaTeX / Math Snippet -->
			<CodeBlock
				code={sampleLatexSnippet}
				language="latex"
				filename="equations.tex"
				showLineNumbers={true}
			/>

			<!-- Vue SFC Snippet -->
			<CodeBlock
				code={sampleVueSnippet}
				language="vue"
				filename="Counter.vue"
				showLineNumbers={true}
			/>

			<!-- React TSX Snippet -->
			<CodeBlock
				code={sampleTsxSnippet}
				language="tsx"
				filename="Metric.tsx"
				showLineNumbers={true}
			/>
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
