import { theme, type ThemeMode } from '../theme/theme.svelte.js';

export function useColorMode() {
	return {
		get value(): ThemeMode {
			return theme.mode;
		},
		get resolvedTheme(): 'light' | 'dark' {
			return theme.resolvedTheme;
		},
		get isDark(): boolean {
			return theme.resolvedTheme === 'dark';
		},
		set(mode: ThemeMode) {
			theme.setMode(mode);
		},
		toggle() {
			theme.toggle();
		}
	};
}
