import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentName = 'svelte' | 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'indigo';
export type NeutralName = 'zinc' | 'slate' | 'stone' | 'neutral';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type RadiusPreset = 'sharp' | 'subtle' | 'default' | 'rounded' | 'pill';
export type BaseFontSize = 'compact' | 'base' | 'spacious';

export interface AccentOption {
	id: AccentName;
	name: string;
	color: string;
	shades: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
		800: string;
		900: string;
		950: string;
		ring: string;
	};
}

export const ACCENT_PALETTES: Record<AccentName, AccentOption> = {
	svelte: {
		id: 'svelte',
		name: 'Svelte Flame',
		color: '#ff3e00',
		shades: {
			50: '#fff5f2',
			100: '#ffe8e2',
			200: '#ffd0c5',
			300: '#ffa998',
			400: '#ff755b',
			500: '#ff3e00',
			600: '#ea2f00',
			700: '#c42400',
			800: '#9e1e03',
			900: '#7c1c08',
			950: '#420a02',
			ring: 'rgba(255, 62, 0, 0.35)'
		}
	},
	amber: {
		id: 'amber',
		name: 'Sunset Amber',
		color: '#f59e0b',
		shades: {
			50: '#fffbeb',
			100: '#fef3c7',
			200: '#fde68a',
			300: '#fcd34d',
			400: '#fbbf24',
			500: '#f59e0b',
			600: '#d97706',
			700: '#b45309',
			800: '#92400e',
			900: '#78350f',
			950: '#451a03',
			ring: 'rgba(245, 158, 11, 0.35)'
		}
	},
	emerald: {
		id: 'emerald',
		name: 'Emerald Mint',
		color: '#10b981',
		shades: {
			50: '#ecfdf5',
			100: '#d1fae5',
			200: '#a7f3d0',
			300: '#6ee7b7',
			400: '#34d399',
			500: '#10b981',
			600: '#059669',
			700: '#047857',
			800: '#065f46',
			900: '#064e3b',
			950: '#022c22',
			ring: 'rgba(16, 185, 129, 0.35)'
		}
	},
	sky: {
		id: 'sky',
		name: 'Sky Cyan',
		color: '#0ea5e9',
		shades: {
			50: '#f0f9ff',
			100: '#e0f2fe',
			200: '#bae6fd',
			300: '#7dd3fc',
			400: '#38bdf8',
			500: '#0ea5e9',
			600: '#0284c7',
			700: '#0369a1',
			800: '#075985',
			900: '#0c4a6e',
			950: '#082f49',
			ring: 'rgba(14, 165, 233, 0.35)'
		}
	},
	violet: {
		id: 'violet',
		name: 'Electric Violet',
		color: '#8b5cf6',
		shades: {
			50: '#f5f3ff',
			100: '#ede9fe',
			200: '#ddd6fe',
			300: '#c4b5fd',
			400: '#a78bfa',
			500: '#8b5cf6',
			600: '#7c3aed',
			700: '#6d28d9',
			800: '#5b21b6',
			900: '#4c1d95',
			950: '#2e1065',
			ring: 'rgba(139, 92, 246, 0.35)'
		}
	},
	rose: {
		id: 'rose',
		name: 'Neon Rose',
		color: '#f43f5e',
		shades: {
			50: '#fff1f2',
			100: '#ffe4e6',
			200: '#fecdd3',
			300: '#fda4af',
			400: '#fb7185',
			500: '#f43f5e',
			600: '#e11d48',
			700: '#be123c',
			800: '#9f1239',
			900: '#881337',
			950: '#4c0519',
			ring: 'rgba(244, 63, 94, 0.35)'
		}
	},
	indigo: {
		id: 'indigo',
		name: 'Royal Indigo',
		color: '#6366f1',
		shades: {
			50: '#eef2ff',
			100: '#e0e7ff',
			200: '#c7d2fe',
			300: '#a5b4fc',
			400: '#818cf8',
			500: '#6366f1',
			600: '#4f46e5',
			700: '#4338ca',
			800: '#3730a3',
			900: '#312e81',
			950: '#1e1b4b',
			ring: 'rgba(99, 102, 241, 0.35)'
		}
	}
};

export const NEUTRAL_PALETTES: Record<
	NeutralName,
	{ name: string; shades: Record<number, string> }
