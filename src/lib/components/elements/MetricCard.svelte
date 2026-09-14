<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconSource } from './Icon.svelte';
	import Badge from './Badge.svelte';
	import Skeleton from './Skeleton.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		title: string;
		value: string | number;
		change?: number;
		changeType?: 'percent' | 'absolute';
		changePeriod?: string;
		icon?: IconSource;
		sparkline?: number[];
		sparklineColor?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'auto';
		variant?: 'outline' | 'flat' | 'elevated';
		loading?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		value,
		change,
		changeType = 'percent',
		changePeriod = 'vs last period',
		icon,
		sparkline,
		sparklineColor = 'auto',
		variant = 'outline',
		loading = false,
		class: className = '',
		children
	}: Props = $props();

	let isPositive = $derived(change !== undefined && change >= 0);
	let changeFormatted = $derived.by(() => {
		if (change === undefined) return '';
		const prefix = change >= 0 ? '+' : '';
		return `${prefix}${change}${changeType === 'percent' ? '%' : ''}`;
	});

	let resolvedColor = $derived.by(() => {
		if (sparklineColor !== 'auto') return sparklineColor;
		if (change !== undefined) {
			return change >= 0 ? 'success' : 'error';
		}
		return 'primary';
	});

	// SVG Sparkline geometry calculation (viewBox: 0 0 120 36)
	let sparklineData = $derived.by(() => {
		if (!sparkline || sparkline.length < 2) return null;
		const width = 120;
		const height = 36;
		const padding = 3;

		const min = Math.min(...sparkline);
		const max = Math.max(...sparkline);
		const range = max === min ? 1 : max - min;

		const points = sparkline.map((val, idx) => {
			const x = (idx / (sparkline.length - 1)) * width;
			const y = height - padding - ((val - min) / range) * (height - padding * 2);
			return { x, y };
		});

		const linePath = points.reduce(
			(acc, pt, i) =>
				i === 0
					? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
					: `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
			''
		);

		const firstX = points[0].x.toFixed(1);
		const lastX = points[points.length - 1].x.toFixed(1);
		const areaPath = `${linePath} L ${lastX} ${height} L ${firstX} ${height} Z`;

		const lastPoint = points[points.length - 1];

		return { linePath, areaPath, lastPoint };
	});

	let colorHex = $derived.by(() => {
		switch (resolvedColor) {
			case 'success':
				return { stroke: '#10b981', fill: '#10b981' };
			case 'error':
				return { stroke: '#f43f5e', fill: '#f43f5e' };
			case 'warning':
				return { stroke: '#f59e0b', fill: '#f59e0b' };
			case 'neutral':
				return { stroke: '#71717a', fill: '#71717a' };
			case 'primary':
			default:
				return { stroke: '#ff3e00', fill: '#ff3e00' };
		}
	});

	let containerClasses = $derived.by(() => {
		const base =
			'relative overflow-hidden rounded-xl p-5 transition-all duration-200 bg-white dark:bg-neutral-900';
		switch (variant) {
			case 'flat':
				return cn(base, 'bg-neutral-50/80 dark:bg-neutral-900/60 border-0', className);
			case 'elevated':
				return cn(
					base,
					'shadow-md hover:shadow-lg border border-neutral-200/80 dark:border-neutral-800',
					className
				);
			case 'outline':
			default:
				return cn(
					base,
					'border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700',
					className
				);
		}
	});

	let uniqueId = $derived(`sparkline-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class={containerClasses}>
	{#if loading}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Skeleton class="h-4 w-28" />
				<Skeleton class="h-8 w-8 rounded-lg" />
			</div>
			<Skeleton class="h-8 w-36" />
			<div class="flex items-center gap-2 pt-1">
				<Skeleton class="h-4 w-16" />
				<Skeleton class="h-4 w-24" />
			</div>
		</div>
	{:else}
		<div class="flex items-start justify-between gap-2">
			<span class="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
				{title}
			</span>
			{#if icon}
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
				>
					<Icon name={icon} size="sm" />
				</div>
			{/if}
		</div>

		<div class="mt-2 flex items-baseline justify-between gap-4">
			<div>
				<div class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
					{value}
				</div>

				{#if change !== undefined || changePeriod}
					<div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
						{#if change !== undefined}
							<Badge
								color={isPositive ? 'success' : 'error'}
								variant="soft"
								size="sm"
								class="gap-0.5 font-semibold"
							>
								<Icon
									name={isPositive ? 'arrow-up-right' : 'arrow-down-right'}
									size="xs"
									class="inline-block"
								/>
								{changeFormatted}
							</Badge>
						{/if}
						{#if changePeriod}
							<span class="text-neutral-500 dark:text-neutral-400">
								{changePeriod}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Sparkline Chart -->
			{#if sparklineData}
				<div class="flex h-10 w-24 shrink-0 items-center">
					<svg
						viewBox="0 0 120 36"
						class="h-full w-full overflow-visible"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stop-color={colorHex.fill} stop-opacity="0.35" />
								<stop offset="100%" stop-color={colorHex.fill} stop-opacity="0" />
							</linearGradient>
						</defs>
						<path d={sparklineData.areaPath} fill="url(#{uniqueId})" />
						<path
							d={sparklineData.linePath}
							fill="none"
							stroke={colorHex.stroke}
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<circle
							cx={sparklineData.lastPoint.x}
							cy={sparklineData.lastPoint.y}
							r="3"
							fill={colorHex.stroke}
							class="animate-pulse"
						/>
					</svg>
				</div>
			{/if}
		</div>

		{#if children}
			<div class="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
				{@render children()}
			</div>
		{/if}
	{/if}
</div>
