import { spring } from 'svelte/motion';

export interface SpringTiltOptions {
	max?: number;
	perspective?: number;
	scale?: number;
	stiffness?: number;
	damping?: number;
	disabled?: boolean;
}

/**
 * Svelte Action that applies physics-driven 3D spring tilt on hover.
 */
export function springTilt(node: HTMLElement, options: SpringTiltOptions = {}) {
	let max = options.max ?? 10;
	let perspective = options.perspective ?? 1000;
	let scale = options.scale ?? 1.02;
	const stiffness = options.stiffness ?? 0.12;
	const damping = options.damping ?? 0.28;
	let disabled = options.disabled ?? false;

	const coords = spring({ x: 0, y: 0, scale: 1 }, { stiffness, damping });

	const unsub = coords.subscribe((val) => {
		if (disabled) {
			node.style.transform = '';
			return;
		}
		node.style.transform = `perspective(${perspective}px) rotateX(${val.x.toFixed(2)}deg) rotateY(${val.y.toFixed(2)}deg) scale(${val.scale.toFixed(3)})`;
		node.style.transformStyle = 'preserve-3d';
	});

	function onMouseMove(e: MouseEvent) {
		if (disabled) return;
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		const rotateX = -((y - centerY) / (centerY || 1)) * max;
		const rotateY = ((x - centerX) / (centerX || 1)) * max;

		coords.set({ x: rotateX, y: rotateY, scale });
	}

	function onMouseLeave() {
		if (disabled) return;
		coords.set({ x: 0, y: 0, scale: 1 });
	}

	node.addEventListener('mousemove', onMouseMove);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		update(newOptions: SpringTiltOptions = {}) {
			max = newOptions.max ?? 10;
			perspective = newOptions.perspective ?? 1000;
			scale = newOptions.scale ?? 1.02;
			disabled = Boolean(newOptions.disabled);
			if (disabled) {
				node.style.transform = '';
			}
		},
		destroy() {
			unsub();
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
			node.style.transform = '';
		}
	};
}
