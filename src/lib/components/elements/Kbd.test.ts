import { describe, it, expect } from 'vitest';
import { kbdVariants, formatKbdKey } from './Kbd.svelte';

describe('Kbd Component', () => {
	it('generates base kbd classes by default', () => {
		const classes = kbdVariants({ size: 'sm' });
		expect(classes).toContain('font-mono');
		expect(classes).toContain('border');
		expect(classes).toContain('rounded');
	});

	it('supports multiple sizes', () => {
		const xs = kbdVariants({ size: 'xs' });
		expect(xs).toContain('text-[10px]');

		const lg = kbdVariants({ size: 'lg' });
		expect(lg).toContain('text-sm');
	});

	it('formats platform-specific keys correctly', () => {
		// macOS
		expect(formatKbdKey('meta', true)).toBe('⌘');
		expect(formatKbdKey('cmd', true)).toBe('⌘');
		expect(formatKbdKey('alt', true)).toBe('⌥');
		expect(formatKbdKey('shift', true)).toBe('⇧');
		expect(formatKbdKey('ctrl', true)).toBe('⌃');
		expect(formatKbdKey('enter', true)).toBe('↵');

		// Windows / Linux
		expect(formatKbdKey('meta', false)).toBe('Ctrl');
		expect(formatKbdKey('cmd', false)).toBe('Ctrl');
		expect(formatKbdKey('alt', false)).toBe('Alt');
		expect(formatKbdKey('shift', false)).toBe('Shift');
		expect(formatKbdKey('ctrl', false)).toBe('Ctrl');
		expect(formatKbdKey('enter', false)).toBe('Enter');

		// Common literal keys
		expect(formatKbdKey('k', false)).toBe('K');
	});
});
