import { describe, it, expect } from 'vitest';
import LineChart from './LineChart.svelte';
import BarChart from './BarChart.svelte';
import DonutChart from './DonutChart.svelte';

describe('Native SVG Chart Components', () => {
	it('should export all chart component definitions', () => {
		expect(LineChart).toBeDefined();
		expect(BarChart).toBeDefined();
		expect(DonutChart).toBeDefined();
	});
});
