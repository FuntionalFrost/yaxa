<script lang="ts" module>
	import { tv, type VariantProps } from '../../utils/cn';
	import type { SVGAttributes } from 'svelte/elements';

	export const sparklineVariants = tv({
		slots: {
			root: 'inline-block overflow-visible select-none',
			area: 'transition-opacity duration-300',
			line: 'fill-none transition-all duration-300',
			dot: 'transition-all duration-300'
		}
	});

	export type SparklineVariants = VariantProps<typeof sparklineVariants>;
	export type SparklineSlots = keyof typeof sparklineVariants.slots;
	export type SparklineColor =
		'auto' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

	export interface SparklineProps extends Omit<
		SVGAttributes<SVGSVGElement>,
		'width' | 'height' | 'fill' | 'color'
	> {
		/**
		 * Numeric series values to plot.
		 */
		data: number[];
		/**
		 * SVG width in pixels.
		 * @default 120
		 */
		width?: number;
		/**
		 * SVG height in pixels.
		 * @default 36
		 */
		height?: number;
		/**
		 * Semantic color or `'auto'` (green when trending up/flat, red when trending down).
		 * @default 'auto'
		 */
		color?: SparklineColor;
		/**
		 * Line interpolation mode.
		 * @default 'smooth'
		 */
		curve?: 'smooth' | 'linear';
		/**
		 * Render a subtle vertical gradient fill under the sparkline.
		 * @default true
		 */
		fill?: boolean;
		/**
		 * Stroke width in pixels.
		 * @default 2
		 */
		strokeWidth?: number;
		/**
		 * Highlight the final data point with an indicator dot.
		 * @default true
		 */
		showDot?: boolean;
		/**
		 * Accessible label describing the trend.
		 */
		label?: string;
		/**
		 * Granular slot class overrides.
		 */
		ui?: Partial<Record<SparklineSlots, string>>;
	}
</script>

<script lang="ts">
	import { cn } from '../../utils/cn';

	let {
		data = [],
		width = 120,
		height = 36,
		color = 'auto',
		curve = 'smooth',
		fill = true,
		strokeWidth = 2,
		showDot = true,
		label,
		ui,
		class: className = '',
		...restProps
	}: SparklineProps = $props();

	const slots = $derived(sparklineVariants());
	const gradientId = `yaxa-spark-${Math.random().toString(36).slice(2, 9)}`;

	const COLOR_MAP: Record<Exclude<SparklineColor, 'auto'>, string> = {
		primary: 'var(--color-primary-500, #ff3e00)',
		success: '#10b981',
		warning: '#f59e0b',
		error: '#ef4444',
		info: '#3b82f6',
		neutral: '#71717a'
	};

	const resolvedStrokeColor = $derived.by(() => {
		if (color !== 'auto') return COLOR_MAP[color];
		if (data.length < 2) return COLOR_MAP.primary;
		const first = data[0] ?? 0;
		const last = data[data.length - 1] ?? 0;
		return last >= first ? COLOR_MAP.success : COLOR_MAP.error;
	});

	const points = $derived.by(() => {
		if (!data || data.length === 0) return [];
		const pad = Math.max(3, strokeWidth + 2);
		const usableW = Math.max(1, width - pad * 2);
		const usableH = Math.max(1, height - pad * 2);

		const min = Math.min(...data);
		const max = Math.max(...data);
		const range = max - min || 1;

		if (data.length === 1) {
			return [
				{ x: pad, y: height / 2 },
				{ x: width - pad, y: height / 2 }
			];
		}

		return data.map((val, idx) => ({
			x: pad + (idx / (data.length - 1)) * usableW,
			y: pad + usableH - ((val - min) / range) * usableH
		}));
	});

	const linePath = $derived.by(() => {
		if (points.length === 0) return '';
		if (curve === 'linear' || points.length <= 2) {
			return points
				.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
				.join(' ');
		}

		let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i];
			const p1 = points[i + 1];
			const cpx = ((p0.x + p1.x) / 2).toFixed(2);
			d += ` C ${cpx} ${p0.y.toFixed(2)}, ${cpx} ${p1.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
		}
		return d;
	});

	const areaPath = $derived.by(() => {
		if (!linePath || points.length === 0) return '';
		const first = points[0];
		const last = points[points.length - 1];
		return `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;
	});

	const lastPoint = $derived(points.length > 0 ? points[points.length - 1] : null);
	const ariaLabel = $derived(
		label ||
			(data.length > 0
				? `Sparkline trend from ${data[0]} to ${data[data.length - 1]}`
				: 'Empty sparkline')
	);
</script>

<svg
	data-slot="root"
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	role="img"
	aria-label={ariaLabel}
	class={cn(slots.root({ class: ui?.root }), className)}
	{...restProps}
>
	{#if fill && areaPath}
		<defs>
			<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={resolvedStrokeColor} stop-opacity="0.28" />
				<stop offset="100%" stop-color={resolvedStrokeColor} stop-opacity="0.0" />
			</linearGradient>
		</defs>
		<path
			data-slot="area"
			d={areaPath}
			fill="url(#{gradientId})"
			class={slots.area({ class: ui?.area })}
		/>
	{/if}

	{#if linePath}
		<path
			data-slot="line"
			d={linePath}
			stroke={resolvedStrokeColor}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
			class={slots.line({ class: ui?.line })}
		/>
	{/if}

	{#if showDot && lastPoint}
		<circle
			data-slot="dot"
			cx={lastPoint.x}
			cy={lastPoint.y}
			r={strokeWidth + 1}
			fill={resolvedStrokeColor}
			class={slots.dot({ class: ui?.dot })}
		/>
	{/if}
</svg>
