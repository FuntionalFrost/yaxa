<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';

	const sampleLineData = [
		{ label: 'Jan', revenue: 1400, costs: 600 },
		{ label: 'Feb', revenue: 2200, costs: 800 },
		{ label: 'Mar', revenue: 3100, costs: 1100 },
		{ label: 'Apr', revenue: 2800, costs: 950 },
		{ label: 'May', revenue: 4200, costs: 1300 },
		{ label: 'Jun', revenue: 5600, costs: 1700 }
	];

	const sampleBarData = [
		{ label: 'Q1', starter: 40, pro: 80, enterprise: 25 },
		{ label: 'Q2', starter: 65, pro: 110, enterprise: 45 },
		{ label: 'Q3', starter: 90, pro: 160, enterprise: 70 },
		{ label: 'Q4', starter: 120, pro: 210, enterprise: 95 }
	];

	const sampleDonutData = [
		{ label: 'SaaS Subscriptions', value: 55 },
		{ label: 'Usage Add-ons', value: 30 },
		{ label: 'Enterprise Support', value: 15 }
	];
</script>

<div class="space-y-12">
	<DocHeader
		title="Native SVG Theme-Aware Charts"
		description="Zero-dependency, accessible SVG charts for Svelte 5 with interactive hover crosshairs, multi-series area gradients, and automatic theme token synchronization."
		badge="Charts"
	/>

	<!-- Line Chart -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Smooth Line Chart (&lt;LineChart /&gt;)
		</h2>
		<p class="text-xs text-neutral-500">
			Bézier curve interpolation with gradient area fills, dashed series, and responsive hover
			crosshair tooltips.
		</p>

		<DocSandbox
			code={`<LineChart
  data={sampleData}
  series={[
    { key: 'revenue', label: 'Revenue ($)', area: true },
    { key: 'costs', label: 'Operating Costs', dashed: true }
  ]}
  height={260}
  yAxisFormat={(v) => '$' + v}
/>`}
		>
			<div class="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
				<LineChart
					data={sampleLineData}
					series={[
						{ key: 'revenue', label: 'Revenue ($)', area: true },
						{ key: 'costs', label: 'Operating Costs', dashed: true }
					]}
					height={260}
					yAxisFormat={(v) => `$${v}`}
				/>
			</div>
		</DocSandbox>
	</section>

	<!-- Bar Chart -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Grouped & Stacked Bar Chart (&lt;BarChart /&gt;)
		</h2>

		<DocSandbox
			code={`<BarChart
  data={sampleBarData}
  series={[
    { key: 'starter', label: 'Starter' },
    { key: 'pro', label: 'Pro' },
    { key: 'enterprise', label: 'Enterprise' }
  ]}
  height={240}
/>`}
		>
			<div class="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
				<BarChart
					data={sampleBarData}
					series={[
						{ key: 'starter', label: 'Starter' },
						{ key: 'pro', label: 'Pro' },
						{ key: 'enterprise', label: 'Enterprise' }
					]}
					height={240}
				/>
			</div>
		</DocSandbox>
	</section>

	<!-- Donut Chart -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Donut & KPI Chart (&lt;DonutChart /&gt;)
		</h2>

		<DocSandbox
			code={`<DonutChart
  data={sampleDonutData}
  size={200}
  strokeWidth={22}
  centerLabel="Total MRR"
  centerValue="$14.5k"
/>`}
		>
			<div class="flex justify-center p-4">
				<DonutChart
					data={sampleDonutData}
					size={200}
					strokeWidth={22}
					centerLabel="Total MRR"
					centerValue="$14.5k"
				/>
			</div>
		</DocSandbox>
	</section>
</div>
