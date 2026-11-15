import { describe, it, expect } from 'vitest';
import { renderComponent } from '#lib/testing/index.js';
import LineChart from './LineChart.svelte';
import BarChart from './BarChart.svelte';
import DonutChart from './DonutChart.svelte';
import Sparkline from './Sparkline.svelte';

describe('Native SVG Chart Components', () => {
	it('should export all chart component definitions', () => {
		expect(LineChart).toBeDefined();
		expect(BarChart).toBeDefined();
		expect(DonutChart).toBeDefined();
		expect(Sparkline).toBeDefined();
	});

	it('renders Sparkline SVG path and auto-detects positive/negative trend color', () => {
		const up = renderComponent(Sparkline, {
			data: [10, 18, 15, 29, 42]
		});
		const lineUp = up.target.querySelector('[data-slot="line"]');
		expect(lineUp).not.toBeNull();
		expect(lineUp?.getAttribute('stroke')).toBe('#10b981');
		up.cleanup();

		const down = renderComponent(Sparkline, {
			data: [50, 40, 28, 12]
		});
		const lineDown = down.target.querySelector('[data-slot="line"]');
		expect(lineDown?.getAttribute('stroke')).toBe('#ef4444');
		down.cleanup();
	});
});
