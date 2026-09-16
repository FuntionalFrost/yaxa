import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIdle } from './useIdle.svelte';

describe('useIdle Composable', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('initializes active and switches to idle after timeout', () => {
		const onIdle = vi.fn();
		const idle = useIdle({ timeout: 1000, onIdle });

		expect(idle.isIdle).toBe(false);

		vi.advanceTimersByTime(1000);

		expect(idle.isIdle).toBe(true);
		expect(onIdle).toHaveBeenCalledTimes(1);

		idle.destroy();
	});

	it('resets timer when user becomes active', () => {
		const onActive = vi.fn();
		const idle = useIdle({ timeout: 1000, onActive });

		vi.advanceTimersByTime(1000);
		expect(idle.isIdle).toBe(true);

		idle.reset();
		expect(idle.isIdle).toBe(false);
		expect(onActive).toHaveBeenCalledTimes(1);

		idle.destroy();
	});
});
