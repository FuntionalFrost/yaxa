<script module lang="ts">
	import type { ChartDataPoint } from './LineChart.svelte';

	export interface BarSeries {
		key: string;
		label?: string;
		color?: string;
		stacked?: boolean;
	}

	export interface BarChartProps {
		data: ChartDataPoint[];
		series: BarSeries[];
		height?: number;
		rounded?: boolean;
		showGrid?: boolean;
		showTooltip?: boolean;
		showLegend?: boolean;
		yAxisFormat?: (val: number) => string;
		xAxisFormat?: (label: string) => string;
		class?: string;
	}
</script>

<script lang="ts">
	const DEFAULT_COLORS = [
		'var(--color-chart-1, #ff3e00)',
		'var(--color-chart-2, #3b82f6)',
		'var(--color-chart-3, #10b981)',
		'var(--color-chart-4, #f59e0b)',
		'var(--color-chart-5, #8b5cf6)'
	];

	let {
		data = [],
		series = [],
		height = 280,
		rounded = true,
		showGrid = true,
		showTooltip = true,
		showLegend = true,
		yAxisFormat = (v) => String(v),
		xAxisFormat = (l) => l,
		class: className = ''
	}: BarChartProps = $props();

	let hoveredIdx = $state<number | null>(null);

	const padding = { top: 20, right: 20, bottom: 30, left: 45 };
	const width = 600;

	let innerWidth = $derived(width - padding.left - padding.right);
	let innerHeight = $derived(height - padding.top - padding.bottom);

	let isStacked = $derived(series.some((s) => s.stacked));

	let yMax = $derived.by(() => {
		if (data.length === 0) return 100;
		let max = 0;
		data.forEach((d) => {
			if (isStacked) {
				const sum = series.reduce((acc, s) => acc + Number(d[s.key] ?? 0), 0);
				if (sum > max) max = sum;
			} else {
				series.forEach((s) => {
					const val = Number(d[s.key] ?? 0);
					if (val > max) max = val;
				});
			}
		});
		return max === 0 ? 100 : Math.ceil(max * 1.15);
	});

	let yTicks = $derived.by(() => {
		const step = yMax / 4;
		return Array.from({ length: 5 }, (_, i) => Math.round(step * i));
	});

	function getY(val: number): number {
		const normalized = val / (yMax || 1);
		return padding.top + innerHeight - normalized * innerHeight;
	}

	let groupWidth = $derived(data.length > 0 ? innerWidth / data.length : innerWidth);
	function getStackedOffset(d: ChartDataPoint, seriesIndex: number): number {
		let sum = 0;
		for (let i = 0; i < seriesIndex; i++) {
			sum += Number(d[series[i].key] ?? 0);
		}
		return sum;
	}
</script>

