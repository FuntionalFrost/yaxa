export interface UseIdleOptions {
	timeout?: number;
	events?: Array<keyof WindowEventMap | string>;
	initialState?: boolean;
	onIdle?: () => void;
	onActive?: () => void;
}

export function useIdle(options: UseIdleOptions = {}) {
	const {
		timeout = 60000,
		events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'],
		initialState = false,
		onIdle,
		onActive
	} = options;

	let isIdle = $state(initialState);
	let lastActive = $state(Date.now());
	let timer: ReturnType<typeof setTimeout> | null = null;

	function setIdle() {
		if (!isIdle) {
			isIdle = true;
			onIdle?.();
		}
	}

	function resetTimer() {
		const wasIdle = isIdle;
		isIdle = false;
		lastActive = Date.now();

		if (wasIdle) {
			onActive?.();
		}

		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(setIdle, timeout);
	}

	resetTimer();

	if (typeof window !== 'undefined') {
		for (const event of events) {
			window.addEventListener(event as keyof WindowEventMap, resetTimer, { passive: true });
		}
	}

	function destroy() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (typeof window !== 'undefined') {
			for (const event of events) {
				window.removeEventListener(event as keyof WindowEventMap, resetTimer);
			}
		}
	}

	return {
		get isIdle() {
			return isIdle;
		},
		get lastActive() {
			return lastActive;
		},
		reset: resetTimer,
		destroy
	};
}
