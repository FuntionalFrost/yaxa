<script module lang="ts">
	export interface ChartDataPoint {
		label: string;
		[key: string]: number | string;
	}

	export interface LineSeries {
		key: string;
		label?: string;
		color?: string;
		strokeWidth?: number;
		curve?: 'linear' | 'smooth';
		area?: boolean;
		dashed?: boolean;
	}

	export interface LineChartProps {
		data: ChartDataPoint[];
		series: LineSeries[];
		height?: number;
		showGrid?: boolean;
		showDots?: boolean;
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
		showGrid = true,
		showDots = true,
		showTooltip = true,
		showLegend = true,
		yAxisFormat = (v) => String(v),
		xAxisFormat = (l) => l,
		class: className = ''
	}: LineChartProps = $props();

	let hoveredIdx = $state<number | null>(null);

	const padding = { top: 20, right: 20, bottom: 30, left: 45 };
	const width = 600; // SVG coordinate space

	let innerWidth = $derived(width - padding.left - padding.right);
	let innerHeight = $derived(height - padding.top - padding.bottom);

	// Compute min and max values across all series
	let yMin = $derived.by(() => {
		if (data.length === 0) return 0;
		let min = Infinity;
		data.forEach((d) => {
			series.forEach((s) => {
				const val = Number(d[s.key] ?? 0);
				if (val < min) min = val;
			});
		});
		return min > 0 ? 0 : min;
	});

	let yMax = $derived.by(() => {
		if (data.length === 0) return 100;
		let max = -Infinity;
		data.forEach((d) => {
			series.forEach((s) => {
				const val = Number(d[s.key] ?? 0);
				if (val > max) max = val;
			});
		});
		return max === -Infinity ? 100 : Math.ceil(max * 1.1) || 10;
	});

	// Generate 5 Y-ticks
	let yTicks = $derived.by(() => {
		const step = (yMax - yMin) / 4;
		return Array.from({ length: 5 }, (_, i) => yMin + step * i);
	});

	function getX(idx: number): number {
		if (data.length <= 1) return padding.left + innerWidth / 2;
		return padding.left + (idx / (data.length - 1)) * innerWidth;
	}

	function getY(val: number): number {
		const normalized = (val - yMin) / (yMax - yMin || 1);
		return padding.top + innerHeight - normalized * innerHeight;
	}

	function buildSmoothPath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

		let d = `M ${points[0].x} ${points[0].y}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i === 0 ? 0 : i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

			const cp1x = p1.x + (p2.x - p0.x) / 6;
			const cp1y = p1.y + (p2.y - p0.y) / 6;
			const cp2x = p2.x - (p3.x - p1.x) / 6;
			const cp2y = p2.y - (p3.y - p1.y) / 6;

			d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
		}
		return d;
	}

	let seriesPaths = $derived.by(() => {
		return series.map((s, sIdx) => {
			const color = s.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];
			const points = data.map((d, i) => ({
				x: getX(i),
				y: getY(Number(d[s.key] ?? 0)),
				value: Number(d[s.key] ?? 0)
			}));

			const isSmooth = s.curve !== 'linear';
			const linePath = isSmooth
				? buildSmoothPath(points)
				: points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

			let areaPath = '';
			if (s.area && points.length > 0) {
				const baselineY = getY(yMin);
				const firstX = points[0].x;
				const lastX = points[points.length - 1].x;
				areaPath = `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
			}

			return {
				series: s,
				color,
				points,
				linePath,
				areaPath
			};
		});
	});

	function handleMouseMove(e: MouseEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const clientX = e.clientX - rect.left;
		const svgX = (clientX / rect.width) * width;

		if (data.length <= 1) {
			hoveredIdx = 0;
			return;
		}

		let closestIdx = 0;
		let closestDist = Infinity;
		data.forEach((_, i) => {
			const dist = Math.abs(getX(i) - svgX);
			if (dist < closestDist) {
				closestDist = dist;
				closestIdx = i;
			}
		});

		hoveredIdx = closestIdx;
	}

	function handleMouseLeave() {
		hoveredIdx = null;
	}
</script>

<div class="relative w-full overflow-hidden {className}">
	<!-- SVG Chart Viewport -->
	<svg
		viewBox="0 0 {width} {height}"
		class="h-auto w-full overflow-visible"
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		role="img"
		aria-label="Interactive Line Chart"
	>
		<defs>
			{#each seriesPaths as sp, idx}
				{#if sp.series.area}
					<linearGradient id="area-grad-{idx}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color={sp.color} stop-opacity="0.3" />
						<stop offset="100%" stop-color={sp.color} stop-opacity="0.0" />
					</linearGradient>
				{/if}
			{/each}
		</defs>

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
				{@const x = getX(i)}
				<text {x} y={height - 8} text-anchor="middle">
					{xAxisFormat(d.label)}
				</text>
			{/each}
		</g>

		<!-- Area Fills -->
		{#each seriesPaths as sp, idx}
			{#if sp.areaPath}
				<path d={sp.areaPath} fill="url(#area-grad-{idx})" />
			{/if}
		{/each}

		<!-- Line Curves -->
		{#each seriesPaths as sp}
			<path
				d={sp.linePath}
				fill="none"
				stroke={sp.color}
				stroke-width={sp.series.strokeWidth || 2.5}
				stroke-dasharray={sp.series.dashed ? '4 4' : undefined}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/each}

		<!-- Data Dots -->
		{#if showDots}
			{#each seriesPaths as sp}
				{#each sp.points as pt}
					<circle
						cx={pt.x}
						cy={pt.y}
						r="3.5"
						fill="white"
						stroke={sp.color}
						stroke-width="2"
						class="transition-transform duration-150"
					/>
				{/each}
			{/each}
		{/if}

		<!-- Active Hover Crosshair Line -->
		{#if hoveredIdx !== null && showTooltip}
			{@const hX = getX(hoveredIdx)}
			<line
				x1={hX}
				y1={padding.top}
				x2={hX}
				y2={padding.top + innerHeight}
				class="stroke-neutral-400/80 dark:stroke-neutral-500/80"
				stroke-width="1.5"
				stroke-dasharray="2 2"
			/>
			{#each seriesPaths as sp}
				{@const pt = sp.points[hoveredIdx]}
				{#if pt}
					<circle cx={pt.x} cy={pt.y} r="5" fill={sp.color} stroke="white" stroke-width="2" />
				{/if}
			{/each}
		{/if}
	</svg>

	<!-- Floating Tooltip Box -->
	{#if hoveredIdx !== null && showTooltip && data[hoveredIdx]}
		{@const activeItem = data[hoveredIdx]}
		<div
			class="pointer-events-none absolute top-2 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xs transition-all dark:border-neutral-800 dark:bg-neutral-900/95"
			style="left: clamp(10px, {(getX(hoveredIdx) / width) *
				100}%, calc(100% - 140px)); transform: translateX(-50%);"
		>
			<div class="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
				{xAxisFormat(activeItem.label)}
			</div>
			{#each seriesPaths as sp}
				{@const val = Number(activeItem[sp.series.key] ?? 0)}
				<div class="flex items-center justify-between gap-3 text-[11px]">
					<div class="flex items-center gap-1.5">
						<span class="h-2 w-2 rounded-full" style="background-color: {sp.color}"></span>
						<span class="text-neutral-500 dark:text-neutral-400">
							{sp.series.label || sp.series.key}:
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
			{#each seriesPaths as sp}
				<div class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-full" style="background-color: {sp.color}"></span>
					<span>{sp.series.label || sp.series.key}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
