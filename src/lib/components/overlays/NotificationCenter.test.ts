import { describe, it, expect } from 'vitest';
import { notificationCenterVariants } from './NotificationCenter.svelte';

describe('NotificationCenter Component', () => {
	it('generates default variant classes', () => {
		const classes = notificationCenterVariants();
		expect(classes).toContain('inline-flex');
	});
});
