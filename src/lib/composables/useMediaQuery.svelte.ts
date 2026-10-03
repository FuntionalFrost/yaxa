import { browser } from '$app/env';

export function useMediaQuery(query: string) {
	let matches = $state(false);

	if (browser && typeof window !== 'undefined') {
		const mediaQuery = window.matchMedia(query);
		matches = mediaQuery.matches;

		const listener = (e: MediaQueryListEvent) => {
			matches = e.matches;
		};

		mediaQuery.addEventListener('change', listener);
	}

	return {
		get matches() {
			return matches;
		}
	};
}
