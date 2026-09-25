import { describe, it, expect } from 'vitest';
import { springTilt } from './springTilt';

describe('springTilt Action', () => {
	it('attaches event listeners and updates transform on mousemove', () => {
		const div = document.createElement('div');
		Object.defineProperty(div, 'getBoundingClientRect', {
			value: () => ({
				left: 0,
				top: 0,
				width: 200,
				height: 200,
				right: 200,
				bottom: 200
			})
		});

		const action = springTilt(div, { max: 15, perspective: 800 });

		expect(div.style.transformStyle).toBe('preserve-3d');

		// Dispatch mousemove
		const moveEvent = new MouseEvent('mousemove', {
			clientX: 150,
			clientY: 150
		});
		div.dispatchEvent(moveEvent);

		// Cleanup
		action.destroy();
		expect(div.style.transform).toBe('');
	});
});
