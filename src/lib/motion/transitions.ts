import { cubicOut, quadOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export interface StaggerFlyOptions {
	index?: number;
	step?: number;
	y?: number;
	x?: number;
	duration?: number;
	opacity?: number;
}

/**
 * Parameterized stagger fly-in transition for loops and lists.
 */
export function staggerFly(_node: Element, options: StaggerFlyOptions = {}): TransitionConfig {
	const index = options.index ?? 0;
	const step = options.step ?? 45;
	const y = options.y ?? 20;
	const x = options.x ?? 0;
	const duration = options.duration ?? 300;
	const baseOpacity = options.opacity ?? 0;

	return {
		delay: Math.max(0, index * step),
		duration,
		easing: cubicOut,
		css: (t, u) => {
			const currentY = u * y;
			const currentX = u * x;
			const currentOpacity = baseOpacity + t * (1 - baseOpacity);
			return `transform: translate3d(${currentX}px, ${currentY}px, 0); opacity: ${currentOpacity};`;
		}
	};
}

export interface SmoothSlideOptions {
	duration?: number;
	delay?: number;
	axis?: 'x' | 'y';
}

/**
 * Physics-friendly smooth slide transition for accordions and drawers.
 */
export function smoothSlide(node: Element, options: SmoothSlideOptions = {}): TransitionConfig {
	const duration = options.duration ?? 250;
	const delay = options.delay ?? 0;
	const axis = options.axis ?? 'y';

	const style = getComputedStyle(node);
	const opacity = parseFloat(style.opacity);
	const height = parseFloat(style.height);
	const paddingTop = parseFloat(style.paddingTop);
	const paddingBottom = parseFloat(style.paddingBottom);
	const marginTop = parseFloat(style.marginTop);
	const marginBottom = parseFloat(style.marginBottom);

	return {
		delay,
		duration,
		easing: quadOut,
		css: (t) => {
			if (axis === 'y') {
				return (
					`overflow: hidden;` +
					`opacity: ${Math.min(t * 20, 1) * opacity};` +
					`height: ${t * height}px;` +
					`padding-top: ${t * paddingTop}px;` +
					`padding-bottom: ${t * paddingBottom}px;` +
					`margin-top: ${t * marginTop}px;` +
					`margin-bottom: ${t * marginBottom}px;`
				);
			}
			return `overflow: hidden; opacity: ${t * opacity};`;
		}
	};
}