<div class="relative w-full overflow-hidden {className}">
	<!-- SVG Bar Viewport -->
	<svg
		viewBox="0 0 {width} {height}"
		class="h-auto w-full overflow-visible"
		role="img"
		aria-label="Interactive Bar Chart"
	>
		<!-- Gridlines -->
		{#if showGrid}
			<g class="stroke-neutral-200/70 dark:stroke-neutral-800/70" stroke-dasharray="3 3">
				{#each yTicks as tick}
					{@const y = getY(tick)}
					<line x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
				{/each}
			</g>
		{/if}

		<!-- Y-Axis Labels -->
		<g class="fill-neutral-400 text-[10px] select-none dark:fill-neutral-500">
			{#each yTicks as tick}
				{@const y = getY(tick)}
				<text x={padding.left - 8} y={y + 3} text-anchor="end">
					{yAxisFormat(tick)}
				</text>
			{/each}
		</g>

		<!-- X-Axis Labels -->
		<g class="fill-neutral-400 text-[10px] select-none dark:fill-neutral-500">
			{#each data as d, i}
				{@const x = padding.left + i * groupWidth + groupWidth / 2}
				<text {x} y={height - 8} text-anchor="middle">
					{xAxisFormat(d.label)}
				</text>
			{/each}
		</g>

		<!-- Bar Groups -->
		{#each data as d, dIdx}
			{@const groupX = padding.left + dIdx * groupWidth}
			{@const paddingFactor = 0.25}
			{@const availableWidth = groupWidth * (1 - paddingFactor)}
			{@const barWidth = isStacked ? availableWidth : availableWidth / (series.length || 1)}
			{@const startOffset = (groupWidth - availableWidth) / 2}

			<g
				role="group"
				aria-label={d.label}
				onmouseenter={() => (hoveredIdx = dIdx)}
				onmouseleave={() => (hoveredIdx = null)}
				class="cursor-pointer"
			>
				<!-- Group Hover Background highlight -->
				{#if hoveredIdx === dIdx}
					<rect
						x={groupX}
						y={padding.top}
						width={groupWidth}
						height={innerHeight}
						class="fill-neutral-500/5 dark:fill-neutral-400/5"
						rx="6"
					/>
				{/if}

				{#if isStacked}
					<!-- Stacked Bars -->
					{#each series as s, sIdx}
						{@const val = Number(d[s.key] ?? 0)}
						{@const offsetVal = getStackedOffset(d, sIdx)}
						{@const barHeight = (val / (yMax || 1)) * innerHeight}
						{@const y = getY(offsetVal + val)}
						{@const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]}
						<rect
							x={groupX + startOffset}
							{y}
							width={barWidth}
							height={barHeight}
							fill={color}
							rx={rounded && sIdx === series.length - 1 ? 4 : 0}
							class="transition-opacity duration-150 {hoveredIdx !== null && hoveredIdx !== dIdx
								? 'opacity-60'
								: 'opacity-100'}"
						/>
					{/each}
				{:else}
					<!-- Grouped / Side-by-Side Bars -->
					{#each series as s, sIdx}
						{@const val = Number(d[s.key] ?? 0)}
						{@const barHeight = (val / (yMax || 1)) * innerHeight}
						{@const y = padding.top + innerHeight - barHeight}
						{@const x = groupX + startOffset + sIdx * barWidth}
						{@const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]}
						<rect
							{x}
							{y}
							width={barWidth * 0.9}
							height={barHeight}
							fill={color}
							rx={rounded ? 4 : 0}
							class="transition-opacity duration-150 {hoveredIdx !== null && hoveredIdx !== dIdx
								? 'opacity-60'
								: 'opacity-100'}"
						/>
					{/each}
				{/if}
			</g>
		{/each}
	</svg>

	<!-- Hover Tooltip -->
	{#if hoveredIdx !== null && showTooltip && data[hoveredIdx]}
		{@const activeItem = data[hoveredIdx]}
		{@const activeX = padding.left + hoveredIdx * groupWidth + groupWidth / 2}
		<div
			class="pointer-events-none absolute top-2 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xs transition-all dark:border-neutral-800 dark:bg-neutral-900/95"
			style="left: clamp(10px, {(activeX / width) *
				100}%, calc(100% - 140px)); transform: translateX(-50%);"
		>
			<div class="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
				{xAxisFormat(activeItem.label)}
			</div>
			{#each series as s, sIdx}
				{@const val = Number(activeItem[s.key] ?? 0)}
				{@const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]}
				<div class="flex items-center justify-between gap-3 text-[11px]">
					<div class="flex items-center gap-1.5">
						<span class="h-2 w-2 rounded-full" style="background-color: {color}"></span>
						<span class="text-neutral-500 dark:text-neutral-400">
							{s.label || s.key}:
						</span>
					</div>
					<span class="font-semibold text-neutral-900 dark:text-white">
						{yAxisFormat(val)}
					</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Legend List -->
	{#if showLegend && series.length > 0}
		<div
			class="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600 dark:text-neutral-300"
		>
			{#each series as s, sIdx}
				{@const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length]}
				<div class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-full" style="background-color: {color}"></span>
					<span>{s.label || s.key}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
