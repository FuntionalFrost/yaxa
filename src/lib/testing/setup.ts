// Global Vitest & jsdom setup for Yaxa Testing
if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		})
	});

	if (!window.ResizeObserver) {
		window.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}

	if (!window.IntersectionObserver) {
		window.IntersectionObserver = class IntersectionObserver {
			readonly root: Element | Document | null = null;
			readonly rootMargin: string = '0px';
			readonly thresholds: ReadonlyArray<number> = [0];
			readonly scrollMargin: string = '0px';
			observe() {}
			unobserve() {}
			disconnect() {}
			takeRecords() {
				return [];
			}
		} as any;
	}
}
