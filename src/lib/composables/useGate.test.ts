import { describe, it, expect } from 'vitest';
import { useGate } from './useGate.svelte';

describe('useGate', () => {
	it('evaluates plan hierarchy correctly', () => {
		const gateStarter = useGate({
			user: { id: '1', role: 'user', plan: 'starter' }
		});

		expect(gateStarter.allowsPlan('free')).toBe(true);
		expect(gateStarter.allowsPlan('starter')).toBe(true);
		expect(gateStarter.allowsPlan('pro')).toBe(false);
		expect(gateStarter.allowsPlan('enterprise')).toBe(false);

		const gatePro = useGate({
			user: { id: '2', role: 'user', plan: 'pro' }
		});
		expect(gatePro.allowsPlan('starter')).toBe(true);
		expect(gatePro.allowsPlan('pro')).toBe(true);
		expect(gatePro.allowsPlan('enterprise')).toBe(false);
	});

	it('allows plan arrays (exact match within allowed array)', () => {
		const gate = useGate({
			user: { id: '1', role: 'user', plan: 'pro' }
		});

		expect(gate.allowsPlan(['starter', 'pro'])).toBe(true);
		expect(gate.allowsPlan(['starter', 'enterprise'])).toBe(false);
	});

	it('checks user roles correctly', () => {
		const gateUser = useGate({
			user: { id: '1', role: 'member', plan: 'free' }
		});

		expect(gateUser.hasRole('member')).toBe(true);
		expect(gateUser.hasRole('editor')).toBe(false);
		expect(gateUser.hasRole(['editor', 'member'])).toBe(true);
	});

	it('allows admin bypass by default', () => {
		const gateAdmin = useGate({
			user: { id: 'admin-1', role: 'admin', plan: 'free' }
		});

		expect(gateAdmin.isAdmin).toBe(true);
		expect(gateAdmin.allowsPlan('enterprise')).toBe(true);
		expect(gateAdmin.hasRole('billing_manager')).toBe(true);
		expect(gateAdmin.can(() => false)).toBe(true);
	});

	it('respects allowAdminBypass = false', () => {
		const gateAdminRestricted = useGate({
			user: { id: 'admin-1', role: 'admin', plan: 'free' },
			allowAdminBypass: false
		});

		expect(gateAdminRestricted.isAdmin).toBe(false);
		expect(gateAdminRestricted.allowsPlan('pro')).toBe(false);
	});

	it('evaluates custom can() predicate correctly', () => {
		const gate = useGate({
			user: { id: 'custom-1', role: 'user', plan: 'pro' }
		});

		expect(gate.can((u) => u?.id === 'custom-1')).toBe(true);
		expect(gate.can((u) => u?.id === 'other')).toBe(false);
	});
});
