import { describe, it, expect } from 'vitest';
import {
	ACCENT_PALETTES,
	NEUTRAL_PALETTES,
	FONT_PRESETS,
	RADIUS_PRESETS,
	theme
} from './theme.svelte';

describe('Theme Palettes & Engine', () => {
	const requiredShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

	it('includes all 7 standard accent palettes with complete shades and ring tokens', () => {
		const expectedAccents = [
			'svelte',
			'amber',
			'emerald',
			'sky',
			'violet',
			'rose',
			'indigo'
		] as const;

		for (const accent of expectedAccents) {
			const palette = ACCENT_PALETTES[accent];
			expect(palette).toBeDefined();
			expect(palette.id).toBe(accent);
			expect(palette.color).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(palette.shades.ring).toBeDefined();

			for (const shade of requiredShades) {
				expect(palette.shades[shade]).toBeDefined();
			}
		}
	});

	it('includes all 4 standard neutral palettes', () => {
		const expectedNeutrals = ['zinc', 'slate', 'stone', 'neutral'] as const;

		for (const neutral of expectedNeutrals) {
			const palette = NEUTRAL_PALETTES[neutral];
			expect(palette).toBeDefined();
			expect(palette.name).toBeDefined();
			for (const shade of requiredShades) {
				expect(palette.shades[shade]).toBeDefined();
			}
		}
	});

	it('provides font presets and radius presets', () => {
		expect(FONT_PRESETS.sans.value).toBeDefined();
		expect(FONT_PRESETS.serif.value).toBeDefined();
		expect(FONT_PRESETS.mono.value).toBeDefined();

		expect(RADIUS_PRESETS.sharp.value).toBe('0px');
		expect(RADIUS_PRESETS.rounded.value).toBe('0.75rem');
		expect(RADIUS_PRESETS.pill.value).toBe('1.25rem');
	});

	it('updates theme state reactively via theme methods', () => {
		theme.setAccent('emerald');
		expect(theme.accent).toBe('emerald');

		theme.setNeutral('stone');
		expect(theme.neutral).toBe('stone');

		theme.setMode('dark');
		expect(theme.mode).toBe('dark');
	});
});
