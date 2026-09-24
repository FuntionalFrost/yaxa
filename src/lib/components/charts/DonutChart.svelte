<script module lang="ts">
	export interface DonutDataItem {
		label: string;
		value: number;
		color?: string;
	}

	export interface DonutChartProps {
		data: DonutDataItem[];
		size?: number;
		strokeWidth?: number;
		centerLabel?: string;
		centerValue?: string | number;
		showLegend?: boolean;
		showTooltip?: boolean;
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
		size = 220,
		strokeWidth = 24,
		centerLabel = 'Total',
		centerValue,
		showLegend = true,
		showTooltip = true,
		class: className = ''
	}: DonutChartProps = $props();

	let hoveredIdx = $state<number | null>(null);

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);

	let totalValue = $derived(data.reduce((acc, item) => acc + item.value, 0));
	let displayValue = $derived(centerValue !== undefined ? centerValue : totalValue);

	let segments = $derived.by(() => {
		let accumulatedPercent = 0;
		return data.map((item, idx) => {
			const percent = totalValue > 0 ? item.value / totalValue : 0;
			const strokeDasharray = `${percent * circumference} ${circumference}`;
			const strokeDashoffset = -accumulatedPercent * circumference;
			accumulatedPercent += percent;

			return {
				item,
				percent,
				color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
				strokeDasharray,
				strokeDashoffset
			};
		});
	});
</script>

<div class="flex flex-col items-center {className}">
	<div class="relative" style="width: {size}px; height: {size}px;">
		<svg
			viewBox="0 0 {size} {size}"
			class="h-full w-full -rotate-90 transform overflow-visible"
			role="img"
			aria-label="Interactive Donut Chart"
		>
			<!-- Background Track -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				class="stroke-neutral-100 dark:stroke-neutral-800"
				stroke-width={strokeWidth}
			/>

			<!-- Segments -->
			{#each segments as seg, idx}
				<circle
					role="graphics-symbol"
					aria-label={seg.item.label}
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={seg.color}
					stroke-width={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
					stroke-dasharray={seg.strokeDasharray}
					stroke-dashoffset={seg.strokeDashoffset}
					onmouseenter={() => (hoveredIdx = idx)}
					onmouseleave={() => (hoveredIdx = null)}
					class="cursor-pointer transition-all duration-200 hover:opacity-90"
				/>
			{/each}
		</svg>

		<!-- Center KPI Metric -->
		<div
			class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center select-none"
		>
			{#if showTooltip && hoveredIdx !== null && segments[hoveredIdx]}
				{@const active = segments[hoveredIdx]}
				<span class="text-xs text-neutral-500 dark:text-neutral-400">
					{active.item.label}
				</span>
				<span class="text-xl font-bold text-neutral-900 dark:text-white">
					{active.item.value}
				</span>
				<span class="text-[10px] text-neutral-400">
					{(active.percent * 100).toFixed(1)}%
				</span>
			{:else}
				{#if centerLabel}
					<span class="text-xs text-neutral-500 dark:text-neutral-400">{centerLabel}</span>
				{/if}
				<span class="text-xl font-bold text-neutral-900 dark:text-white">
					{displayValue}
				</span>
			{/if}
		</div>
	</div>

	<!-- Legend -->
	{#if showLegend && data.length > 0}
		<div
			class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-neutral-600 dark:text-neutral-300"
		>
			{#each segments as seg, idx}
				<button
					type="button"
					onmouseenter={() => (hoveredIdx = idx)}
					onmouseleave={() => (hoveredIdx = null)}
					class="flex items-center gap-1.5 transition-opacity hover:opacity-80 {hoveredIdx !==
						null && hoveredIdx !== idx
						? 'opacity-40'
						: 'opacity-100'}"
				>
					<span class="h-2.5 w-2.5 rounded-full" style="background-color: {seg.color}"></span>
					<span>{seg.item.label}</span>
					<span class="text-neutral-400">({(seg.percent * 100).toFixed(0)}%)</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