> = {
	zinc: {
		name: 'Zinc (Modern)',
		shades: {
			50: '#fafafa',
			100: '#f4f4f5',
			200: '#e4e4e7',
			300: '#d4d4d8',
			400: '#a1a1aa',
			500: '#71717a',
			600: '#52525b',
			700: '#3f3f46',
			800: '#27272a',
			900: '#18181b',
			950: '#121212'
		}
	},
	slate: {
		name: 'Slate (Cool)',
		shades: {
			50: '#f8fafc',
			100: '#f1f5f9',
			200: '#e2e8f0',
			300: '#cbd5e1',
			400: '#94a3b8',
			500: '#64748b',
			600: '#475569',
			700: '#334155',
			800: '#1e293b',
			900: '#0f172a',
			950: '#020617'
		}
	},
	stone: {
		name: 'Stone (Warm)',
		shades: {
			50: '#fafaf9',
			100: '#f5f5f4',
			200: '#e7e5e4',
			300: '#d6d3d1',
			400: '#a8a29e',
			500: '#78716c',
			600: '#57534e',
			700: '#44403c',
			800: '#292524',
			900: '#1c1917',
			950: '#0c0a09'
		}
	},
	neutral: {
		name: 'Neutral (Mono)',
		shades: {
			50: '#fafafa',
			100: '#f5f5f5',
			200: '#e5e5e5',
			300: '#d4d4d4',
			400: '#a3a3a3',
			500: '#737373',
			600: '#525252',
			700: '#404040',
			800: '#262626',
			900: '#171717',
			950: '#0a0a0a'
		}
	}
};

export const RADIUS_PRESETS: Record<RadiusPreset, { name: string; value: string }> = {
	sharp: { name: 'Sharp', value: '0px' },
	subtle: { name: 'Subtle', value: '0.25rem' },
	default: { name: 'Medium', value: '0.5rem' },
	rounded: { name: 'Rounded', value: '0.75rem' },
	pill: { name: 'Pill', value: '1.25rem' }
};

export const FONT_PRESETS: Record<FontFamily, { name: string; value: string }> = {
	sans: {
		name: 'Sans (Inter)',
		value:
			"'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
	},
	serif: {
		name: 'Serif (Newsreader)',
		value: "'Newsreader', Georgia, Cambria, 'Times New Roman', Times, serif"
	},
	mono: {
		name: 'Mono (JetBrains)',
		value: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
	}
};

export const FONT_SIZE_PRESETS: Record<
	BaseFontSize,
	{ name: string; value: string; label: string }
> = {
	compact: { name: 'Compact', value: '87.5%', label: '14px' },
	base: { name: 'Comfortable', value: '100%', label: '16px' },
	spacious: { name: 'Spacious', value: '112.5%', label: '18px' }
};

