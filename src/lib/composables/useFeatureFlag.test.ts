import { describe, it, expect, beforeEach } from 'vitest';
import {
	defineFlags,
	evaluateFeatureFlag,
	setFeatureFlagOverride,
	clearFeatureFlagOverrides,
	getRegisteredFlags,
	computeRolloutBucket
} from './useFeatureFlag.svelte';

describe('Feature Flags & Deterministic Rollouts (defineFlags, evaluateFeatureFlag)', () => {
	beforeEach(() => {
		clearFeatureFlagOverrides();
	});

	it('evaluates simple boolean flags and supports local browser overrides', () => {
		defineFlags({
			'new-checkout': true,
			'legacy-mode': false
		});

		expect(evaluateFeatureFlag('new-checkout', null)).toBe(true);
		expect(evaluateFeatureFlag('legacy-mode', null)).toBe(false);

		setFeatureFlagOverride('legacy-mode', true);
		expect(evaluateFeatureFlag('legacy-mode', null)).toBe(true);

		clearFeatureFlagOverrides();
		expect(evaluateFeatureFlag('legacy-mode', null)).toBe(false);
	});

	it('enforces allowedPlans and allowedRoles targeting rules', () => {
		defineFlags({
			'enterprise-audit': {
				enabled: true,
				allowedPlans: ['pro', 'enterprise'],
				allowedRoles: ['admin', 'owner']
			}
		});

		expect(evaluateFeatureFlag('enterprise-audit', { id: 'u1', plan: 'free', role: 'admin' })).toBe(
			false
		);
		expect(evaluateFeatureFlag('enterprise-audit', { id: 'u1', plan: 'pro', role: 'member' })).toBe(
			false
		);
		expect(
			evaluateFeatureFlag('enterprise-audit', { id: 'u1', plan: 'enterprise', role: 'owner' })
		).toBe(true);
	});

	it('computes deterministic rollout buckets (0-99) and respects rolloutPercentage', () => {
		const bucketA = computeRolloutBucket('ai-copilot', 'user-42');
		const bucketB = computeRolloutBucket('ai-copilot', 'user-42');
		expect(bucketA).toBe(bucketB);
		expect(bucketA).toBeGreaterThanOrEqual(0);
		expect(bucketA).toBeLessThan(100);

		defineFlags({
			'zero-rollout': { enabled: true, rolloutPercentage: 0 },
			'full-rollout': { enabled: true, rolloutPercentage: 100 }
		});

		expect(evaluateFeatureFlag('zero-rollout', { id: 'user-42' })).toBe(false);
		expect(evaluateFeatureFlag('full-rollout', { id: 'user-42' })).toBe(true);
	});

	it('lists registered flags with their effective and override states', () => {
		defineFlags({
			'beta-kanban': { enabled: true, description: 'Multi-column Kanban board' }
		});
		setFeatureFlagOverride('beta-kanban', false);

		const flags = getRegisteredFlags(null);
		const kanbanFlag = flags.find((f) => f.key === 'beta-kanban');
		expect(kanbanFlag).toBeDefined();
		expect(kanbanFlag?.override).toBe(false);
		expect(kanbanFlag?.effective).toBe(false);
	});
});
