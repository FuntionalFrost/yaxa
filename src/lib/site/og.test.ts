import { describe, it, expect } from 'vitest';
import { generateOgSvg } from './og';

describe('generateOgSvg', () => {
	it('generates a valid 1200x630 SVG element', () => {
		const svg = generateOgSvg({
			title: 'Welcome to Yaxa',
			description: 'A Next-Gen UI library for Svelte 5',
			siteName: 'Yaxa',
			badge: 'v1.5.1'
		});

		expect(svg).toContain('<svg width="1200" height="630" viewBox="0 0 1200 630"');
		expect(svg).toContain('Welcome to Yaxa');
		expect(svg).toContain('A Next-Gen UI library for Svelte 5');
		expect(svg).toContain('v1.5.1');
		expect(svg).toContain('</svg>');
	});

	it('escapes dangerous XML characters in titles and descriptions', () => {
		const svg = generateOgSvg({
			title: 'Tom & Jerry <Script> "Quotes" \'Single\'',
			description: 'Symbols: < > & " \'',
			siteName: 'Yaxa & Co'
		});

		expect(svg).not.toContain('<Script>');
		expect(svg).toContain('&lt;Script&gt;');
		expect(svg).toContain('&amp;');
		expect(svg).toContain('&quot;');
		expect(svg).toContain('&apos;');
	});

	it('handles light mode and dark mode color palettes', () => {
		const darkSvg = generateOgSvg({
			title: 'Dark Mode',
			theme: 'dark'
		});
		const lightSvg = generateOgSvg({
			title: 'Light Mode',
			theme: 'light'
		});

		expect(darkSvg).toContain('#09090b');
		expect(lightSvg).toContain('#fafafa');
	});
});