export const DEFAULT_CHART_COLORS = ['#ff3e00', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

class ThemeStore {
	mode = $state<ThemeMode>('system');
	resolvedTheme = $state<'light' | 'dark'>('light');
	accent = $state<AccentName>('svelte');
	neutral = $state<NeutralName>('zinc');
	fontFamily = $state<FontFamily>('sans');
	radius = $state<RadiusPreset>('default');
	fontSize = $state<BaseFontSize>('base');
	accentScrollbar = $state<boolean>(false);

	constructor() {
		if (browser) {
			const storedMode = localStorage.getItem('yaxa-theme') as ThemeMode | null;
			if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
				this.mode = storedMode;
			}
			const storedAccent = localStorage.getItem('yaxa-accent') as AccentName | null;
			if (storedAccent && storedAccent in ACCENT_PALETTES) {
				this.accent = storedAccent;
			}
			const storedNeutral = localStorage.getItem('yaxa-neutral') as NeutralName | null;
			if (storedNeutral && storedNeutral in NEUTRAL_PALETTES) {
				this.neutral = storedNeutral;
			}
			const storedFont = localStorage.getItem('yaxa-font') as FontFamily | null;
			if (storedFont && storedFont in FONT_PRESETS) {
				this.fontFamily = storedFont;
			}
			const storedRadius = localStorage.getItem('yaxa-radius') as RadiusPreset | null;
			if (storedRadius && storedRadius in RADIUS_PRESETS) {
				this.radius = storedRadius;
			}
			const storedFontSize = localStorage.getItem('yaxa-size') as BaseFontSize | null;
			if (storedFontSize && storedFontSize in FONT_SIZE_PRESETS) {
				this.fontSize = storedFontSize;
			}
			const storedScrollbar = localStorage.getItem('yaxa-accent-scrollbar');
			if (storedScrollbar !== null) {
				this.accentScrollbar = storedScrollbar === 'true';
			}

			this.applyAllStyles();

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (this.mode === 'system') {
					this.updateResolvedTheme();
				}
			});
		}
	}

	setMode(newMode: ThemeMode) {
		this.mode = newMode;
		if (browser) {
			localStorage.setItem('yaxa-theme', newMode);
			this.updateResolvedTheme();
		}
	}

	toggle() {
		if (this.resolvedTheme === 'dark') {
			this.setMode('light');
		} else {
			this.setMode('dark');
		}
	}

	setAccent(newAccent: AccentName) {
		this.accent = newAccent;
		if (browser) {
			localStorage.setItem('yaxa-accent', newAccent);
			this.applyAccent();
			this.applyCharts();
			this.applyScrollbars();
		}
	}

	setNeutral(newNeutral: NeutralName) {
		this.neutral = newNeutral;
		if (browser) {
			localStorage.setItem('yaxa-neutral', newNeutral);
			this.applyNeutral();
			this.applyScrollbars();
		}
	}

	setFontFamily(newFont: FontFamily) {
		this.fontFamily = newFont;
		if (browser) {
			localStorage.setItem('yaxa-font', newFont);
			this.applyFont();
		}
	}

	setRadius(newRadius: RadiusPreset) {
		this.radius = newRadius;
		if (browser) {
			localStorage.setItem('yaxa-radius', newRadius);
			this.applyRadius();
		}
	}

	setFontSize(newSize: BaseFontSize) {
		this.fontSize = newSize;
		if (browser) {
			localStorage.setItem('yaxa-size', newSize);
			this.applyFontSize();
		}
	}

	setAccentScrollbar(enabled: boolean) {
		this.accentScrollbar = enabled;
		if (browser) {
			localStorage.setItem('yaxa-accent-scrollbar', String(enabled));
			this.applyScrollbars();
		}
	}

	reset() {
		this.setMode('system');
		this.setAccent('svelte');
		this.setNeutral('zinc');
		this.setFontFamily('sans');
		this.setRadius('default');
		this.setFontSize('base');
		this.setAccentScrollbar(false);
	}

	private applyAllStyles() {
		this.updateResolvedTheme();
		this.applyAccent();
		this.applyNeutral();
		this.applyCharts();
		this.applyScrollbars();
		this.applyFont();
		this.applyRadius();
		this.applyFontSize();
	}

	private updateResolvedTheme() {
		if (!browser) return;

		let isDark: boolean;
		if (this.mode === 'system') {
			isDark =
				typeof window.matchMedia === 'function'
					? window.matchMedia('(prefers-color-scheme: dark)').matches
					: false;
		} else {
			isDark = this.mode === 'dark';
		}

		this.resolvedTheme = isDark ? 'dark' : 'light';

		if (isDark) {
			document.documentElement.classList.add('dark');
			document.documentElement.style.colorScheme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.style.colorScheme = 'light';
		}

		this.applyScrollbars();
	}

	private applyAccent() {
		if (!browser) return;
		const palette = ACCENT_PALETTES[this.accent] || ACCENT_PALETTES.svelte;
		const root = document.documentElement;

		for (const [shade, hex] of Object.entries(palette.shades)) {
			if (shade === 'ring') {
				root.style.setProperty('--yaxa-ring', hex);
			} else {
				root.style.setProperty(`--yaxa-primary-${shade}`, hex);
				root.style.setProperty(`--color-primary-${shade}`, hex);
			}
		}
	}

	private applyNeutral() {
		if (!browser) return;
		const palette = NEUTRAL_PALETTES[this.neutral] || NEUTRAL_PALETTES.zinc;
		const root = document.documentElement;

		for (const [shade, hex] of Object.entries(palette.shades)) {
			root.style.setProperty(`--yaxa-neutral-${shade}`, hex);
			root.style.setProperty(`--color-neutral-${shade}`, hex);
		}
	}

	private applyCharts() {
		if (!browser) return;
		const palette = ACCENT_PALETTES[this.accent] || ACCENT_PALETTES.svelte;
		const root = document.documentElement;
		root.style.setProperty('--yaxa-chart-1', palette.shades[500]);
		root.style.setProperty('--yaxa-chart-2', '#3b82f6');
		root.style.setProperty('--yaxa-chart-3', '#10b981');
		root.style.setProperty('--yaxa-chart-4', '#f59e0b');
		root.style.setProperty('--yaxa-chart-5', '#8b5cf6');
	}

	private applyScrollbars() {
		if (!browser) return;
		const root = document.documentElement;
		const isDark = this.resolvedTheme === 'dark';
		const neutral = NEUTRAL_PALETTES[this.neutral] || NEUTRAL_PALETTES.zinc;
		const accent = ACCENT_PALETTES[this.accent] || ACCENT_PALETTES.svelte;

		if (this.accentScrollbar) {
			root.style.setProperty('--yaxa-scrollbar-thumb', accent.shades[500]);
			root.style.setProperty('--yaxa-scrollbar-hover', accent.shades[600]);
		} else {
			const thumb = isDark ? neutral.shades[700] : neutral.shades[300];
			const hover = isDark ? neutral.shades[600] : neutral.shades[400];
			root.style.setProperty('--yaxa-scrollbar-thumb', thumb);
			root.style.setProperty('--yaxa-scrollbar-hover', hover);
		}
	}

	private applyFont() {
		if (!browser) return;
		const font = FONT_PRESETS[this.fontFamily] || FONT_PRESETS.sans;
		document.documentElement.style.setProperty('--font-sans', font.value);
		document.body.style.fontFamily = font.value;
	}

	private applyRadius() {
		if (!browser) return;
		const rad = RADIUS_PRESETS[this.radius] || RADIUS_PRESETS.default;
		document.documentElement.style.setProperty('--yaxa-radius', rad.value);
	}

	private applyFontSize() {
		if (!browser) return;
		const size = FONT_SIZE_PRESETS[this.fontSize] || FONT_SIZE_PRESETS.base;
		document.documentElement.style.fontSize = size.value;
	}
}

export const theme = new ThemeStore();

/**
 * Inline script to prevent theme and accent flash (FOUC) during initial SSR load.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('yaxa-theme');
    var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;
